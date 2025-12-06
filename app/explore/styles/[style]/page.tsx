// app/explore/styles/[style]/page.tsx
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Local labels so we don't depend on other exports
const STYLE_LABELS: Record<string, string> = {
  VAN_GOGH: 'Van Gogh',
  DALI: 'Dalí',
  POLLOCK: 'Jackson Pollock',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  PICASSO: 'Pablo Picasso',
  REMBRANDT: 'Rembrandt',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  MICHELANGELO: 'Michelangelo',
}

// Slug ("van-gogh", "dali") -> enum key ("VAN_GOGH", "DALI")
function slugToKey(slug: string): string {
  const norm = slug.trim().toLowerCase()
  const map: Record<string, string> = {
    'van-gogh': 'VAN_GOGH',
    'dali': 'DALI',
    'pollock': 'POLLOCK',
    'vermeer': 'VERMEER',
    'monet': 'MONET',
    'picasso': 'PICASSO',
    'rembrandt': 'REMBRANDT',
    'caravaggio': 'CARAVAGGIO',
    'da-vinci': 'DA_VINCI',
    'michelangelo': 'MICHELANGELO',
  }
  return map[norm] ?? norm.toUpperCase()
}

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#0b1220"/><text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="20" text-anchor="middle" dominant-baseline="middle">No image</text></svg>`
  )

function pickImgSrc(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string }[]
}) {
  return a.thumbnail || a.assets?.[0]?.originalUrl || FALLBACK_DATA_URL
}

export default async function StyleAllPage({
  params,
}: {
  params: { style: string }
}) {
  const styleKey = slugToKey(params.style)
  const label = STYLE_LABELS[styleKey] || styleKey

  const rows = await prisma.artwork.findMany({
    where: {
      style: styleKey as any,
      status: 'PUBLISHED',
      NOT: { tags: { has: 'smoketest' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 120,
    select: {
      id: true,
      title: true,
      style: true,
      thumbnail: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{label}</h1>
        <Link href="/explore" className="text-amber-400 hover:underline text-sm">
          ← Back to Explore
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="text-slate-400 text-sm">No artworks yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((a) => (
            <Link
              key={a.id}
              href={`/artwork/${a.id}`}
              className="group block rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-amber-400/60 transition-colors"
            >
              {/* Plain <img> so public Blob URLs just work */}
              <img
                src={pickImgSrc(a)}
                alt={a.title}
                loading="lazy"
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <div className="text-sm text-slate-300 line-clamp-1">{a.title}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
