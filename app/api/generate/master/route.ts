import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'CARAVAGGIO'
const ARTIST = 'Caravaggio'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Dramatic Candlelit Hero in Caravaggio Style',
  'Triumphant Youth in Caravaggio Style',
  'Saint at Writing Table in Caravaggio Style',
  'Candlelit Supper Scene in Caravaggio Style',
  'Pilgrims in Shadowed Chapel in Caravaggio Style',
  'Musician under Candlelight in Caravaggio Style',
  'Young Nobleman in Dark Velvet in Caravaggio Style',
  'Fruit Seller in Dramatic Light in Caravaggio Style',
  'Woman in Red Shawl in Caravaggio Style',
  'Scholar with Manuscript in Caravaggio Style',
  'Old Man with Lantern in Caravaggio Style',
  'Dark Interior with Table and Fruit in Caravaggio Style',
  'Stormy Harbor in Caravaggio Style',
  'Boy with Violin in Caravaggio Style',
  'Woman beside Stone Window in Caravaggio Style',
  'Pilgrim at Dusk in Caravaggio Style',
  'Candlelit Courtyard in Caravaggio Style',
  'Golden Tavern Light in Caravaggio Style',
  'Chapel Interior with Figures in Caravaggio Style',
  'Still Life in Dramatic Shadow in Caravaggio Style',

  'Sunflowers in Caravaggio Style',
  'Japanese Bridge in Caravaggio Style',
  'Rouen Cathedral in Caravaggio Style',
  'Parliament in Fog in Caravaggio Style',
  'Woman with Parasol in Caravaggio Style',
  'Boats on the Seine in Caravaggio Style',
  'Golden Path through Flowers in Caravaggio Style',
  'Evening Glow over Pond in Caravaggio Style',
  'Rose Garden in Caravaggio Style',
  'Wildflowers beside Water in Caravaggio Style',
  'Garden Gate in Summer in Caravaggio Style',
  'Pond with White Lilies in Caravaggio Style',
  'Sunset Reflections in Caravaggio Style',
  'Quiet Garden after Rain in Caravaggio Style',
  'Golden Sky Reflections in Caravaggio Style',
  'Small Boats at Dawn in Caravaggio Style',
  'Evening Reflections on Water in Caravaggio Style',
  'Woman by the Water Garden in Caravaggio Style',
  'Morning Fog on Water in Caravaggio Style',
  'Soft Light through Trees in Caravaggio Style',

  'David in Caravaggio Style',
  'Moses in Caravaggio Style',
  'Sistine Chapel Ceiling Study in Caravaggio Style',
  'The Last Judgement in Caravaggio Style',
  'Renaissance Chapel Interior in Caravaggio Style',
  'Marble Cloister in Caravaggio Style',
  'Sacred Stone Arcade in Caravaggio Style',
  'High Renaissance Chapel in Caravaggio Style',
  'Vaulted Hall of Frescoes in Caravaggio Style',
  'Golden Apse Light in Caravaggio Style'
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
    message: 'Caravaggio 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
