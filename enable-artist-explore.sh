set -euo pipefail
mkdir -p lib
cat > lib/styles.ts <<'TS'
export const STYLE_ORDER = [
  'VAN_GOGH',
  'REMBRANDT',
  'PICASSO',
  'VERMEER',
  'MONET',
  'MICHELANGELO',
  'DALI',
  'CARAVAGGIO',
  'DA_VINCI',
  'POLLOCK',
] as const
export type StyleKey = typeof STYLE_ORDER[number]

export const STYLE_LABELS: Record<StyleKey, string> = {
  VAN_GOGH: 'Vincent van Gogh',
  REMBRANDT: 'Rembrandt van Rijn',
  PICASSO: 'Pablo Picasso',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  MICHELANGELO: 'Michelangelo',
  DALI: 'Salvador Dalí',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  POLLOCK: 'Jackson Pollock',
}

export const styleKeyToLabel = (key: string) =>
  STYLE_LABELS[key as StyleKey] ?? key

export const styleKeyToSlug = (key: string) =>
  key.toLowerCase().replace(/_/g, '-')

export const styleSlugToKey = (slug: string) =>
  slug.toUpperCase().replace(/-/g, '_') as StyleKey
TS
cat > components/FeaturedCarousel.tsx <<'TSX'
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { styleKeyToLabel } from '@/lib/styles'

export default function FeaturedCarousel({ items }: { items: any[] }) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Featured Masters</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]">
        <style jsx>{`div::-webkit-scrollbar { display: none; }`}</style>
        {items.map((a) => (
          <Link
            key={a.id}
            href={`/artwork/${a.id}`}
            className="group relative snap-start shrink-0 w-[80%] sm:w-[55%] md:w-[40%] lg:w-[32%] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition"
          >
            <div className="relative aspect-[4/3]">
              <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <div className="text-white">
                  <div className="text-base font-semibold drop-shadow">{a.title}</div>
                  <div className="text-xs text-indigo-200">
                    {styleKeyToLabel(a.style)} {/* Full artist name */}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
TSX
cat > app/page.tsx <<'TSX'
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
TSX
mkdir -p app/explore/styles
cat > app/explore/page.tsx <<'TSX'
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
TSX
cat > app/explore/styles/[style]/page.tsx <<'TSX'
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
TSX
echo "✔ Artist-based Featured + Explore written."
