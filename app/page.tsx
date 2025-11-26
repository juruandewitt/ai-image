// app/page.tsx — robust “New Drops” page
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import ArtworkCard from '@/components/ArtworkCard'

async function getLatest() {
  const rows = await prisma.artwork.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 24,
    select: {
      id: true,
      title: true,
      style: true,
      displayArtist: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true },
      },
    },
  })
  return rows
}

export default async function HomePage() {
  let drops: Awaited<ReturnType<typeof getLatest>> = []
  try {
    drops = await getLatest()
  } catch {
    drops = []
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl p-8 md:p-12 bg-gradient-to-r from-slate-900/70 to-slate-800/50 ring-1 ring-slate-800">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-100">
          Discover & collect AI artwork
        </h1>
        <p className="text-slate-300 mt-3 max-w-2xl">
          Curated styles inspired by the masters. Fresh drops daily.
        </p>
      </section>

      {/* New Drops */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-amber-400 font-semibold">New Drops</span>
          <div className="h-px bg-slate-800 flex-1" />
        </div>

        {drops.length === 0 ? (
          <div className="text-slate-400">
            No artworks yet. As soon as assets are created, they’ll show up here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {drops.map((a) => (
              // ✅ Pass the prop name the component expects: a
              <ArtworkCard key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
