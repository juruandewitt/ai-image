import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'POLLOCK'
const ARTIST = 'Jackson Pollock'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Autumn Rhythm in Pollock Style',
  'Lavender Mist in Pollock Style',
  'Blue Poles in Pollock Style',
  'Number 1 in Pollock Style',
  'Number 5 in Pollock Style',
  'Convergence in Pollock Style',
  'Mural in Pollock Style',
  'Drip Composition in Pollock Style',
  'Black and White Energy in Pollock Style',
  'Splatter Field in Pollock Style',
  'Action Painting in Pollock Style',
  'Rhythmic Paint Web in Pollock Style',
  'Gesture and Motion in Pollock Style',
  'Layered Color Storm in Pollock Style',
  'Abstract Pulse in Pollock Style',
  'Midnight Splatter in Pollock Style',
  'Golden Drip Structure in Pollock Style',
  'Tangled Lines in Pollock Style',
  'Painted Chaos in Pollock Style',
  'Dynamic Color Field in Pollock Style',

  'Mona Lisa in Pollock Style',
  'Girl with a Pearl Earring in Pollock Style',
  'The Last Supper in Pollock Style',
  'Starry Night in Pollock Style',
  'Water Lilies in Pollock Style',
  'The Night Watch in Pollock Style',
  'The Scream in Pollock Style',
  'Persistence of Memory in Pollock Style',
  'The Great Wave off Kanagawa in Pollock Style',
  'American Gothic in Pollock Style',
  'The School of Athens in Pollock Style',
  'Liberty Leading the People in Pollock Style',
  'Whistler Mother in Pollock Style',
  'The Thinker in Pollock Style',
  'View of Delft in Pollock Style',
  'The Art of Painting in Pollock Style',
  'The Music Lesson in Pollock Style',
  'The Milkmaid in Pollock Style',
  'The Love Letter in Pollock Style',
  'The Glass of Wine in Pollock Style',

  'Woman Holding a Balance in Pollock Style',
  'Young Woman with a Water Pitcher in Pollock Style',
  'Officer and Laughing Girl in Pollock Style',
  'Girl Reading a Letter by an Open Window in Pollock Style',
  'Woman with a Lute in Pollock Style',
  'The Hay Wain in Pollock Style',
  'The Red Vineyard in Pollock Style',
  'Impression Sunrise in Pollock Style',
  'Cafe Terrace at Night in Pollock Style',
  'Nighthawks in Pollock Style'
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
    message: 'Pollock 50-batch part 1 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
