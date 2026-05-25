import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'travel-destinations'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Dubai Luxury Skyline', 'Dubai luxury skyline at sunset, modern skyscrapers, golden reflections, futuristic city atmosphere'],
  ['Kyoto Temple Garden', 'Kyoto temple garden in autumn, red maple leaves, wooden architecture, peaceful Japanese atmosphere'],
  ['Iceland Waterfall Road', 'Iceland road leading to dramatic waterfall, black volcanic landscape, misty cinematic sky'],
  ['Amalfi Coast Cliff Town', 'Amalfi coast cliff town, colorful houses, Mediterranean sea, warm summer sunlight'],
  ['African Safari Lodge', 'luxury African safari lodge at sunset, savanna landscape, acacia trees, warm golden horizon'],
  ['Canadian Lake Mountains', 'Canadian mountain lake, turquoise water, pine forest, snow peaks, clear alpine light'],
  ['Singapore Garden Skyline', 'Singapore garden skyline, futuristic towers, lush greenery, evening city glow'],
  ['Cappadocia Balloon Sunrise', 'Cappadocia hot air balloons at sunrise, rocky valleys, soft pastel sky, magical travel view'],
  ['Bora Bora Lagoon', 'Bora Bora lagoon, turquoise water, overwater bungalows, tropical mountain backdrop'],
  ['London Rainy Street', 'London rainy street at night, historic architecture, reflections, warm city lights'],
].map(([name, description]) => ({
  title: `${name} - Travel Destinations Theme`,
  prompt: `premium travel and destination digital artwork, ${description}, ultra realistic, cinematic lighting, luxury travel photography style, commercial wall art quality, rich detail, no people, no readable text, no logos, no watermark`,
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

  const response = await fetch('https://api.openai.com/v1/images/generations', {
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
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI image generation failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  const base64 = data?.data?.[0]?.b64_json

  if (!base64 || typeof base64 !== 'string') {
    throw new Error('No base64 image returned from OpenAI')
  }

  return Buffer.from(base64, 'base64')
}

async function uploadGeneratedImageToBlob(imageBuffer: Buffer, title: string) {
  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    imageBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    }
  )

  if (!blob.url) throw new Error('Blob upload failed')
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const tags = [
    THEME_TAG,
    'theme',
    'travel',
    'destinations',
    'cities',
    'landmarks',
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
      const blobUrl = await uploadGeneratedImageToBlob(imageBuffer, item.title)
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
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Travel Destinations batch 2 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
