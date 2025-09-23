import ArtworkCard from '@/components/ArtworkCard'
import { listArtworks } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const items = await listArtworks()
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Explore</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a) => (<ArtworkCard key={a.id} a={a as any} />))}
      </div>
    </section>
  )
}
