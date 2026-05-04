import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'VAN_GOGH'
const ARTIST = 'Vincent van Gogh'

const ITEM = {
  title: 'Starry Night in Van Gogh Style',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/Special:FilePath/VanGogh-starry%20night.jpg',
  prompt: 'Corrected public-domain source image: The Starry Night by Vincent van Gogh',
}

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

  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buffer = await res.arrayBuffer()

  return { buffer, contentType }
}

async function uploadSourceToBlob() {
  const { buffer, contentType } = await fetchSource(ITEM.sourceUrl)

  const blob = await put(
    `artworks/van-gogh/${safeFilePart(ITEM.title)}-correct-source.jpg`,
    buffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${ITEM.title}`)
  return blob.url
}

async function updateArtwork(imageUrl: string) {
  const existing = await prisma.artwork.findFirst({
    where: {
      title: ITEM.title,
      style: STYLE as any,
    },
    select: { id: true },
  })

  if (!existing) throw new Error(`Artwork not found: ${ITEM.title}`)

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
      provider: 'public-domain-source-blob-corrected',
      prompt: ITEM.prompt,
    },
  })

  return existing.id
}

export async function GET() {
  try {
    const imageUrl = await uploadSourceToBlob()
    const artworkId = await updateArtwork(imageUrl)

    return NextResponse.json({
      message: 'Van Gogh Starry Night corrected',
      style: STYLE,
      result: {
        title: ITEM.title,
        success: true,
        artworkId,
        imageUrl,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Van Gogh Starry Night correction failed',
        style: STYLE,
        result: {
          title: ITEM.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    )
  }
}
