import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'MUNCH'
const ARTIST = 'Edvard Munch'

const ITEMS = [
  {
    title: 'The Scream in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Scream.jpg',
    prompt: 'Public-domain source image: The Scream by Edvard Munch',
  },
  {
    title: 'The Dance of Life in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20The%20Dance%20of%20Life.jpg',
    prompt: 'Public-domain source image: The Dance of Life by Edvard Munch',
  },
  {
    title: 'Madonna in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Madonna.jpg',
    prompt: 'Public-domain source image: Madonna by Edvard Munch',
  },
  {
    title: 'The Sick Child in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20The%20Sick%20Child.jpg',
    prompt: 'Public-domain source image: The Sick Child by Edvard Munch',
  },
  {
    title: 'Anxiety in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Anxiety.jpg',
    prompt: 'Public-domain source image: Anxiety by Edvard Munch',
  },
  {
    title: 'Ashes in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Ashes.jpg',
    prompt: 'Public-domain source image: Ashes by Edvard Munch',
  },
  {
    title: 'Vampire in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Vampire.jpg',
    prompt: 'Public-domain source image: Vampire by Edvard Munch',
  },
  {
    title: 'Evening on Karl Johan Street in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Evening%20on%20Karl%20Johan%20Street.jpg',
    prompt: 'Public-domain source image: Evening on Karl Johan Street by Edvard Munch',
  },
  {
    title: 'Girls on the Bridge in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Girls%20on%20the%20Bridge.jpg',
    prompt: 'Public-domain source image: Girls on the Bridge by Edvard Munch',
  },
  {
    title: 'Self Portrait with Cigarette in Munch Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20Self-Portrait%20with%20Cigarette.jpg',
    prompt: 'Public-domain source image: Self-Portrait with Cigarette by Edvard Munch',
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
    `artworks/munch/${safeFilePart(item.title)}-public-domain-source`,
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
    message: 'Munch public-domain top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
