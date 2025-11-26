// app/page.tsx — show only artworks that have an image; hide smoketests
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import ArtworkCard from '@/components/ArtworkCard'

// Turn enum like VAN_GOGH into "Van Gogh"
function labelFromStyle(s: string | null | undefined) {
  if (!s) return 'Unknown'
  return s
    .toString()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

async function getLatest() {
  return prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      // skip smoketest rows
      NOT: { tags: { has: 'smoketest' } },
      // require at least one asset so we don't render blanks
      assets: { some: {} },
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
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
}

export default async function HomePage() {
  let drops = [] as Awaited<ReturnType<typeof getLatest>>
  try {
    drops = await getLatest()
  } catch {
    drops = []
  }

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl p-8 md:p-12 bg-gradient-to-r from-slate-900/70 to-slate-800/50 ring-1 ring-slate-800">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-100">Discover & collect AI artwork</h1>
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
            No image-backed artworks yet. As soon as generation uploads assets, they’ll appear here.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {drops.map((a) => {
              const displayArtist = labelFromStyle(a.style as unknown as string)
              return <ArtworkCard key={a.id} a={{ ...a, displayArtist } as any} />
            })}
          </div>
        )}
      </section>
    </div>
  )
}
