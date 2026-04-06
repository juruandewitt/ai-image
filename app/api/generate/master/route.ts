import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'MONET'
const ARTIST = 'Claude Monet'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'The Night Watch in Monet Style',
  'The Kiss in Monet Style',
  'The Great Wave off Kanagawa in Monet Style',
  'Nighthawks in Monet Style',
  'The School of Athens in Monet Style',
  'Liberty Leading the People in Monet Style',
  'Whistler Mother in Monet Style',
  'The Thinker in Monet Style',
  'View of Delft in Monet Style',
  'The Art of Painting in Monet Style',
  'The Music Lesson in Monet Style',
  'The Milkmaid in Monet Style',
  'The Love Letter in Monet Style',
  'The Glass of Wine in Monet Style',
  'Woman Holding a Balance in Monet Style',
  'Young Woman with a Water Pitcher in Monet Style',
  'Officer and Laughing Girl in Monet Style',
  'Girl Reading a Letter by an Open Window in Monet Style',
  'Woman with a Lute in Monet Style',
  'The Hay Wain in Monet Style',

  'The Red Vineyard in Monet Style',
  'Impression Sunrise in Monet Style',
  'Cafe Terrace at Night in Monet Style',
  'Bridge over Still Water in Monet Style',
  'Woman by the Water Garden in Monet Style',
  'Golden Willows at Noon in Monet Style',
  'Cloud Reflections in Monet Style',
  'Flower Market Morning in Monet Style',
  'Sunlit Riverbank in Monet Style',
  'Rain over Garden Pond in Monet Style',
  'Blue Shadows on Snow in Monet Style',
  'Pale Morning over Canal in Monet Style',
  'Wind in the Poppies in Monet Style',
  'Soft Light through Trees in Monet Style',
  'Garden Steps in Spring in Monet Style',
  'Lilac Bushes in Bloom in Monet Style',
  'Quiet Terrace with Flowers in Monet Style',
  'Sunlit Birch Grove in Monet Style',
  'Wild Garden after Rain in Monet Style',
  'Reflections of Golden Clouds in Monet Style',

  'Path beside Water Lilies in Monet Style',
  'Rose Arches in Summer in Monet Style',
  'Still Water at Twilight in Monet Style',
  'Warm Evening on the Seine in Monet Style',
  'Boat Landing in Morning Light in Monet Style',
  'Marigolds by the Window in Monet Style',
  'Soft Breeze through Garden in Monet Style',
  'Pond with White Lilies in Monet Style',
  'Sunset Reflections in Monet Style',
  'Quiet Garden after Rain in Monet Style'
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
    message: 'Monet 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
