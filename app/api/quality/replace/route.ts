import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'CARAVAGGIO'
const ARTIST = 'Caravaggio'

const ITEMS = [
  {
    title: 'The Calling of Saint Matthew in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%20%E2%80%94%20The%20Calling%20of%20Saint%20Matthew.jpg',
    prompt: 'Public-domain source image: The Calling of Saint Matthew by Caravaggio',
  },
  {
    title: 'The Supper at Emmaus in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%20%E2%80%94%20Supper%20at%20Emmaus.jpg',
    prompt: 'Public-domain source image: Supper at Emmaus by Caravaggio',
  },
  {
    title: 'The Taking of Christ in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Taking%20of%20Christ-Caravaggio%20%28c.1602%29.jpg',
    prompt: 'Public-domain source image: The Taking of Christ by Caravaggio',
  },
  {
    title: 'Bacchus in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Bacchus%20by%20Caravaggio%201.jpg',
    prompt: 'Public-domain source image: Bacchus by Caravaggio',
  },
  {
    title: 'Boy with a Basket of Fruit in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Boy%20with%20a%20Basket%20of%20Fruit-Caravaggio%20%281593%29.jpg',
    prompt: 'Public-domain source image: Boy with a Basket of Fruit by Caravaggio',
  },
  {
    title: 'The Musicians in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%20-%20I%20Musici.jpg',
    prompt: 'Public-domain source image: The Musicians by Caravaggio',
  },
  {
    title: 'Medusa in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%20-%20Medusa%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Medusa by Caravaggio',
  },
  {
    title: 'Saint Jerome Writing in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Saint%20Jerome%20Writing-Caravaggio%20%281605-6%29.jpg',
    prompt: 'Public-domain source image: Saint Jerome Writing by Caravaggio',
  },
  {
    title: 'The Fortune Teller in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%20-%20The%20Fortune%20Teller.jpg',
    prompt: 'Public-domain source image: The Fortune Teller by Caravaggio',
  },
  {
    title: 'The Cardsharps in Caravaggio Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%20-%20The%20Cardsharps.jpg',
    prompt: 'Public-domain source image: The Cardsharps by Caravaggio',
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
    `artworks/caravaggio/${safeFilePart(item.title)}-public-domain-source`,
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
    message: 'Caravaggio public-domain top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
