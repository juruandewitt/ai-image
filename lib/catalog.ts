// lib/catalog.ts
import { prisma } from '@/lib/prisma'

/**
 * Minimal shape the UI needs for cards.
 * We return either the first asset's originalUrl or a thumbnail.
 * (Your components can still use getPrimaryImage() to pick one.)
 */
export type CardArtwork = {
  id: string
  title: string
  style: string | null
  thumbnail: string | null
  assets: { originalUrl: string | null }[]
  createdAt: Date
}

/**
 * "New Drops" — newest artworks first.
 * Excludes items tagged "smoketest" so your home stays clean.
 */
export async function getNewDrops(limit = 24): Promise<CardArtwork[]> {
  const rows = await prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    where: { NOT: { tags: { has: 'smoketest' } } },
    select: {
      id: true,
      title: true,
      style: true,
      thumbnail: true,
      createdAt: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        // IMPORTANT: your schema stores originalUrl (not url/width/height)
        select: { originalUrl: true },
      },
    },
  })

  return rows as CardArtwork[]
}

/**
 * Explore grid — filterable by style via slug (e.g. "van-gogh").
 * If no style is provided, returns a balanced slice of the latest artworks.
 */
export async function getExplore(params: { style?: string; take?: number } = {}): Promise<CardArtwork[]> {
  const take = params.take ?? 60

  // Optional style filter (slug like "van-gogh" → enum key "VAN_GOGH")
  let where: any = { NOT: { tags: { has: 'smoketest' } } }
  if (params.style && params.style.trim()) {
    const key = params.style.toUpperCase().replace(/-/g, '_')
    where = { ...where, style: key }
  }

  const rows = await prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    where,
    select: {
      id: true,
      title: true,
      style: true,
      thumbnail: true,
      createdAt: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true },
      },
    },
  })

  return rows as CardArtwork[]
}

/**
 * Featured sample by styles — grab one representative item per style key you pass.
 * Falls back gracefully if a style has no items yet.
 */
export async function getFeaturedByStyles(styleKeys: string[], perStyleTake = 1): Promise<Record<string, CardArtwork[]>> {
  const result: Record<string, CardArtwork[]> = {}
  for (const key of styleKeys) {
    const rows = await prisma.artwork.findMany({
      orderBy: { createdAt: 'desc' },
      take: perStyleTake,
      where: {
        style: key,
        NOT: { tags: { has: 'smoketest' } },
      },
      select: {
        id: true,
        title: true,
        style: true,
        thumbnail: true,
        createdAt: true,
        assets: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: { originalUrl: true },
        },
      },
    })
    result[key] = rows as CardArtwork[]
  }
  return result
}
