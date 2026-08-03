import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SEARCH_TERMS = [
  'The Scream',
  'Mona Lisa',
  'Starry Night',
  'Girl with a Pearl Earring',
  'Creation of Adam',
  'The Night Watch',
  'Impression Sunrise',
  'The Last Supper',
  'Guernica',
  'Persistence of Memory',
]

export async function GET() {
  const matches = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      OR: SEARCH_TERMS.map((term) => ({
        title: {
          contains: term,
          mode: 'insensitive',
        },
      })),
    },
    orderBy: [{ title: 'asc' }, { createdAt: 'asc' }],
    take: 1000,
    select: {
      id: true,
      title: true,
      artist: true,
      style: true,
      tags: true,
      thumbnail: true,
      createdAt: true,
    },
  })

  const grouped = SEARCH_TERMS.map((term) => ({
    searchTerm: term,
    count: matches.filter((artwork) =>
      artwork.title.toLowerCase().includes(term.toLowerCase())
    ).length,
    artworks: matches
      .filter((artwork) =>
        artwork.title.toLowerCase().includes(term.toLowerCase())
      )
      .map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist,
        style: artwork.style,
        tags: artwork.tags,
        thumbnail: artwork.thumbnail,
      })),
  }))

  return NextResponse.json({
    message: 'Masters reimagined artwork audit complete',
    totalMatches: matches.length,
    grouped,
  })
}
