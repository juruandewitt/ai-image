import ArtworkCard from '@/components/ArtworkCard'
import FilterBar from '@/components/FilterBar'
import Pagination from '@/components/Pagination'
import { searchArtworks } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function ExplorePage({ searchParams }: { searchParams: any }) {
  const { items, total, page, totalPages } = await searchArtworks({
    q: searchParams.q,
    category: searchParams.category,
    tag: searchParams.tag,
    sort: searchParams.sort,
    page: Number(searchParams.page || 1),
    perPage: Number(searchParams.perPage || 9),
  })

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Explore</h1>
      <FilterBar />
      <p className="text-sm opacity-70">{total} result{total===1?'':'s'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(a => (<ArtworkCard key={a.id} a={a as any} />))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </section>
  )
}
