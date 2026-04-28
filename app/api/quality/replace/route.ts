import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DA_VINCI'
const ARTIST = 'Leonardo da Vinci'

const ITEMS = [
  {
    title: 'Saint John the Baptist in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20-%20Saint%20John%20the%20Baptist%20C2RMF%20retouched.jpg',
    prompt: 'Public-domain source image: Saint John the Baptist by Leonardo da Vinci',
  },
  {
    title: 'The Baptism of Christ in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Baptism%20of%20Christ%20-%20Verrocchio%20and%20Leonardo.jpg',
    prompt: 'Public-domain source image: The Baptism of Christ (Verrocchio with Leonardo contribution)',
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
    `artworks/da-vinci/${safeFilePart(item.title)}-public-domain-source`,
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
    message: 'Da Vinci public-domain final batch complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
