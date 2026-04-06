import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'PICASSO'
const ARTIST = 'Pablo Picasso'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Cubist City Street in Picasso Style',
  'Cubist Cafe Interior in Picasso Style',
  'Cubist Violin and Bottle in Picasso Style',
  'Fragmented Portrait with Blue Eyes in Picasso Style',
  'Angular Woman with Hat in Picasso Style',
  'Cubist Guitar on Table in Picasso Style',
  'Harlequin in Red and Blue in Picasso Style',
  'Seated Musician in Picasso Style',
  'Abstract Mother and Child in Picasso Style',
  'Bull and Moon in Picasso Style',
  'Cubist Balcony Scene in Picasso Style',
  'Still Life with Fruit Bowl in Picasso Style',
  'Still Life with Newspaper in Picasso Style',
  'Woman by Open Window in Picasso Style',
  'Striped Armchair Portrait in Picasso Style',
  'Cubist Horse Study in Picasso Style',
  'Blue Room Figure in Picasso Style',
  'Rose Circus Performer in Picasso Style',
  'Angular Still Life with Lamp in Picasso Style',
  'Painter in Studio in Picasso Style',

  'Sunflowers in Picasso Style',
  'Cafe Terrace at Night in Picasso Style',
  'Water Lilies at Dawn in Picasso Style',
  'Japanese Bridge in Picasso Style',
  'Bridge over Quiet Water in Picasso Style',
  'Rouen Cathedral in Picasso Style',
  'Parliament in Fog in Picasso Style',
  'Woman with Parasol in Picasso Style',
  'Boats on the Seine in Picasso Style',
  'Golden Path through Flowers in Picasso Style',
  'Evening Glow over Pond in Picasso Style',
  'Rose Garden in Picasso Style',
  'Wildflowers beside Water in Picasso Style',
  'Garden Gate in Summer in Picasso Style',
  'Pond with White Lilies in Picasso Style',
  'Sunset Reflections in Picasso Style',
  'Quiet Garden after Rain in Picasso Style',
  'Golden Sky Reflections in Picasso Style',
  'Small Boats at Dawn in Picasso Style',
  'Evening Reflections on Water in Picasso Style',

  'David in Picasso Style',
  'Moses in Picasso Style',
  'Sistine Chapel Ceiling Study in Picasso Style',
  'The Last Judgement in Picasso Style',
  'Renaissance Chapel Interior in Picasso Style',
  'Marble Cloister in Picasso Style',
  'Sacred Stone Arcade in Picasso Style',
  'High Renaissance Chapel in Picasso Style',
  'Vaulted Hall of Frescoes in Picasso Style',
  'Golden Apse Light in Picasso Style'
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
    message: 'Picasso 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
