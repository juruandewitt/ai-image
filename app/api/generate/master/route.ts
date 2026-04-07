import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'DALI'
const ARTIST = 'Salvador Dalí'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Surreal Clock Tower in Dali Style',
  'Desert with Floating Doors in Dali Style',
  'Dream Harbor with Silent Boats in Dali Style',
  'Moonlit Desert Arch in Dali Style',
  'Melting Staircase in Dali Style',
  'Suspended Stone Window in Dali Style',
  'Long Shadow Courtyard in Dali Style',
  'Surreal Garden of Mirrors in Dali Style',
  'Impossible Balcony over Water in Dali Style',
  'Cracked Marble Plaza in Dali Style',
  'Dream of a Golden Hall in Dali Style',
  'Surreal Library with Open Sky in Dali Style',
  'Floating Bridge over Desert in Dali Style',
  'Mirror Lake with Distorted Horizon in Dali Style',
  'Surreal Orchard with Moons in Dali Style',
  'Twilight Plaza with Echoes in Dali Style',
  'Dream Path through Empty Arches in Dali Style',
  'Long Legged Horse in Dali Style',
  'Window into a Second Sea in Dali Style',
  'Golden Sand with Reflections in Dali Style',

  'Sunflowers in Dali Style',
  'Japanese Bridge in Dali Style',
  'Rouen Cathedral in Dali Style',
  'Parliament in Fog in Dali Style',
  'Woman with Parasol in Dali Style',
  'Boats on the Seine in Dali Style',
  'Golden Path through Flowers in Dali Style',
  'Evening Glow over Pond in Dali Style',
  'Rose Garden in Dali Style',
  'Wildflowers beside Water in Dali Style',
  'Garden Gate in Summer in Dali Style',
  'Pond with White Lilies in Dali Style',
  'Sunset Reflections in Dali Style',
  'Quiet Garden after Rain in Dali Style',
  'Golden Sky Reflections in Dali Style',
  'Small Boats at Dawn in Dali Style',
  'Evening Reflections on Water in Dali Style',
  'Woman by the Water Garden in Dali Style',
  'Morning Fog on Water in Dali Style',
  'Soft Light through Trees in Dali Style',

  'David in Dali Style',
  'Moses in Dali Style',
  'Sistine Chapel Ceiling Study in Dali Style',
  'The Last Judgement in Dali Style',
  'Renaissance Chapel Interior in Dali Style',
  'Marble Cloister in Dali Style',
  'Sacred Stone Arcade in Dali Style',
  'High Renaissance Chapel in Dali Style',
  'Vaulted Hall of Frescoes in Dali Style',
  'Golden Apse Light in Dali Style'
]

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function generateOpenAiImageUrl(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
      n: 1,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI image generation failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const imageUrl = data?.data?.[0]?.url
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('No image URL returned from OpenAI')
  }

  return imageUrl
}

async function uploadImageToBlob(openAiUrl: string, title: string) {
  const imageRes = await fetch(openAiUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    const text = await imageRes.text().catch(() => '')
    throw new Error(`Failed to download generated image (${imageRes.status}): ${text}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const path = `artworks/${safeFilePart(STYLE)}/${safeFilePart(title)}.png`

  const blob = await put(path, arrayBuffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  })

  if (!blob?.url) throw new Error('Failed to upload generated image to Vercel Blob')
  return blob.url
}

async function processOneTitle(title: string) {
  const existing = await prisma.artwork.findFirst({
    where: { title, style: STYLE as any },
  })

  if (existing) return { title, success: true, reused: true }

  const stableImageUrl = await uploadImageToBlob(
    await generateOpenAiImageUrl(title),
    title
  )

  const artwork = await prisma.artwork.create({
    data: {
      title,
      style: STYLE as any,
      artist: ARTIST,
      thumbnail: stableImageUrl,
      status: 'PUBLISHED' as any,
      tags: [],
      price: 9.99,
    },
  })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: stableImageUrl,
      provider: DEFAULT_ASSET_PROVIDER,
      prompt: title,
    },
  })

  return { title, success: true, created: true }
}

export async function GET() {
  const results = []

  for (const title of TITLES) {
    try {
      const result = await processOneTitle(title)
      results.push(result)
    } catch (error) {
      results.push({
        title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Dali 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
