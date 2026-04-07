import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'REMBRANDT'
const ARTIST = 'Rembrandt'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'The Night Watch in Rembrandt Style',
  'The Return of the Prodigal Son in Rembrandt Style',
  'The Anatomy Lesson in Rembrandt Style',
  'The Jewish Bride in Rembrandt Style',
  'Bathsheba at Her Bath in Rembrandt Style',
  'Belshazzar Feast in Rembrandt Style',
  'Self Portrait in Rembrandt Style',
  'Self Portrait with Two Circles in Rembrandt Style',
  'The Storm on the Sea of Galilee in Rembrandt Style',
  'The Syndics in Rembrandt Style',
  'Scholar at Candlelight in Rembrandt Style',
  'Old Man in Shadow in Rembrandt Style',
  'Young Woman in Golden Light in Rembrandt Style',
  'Man with Feathered Hat in Rembrandt Style',
  'Portrait with Ruff Collar in Rembrandt Style',
  'Reading Figure by Window in Rembrandt Style',
  'Biblical Interior in Rembrandt Style',
  'Golden Study Room in Rembrandt Style',
  'Merchant Portrait in Rembrandt Style',
  'Woman in Velvet Gown in Rembrandt Style',

  'Mona Lisa in Rembrandt Style',
  'Girl with a Pearl Earring in Rembrandt Style',
  'The Last Supper in Rembrandt Style',
  'Starry Night in Rembrandt Style',
  'Water Lilies in Rembrandt Style',
  'The Scream in Rembrandt Style',
  'Persistence of Memory in Rembrandt Style',
  'The Great Wave off Kanagawa in Rembrandt Style',
  'American Gothic in Rembrandt Style',
  'The School of Athens in Rembrandt Style',
  'Liberty Leading the People in Rembrandt Style',
  'Whistler Mother in Rembrandt Style',
  'The Thinker in Rembrandt Style',
  'View of Delft in Rembrandt Style',
  'The Art of Painting in Rembrandt Style',
  'The Music Lesson in Rembrandt Style',
  'The Milkmaid in Rembrandt Style',
  'The Love Letter in Rembrandt Style',
  'The Glass of Wine in Rembrandt Style',
  'Woman Holding a Balance in Rembrandt Style',

  'Young Woman with a Water Pitcher in Rembrandt Style',
  'Officer and Laughing Girl in Rembrandt Style',
  'Girl Reading a Letter by an Open Window in Rembrandt Style',
  'Woman with a Lute in Rembrandt Style',
  'The Hay Wain in Rembrandt Style',
  'The Red Vineyard in Rembrandt Style',
  'Impression Sunrise in Rembrandt Style',
  'Cafe Terrace at Night in Rembrandt Style',
  'Bridge in a Garden in Rembrandt Style',
  'Nighthawks in Rembrandt Style'
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
    message: 'Rembrandt 50-batch part 1 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
