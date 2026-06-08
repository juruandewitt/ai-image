import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'cars-automotive'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  [
    'Luxury Hypercar Collection',
    'private collection of luxury hypercars displayed in an architectural glass showroom with dramatic lighting',
  ],
  [
    'Classic Automotive Museum',
    'world class automotive museum featuring iconic classic vehicles and elegant exhibition spaces',
  ],
  [
    'Supercar Mountain Resort',
    'exotic supercars parked at an exclusive mountain resort surrounded by alpine scenery',
  ],
  [
    'Luxury EV Innovation Center',
    'futuristic electric vehicle innovation center with cutting edge automotive technology displays',
  ],
  [
    'Performance Racing Headquarters',
    'professional motorsport headquarters with race cars engineering workspaces and championship atmosphere',
  ],
  [
    'Executive Car Collection Estate',
    'luxury estate garage featuring an executive collection of premium vehicles and refined architecture',
  ],
  [
    'Hypercar Marina District',
    'ultra luxury hypercars parked beside an exclusive marina with yachts and waterfront views',
  ],
  [
    'Automotive Design Pavilion',
    'award winning automotive design pavilion showcasing concept cars and modern design excellence',
  ],
  [
    'Grand Touring Mountain Escape',
    'luxury grand touring vehicles driving through scenic mountain landscapes during golden hour',
  ],
  [
    'Ultimate Automotive Lifestyle',
    'luxury automotive lifestyle scene combining supercars architecture and premium living experiences',
  ],
].map(([name, description]) => ({
  title: `${name} - Cars Automotive Theme`,
  prompt: `premium automotive artwork, ${description}, ultra realistic, luxury vehicle photography, cinematic lighting, highly detailed, commercial wall art quality, premium automotive lifestyle, showroom quality, luxury transportation aesthetic, rich reflections, award winning composition, no readable text, no logos, no watermark, no people`,
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
    'cars',
    'automotive',
    'luxury',
    'vehicles',
    'transportation',
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
          style: STYLE as any,
          artist: ARTIST,
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

      const blobUrl = await uploadGeneratedImageToBlob(
        imageBuffer,
        item.title
      )

      const artworkId = await upsertArtwork(
        item,
        blobUrl
      )

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
    message: 'Cars Automotive final batch complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
