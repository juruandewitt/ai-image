import { prisma } from '@/lib/prisma'
import { Category, Prisma } from '@prisma/client'

export type ExploreParams = {
  q?: string
  category?: string | string[]
  tag?: string | string[]
  sort?: 'new'|'price_asc'|'price_desc'|'featured'
  page?: number
  perPage?: number
}

const PER_PAGE_DEFAULT = 9

function normalizeArray(val?: string|string[]): string[] {
  if (!val) return []
  return Array.isArray(val) ? val : [val]
}

export function buildWhere(params: ExploreParams): Prisma.ArtworkWhereInput {
  const categories = normalizeArray(params.category)
    .map(c => c.toUpperCase().replace('-', '_'))
    .filter(c => Object.keys(Category).includes(c)) as Category[]

  const tags = normalizeArray(params.tag)

  const where: Prisma.ArtworkWhereInput = {
    status: 'PUBLISHED',
    AND: []
  }

  if (params.q) {
    const q = params.q.trim()
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { artist: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ]
    })
  }

  if (categories.length) {
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({ category: { in: categories } })
  }

  if (tags.length) {
    for (const t of tags) {
      ;(where.AND as Prisma.ArtworkWhereInput[]).push({ tags: { has: t.toLowerCase() } })
    }
  }

  return where
}

export function buildOrderBy(sort?: ExploreParams['sort']): Prisma.ArtworkOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc':  return { price: 'asc' }
    case 'price_desc': return { price: 'desc' }
    case 'featured':   return { featured: 'desc' }
    default:           return { createdAt: 'desc' } // 'new'
  }
}

export async function searchArtworks(params: ExploreParams) {
  const page = Math.max(1, Number(params.page || 1))
  const perPage = Math.min(24, Math.max(3, Number(params.perPage || PER_PAGE_DEFAULT)))
  const skip = (page - 1) * perPage

  const where = buildWhere(params)
  const orderBy = buildOrderBy(params.sort)

  const [items, total] = await Promise.all([
    prisma.artwork.findMany({ where, orderBy, skip, take: perPage }),
    prisma.artwork.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage) || 1
  return { items, total, page, perPage, totalPages }
}
