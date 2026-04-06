import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'MONET'
const ARTIST = 'Claude Monet'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Water Lilies in Monet Style',
  'Water Lilies at Dawn in Monet Style',
  'Water Lilies at Sunset in Monet Style',
  'Japanese Bridge in Monet Style',
  'Bridge over Quiet Water in Monet Style',
  'Garden in Bloom in Monet Style',
  'Morning Light on the River in Monet Style',
  'Misty Morning Garden in Monet Style',
  'Spring Blossom Path in Monet Style',
  'Reflections of Sky in Monet Style',
  'Summer Meadow Light in Monet Style',
  'Quiet Pond Afternoon in Monet Style',
  'Poppies in a Field in Monet Style',
  'Haystacks at Sunset in Monet Style',
  'Haystacks in Morning Mist in Monet Style',
  'Rouen Cathedral in Soft Light in Monet Style',
  'Parliament in Fog in Monet Style',
  'Woman with Parasol in Monet Style',
  'Camille in Garden Light in Monet Style',
  'Coastal Cliffs in Monet Style',
  'Boats on the Seine in Monet Style',
  'Seine River at Dawn in Monet Style',
  'Autumn Trees by Water in Monet Style',
  'Snowy Garden in Monet Style',
  'Blooming Orchard in Monet Style',
  'Iris Garden in Monet Style',
  'Golden Path through Flowers in Monet Style',
  'Sunlit Courtyard in Monet Style',
  'Willows over Water in Monet Style',
  'Lavender Field in Monet Style',
  'Lily Pond with Reflections in Monet Style',
  'Bridge in a Garden in Monet Style',
  'Morning Fog on Water in Monet Style',
  'Evening Glow over Pond in Monet Style',
  'Distant Hills in Haze in Monet Style',
  'Rose Garden in Monet Style',
  'Sunrise over Meadow in Monet Style',
  'Canal View in Monet Style',
  'Wildflowers beside Water in Monet Style',
  'Garden Gate in Summer in Monet Style',
  'Mona Lisa in Monet Style',
  'The Last Supper in Monet Style',
  'Girl with a Pearl Earring in Monet Style',
  'Starry Night in Monet Style',
  'Birth of Venus in Monet Style',
  'Persistence of Memory in Monet Style',
  'American Gothic in Monet Style',
  'The Scream in Monet Style',
  'Creation of Adam in Monet Style',
  'Guernica in Monet Style'
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
    message: 'Monet 50-batch part 1 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
