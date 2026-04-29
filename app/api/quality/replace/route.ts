import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'MONET'
const ARTIST = 'Claude Monet'

const ITEMS = [
  {
    title: 'Impression Sunrise in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Impression%2C%20Sunrise.jpg',
    prompt: 'Public-domain source image: Impression, Sunrise by Claude Monet',
  },
  {
    title: 'Water Lilies in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Water%20Lilies%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Water Lilies by Claude Monet',
  },
  {
    title: 'Japanese Bridge in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20The%20Japanese%20Footbridge.jpg',
    prompt: 'Public-domain source image: Japanese Bridge by Claude Monet',
  },
  {
    title: 'Woman with a Parasol in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Woman%20with%20a%20Parasol.jpg',
    prompt: 'Public-domain source image: Woman with a Parasol by Claude Monet',
  },
  {
    title: 'Rouen Cathedral in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Rouen%20Cathedral%2C%20Facade.jpg',
    prompt: 'Public-domain source image: Rouen Cathedral by Claude Monet',
  },
  {
    title: 'Parliament in Fog in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Houses%20of%20Parliament%2C%20London.jpg',
    prompt: 'Public-domain source image: Houses of Parliament by Claude Monet',
  },
  {
    title: 'Poppy Field in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Poppy%20Field.jpg',
    prompt: 'Public-domain source image: Poppy Field by Claude Monet',
  },
  {
    title: 'Haystacks in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Haystacks.jpg',
    prompt: 'Public-domain source image: Haystacks by Claude Monet',
  },
  {
    title: 'Garden at Giverny in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Garden%20at%20Giverny.jpg',
    prompt: 'Public-domain source image: Garden at Giverny by Claude Monet',
  },
  {
    title: 'Boats on the Seine in Monet Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Boats%20on%20the%20Seine.jpg',
    prompt: 'Public-domain source image: Boats on the Seine by Claude Monet',
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchWithRetry(url: string) {
  let lastError = ''

  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'AI Image quality replacement bot; contact=juruandewitt@gmail.com',
      },
    })

    if (response.ok) return response

    lastError = `${response.status}`

    if (response.status === 429) {
      await sleep(3000 * attempt)
      continue
    }

    throw new Error(`Failed to fetch source image: ${response.status}`)
  }

  throw new Error(`Failed to fetch source image after retries: ${lastError}`)
}

async function uploadSourceToBlob(item: (typeof ITEMS)[number]) {
  const response = await fetchWithRetry(item.sourceUrl)
  const contentType = response.headers.get('content-type') || 'image/jpeg'
  const arrayBuffer = await response.arrayBuffer()

  const blob = await put(
    `artworks/monet/${safeFilePart(item.title)}-public-domain-source`,
    arrayBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${item.title}`)
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const existing = await prisma.artwork.findFirst({
    where: {
      title: item.title,
      style: STYLE as any,
    },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: ARTIST,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
          tags: [],
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'public-domain-source-blob',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const imageUrl = await uploadSourceToBlob(item)
      const artworkId = await upsertArtwork(item, imageUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl,
      })

      await sleep(3000)
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Monet public-domain top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
