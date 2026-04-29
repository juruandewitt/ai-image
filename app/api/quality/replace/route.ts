import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'VAN_GOGH'
const ARTIST = 'Vincent van Gogh'

const ITEMS = [
  {
    title: 'Starry Night in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Starry%20Night.jpg',
  },
  {
    title: 'Sunflowers in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Sunflowers%20%281889%29.jpg',
  },
  {
    title: 'Cafe Terrace at Night in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Cafe%20Terrace%20at%20Night.jpg',
  },
  {
    title: 'Bedroom in Arles in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Bedroom%20in%20Arles.jpg',
  },
  {
    title: 'Irises in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Irises-Vincent%20van%20Gogh.jpg',
  },
  {
    title: 'Wheatfield with Crows in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Wheatfield%20with%20Crows.jpg',
  },
  {
    title: 'Almond Blossom in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Almond%20Blossom.jpg',
  },
  {
    title: 'Self Portrait in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Self-Portrait%20-%20Google%20Art%20Project.jpg',
  },
  {
    title: 'The Night Cafe in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20The%20Night%20Cafe.jpg',
  },
  {
    title: 'The Potato Eaters in Van Gogh Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Potato%20Eaters.jpg',
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
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'AI Image quality replacement bot',
      },
    })

    if (res.ok) return res

    if (res.status === 429) {
      await sleep(3000 * attempt)
      continue
    }

    throw new Error(`Fetch failed: ${res.status}`)
  }

  throw new Error('Fetch failed after retries')
}

async function upload(item: any) {
  const res = await fetchWithRetry(item.sourceUrl)
  const buffer = await res.arrayBuffer()
  const type = res.headers.get('content-type') || 'image/jpeg'

  const blob = await put(
    `artworks/van-gogh/${safeFilePart(item.title)}`,
    buffer,
    { access: 'public', contentType: type }
  )

  return blob.url
}

async function upsert(item: any, url: string) {
  const existing = await prisma.artwork.findFirst({
    where: { title: item.title, style: STYLE as any },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: { thumbnail: url, artist: ARTIST, status: 'PUBLISHED' as any },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: url,
          status: 'PUBLISHED' as any,
          price: 9.99,
        },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: url,
      provider: 'public-domain',
    },
  })
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const url = await upload(item)
      await upsert(item, url)

      results.push({ title: item.title, success: true })
      await sleep(2500)
    } catch (e: any) {
      results.push({ title: item.title, success: false, error: e.message })
    }
  }

  return NextResponse.json({
    message: 'Van Gogh Top 10 complete',
    results,
  })
}
