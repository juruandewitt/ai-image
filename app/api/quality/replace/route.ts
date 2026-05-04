import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'REMBRANDT'
const ARTIST = 'Rembrandt'

const ITEMS = [
  {
    title: 'The Night Watch in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Night%20Watch%20-%20HD.jpg',
    prompt: 'Optimized public-domain source image: The Night Watch by Rembrandt',
  },
  {
    title: 'The Return of the Prodigal Son in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20Harmensz%20van%20Rijn%20-%20Return%20of%20the%20Prodigal%20Son%20-%20Google%20Art%20Project.jpg',
    prompt:
      'Optimized public-domain source image: The Return of the Prodigal Son by Rembrandt',
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

async function fetchSource(url: string) {
  const res = await fetch(url, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      'User-Agent': 'AI Image quality replacement bot; contact=juruandewitt@gmail.com',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch source image: ${res.status}`)
  }

  return Buffer.from(await res.arrayBuffer())
}

async function optimizeImage(buffer: Buffer) {
  return sharp(buffer, {
    limitInputPixels: 268402689,
  })
    .resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 86,
      progressive: true,
    })
    .toBuffer()
}

async function uploadOptimized(item: (typeof ITEMS)[number]) {
  const originalBuffer = await fetchSource(item.sourceUrl)
  const optimizedBuffer = await optimizeImage(originalBuffer)

  const blob = await put(
    `artworks/rembrandt/${safeFilePart(item.title)}-optimized.jpg`,
    optimizedBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/jpeg',
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${item.title}`)
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

  if (!existing) {
    throw new Error(`Artwork not found: ${item.title}`)
  }

  await prisma.artwork.update({
    where: { id: existing.id },
    data: {
      artist: ARTIST,
      thumbnail: imageUrl,
      status: 'PUBLISHED' as any,
    },
  })

  await prisma.asset.create({
    data: {
      artworkId: existing.id,
      originalUrl: imageUrl,
      provider: 'public-domain-source-blob-optimized',
      prompt: item.prompt,
    },
  })

  return existing.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const imageUrl = await uploadOptimized(item)
      const artworkId = await updateArtwork(item, imageUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl,
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
    message: 'Rembrandt optimized thumbnail repair complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
