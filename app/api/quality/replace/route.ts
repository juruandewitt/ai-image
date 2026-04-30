import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DALI'
const ARTIST = 'Salvador Dalí'

const ITEMS = [
  {
    title: 'Persistence of Memory Inspired',
    prompt:
      'museum-quality surrealist oil painting inspired by Salvador Dali, vast coastal landscape at dusk, precise long shadows, hyper-realistic textures, a single subtly distorted clock draped over a natural rock form, minimal composition, cinematic lighting, no clutter, no repetition, no cartoon style',
  },
  {
    title: 'Dreamlike Desert Clocks',
    prompt:
      'high-end surrealist desert scene inspired by Salvador Dali, expansive empty landscape, one or two distorted time objects integrated naturally into the environment, hyper realistic lighting, sharp shadows, restrained composition, fine detail, no clutter, no cartoon style',
  },
  {
    title: 'Time Collapse Landscape',
    prompt:
      'premium surrealist landscape inspired by Salvador Dali, time distortion visualized through melting architectural and geological forms, cinematic perspective, hyper realistic textures, controlled composition, dramatic lighting, no repetition, no cartoon style',
  },
]

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

async function generateImage(prompt: string) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI error: ${text}`)
  }

  const data = await res.json()
  return data.data[0].url
}

async function upload(url: string, title: string) {
  const img = await fetch(url)

  if (!img.ok) {
    throw new Error(`Failed to download generated image: ${img.status}`)
  }

  const contentType = img.headers.get('content-type') || 'image/png'
  const buffer = await img.arrayBuffer()

  const blob = await put(
    `artworks/dali/${safeFilePart(title)}-refined.png`,
    buffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  return blob.url
}

async function updateArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const existing = await prisma.artwork.findFirst({
    where: {
      title: item.title,
      style: STYLE as any,
    },
    select: { id: true },
  })

  if (!existing) throw new Error(`Artwork not found: ${item.title}`)

  await prisma.artwork.update({
    where: { id: existing.id },
    data: {
      thumbnail: imageUrl,
      artist: ARTIST,
      status: 'PUBLISHED' as any,
    },
  })

  await prisma.asset.create({
    data: {
      artworkId: existing.id,
      originalUrl: imageUrl,
      provider: 'ai-refined',
      prompt: item.prompt,
    },
  })

  return existing.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const aiUrl = await generateImage(item.prompt)
      const blobUrl = await upload(aiUrl, item.title)
      const id = await updateArtwork(item, blobUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId: id,
        imageUrl: blobUrl,
      })
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Dalí refinement batch complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
