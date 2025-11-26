import { Prisma } from '@prisma/client'
import { prisma } from './prisma'

export type ExploreParams = {
  q?: string
  style?: string
  tag?: string
  page?: number
  perPage?: number
}

export type ExploreRow = {
  id: string
  title: string
  artist: string
  price: number
  style: string
  tags: string[]
  createdAt: Date
  thumbnail: string | null
  assets: { originalUrl: string | null; width: number | null; height: number | null }[]
}

export async function getNewDrops(limit = 12): Promise<ExploreRow[]> {
  const rows = await prisma.artwork.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true, title: true, artist: true, price: true, style: true, tags: true,
      createdAt: true, thumbnail: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true, width: true, height: true }
      }
    }
  })
  return rows as any
}

export async function getExplore(params: ExploreParams): Promise<{
  items: ExploreRow[]
}> {
  const where: Prisma.ArtworkWhereInput = { status: 'PUBLISHED', AND: [] }

  if (params.q?.trim()) {
    (where.AND as Prisma.ArtworkWhereInput[]).push({
      OR: [
        { title: { contains: params.q, mode: 'insensitive' } },
        { artist: { contains: params.q, mode: 'insensitive' } },
        { tags: { has: params.q } },
      ],
    })
  }

  if (params.style?.trim()) {
    const key = params.style.toUpperCase().replace(/-/g, '_')
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({ style: key as any })
  }

  const page = Math.max(1, Number(params.page ?? 1))
  const perPage = Math.min(60, Math.max(12, Number(params.perPage ?? 24)))
  const skip = (page - 1) * perPage

  const items = await prisma.artwork.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: perPage,
    select: {
      id: true, title: true, artist: true, price: true, style: true, tags: true,
      createdAt: true, thumbnail: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true, width: true, height: true }
      }
    }
  })

  return { items: items as any }
}
