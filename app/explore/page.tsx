// app/explore/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

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

const STYLE_SLUGS: Record<string, string> = {
  VAN_GOGH: 'van-gogh',
  DALI: 'dali',
  POLLOCK: 'jackson-pollock',
  VERMEER: 'johannes-vermeer',
  MONET: 'claude-monet',
  PICASSO: 'pablo-picasso',
  REMBRANDT: 'rembrandt',
  CARAVAGGIO: 'caravaggio',
  DA_VINCI: 'leonardo-da-vinci',
  MICHELANGELO: 'michelangelo',
}

const STYLE_ORDER = Object.keys(STYLE_LABELS)

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="22"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="14"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

export default async function ExploreDirectory() {
  const perStyleTake = 12

  const byStyle: Record<
    string,
    {
      id: string
      title: string
      style: string
    }[]
  > = {}

  for (const key of STYLE_ORDER) {
    const rows = await prisma.artwork.findMany({
      where: {
        style: key as any,
        status: 'PUBLISHED',
        NOT: [
          { tags: { has: 'smoketest' } },
          { title: { contains: 'smoketest', mode: 'insensitive' } },
          { title: { contains: 'diagnostic', mode: 'insensitive' } },
          { title: { contains: 'test artwork', mode: 'insensitive' } },
          { title: { contains: 'db smoketest', mode: 'insensitive' } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: perStyleTake,
      select: {
        id: true,
        title: true,
        style: true,
      },
    })

    byStyle[key] = rows
  }

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold">Explore Masters</h1>

      {STYLE_ORDER.map((key) => {
        const label = STYLE_LABELS[key]
        const slug = STYLE_SLUGS[key]
        const rows = byStyle[key] || []

        return (
          <section key={key} className="space-y-4">
            <div className="flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">{label}</h2>
              <Link
                href={`/explore/styles/${slug}`}
                className="text-amber-400 hover:underline text-sm"
              >
                See all →
              </Link>
            </div>

            {rows.length === 0 ? (
              <p className="text-slate-400 text-sm">No artworks yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {rows.slice(0, 8).map((a) => (
                  <Link
                    key={a.id}
                    href={`/artwork/${a.id}`}
                    className="group block rounded-xl overflow-hidden bg-slate-900/60 border border-slate-800 hover:border-amber-400/60 transition-colors"
                  >
                    <SafeImg
                      src={`/api/artwork/preview/${a.id}?w=520`}
                      fallbackSrc={FALLBACK_DATA_URL}
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
          </section>
        )
      })}
    </div>
  )
}
