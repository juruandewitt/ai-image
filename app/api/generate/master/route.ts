import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'REMBRANDT'
const ARTIST = 'Rembrandt'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Candlelit Scholar in Rembrandt Style',
  'Old Woman by the Hearth in Rembrandt Style',
  'Merchant at Writing Desk in Rembrandt Style',
  'Golden Portrait in Shadow in Rembrandt Style',
  'Man Reading by Candlelight in Rembrandt Style',
  'Woman with Lace Collar in Rembrandt Style',
  'Painter in Studio Light in Rembrandt Style',
  'Biblical Study in Warm Light in Rembrandt Style',
  'Man in Velvet Coat in Rembrandt Style',
  'Quiet Interior with Book in Rembrandt Style',
  'Portrait in Deep Shadow in Rembrandt Style',
  'Candlelit Table Scene in Rembrandt Style',
  'Young Scholar with Papers in Rembrandt Style',
  'Noble Figure in Amber Light in Rembrandt Style',
  'Old Testament Scene in Rembrandt Style',
  'Interior with Heavy Drapes in Rembrandt Style',
  'Portrait beside Globe in Rembrandt Style',
  'Storm over Harbor in Rembrandt Style',
  'Old Master Studio in Rembrandt Style',
  'Figure in Window Light in Rembrandt Style',

  'Sunflowers in Rembrandt Style',
  'Japanese Bridge in Rembrandt Style',
  'Rouen Cathedral in Rembrandt Style',
  'Parliament in Fog in Rembrandt Style',
  'Woman with Parasol in Rembrandt Style',
  'Boats on the Seine in Rembrandt Style',
  'Golden Path through Flowers in Rembrandt Style',
  'Evening Glow over Pond in Rembrandt Style',
  'Rose Garden in Rembrandt Style',
  'Wildflowers beside Water in Rembrandt Style',
  'Garden Gate in Summer in Rembrandt Style',
  'Pond with White Lilies in Rembrandt Style',
  'Sunset Reflections in Rembrandt Style',
  'Quiet Garden after Rain in Rembrandt Style',
  'Golden Sky Reflections in Rembrandt Style',
  'Small Boats at Dawn in Rembrandt Style',
  'Evening Reflections on Water in Rembrandt Style',
  'Woman by the Water Garden in Rembrandt Style',
  'Morning Fog on Water in Rembrandt Style',
  'Soft Light through Trees in Rembrandt Style',

  'David in Rembrandt Style',
  'Moses in Rembrandt Style',
  'Sistine Chapel Ceiling Study in Rembrandt Style',
  'The Last Judgement in Rembrandt Style',
  'Renaissance Chapel Interior in Rembrandt Style',
  'Marble Cloister in Rembrandt Style',
  'Sacred Stone Arcade in Rembrandt Style',
  'High Renaissance Chapel in Rembrandt Style',
  'Vaulted Hall of Frescoes in Rembrandt Style',
  'Golden Apse Light in Rembrandt Style'
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
    message: 'Rembrandt 50-batch part 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
