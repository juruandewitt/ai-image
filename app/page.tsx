// app/page.tsx
import ArtworkCard, { MinimalArtwork } from '@/components/ArtworkCard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getNewDrops(): Promise<MinimalArtwork[]> {
  // Latest 48 artworks that are PUBLISHED, have at least one Asset,
  // and are NOT tagged 'smoketest'
  const rows = await prisma.artwork.findMany({
    take: 48,
    orderBy: { createdAt: 'desc' },
    where: {
      status: 'PUBLISHED',
      NOT: { tags: { has: 'smoketest' } },
      assets: { some: {} },
    },
    select: {
      id: true,
      title: true,
      style: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true },
      },
    },
  })

  // Strongly type to MinimalArtwork
  return rows as unknown as MinimalArtwork[]
}

export default async function HomePage() {
  const drops = await getNewDrops()

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 text-2xl font-semibold">New Drops</h1>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {drops.map((a) => (
            <ArtworkCard key={a.id} a={a} />
          ))}
        </div>

        {drops.length === 0 && (
          <div className="text-sm text-slate-400">
            No recent items with images yet. Try refreshing in a minute.
          </div>
        )}
      </section>
    </div>
  )
}
