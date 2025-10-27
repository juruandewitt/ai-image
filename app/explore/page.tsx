import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import FilterBar from '@/components/FilterBar'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 12

type Props = {
  searchParams?: {
    q?: string
    sort?: 'NEW'|'PRICE_ASC'|'PRICE_DESC'
    page?: string
  }
}

export default async function ExplorePage({ searchParams = {} as Props['searchParams'] }) {
  const q = (searchParams?.q ?? '').trim()
  const sort = searchParams?.sort ?? 'NEW'
  const page = Math.max(1, parseInt(searchParams?.page ?? '1', 10) || 1)

  const where:any = {}
  if (q) {
    where.OR = [
      { title:   { contains: q, mode: 'insensitive' } },
      { artist:  { contains: q, mode: 'insensitive' } },
    ]
  }

  const orderBy =
    sort === 'PRICE_ASC'  ? { amount: 'asc'  } :
    sort === 'PRICE_DESC' ? { amount: 'desc' } :
                            { createdAt: 'desc' }

  const [items, total] = await Promise.all([
    prisma.artwork.findMany({
      where, orderBy,
      skip: (page-1)*PAGE_SIZE, take: PAGE_SIZE,
      select: { id:true, title:true, artist:true, thumbnail:true, amount:true }
    }),
    prisma.artwork.count({ where })
  ])

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-100">Explore</h1>
      <FilterBar />

      {items.length === 0 ? (
        <p className="text-slate-300">No artworks found. Try a different search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(a => (
            <Link key={a.id} href={`/artwork/${a.id}`} className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition">
              <Image src={a.thumbnail} alt={a.title} width={600} height={400} className="object-cover w-full h-64 group-hover:scale-105 transition-transform" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-slate-100 font-semibold">{a.title}</h3>
                  <span className="text-slate-300 text-sm">${(a.amount/100).toFixed(2)}</span>
                </div>
                <p className="text-slate-400 text-sm">by {a.artist}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-2 pt-4">
        {Array.from({ length: pages }, (_, i) => i+1).map(p => {
          const params = new URLSearchParams({ ...Object.fromEntries(Object.entries(searchParams||{}).map(([k,v])=>[k,String(v??'')])), page:String(p) })
          return (
            <Link
              key={p}
              href={`/explore?${params.toString()}`}
              className={`px-3 py-1.5 rounded border ${p===page ? 'bg-amber-400 text-black border-amber-300' : 'bg-slate-900 text-slate-200 border-slate-700 hover:bg-slate-800'}`}
            >
              {p}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
