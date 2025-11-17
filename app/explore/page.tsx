export const dynamic = 'force-dynamic'
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { STYLE_ORDER, STYLE_LABELS, styleKeyToSlug } from '@/lib/styles'
import Image from 'next/image'
import Link from 'next/link'

function shuffle<T>(arr: T[]) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const dynamic = 'force-dynamic'

export default async function ExploreDirectory() {
  // For each style: fetch up to 60 recent and show 6 random
  const sections = await Promise.all(
    STYLE_ORDER.map(async (style) => {
      const pool = await prisma.artwork.findMany({
        where: { style, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
        take: 60,
      })
      const six = shuffle(pool).slice(0, 6)
      return { style, label: STYLE_LABELS[style], items: six }
    })
  )

  return (
    <section className="space-y-14">
      <h1 className="text-3xl font-semibold text-white">Explore by Master</h1>

      {sections.map(sec => (
        <div key={sec.style} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold text-white">{sec.label}</h2>
            <Link href={`/explore/styles/${styleKeyToSlug(sec.style)}`} className="text-sm font-medium text-indigo-300 hover:underline">
              See all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sec.items.map(a => (
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
        </div>
      ))}
    </section>
  )
}
