import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
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
    prompt: 'Public-domain source image: The Night Watch by Rembrandt',
  },
  {
    title: 'The Return of the Prodigal Son in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20Harmensz%20van%20Rijn%20-%20Return%20of%20the%20Prodigal%20Son%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: The Return of the Prodigal Son by Rembrandt',
  },
  {
    title: 'The Anatomy Lesson in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20The%20Anatomy%20Lesson%20of%20Dr.%20Nicolaes%20Tulp.jpg',
    prompt: 'Public-domain source image: The Anatomy Lesson of Dr Nicolaes Tulp by Rembrandt',
  },
  {
    title: 'The Jewish Bride in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20The%20Jewish%20Bride%20-%20WGA19158.jpg',
    prompt: 'Public-domain source image: The Jewish Bride by Rembrandt',
  },
  {
    title: 'Self Portrait in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20Zelfportret%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Self Portrait by Rembrandt',
  },
  {
    title: 'Self Portrait with Two Circles in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20Self%20Portrait%20with%20Two%20Circles.jpg',
    prompt: 'Public-domain source image: Self Portrait with Two Circles by Rembrandt',
  },
  {
    title: 'The Storm on the Sea of Galilee in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20Christ%20in%20the%20Storm%20on%20the%20Lake%20of%20Galilee.jpg',
    prompt: 'Public-domain source image: The Storm on the Sea of Galilee by Rembrandt',
  },
  {
    title: 'The Syndics in Rembrandt Style',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20De%20Staalmeesters%20-%20The%20Syndics%20of%20the%20Clothmaker's%20Guild.jpg",
    prompt: 'Public-domain source image: The Syndics by Rembrandt',
  },
  {
    title: 'Scholar at Candlelight in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20The%20Philosopher%20in%20Meditation.jpg',
    prompt: 'Public-domain source image: Philosopher in Meditation by Rembrandt, used for Scholar at Candlelight',
  },
  {
    title: 'Old Man in Shadow in Rembrandt Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20Self-Portrait%20-%20WGA19221.jpg',
    prompt: 'Public-domain source image: Rembrandt old-master portrait source used for Old Man in Shadow',
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
    `artworks/rembrandt/${safeFilePart(item.title)}-public-domain-source`,
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
    message: 'Rembrandt public-domain top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
