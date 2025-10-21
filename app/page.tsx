import Link from 'next/link'
import ArtworkCard from '@/components/ArtworkCard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featured = await prisma.artwork.findMany({ orderBy: { createdAt: 'desc' }, take: 3 })
  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Discover & Collect<br />AI‑Generated Art</h1>
          <p className="text-neutral-600 max-w-prose">Browse a curated gallery of AI‑created artworks. Find your next favorite piece and support digital artists.</p>
          <div className="flex gap-3">
            <Link href="/explore" className="inline-flex items-center px-5 py-2.5 rounded-md bg-black text-white">Explore Gallery →</Link>
            <Link href="/explore" className="inline-flex items-center px-5 py-2.5 rounded-md border">Latest Drops</Link>
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="aspect-[4/3] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200 via-pink-100 to-yellow-100 rounded-xl" />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured Artworks</h2>
          <Link href="/explore" className="text-sm underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(a => (<ArtworkCard key={a.id} a={a as any} />))}
        </div>
      </section>
    </div>
  )
}
