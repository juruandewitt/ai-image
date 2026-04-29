import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'VAN_GOGH'
const ARTIST = 'Vincent van Gogh'

const ITEMS = [
  {
    title: 'Sunflowers in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Sunflowers%20-%20VGM%20F458.jpg',
    prompt: 'Public-domain source image: Sunflowers by Vincent van Gogh',
  },
  {
    title: 'Cafe Terrace at Night in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Cafe%20Terrace%20at%20Night%20%281888%29.jpg',
    prompt: 'Public-domain source image: Cafe Terrace at Night by Vincent van Gogh',
  },
  {
    title: 'Bedroom in Arles in Van Gogh Style',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Van%20Gogh's%20Bedroom%20in%20Arles%20-%20Google%20Art%20Project.jpg",
    prompt: 'Public-domain source image: Bedroom in Arles by Vincent van Gogh',
  },
  {
    title: 'Wheatfield with Crows in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Wheatfield%20with%20crows%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Wheatfield with Crows by Vincent van Gogh',
  },
  {
    title: 'Almond Blossoms in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Almond%20blossom%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Almond Blossom by Vincent van Gogh',
  },
  {
    title: 'The Night Cafe in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Van%20Gogh%20The%20Night%20Cafe.jpg',
    prompt: 'Public-domain source image: The Night Cafe by Vincent van Gogh',
  },
  {
    title: 'The Potato Eaters in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20potato%20eaters%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: The Potato Eaters by Vincent van Gogh',
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
    `artworks/van-gogh/${safeFilePart(item.title)}-public-domain-source`,
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
    message: 'Van Gogh remaining public-domain replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
