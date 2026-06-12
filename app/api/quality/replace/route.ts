import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'fantasy-kingdoms'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  [
    'Kingdom Of The Golden Dragons',
    'legendary fantasy kingdom ruled by golden dragons, magnificent royal castles, magical mountains and epic landscapes',
  ],
  [
    'Celestial Crystal Empire',
    'vast fantasy empire constructed from celestial crystals glowing beneath magical skies',
  ],
  [
    'Eternal Sky Palace',
    'majestic floating palace kingdom suspended among clouds with radiant towers and magical bridges',
  ],
  [
    'Silver Phoenix Kingdom',
    'beautiful fantasy realm inspired by silver phoenixes, elegant palaces and enchanted gardens',
  ],
  [
    'Arcane Dragon Fortress',
    'powerful magical fortress kingdom protected by ancient dragons and arcane defenses',
  ],
  [
    'Moonstone Royal Capital',
    'luxurious fantasy capital city built from moonstone architecture illuminated by celestial light',
  ],
  [
    'Emerald Griffin Kingdom',
    'prosperous kingdom guarded by majestic griffins surrounded by enchanted forests and royal fortresses',
  ],
  [
    'Crystal Throne Empire',
    'epic fantasy empire centered around a magnificent crystal throne and breathtaking royal architecture',
  ],
  [
    'Dragon Crown Citadel',
    'ultimate dragon kingdom featuring towering citadels, magical wonders and legendary royal halls',
  ],
  [
    'The Ultimate Fantasy Kingdom',
    'masterpiece fantasy kingdom combining dragons, castles, floating islands, magical cities and epic fantasy grandeur',
  ],
].map(([name, description]) => ({
  title: `${name} - Fantasy Kingdoms Theme`,
  prompt: `premium fantasy kingdoms digital artwork, ${description}, ultra realistic, cinematic fantasy lighting, luxury concept art quality, epic magical kingdom environment, masterpiece, highly detailed architecture, fantasy wall art, rich colors, magical atmosphere, no readable text, no logos, no watermark, no people`,
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

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY')
  }

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

  if (!base64 || typeof base64 !== 'string') {
    throw new Error('No base64 image returned from OpenAI')
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

  if (!blob.url) {
    throw new Error('Blob upload failed')
  }

  return blob.url
}

async function upsertArtwork(
  item: (typeof ITEMS)[number],
  imageUrl: string
) {
  const tags = [
    THEME_TAG,
    'theme',
    'fantasy',
    'kingdoms',
    'dragons',
    'magic',
    'castles',
    'wall-art',
  ]

  const existing = await prisma.artwork.findFirst({
    where: { title: item.title },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: ARTIST,
          thumbnail: imageUrl,
          tags,
          status: 'PUBLISHED' as any,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: imageUrl,
          tags,
          status: 'PUBLISHED' as any,
          price: 9.99,
        },
        select: { id: true },
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

      const blobUrl = await uploadGeneratedImageToBlob(
        imageBuffer,
        item.title
      )

      const artworkId = await upsertArtwork(item, blobUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl: blobUrl,
      })
    } catch (err) {
      results.push({
        title: item.title,
        success: false,
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Fantasy Kingdoms final batch complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
