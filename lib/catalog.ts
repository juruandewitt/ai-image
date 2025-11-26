// lib/catalog.ts
import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

// Small shape the UI needs (keep types simple & defensive)
export type MinimalAsset = { originalUrl: string | null }
export type MinimalArtwork = {
  id: string
  title: string
  style: string
  tags: string[]
  createdAt: Date
  assets: MinimalAsset[]
}

// Helper to safely read the first asset url
export function getThumbUrl(a: { assets?: { originalUrl: string | null }[] } | null | undefined) {
  return a?.assets?.[0]?.originalUrl ?? '/placeholder.svg'
}

/**
 * Home page "New Drops"
 * - pulls recent, published artworks
 * - excludes any smoketest-tagged rows
 */
export async function getHomeNewDrops(limit = 24): Promise<MinimalArtwork[]> {
  const rows = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { tags: { has: 'smoketest' } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true, title: true, style: true, tags: true, createdAt: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true }
      }
    }
  })
  return rows as unknown as MinimalArtwork[]
}

/**
 * Explore directory (lightweight)
 */
export async function getExploreDirectory(perStyleTake = 12): Promise<MinimalArtwork[]> {
  const rows = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: { tags: { has: 'smoketest' } },
    },
    orderBy: { createdAt: 'desc' },
    take: perStyleTake,
    select: {
      id: true, title: true, style: true, tags: true, createdAt: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true }
      }
    }
  })
  return rows as unknown as MinimalArtwork[]
}
