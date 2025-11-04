set -euo pipefail

mkdir -p prisma
node <<'JS'
const fs = require('fs');
const p = 'prisma/schema.prisma';
let s = fs.readFileSync(p,'utf8');

// Guard against re-running
if (!/enum Style \{/.test(s)) {
  // Insert Style enum after Status enum
  s = s.replace(/enum Status \{[^}]+\}\s*/m, m => m + `
enum Style {
  VAN_GOGH
  REMBRANDT
  PICASSO
  VERMEER
  MONET
  MICHELANGELO
  DALI
  CARAVAGGIO
  DA_VINCI
  POLLOCK
}
`);
  // Add "style" field + index into Artwork model
  s = s.replace(/model Artwork \{([\s\S]*?)\}/m, (full, body) => {
    if (!/^\s*style\s+Style/m.test(body)) {
      body = body
        .replace(/createdAt\s+DateTime[^\n]*\n/, m => m + `  style      Style     @default(VAN_GOGH)\n`)
        .replace(/\}\s*$/, `  @@index([style])\n}\n`);
    }
    return `model Artwork {${body}`;
  });

  // Ensure no @@fulltext remains
  s = s.replace(/^[ \t]*@@fulltext\([^\)]*\)[^\n]*\n?/gm, '');
  fs.writeFileSync(p, s);
  console.log('✔ prisma/schema.prisma updated with Style enum + Artwork.style');
} else {
  console.log('ℹ Style enum already present; leaving schema as-is');
}
JS
cat > prisma/seed.ts <<'TS'
import { PrismaClient, Category, Style } from '@prisma/client'
const prisma = new PrismaClient()

const STYLES: {key: Style, label: string}[] = [
  { key: Style.VAN_GOGH,     label: 'Van Gogh' },
  { key: Style.REMBRANDT,    label: 'Rembrandt' },
  { key: Style.PICASSO,      label: 'Picasso' },
  { key: Style.VERMEER,      label: 'Vermeer' },
  { key: Style.MONET,        label: 'Monet' },
  { key: Style.MICHELANGELO, label: 'Michelangelo' },
  { key: Style.DALI,         label: 'Dalí' },
  { key: Style.CARAVAGGIO,   label: 'Caravaggio' },
  { key: Style.DA_VINCI,     label: 'Da Vinci' },
  { key: Style.POLLOCK,      label: 'Pollock' },
]

function itemFor(style: Style, label: string, i: number) {
  const seed = `${style.toLowerCase()}_${i}`
  const cats: Category[] = [Category.ABSTRACT, Category.LANDSCAPE, Category.PORTRAIT, Category.SURREAL, Category.MINIMAL, Category.SCI_FI]
  const category = cats[i % cats.length]
  return {
    title: `${label} Study #${(i+1).toString().padStart(2,'0')}`,
    price: 5000 + (i % 15) * 100, // $50.00 .. $64.00
    thumbnail: `https://picsum.photos/seed/${seed}/1200/900`,
    artist: 'AI Studio',
    tags: [label.toLowerCase().replace(/\s+/g,'-'), 'classic', 'ai'],
    category,
    status: 'PUBLISHED' as const,
    featured: i < 6, // first few appear in Featured if you use it
    style,
  }
}

async function main() {
  const existing = await prisma.artwork.count()
  if (existing >= 500) {
    console.log('Seed skipped: dataset already populated with', existing, 'artworks')
    return
  }
  let total = 0
  for (const {key, label} of STYLES) {
    const batch = Array.from({length: 50}, (_, i) => itemFor(key, label, i))
    await prisma.artwork.createMany({ data: batch })
    total += batch.length
    console.log(`Inserted ${batch.length} for ${label}`)
  }
  console.log('Seed complete: inserted', total, 'artworks')
}

main().finally(() => prisma.$disconnect())
TS
mkdir -p lib
node <<'JS'
const fs = require('fs');
const p = 'lib/catalog.ts';
let s = fs.readFileSync(p,'utf8');
if (!/style\?:/.test(s)) {
  s = s.replace(/export type ExploreParams \{/, `export type ExploreParams {\n  style?: string`);
}
if (!/buildWhere\(params: ExploreParams\):/.test(s) || s.includes('style:')) {
  // already supports style — skip
} else {
  s = s.replace(/const where: Prisma\.ArtworkWhereInput = {([\s\S]*?)}/, (full, inner) => {
    let block = `const where: Prisma.ArtworkWhereInput = { status: 'PUBLISHED', AND: [] }`;
    block += `\n\n  if (params.style) {\n    const k = params.style.toUpperCase().replace(/-/g,'_');\n    (where.AND as Prisma.ArtworkWhereInput[]).push({ style: k as any })\n  }`;
    return block;
  });
}
fs.writeFileSync(p, s);
console.log('✔ lib/catalog.ts updated to support ?style=');
JS
mkdir -p components
cat > components/StyleRow.tsx <<'TSX'
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
TSX
cat > app/page.tsx <<'TSX'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Hero from '@/components/Hero'
import { MotionCard } from '@/components/MotionCard'
import FeaturedCarousel from '@/components/FeaturedCarousel'
import NewBadge from '@/components/NewBadge'
import StyleRow from '@/components/StyleRow'

export const dynamic = 'force-dynamic'

const DAYS = 14 // how long something counts as NEW

function isNew(dt: Date) {
  const now = new Date()
  const diff = now.getTime() - new Date(dt).getTime()
  return diff <= DAYS * 24 * 60 * 60 * 1000
}

const STYLES = [
  { key: 'VAN_GOGH', label: 'Van Gogh' },
  { key: 'REMBRANDT', label: 'Rembrandt' },
  { key: 'PICASSO', label: 'Picasso' },
  { key: 'VERMEER', label: 'Vermeer' },
  { key: 'MONET', label: 'Monet' },
  { key: 'MICHELANGELO', label: 'Michelangelo' },
  { key: 'DALI', label: 'Dalí' },
  { key: 'CARAVAGGIO', label: 'Caravaggio' },
  { key: 'DA_VINCI', label: 'Da Vinci' },
  { key: 'POLLOCK', label: 'Pollock' },
]

export default async function HomePage() {
  const [featured, latest] = await Promise.all([
    prisma.artwork.findMany({ where: { featured: true, status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 10 }),
    prisma.artwork.findMany({ where: { status: 'PUBLISHED' }, orderBy: { createdAt: 'desc' }, take: 6 }),
  ])

  return (
    <div className="space-y-24">
      <Hero />

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="space-y-6">
          <FeaturedCarousel items={featured} />
        </section>
      )}

      {/* CLASSIC STYLES (above New Drops) */}
      <section className="space-y-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Classic Styles</h2>
        {STYLES.map(s => (
          <StyleRow key={s.key} style={s.key} label={s.label} />
        ))}
      </section>

      {/* NEW DROPS */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold text-white">New Drops</h2>
          <Link href="/explore" className="text-sm font-medium text-indigo-300 hover:underline">View all</Link>
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
TSX
pnpm prisma generate
pnpm db:push
pnpm db:seed

git add .
git commit -m "feat(home): Classic Styles rows + style enum; seed 50 per style"

git push

