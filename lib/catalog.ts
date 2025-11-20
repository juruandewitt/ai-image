
import { prisma } from '@/lib/prisma'

export async function getNewDrops(limit = 24) {
  return prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      tags: { hasEvery: [] }, // keep TS happy
      AND: [
        { NOT: { tags: { has: 'placeholder' } } },
        { NOT: { tags: { has: 'smoketest' } } },
      ],
      // only show rows that actually have saved assets (Blob URLs)
      assets: { some: {} },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true, title: true, displayArtist: true, style: true, tags: true, createdAt: true,
      assets: { take: 1, orderBy: { createdAt: 'asc' }, select: { url: true, width: true, height: true } }
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
    select: {
      id: true, title: true, displayArtist: true, style: true, tags: true, createdAt: true,
      assets: { take: 1, orderBy: { createdAt: 'asc' }, select: { url: true, width: true, height: true } }
    }
  })
}
