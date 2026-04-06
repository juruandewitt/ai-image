import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'DALI'
const ARTIST = 'Salvador Dalí'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Persistence of Memory in Dali Style',
  'Swans Reflecting Elephants in Dali Style',
  'The Elephants in Dali Style',
  'The Burning Giraffe in Dali Style',
  'Dream Caused by the Flight of a Bee in Dali Style',
  'Metamorphosis of Narcissus in Dali Style',
  'Galatea of the Spheres in Dali Style',
  'Soft Construction with Boiled Beans in Dali Style',
  'The Temptation of Saint Anthony in Dali Style',
  'Christ of Saint John of the Cross in Dali Style',
  'Surreal Desert Clockscape in Dali Style',
  'Melting Timepieces in Dali Style',
  'Long Legged Elephant in Dali Style',
  'Surreal Coastal Dream in Dali Style',
  'Lobster Telephone Inspired Scene in Dali Style',
  'Surreal Staircase with Shadows in Dali Style',
  'Dream Landscape with Moons in Dali Style',
  'Floating Stone Arch in Dali Style',
  'Cracked Earth with Reflections in Dali Style',
  'Impossible Window over Sea in Dali Style',

  'Mona Lisa in Dali Style',
  'Girl with a Pearl Earring in Dali Style',
  'The Last Supper in Dali Style',
  'Starry Night in Dali Style',
  'Water Lilies in Dali Style',
  'The Night Watch in Dali Style',
  'The Scream in Dali Style',
  'The Great Wave off Kanagawa in Dali Style',
  'American Gothic in Dali Style',
  'The School of Athens in Dali Style',
  'Liberty Leading the People in Dali Style',
  'Whistler Mother in Dali Style',
  'The Thinker in Dali Style',
  'View of Delft in Dali Style',
  'The Art of Painting in Dali Style',
  'The Music Lesson in Dali Style',
  'The Milkmaid in Dali Style',
  'The Love Letter in Dali Style',
  'The Glass of Wine in Dali Style',
  'Woman Holding a Balance in Dali Style',

  'Young Woman with a Water Pitcher in Dali Style',
  'Officer and Laughing Girl in Dali Style',
  'Girl Reading a Letter by an Open Window in Dali Style',
  'Woman with a Lute in Dali Style',
  'The Hay Wain in Dali Style',
  'The Red Vineyard in Dali Style',
  'Impression Sunrise in Dali Style',
  'Cafe Terrace at Night in Dali Style',
  'Bridge in a Garden in Dali Style',
  'Nighthawks in Dali Style'
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
    message: 'Dali 50-batch part 1 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
