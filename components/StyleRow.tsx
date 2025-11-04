import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function StyleRow({ style, label }: { style: string; label: string }) {
  const key = style.toUpperCase().replace(/-/g, '_')
  const items = await prisma.artwork.findMany({
    where: { style: key as any, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 12,
  })
  if (items.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-xl md:text-2xl font-semibold text-white">{label} — Curated</h2>
        <Link href={`/explore?style=${style}`} className="text-sm font-medium text-indigo-300 hover:underline">View all</Link>
      </div>

      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
        <style jsx>{`div::-webkit-scrollbar{display:none}`}</style>
        {items.map(a => (
          <Link key={a.id} href={`/artwork/${a.id}`}
            className="group relative snap-start shrink-0 w-[70%] sm:w-[45%] md:w-[32%] lg:w-[24%] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition">
            <div className="relative aspect-[4/3]">
              <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-sm font-semibold drop-shadow">{a.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
