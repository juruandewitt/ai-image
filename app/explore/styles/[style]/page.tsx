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

// Headings
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="18"
        text-anchor="middle" dominant-baseline="middle">No image</text>
    </svg>`
  )

function normalizeSlug(input: string): string {
  let s = input
  try {
    s = decodeURIComponent(s)
  } catch {
    // ignore
  }

  // remove diacritics: dalí -> dali
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
  return a.thumbnail || a.assets?.[0]?.originalUrl || FALLBACK_DATA_URL
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

  // Query matches Explore page logic.
  // IMPORTANT: no DOM event handlers in server components.
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
  } catch (e) {
    console.error('Explore style page query failed:', e)
    rows = []
  }

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold">{label}</h1>
          <p className="text-slate-400 text-sm">
            Browse all published artworks in this master style.
          </p>
        </div>

        <Link
          href="/explore"
          className="text-amber-400 hover:underline text-sm"
        >
          ← Back
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-slate-300 text-sm">No artworks yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((a) => (
            <Link
              key={a.id}
              href={`/artwork/${a.id}`}
              className="group block rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-amber-400/60 transition-colors"
            >
              <img
                src={pickImgSrc(a)}
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
          ))}
        </div>
      )}
    </div>
  )
}
