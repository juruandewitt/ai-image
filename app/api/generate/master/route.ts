import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'PICASSO'
const ARTIST = 'Pablo Picasso'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Guernica in Picasso Style',
  'Les Demoiselles d Avignon in Picasso Style',
  'The Weeping Woman in Picasso Style',
  'Girl before a Mirror in Picasso Style',
  'Three Musicians in Picasso Style',
  'Woman with a Mandolin in Picasso Style',
  'Portrait of Dora Maar in Picasso Style',
  'The Old Guitarist in Picasso Style',
  'Harlequin with Violin in Picasso Style',
  'Still Life with Guitar in Picasso Style',
  'Bullfight Scene in Picasso Style',
  'Seated Woman in Picasso Style',
  'Woman in Armchair in Picasso Style',
  'Cubist Still Life in Picasso Style',
  'Blue Period Portrait in Picasso Style',
  'Rose Period Acrobat in Picasso Style',
  'Mother and Child in Picasso Style',
  'The Dream in Picasso Style',
  'Girl with Flower Crown in Picasso Style',
  'Mona Lisa in Picasso Style',

  'Girl with a Pearl Earring in Picasso Style',
  'The Last Supper in Picasso Style',
  'Starry Night in Picasso Style',
  'Water Lilies in Picasso Style',
  'The Night Watch in Picasso Style',
  'The Scream in Picasso Style',
  'Persistence of Memory in Picasso Style',
  'The Great Wave off Kanagawa in Picasso Style',
  'American Gothic in Picasso Style',
  'The School of Athens in Picasso Style',
  'Liberty Leading the People in Picasso Style',
  'Whistler Mother in Picasso Style',
  'The Thinker in Picasso Style',
  'View of Delft in Picasso Style',
  'The Art of Painting in Picasso Style',
  'The Music Lesson in Picasso Style',
  'The Milkmaid in Picasso Style',
  'The Love Letter in Picasso Style',
  'The Glass of Wine in Picasso Style',
  'Woman Holding a Balance in Picasso Style',

  'Young Woman with a Water Pitcher in Picasso Style',
  'Officer and Laughing Girl in Picasso Style',
  'Girl Reading a Letter by an Open Window in Picasso Style',
  'Woman with a Lute in Picasso Style',
  'The Hay Wain in Picasso Style',
  'The Red Vineyard in Picasso Style',
  'Impression Sunrise in Picasso Style',
  'Cafe Terrace at Night in Picasso Style',
  'Bridge in a Garden in Picasso Style',
  'Nighthawks in Picasso Style'
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
    message: 'Picasso 50-batch part 1 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
