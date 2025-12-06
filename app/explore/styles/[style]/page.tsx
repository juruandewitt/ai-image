// app/explore/styles/[style]/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

// Keep this list in sync with your Prisma `enum Style`
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

const SLUG_TO_KEY: Record<string, keyof typeof STYLE_LABELS> = {
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
  // 1) Validate slug → enum key; 404 if unknown to avoid Prisma enum crashes
  const styleKey = SLUG_TO_KEY[params.style.toLowerCase()]
  if (!styleKey) return notFound()
  const label = STYLE_LABELS[styleKey]

  // 2) Query (safe fields only) + guard against server errors
  let rows:
    | {
        id: string
        title: string
        style: string
        thumbnail: string | null
        assets: { originalUrl: string }[]
      }[]
    | null = null
  let errorMsg: string | null = null

  try {
    rows = await prisma.artwork.findMany({
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
  } catch (e: any) {
    errorMsg = e?.message || 'Unknown server error.'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">{label}</h1>
        <Link href="/explore" className="text-amber-400 hover:underline text-sm">
          ← Back to Explore
        </Link>
      </div>

      {errorMsg ? (
        <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-200">
          <div className="font-semibold mb-1">Couldn’t load artworks</div>
          <div className="text-sm opacity-80">{errorMsg}</div>
        </div>
      ) : !rows || rows.length === 0 ? (
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
