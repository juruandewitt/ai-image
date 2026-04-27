import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DA_VINCI'
const ARTIST = 'Leonardo da Vinci'

const ITEMS = [
  {
    title: 'Mona Lisa in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20-%20Mona%20Lisa.jpg',
    prompt: 'Public-domain source image: Mona Lisa by Leonardo da Vinci',
  },
  {
    title: 'The Last Supper in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20-%20The%20Last%20Supper%20high%20res.jpg',
    prompt: 'Public-domain source image: The Last Supper by Leonardo da Vinci',
  },
  {
    title: 'Lady with an Ermine in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Lady%20with%20an%20Ermine%20-%20Leonardo%20da%20Vinci%20-%20Google%20Art%20Project.jpg',
    prompt: 'Public-domain source image: Lady with an Ermine by Leonardo da Vinci',
  },
  {
    title: 'Vitruvian Man in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Vitruvian%20Man%20by%20Leonardo%20da%20Vinci.jpg',
    prompt: 'Public-domain source image: Vitruvian Man by Leonardo da Vinci',
  },
  {
    title: 'Salvator Mundi in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20%28attrib.%29%20-%20Salvator%20Mundi.jpg',
    prompt: 'Public-domain source image: Salvator Mundi attributed to Leonardo da Vinci',
  },
  {
    title: 'Virgin of the Rocks in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20Virgin%20of%20the%20Rocks%20%28National%20Gallery%20London%29.jpg',
    prompt: 'Public-domain source image: Virgin of the Rocks by Leonardo da Vinci',
  },
  {
    title: 'Annunciation in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20-%20Annunciation%20-%20WGA12677.jpg',
    prompt: 'Public-domain source image: Annunciation by Leonardo da Vinci',
  },
  {
    title: 'Adoration of the Magi in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Adoration%20of%20the%20Magi%20%28Leonardo%29.jpg',
    prompt: 'Public-domain source image: Adoration of the Magi by Leonardo da Vinci',
  },
  {
    title: 'Saint John the Baptist in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20-%20Saint%20John%20the%20Baptist%20C2RMF%20retouched.jpg',
    prompt: 'Public-domain source image: Saint John the Baptist by Leonardo da Vinci',
  },
  {
    title: 'The Baptism of Christ in Da Vinci Style',
    sourceUrl:
      'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20-%20Baptism%20of%20Christ%20-%20WGA12649.jpg',
    prompt: 'Public-domain source image: The Baptism of Christ with Leonardo da Vinci contribution',
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

async function uploadSourceToBlob(item: (typeof ITEMS)[number]) {
  const response = await fetch(item.sourceUrl, {
    cache: 'no-store',
    redirect: 'follow',
    headers: {
      'User-Agent': 'AI Image quality replacement bot',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch source image: ${response.status}`)
  }

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
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Da Vinci public-domain top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
