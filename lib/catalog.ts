
import { prisma } from '@/lib/prisma'

export async function getNewDrops(limit = 24) {
  return prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      AND: [
        { NOT: { tags: { has: 'placeholder' } } },
        { NOT: { tags: { has: 'smoketest' } } },
      ],
      // only show artworks that have at least one saved asset
      assets: { some: {} },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    // Use include so we don't have to name per-field types
    include: {
      assets: { take: 1, orderBy: { createdAt: 'asc' } }
    }
  })
}

export type ExploreParams = { style?: string }

export async function getExplore({ style }: ExploreParams) {
  return prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      assets: { some: {} },
      AND: [
        { NOT: { tags: { has: 'placeholder' } } },
        { NOT: { tags: { has: 'smoketest' } } },
      ],
      ...(style ? { style: style.toUpperCase().replace(/-/g,'_') as any } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: {
      assets: { take: 1, orderBy: { createdAt: 'asc' } }
    }
  })
}
