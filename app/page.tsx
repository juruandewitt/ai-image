import { prisma } from '@/lib/prisma'
import Hero from '@/components/Hero'
import FeaturedCarousel from '@/components/FeaturedCarousel'
import NewBadge from '@/components/NewBadge'
import { MotionCard } from '@/components/MotionCard'
import { STYLE_ORDER, STYLE_LABELS } from '@/lib/styles'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const DAYS = 14
function isNew(dt: Date) {
  const now = new Date()
  return now.getTime() - new Date(dt).getTime() <= DAYS * 24 * 60 * 60 * 1000
}

export default async function HomePage() {
  // Pick one iconic piece per style: prefer featured, then newest
  const perStyle = await Promise.all(
    STYLE_ORDER.map(async (style) => {
      const pick = await prisma.artwork.findFirst({
        where: { style, status: 'PUBLISHED', featured: true },
        orderBy: { createdAt: 'desc' },
      }) ?? await prisma.artwork.findFirst({
        where: { style, status: 'PUBLISHED' },
        orderBy: { createdAt: 'desc' },
      })
      return pick
    })
  )
  const featuredDistinct = perStyle.filter(Boolean) as any[]

  const latest = await prisma.artwork.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <div className="space-y-24">
      <Hero />

      {/* FEATURED: one per master, with full names */}
      {featuredDistinct.length > 0 && (
        <section className="space-y-6">
          <FeaturedCarousel items={featuredDistinct} />
        </section>
      )}

      {/* CLASSIC STYLES directory link (optional CTA) */}
      <section className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-neutral-300">
        Browse by master styles on the Explore page below. Each section includes 6 samples and a full archive.
      </section>

      {/* NEW DROPS */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">New Drops</h2>
          <Link href="/explore" className="text-sm font-medium text-indigo-300 hover:underline">Explore all styles</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latest.map((a, i) => (
            <MotionCard key={a.id} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/20 transition">
                {isNew(a.createdAt) && <NewBadge />}
                <Image
                  src={a.thumbnail}
                  alt={a.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64 group-hover:scale-[1.02] transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white space-y-1">
                  <h3 className="text-xl font-semibold drop-shadow">{a.title}</h3>
                  <p className="text-sm text-indigo-200">{STYLE_LABELS[a.style as keyof typeof STYLE_LABELS]}</p>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      </section>
    </div>
  )
}
