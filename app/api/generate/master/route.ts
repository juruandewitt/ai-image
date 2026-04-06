import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'VAN_GOGH'
const ARTIST = 'Vincent van Gogh'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Roses in a Vase in Van Gogh Style',
  'Field of Poppies in Van Gogh Style',
  'Rain over Wheat Field in Van Gogh Style',
  'Evening Village under Stars in Van Gogh Style',
  'Blue Irises beside Wall in Van Gogh Style',
  'Country Road with Trees in Van Gogh Style',
  'Moonlit Orchard in Van Gogh Style',
  'Sunlit Farmhouse in Van Gogh Style',
  'Golden Field with Path in Van Gogh Style',
  'Still Life with Chair in Van Gogh Style',
  'The Kiss in Van Gogh Style',
  'Whistler Mother in Van Gogh Style',
  'Liberty Leading the People in Van Gogh Style',
  'The Thinker in Van Gogh Style',
  'Nighthawks in Van Gogh Style',
  'Birth of Venus in Van Gogh Style',
  'View of Delft in Van Gogh Style',
  'The Art of Painting in Van Gogh Style',
  'The Music Lesson in Van Gogh Style',
  'The Milkmaid in Van Gogh Style'
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
    message: 'Van Gogh batch 3 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
