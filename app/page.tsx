import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Hero from '@/components/Hero'
import { MotionCard } from '@/components/MotionCard'
import FeaturedCarousel from '@/components/FeaturedCarousel'
import NewBadge from '@/components/NewBadge'

export const dynamic = 'force-dynamic'

const DAYS = 14 // how long something counts as NEW

function isNew(dt: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(dt).getTime()
  return diff <= DAYS * 24 * 60 * 60 * 1000
}

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    prisma.artwork.findMany({ where: { featured: true, status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.artwork.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ])

  return (
    <div className="space-y-24">
      <Hero />

      {/* FEATURED: swipeable carousel */}
      {featured.length > 0 && (
        <section className="space-y-6">
          <FeaturedCarousel items={featured} />
        </section>
      )}

      {/* NEW DROPS: ribbon badges on the latest grid */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">New Drops</h2>
          <Link href="/explore" className="text-sm font-medium text-indigo-300 hover:underline">View all</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {latest.map((a, i) => (
            <MotionCard key={a.id} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/20 transition">
                {/* NEW badge */}
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
                  <p className="text-sm text-indigo-200">by {a.artist}</p>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      </section>
    </div>
  )
}
