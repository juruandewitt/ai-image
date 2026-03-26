// app/explore/styles/[style]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

export const dynamic = 'force-dynamic'

const TARGET_TOTAL = 100
const TARGET_REAL = 50

// Canonical slug -> Prisma enum key mapping
const SLUG_TO_STYLE_KEY: Record<string, string> = {
  'van-gogh': 'VAN_GOGH',
  'dali': 'DALI',
  'jackson-pollock': 'POLLOCK',
  'johannes-vermeer': 'VERMEER',
  'claude-monet': 'MONET',
  'pablo-picasso': 'PICASSO',
  'rembrandt': 'REMBRANDT',
  'caravaggio': 'CARAVAGGIO',
  'leonardo-da-vinci': 'DA_VINCI',
  'michelangelo': 'MICHELANGELO',
}

// Page headings
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

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

function normalizeSlug(input: string): string {
  let s = input
  try {
    s = decodeURIComponent(s)
  } catch {
    // ignore
  }

  s = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')

  return s
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function pickImgSrc(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string | null }[]
}) {
  return a.thumbnail || a.assets?.[0]?.originalUrl || null
}

function hasUsableImage(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string | null }[]
}) {
  const src = pickImgSrc(a)
  if (!src) return false

  const lower = src.toLowerCase()

  // Hide obvious placeholders / empty defaults
  if (lower.includes('placeholder')) return false
  if (lower.includes('no-image')) return false
  if (lower.includes('no%20image')) return false
  if (lower.startsWith('data:image/svg+xml')) return false

  return true
}

type RealRow = {
  kind: 'real'
  id: string
  title: string
  style: string
  thumbnail: string | null
  assets: { originalUrl: string | null }[]
}

type PlaceholderRow = {
  kind: 'placeholder'
  id: string
  title: string
  description: string
}

type CardRow = RealRow | PlaceholderRow

function buildPlaceholders(label: string, count: number, startIndex: number): PlaceholderRow[] {
  return Array.from({ length: count }, (_, i) => {
    const num = startIndex + i + 1
    return {
      kind: 'placeholder' as const,
      id: `placeholder-${label}-${num}`,
      title: `${label} Mock-up ${num}`,
      description: `Reimagined ${label} work coming soon`,
    }
  })
}

export default async function ExploreStylePage({
  params,
}: {
  params: { style: string }
}) {
  const slug = normalizeSlug(params.style)
  const styleKey = SLUG_TO_STYLE_KEY[slug]

  if (!styleKey) return notFound()

  const label = STYLE_LABELS[styleKey] ?? styleKey

  let rows: RealRow[] = []

  try {
    const dbRows = await prisma.artwork.findMany({
      where: {
        style: styleKey as any,
        NOT: { tags: { has: 'smoketest' } },
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
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

    rows = dbRows.map((row) => ({
      kind: 'real' as const,
      id: row.id,
      title: row.title,
      style: row.style as string,
      thumbnail: row.thumbnail,
      assets: row.assets,
    }))
  } catch (e) {
    console.error('Explore style page query failed:', e)
    rows = []
  }

  // Keep only rows with a usable image, then cap at 50 real artworks
  const realRows = rows.filter(hasUsableImage).slice(0, TARGET_REAL)

  // Fill the remaining slots with placeholders until we reach 100 total
  const placeholderCount = Math.max(0, TARGET_TOTAL - realRows.length)
  const placeholderRows = buildPlaceholders(label, placeholderCount, realRows.length)

  const visibleRows: CardRow[] = [...realRows, ...placeholderRows]

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{label}</h1>
          <p className="text-slate-400 text-sm">
            Browse all published artworks in this master style.
          </p>
          <p className="text-slate-500 text-xs">
            Showing {realRows.length} real works and {placeholderRows.length} placeholders
          </p>
        </div>

        <Link
          href="/explore"
          className="text-amber-400 hover:underline text-sm"
        >
          ← Back
        </Link>
      </div>

      {visibleRows.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-slate-300 text-sm">
            No artworks found for this style yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleRows.map((row) => {
            if (row.kind === 'real') {
              const src = pickImgSrc(row) ?? FALLBACK_DATA_URL

              return (
                <Link
                  key={row.id}
                  href={`/artwork/${row.id}`}
                  className="group block rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-amber-400/60 transition-colors"
                >
                  <SafeImg
                    src={src}
                    fallbackSrc={FALLBACK_DATA_URL}
                    alt={row.title}
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <div className="text-sm text-slate-300 line-clamp-1">
                      {row.title}
                    </div>
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                </Link>
              )
            }

            return (
              <div
                key={row.id}
                className="rounded-xl overflow-hidden bg-slate-900/40 border border-dashed border-slate-700"
              >
                <SafeImg
                  src={FALLBACK_DATA_URL}
                  fallbackSrc={FALLBACK_DATA_URL}
                  alt={row.title}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
                <div className="p-3">
                  <div className="text-sm text-slate-300 line-clamp-1">
                    {row.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {row.description}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
