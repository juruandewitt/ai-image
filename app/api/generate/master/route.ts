import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'MUNCH'
const ARTIST = 'Edvard Munch'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'The Scream in Munch Style',
  'Madonna in Munch Style',
  'The Dance of Life in Munch Style',
  'Anxiety in Munch Style',
  'The Kiss in Munch Style',
  'Ashes in Munch Style',
  'Jealousy in Munch Style',
  'Melancholy in Munch Style',
  'The Sick Child in Munch Style',
  'Vampire in Munch Style',
  'Self Portrait in Munch Style',
  'Girls on the Bridge in Munch Style',
  'Death in the Sickroom in Munch Style',
  'The Sun in Munch Style',
  'Red and White in Munch Style',
  'Moonlight by the Shore in Munch Style',
  'Starry Night in Munch Style',
  'Woman by the Window in Munch Style',
  'Lonely Figure by the Sea in Munch Style',
  'Evening on Karl Johan Street in Munch Style',

  'Mona Lisa in Munch Style',
  'Girl with a Pearl Earring in Munch Style',
  'The Last Supper in Munch Style',
  'Water Lilies in Munch Style',
  'The Night Watch in Munch Style',
  'Persistence of Memory in Munch Style',
  'The Great Wave off Kanagawa in Munch Style',
  'American Gothic in Munch Style',
  'The School of Athens in Munch Style',
  'Liberty Leading the People in Munch Style',
  'Whistler Mother in Munch Style',
  'The Thinker in Munch Style',
  'View of Delft in Munch Style',
  'The Art of Painting in Munch Style',
  'The Music Lesson in Munch Style',
  'The Milkmaid in Munch Style',
  'The Love Letter in Munch Style',
  'The Glass of Wine in Munch Style',
  'Woman Holding a Balance in Munch Style',
  'Young Woman with a Water Pitcher in Munch Style',

  'Officer and Laughing Girl in Munch Style',
  'Girl Reading a Letter by an Open Window in Munch Style',
  'Woman with a Lute in Munch Style',
  'The Hay Wain in Munch Style',
  'The Red Vineyard in Munch Style',
  'Impression Sunrise in Munch Style',
  'Cafe Terrace at Night in Munch Style',
  'Bridge in a Garden in Munch Style',
  'Nighthawks in Munch Style',
  'Sunflowers in Munch Style'
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
    message: 'Munch 50-batch part 1 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
