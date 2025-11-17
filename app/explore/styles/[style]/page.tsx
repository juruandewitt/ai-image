export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { styleSlugToKey, styleKeyToLabel } from '@/lib/styles'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StyleAllPage({ params }: { params: { style: string } }) {
  const key = styleSlugToKey(params.style)
  const items = await prisma.artwork.findMany({
    where: { style: key as any, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
  })

  const label = styleKeyToLabel(key)

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">{label} — All Works</h1>
        <Link href="/explore" className="text-sm text-indigo-300 hover:underline">← Back to Explore</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(a => (
          <Link
            key={a.id}
            href={`/artwork/${a.id}`}
            className="group relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition"
          >
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
