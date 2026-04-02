import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'MICHELANGELO'
const ARTIST = 'Michelangelo'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Renaissance Dome Interior in Michelangelo Style',
  'Stone Chapel Aisle in Michelangelo Style',
  'Sunlight through Basilica Windows in Michelangelo Style',
  'Sacred Vault with Fresco Panels in Michelangelo Style',
  'Marble Courtyard with Arches in Michelangelo Style',
  'Monumental Stone Passage in Michelangelo Style',
  'Golden Nave Light in Michelangelo Style',
  'Cathedral Columns at Dusk in Michelangelo Style',
  'Painted Ceiling in Chapel Light in Michelangelo Style',
  'Renaissance Sanctuary in Michelangelo Style',

  'The Kiss in Michelangelo Style',
  'The School of Athens in Michelangelo Style',
  'Liberty Leading the People in Michelangelo Style',
  'Whistler Mother in Michelangelo Style',
  'The Thinker in Michelangelo Style',
  'Bridge in a Garden in Michelangelo Style',
  'The Hay Wain in Michelangelo Style',
  'View of Delft in Michelangelo Style',
  'The Art of Painting in Michelangelo Style',
  'The Music Lesson in Michelangelo Style'
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
  const prompt = title

  const existing = await prisma.artwork.findFirst({
    where: { title, style: STYLE as any },
  })

  if (existing) return { title, success: true, reused: true }

  const openAiUrl = await generateOpenAiImageUrl(prompt)
  const stableImageUrl = await uploadImageToBlob(openAiUrl, title)

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
      prompt,
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
    message: 'Michelangelo batch completion 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
