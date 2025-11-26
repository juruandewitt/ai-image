// lib/catalog.ts
import { prisma } from '@/lib/prisma'
import type { Prisma, Style } from '@prisma/client'

/** Convert an uppercase string (e.g. "VAN_GOGH") into the Prisma enum value. */
function toStyleEnum(key: string | undefined): Style | undefined {
  if (!key) return undefined
  // @ts-expect-error: index signature on enum at runtime
  const v = (Object( (Style as any) ))[key]
  return v as Style | undefined
}

/** Card shape the UI needs */
export type CardArtwork = {
  id: string
  title: string
  style: string | null
  thumbnail: string | null
  assets: { originalUrl: string | null }[]
  createdAt: Date
}

/** Home → New Drops (excludes "smoketest") */
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
        select: { originalUrl: true },
      },
    },
  })
  return rows as CardArtwork[]
}

/** Explore grid (optional style slug like "van-gogh") */
export async function getExplore(params: { style?: string; take?: number } = {}): Promise<CardArtwork[]> {
  const take = params.take ?? 60

  const where: Prisma.ArtworkWhereInput = {
    NOT: { tags: { has: 'smoketest' } },
  }

  if (params.style && params.style.trim()) {
    const key = params.style.toUpperCase().replace(/-/g, '_')
    const styleEnum = toStyleEnum(key)
    if (styleEnum) {
      where.style = styleEnum
    }
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

/** Featured: one (or more) representative items per style key you pass */
export async function getFeaturedByStyles(styleKeys: string[], perStyleTake = 1): Promise<Record<string, CardArtwork[]>> {
  const result: Record<string, CardArtwork[]> = {}

  for (const key of styleKeys) {
    const styleEnum = toStyleEnum(key) // key already expected UPPER_SNAKE
    const where: Prisma.ArtworkWhereInput = {
      NOT: { tags: { has: 'smoketest' } },
      ...(styleEnum ? { style: styleEnum } : {}),
    }

    const rows = await prisma.artwork.findMany({
      orderBy: { createdAt: 'desc' },
      take: perStyleTake,
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

    result[key] = rows as CardArtwork[]
  }

  return result
}
