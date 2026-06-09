import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'ancient-civilizations'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  [
    'Ancient Chinese Imperial City',
    'magnificent ancient chinese imperial city with golden palaces, ceremonial courtyards and dynastic grandeur',
  ],
  [
    'Terracotta Army Legacy',
    'vast terracotta army standing guard beneath dramatic skies, symbol of ancient chinese civilization',
  ],
  [
    'Ancient Indian Temple Complex',
    'ornate ancient indian temple complex with intricate carvings, sacred architecture and spiritual atmosphere',
  ],
  [
    'Petra Desert Kingdom',
    'legendary city of petra carved into red sandstone cliffs illuminated by golden desert sunlight',
  ],
  [
    'Mesopotamian Ziggurat',
    'towering mesopotamian ziggurat rising above an ancient city, cradle of civilization',
  ],
  [
    'Phoenician Coastal Port',
    'wealthy phoenician trading port with ancient ships, stone architecture and mediterranean waters',
  ],
  [
    'Inca Mountain Kingdom',
    'remote inca mountain kingdom surrounded by dramatic peaks, terraces and clouds',
  ],
  [
    'Ancient Sumerian Capital',
    'grand sumerian capital city with temples, canals and monumental early civilization architecture',
  ],
  [
    'Carthaginian Harbor Empire',
    'powerful carthaginian harbor city filled with merchant vessels and ancient prosperity',
  ],
  [
    'Oracle Of Delphi Sanctuary',
    'sacred sanctuary of delphi perched on mountain slopes with classical greek elegance',
  ],
].map(([name, description]) => ({
  title: `${name} - Ancient Civilizations Theme`,
  prompt: `premium ancient civilizations digital artwork, ${description}, ultra realistic, cinematic lighting, luxury historical aesthetic, museum quality, highly detailed architecture, epic scale, rich textures, masterpiece composition, commercial wall art quality, historical realism, no readable text, no logos, no watermark, no people`,
}))

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

async function generateOpenAiImageBuffer(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  const response = await fetch(
    'https://api.openai.com/v1/images/generations',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size: '1024x1024',
        quality: 'medium',
        n: 1,
      }),
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `OpenAI image generation failed (${response.status}): ${text}`
    )
  }

  const data = await response.json()
  const base64 = data?.data?.[0]?.b64_json

  if (!base64) {
    throw new Error('No image returned from OpenAI')
  }

  return Buffer.from(base64, 'base64')
}

async function uploadGeneratedImageToBlob(
  imageBuffer: Buffer,
  title: string
) {
  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    imageBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    }
  )

  return blob.url
}

async function upsertArtwork(
  item: (typeof ITEMS)[number],
  imageUrl: string
) {
  const tags = [
    THEME_TAG,
    'ancient',
    'civilization',
    'history',
    'historical',
    'architecture',
    'heritage',
    'wall-art',
  ]

  const existing = await prisma.artwork.findFirst({
    where: {
      title: item.title,
    },
    select: {
      id: true,
    },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: {
          id: existing.id,
        },
        data: {
          thumbnail: imageUrl,
          artist: ARTIST,
          tags,
          status: 'PUBLISHED' as any,
        },
        select: {
          id: true,
        },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          artist: ARTIST,
          style: STYLE as any,
          thumbnail: imageUrl,
          tags,
          status: 'PUBLISHED' as any,
          price: 9.99,
        },
        select: {
          id: true,
        },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'openai-gpt-image-1',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const imageBuffer = await generateOpenAiImageBuffer(item.prompt)
      const imageUrl = await uploadGeneratedImageToBlob(
        imageBuffer,
        item.title
      )

      const artworkId = await upsertArtwork(item, imageUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl,
      })
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Ancient Civilizations batch 3 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
