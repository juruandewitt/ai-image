import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/** Accept URL-like params from pages (/explore?style=...&q=... etc.) */
export type ExploreParams = Partial<Record<'style'|'q'|'tag'|'sort'|'page', string>>

export type ExploreResult = {
  items: {
    id: string
    title: string
    artist: string
    thumbnail: string
    style: string
    createdAt: Date
  }[]
  total: number
  page: number
  pageSize: number
}

const PAGE_SIZE = 24 as const

export async function getExplore(params: ExploreParams): Promise<ExploreResult> {
  const where: Prisma.ArtworkWhereInput = { status: 'PUBLISHED', AND: [] , NOT: { tags: { has: smoketest } } }

  // style filter (?style=van-gogh, da-vinci, etc.)
  if (params.style && params.style.trim()) {
    const k = params.style.toUpperCase().replace(/-/g, '_')
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({ style: k as any })
  }

  // text search (?q=term)
  if (params.q && params.q.trim()) {
    const q = params.q.trim()
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { artist: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ],
    })
  }

  // tag filter (?tag=surreal)
  if (params.tag && params.tag.trim()) {
    const t = params.tag.trim().toLowerCase()
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({ tags: { has: t } })
  }

  // sort
  const sort = (params.sort || 'new').toLowerCase()
  const orderBy: Prisma.ArtworkOrderByWithRelationInput =
    sort === 'old' ? { createdAt: 'asc' } :
    sort === 'title' ? { title: 'asc' } :
    sort === 'artist' ? { artist: 'asc' } :
    { createdAt: 'desc' }

  const page = Math.max(1, parseInt(params.page || '1', 10) || 1)
  const skip = (page - 1) * PAGE_SIZE

  const [items, total] = await Promise.all([
    prisma.artwork.findMany({
      where, orderBy, skip, take: PAGE_SIZE,
      select: { id: true, title: true, artist: true, thumbnail: true, style: true, createdAt: true },
    }),
    prisma.artwork.count({ where }),
  ])

  return { items, total, page, pageSize: PAGE_SIZE }
}
