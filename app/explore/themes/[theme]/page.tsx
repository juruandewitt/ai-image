export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const THEME_ALIASES: Record<string, string> = {
  'luxury-interiors': 'luxury-interior',
  'interior-decor': 'luxury-interior',
  interiors: 'luxury-interior',
  space: 'space-universe',
  universe: 'space-universe',
  cars: 'automotive',
  auto: 'automotive',
  cyber: 'cyberpunk',
}

const THEMES: Record<string, string> = {
  landscapes: 'Landscapes',
  'space-universe': 'Space & Universe',
  wildlife: 'Wildlife',
  automotive: 'Automotive',
  steampunk: 'Steampunk',
  fantasy: 'Fantasy',
  cyberpunk: 'Cyberpunk',
  abstract: 'Abstract',
  architecture: 'Architecture',
  'luxury-interior': 'Luxury / Interior Decor',
  'fashion-editorial': 'Fashion / Editorial',
  'ocean-marine': 'Ocean & Marine',
  'nature-botanical': 'Nature & Botanical',
}

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Theme artwork placeholder</text>
    </svg>`
  )

export default async function ThemeDetailPage({
  params,
}: {
  params: { theme: string }
}) {
  const requestedTheme = params.theme
  const canonicalTheme = THEME_ALIASES[requestedTheme] ?? requestedTheme

  if (canonicalTheme !== requestedTheme) {
    redirect(`/explore/themes/${canonicalTheme}`)
  }

  const themeName = THEMES[canonicalTheme]

  if (!themeName) {
    notFound()
  }

  const tag = `theme:${canonicalTheme}`

  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      tags: {
        has: tag,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 120,
    select: {
      id: true,
      title: true,
    },
  })

  return (
    <main className="space-y-8">
      <div className="space-y-2">
        <Link href="/explore/themes" className="text-sm text-amber-400 hover:underline">
          ← Back to Themes
        </Link>

        <h1 className="text-4xl font-semibold">{themeName}</h1>

        <p className="text-slate-400">
          {artworks.length} published artworks in this theme.
        </p>
      </div>

      {artworks.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-8">
          <div className="text-xl font-semibold">Coming soon</div>
          <p className="mt-2 text-sm text-slate-400">
            This theme is ready. We’ll generate and publish the artwork batch next.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {artworks.map((art) => (
            <Link
              key={art.id}
              href={`/artwork/${art.id}`}
              className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-amber-400/70"
            >
              <SafeImg
                src={`/api/artwork/preview/${art.id}?w=520&v=theme-v1`}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={art.title}
                className="aspect-square w-full object-cover"
              />

              <div className="p-3">
                <div className="line-clamp-2 text-sm text-slate-100">
                  {art.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
