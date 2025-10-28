import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function money(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const a = await prisma.artwork.findUnique({ where: { id: params.id } })
  if (!a) return <p className="text-sm text-neutral-500">Not found.</p>

  const related = await prisma.artwork.findMany({
    where: { category: a.category, id: { not: a.id }, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  return (
    <div className="space-y-10">
      <article className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
          <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{a.title}</h1>
          <p className="text-neutral-300">by {a.artist}</p>
          <form action="/api/checkout" method="POST" className="space-y-3">
            <input type="hidden" name="artworkId" value={a.id} />
            <input type="hidden" name="title" value={a.title} />
            <input type="hidden" name="amount" value={a.price} />
            <button className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white">
              Buy now ({money(a.price)})
            </button>
          </form>
        </div>
      </article>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r.id} href={`/artwork/${r.id}`} className="block rounded-lg overflow-hidden border border-white/10 hover:border-white/20">
                <div className="relative aspect-[4/3]">
                  <Image src={r.thumbnail} alt={r.title} fill className="object-cover" />
                </div>
                <div className="p-3 text-white text-sm">{r.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
