// app/explore/styles/[style]/page.tsx

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Canonical slug -> Prisma enum key mapping (matches Explore)
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
  assets?: { originalUrl: string }[]
}) {
  return a.thumbnail || a.assets?.[0]?.originalUrl || null
}

function hasRealImage(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string }[]
}) {
  const src = pickImgSrc(a)
  if (!src) return false

  const lower = src.toLowerCase()

  // Hide obvious placeholders / broken defaults
  if (lower.includes('placeholder')) return false
  if (lower.includes('no-image')) return false
  if (lower.includes('no%20image')) return false
  if (lower.startsWith('data:image/svg+xml')) return false

  return true
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

  let rows: {
    id: string
    title: string
    style: string
    thumbnail: string | null
    assets: { originalUrl: string }[]
  }[] = []

  try {
    rows = await prisma.artwork.findMany({
      where: {
        style: styleKey as any,
        NOT: { tags: { has: 'smoketest' } },
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
      take: 150,
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
  } catch (e) {
    console.error('Explore style page query failed:', e)
    rows = []
  }

  // ✅ Only show artworks with real images
  const visibleRows = rows.filter(hasRealImage)

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{label}</h1>
          <p className="text-slate-400 text-sm">
            Browse all published artworks in this master style.
          </p>
          <p className="text-slate-500 text-xs">
            Showing {visibleRows.length} available works
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
            No published artworks with valid images found for this style yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleRows.map((a) => {
            const src = pickImgSrc(a)
            return (
              <Link
                key={a.id}
                href={`/artwork/${a.id}`}
                className="group block rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-amber-400/60 transition-colors"
              >
                <img
                  src={src ?? ''}
                  alt={a.title}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
                <div className="p-3">
                  <div className="text-sm text-slate-300 line-clamp-1">
                    {a.title}
                  </div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
