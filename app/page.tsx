// app/page.tsx
import ArtworkCard from '@/components/ArtworkCard'
import { getHomeNewDrops } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const drops = await getHomeNewDrops(24)

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-semibold text-slate-100 mb-4">New Drops</h2>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {drops.map((a) => (
            <ArtworkCard key={a.id} art={a} />
          ))}
        </div>
        {drops.length === 0 && (
          <p className="text-slate-400 text-sm mt-4">No artworks yet.</p>
        )}
      </section>
    </div>
  )
}
