import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'MUNCH'
const ARTIST = 'Edvard Munch'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Moonlit Bridge in Munch Style',
  'Red Sky over Fjord in Munch Style',
  'Lonely Street at Dusk in Munch Style',
  'Melancholic Garden Path in Munch Style',
  'Figure beneath Red Moon in Munch Style',
  'Evening Window Glow in Munch Style',
  'Anxious Crowd at Twilight in Munch Style',
  'Lonely Shoreline in Munch Style',
  'Emotional Portrait in Munch Style',
  'Woman in Red Shadow in Munch Style',
  'Blue Night Interior in Munch Style',
  'Silent Room with Figure in Munch Style',
  'Fjord Reflection in Munch Style',
  'Yellow Sky and Dark Trees in Munch Style',
  'Woman beneath Moonlight in Munch Style',
  'Expressionist Street Scene in Munch Style',
  'Restless Sea at Night in Munch Style',
  'Dark Window and Lamp in Munch Style',
  'Figure on the Bridge at Night in Munch Style',
  'Twilight Anxiety Scene in Munch Style',

  'Sunflowers in Munch Style',
  'Japanese Bridge in Munch Style',
  'Rouen Cathedral in Munch Style',
  'Parliament in Fog in Munch Style',
  'Woman with Parasol in Munch Style',
  'Boats on the Seine in Munch Style',
  'Golden Path through Flowers in Munch Style',
  'Evening Glow over Pond in Munch Style',
  'Rose Garden in Munch Style',
  'Wildflowers beside Water in Munch Style',
  'Garden Gate in Summer in Munch Style',
  'Pond with White Lilies in Munch Style',
  'Sunset Reflections in Munch Style',
  'Quiet Garden after Rain in Munch Style',
  'Golden Sky Reflections in Munch Style',
  'Small Boats at Dawn in Munch Style',
  'Evening Reflections on Water in Munch Style',
  'Woman by the Water Garden in Munch Style',
  'Morning Fog on Water in Munch Style',
  'Soft Light through Trees in Munch Style',

  'David in Munch Style',
  'Moses in Munch Style',
  'Sistine Chapel Ceiling Study in Munch Style',
  'The Last Judgement in Munch Style',
  'Renaissance Chapel Interior in Munch Style',
  'Marble Cloister in Munch Style',
  'Sacred Stone Arcade in Munch Style',
  'High Renaissance Chapel in Munch Style',
  'Vaulted Hall of Frescoes in Munch Style',
  'Golden Apse Light in Munch Style'
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
    message: 'Munch 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
