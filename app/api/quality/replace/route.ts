import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'VERMEER'
const ARTIST = 'Johannes Vermeer'

const ITEMS = [
  {
    title: 'Girl with a Pearl Earring in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/1665%20Girl%20with%20a%20Pearl%20Earring.jpg',
    prompt: 'Public-domain source image: Girl with a Pearl Earring by Johannes Vermeer',
  },
  {
    title: 'The Milkmaid in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Het%20melkmeisje%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: The Milkmaid by Johannes Vermeer',
  },
  {
    title: 'View of Delft in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vermeer-view-of-delft.jpg',
    prompt: 'Public-domain source image: View of Delft by Johannes Vermeer',
  },
  {
    title: 'The Art of Painting in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jan%20Vermeer%20-%20The%20Art%20of%20Painting%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: The Art of Painting by Johannes Vermeer',
  },
  {
    title: 'Woman in Blue Reading a Letter in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Woman%20in%20Blue%20Reading%20a%20Letter%20-%20WGA24657.jpg',
    prompt: 'Public-domain source image: Woman in Blue Reading a Letter by Johannes Vermeer',
  },
  {
    title: 'Girl Reading a Letter by an Open Window in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Girl%20Reading%20a%20Letter%20by%20an%20Open%20Window%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Girl Reading a Letter by an Open Window by Johannes Vermeer',
  },
  {
    title: 'Woman Holding a Balance in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Woman%20Holding%20a%20Balance%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Woman Holding a Balance by Johannes Vermeer',
  },
  {
    title: 'The Music Lesson in Vermeer Style',
    sourceUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Lady%20at%20the%20Virginal%20with%20a%20Gentleman%2C%20'The%20Music%20Lesson'%20-%20Google%20Art%20Project.jpg",
    prompt: 'Public-domain source image: The Music Lesson by Johannes Vermeer',
  },
  {
    title: 'Young Woman with a Water Pitcher in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Jan%20Vermeer%20van%20Delft%20018.jpg',
    prompt: 'Public-domain source image: Young Woman with a Water Pitcher by Johannes Vermeer',
  },
  {
    title: 'Woman with a Lute in Vermeer Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Woman%20with%20a%20Lute%20-%20WGA24656.jpg',
    prompt: 'Public-domain source image: Woman with a Lute by Johannes Vermeer',
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
    `artworks/vermeer/${safeFilePart(item.title)}-public-domain-source`,
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
    message: 'Vermeer public-domain top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
