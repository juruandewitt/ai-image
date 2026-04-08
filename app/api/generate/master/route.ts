import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'POLLOCK'
const ARTIST = 'Jackson Pollock'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Crimson Splash Field in Pollock Style',
  'Silver Drip Current in Pollock Style',
  'Dense Black Web in Pollock Style',
  'Amber Motion Grid in Pollock Style',
  'Electric Blue Splatter in Pollock Style',
  'Chaotic White Lines in Pollock Style',
  'Layered Paint Constellation in Pollock Style',
  'Fractured Rhythm in Pollock Style',
  'Storm of Color in Pollock Style',
  'Interlaced Energy in Pollock Style',
  'Paint Network in Pollock Style',
  'Gestural Horizon in Pollock Style',
  'Splintered Color Rain in Pollock Style',
  'Wild Drip Matrix in Pollock Style',
  'Nocturne Splatter in Pollock Style',
  'Bronze and Black Motion in Pollock Style',
  'White Line Frenzy in Pollock Style',
  'Chaotic Ember Field in Pollock Style',
  'Abstract Thunder Pattern in Pollock Style',
  'Dense Action Surface in Pollock Style',

  'Sunflowers in Pollock Style',
  'Japanese Bridge in Pollock Style',
  'Rouen Cathedral in Pollock Style',
  'Parliament in Fog in Pollock Style',
  'Woman with Parasol in Pollock Style',
  'Boats on the Seine in Pollock Style',
  'Golden Path through Flowers in Pollock Style',
  'Evening Glow over Pond in Pollock Style',
  'Rose Garden in Pollock Style',
  'Wildflowers beside Water in Pollock Style',
  'Garden Gate in Summer in Pollock Style',
  'Pond with White Lilies in Pollock Style',
  'Sunset Reflections in Pollock Style',
  'Quiet Garden after Rain in Pollock Style',
  'Golden Sky Reflections in Pollock Style',
  'Small Boats at Dawn in Pollock Style',
  'Evening Reflections on Water in Pollock Style',
  'Woman by the Water Garden in Pollock Style',
  'Morning Fog on Water in Pollock Style',
  'Soft Light through Trees in Pollock Style',

  'David in Pollock Style',
  'Moses in Pollock Style',
  'Sistine Chapel Ceiling Study in Pollock Style',
  'The Last Judgement in Pollock Style',
  'Renaissance Chapel Interior in Pollock Style',
  'Marble Cloister in Pollock Style',
  'Sacred Stone Arcade in Pollock Style',
  'High Renaissance Chapel in Pollock Style',
  'Vaulted Hall of Frescoes in Pollock Style',
  'Golden Apse Light in Pollock Style'
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
    message: 'Pollock 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
