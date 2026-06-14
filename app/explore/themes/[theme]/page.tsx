export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const THEME_ALIASES: Record<string, string> = {
  interiors: 'luxury-interior',
  'luxury-interiors': 'luxury-interior',
  'interior-decor': 'luxury-interior',
  space: 'space-universe',
  universe: 'space-universe',
  cars: 'cars-automotive',
  auto: 'cars-automotive',
  cyber: 'cyberpunk',
  food: 'food-culinary',
  sports: 'sports-action',
  music: 'music-performance',
  travel: 'travel-destinations',
  wellness: 'health-wellness',
  business: 'business-finance',
  vintage: 'vintage-retro',
  animals: 'animals-pets',
  pets: 'animals-pets',
  kids: 'kids-nursery',
  gaming: 'gaming-esports',
  spiritual: 'spiritual-zen',
  seasonal: 'seasonal-holidays',
  ancient: 'ancient-civilizations',
  civilizations: 'ancient-civilizations',
  fantasykingdoms: 'fantasy-kingdoms',
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

  'food-culinary': 'Food / Culinary',
  'sports-action': 'Sports / Action',
  'music-performance': 'Music / Performance',
  'travel-destinations': 'Travel / Destinations',
  'luxury-lifestyle': 'Luxury Lifestyle',
  'health-wellness': 'Health / Wellness',
  'business-finance': 'Business / Finance',
  'vintage-retro': 'Vintage / Retro',
  'animals-pets': 'Animals / Pets',
  'kids-nursery': 'Kids / Nursery',
  'gaming-esports': 'Gaming / Esports',
  'spiritual-zen': 'Spiritual / Zen',
  'seasonal-holidays': 'Seasonal / Holidays',
  'cars-automotive': 'Cars / Automotive',
  'space-galaxy': 'Space / Galaxy',
  'ancient-civilizations': 'Ancient Civilizations',
  'fantasy-kingdoms': 'Fantasy Kingdoms',
}

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#050816"/>
      <text x="50%" y="46%" fill="#d6bc7b" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">AI Image</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Theme artwork</text>
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
    take: 200,
    select: {
      id: true,
      title: true,
    },
  })

  return (
    <main className="space-y-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <Link href="/explore/categories" className="text-sm font-semibold text-amber-300 hover:underline">
          ← Back to Favorite Collections
        </Link>

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          {themeName}
        </h1>

        <p className="mt-4 text-slate-400">
          {artworks.length} published artworks in this collection.
        </p>
      </section>

      {artworks.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <div className="text-xl font-semibold text-white">No artworks found</div>
          <p className="mt-2 text-sm text-slate-400">
            This collection exists, but no artworks were found with tag: {tag}
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {artworks.map((art) => (
            <Link
              key={art.id}
              href={`/artwork/${art.id}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60"
            >
              <SafeImg
                src={`/api/artwork/preview/${art.id}?w=620&v=theme-v2`}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={art.title}
                className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="p-4">
                <div className="line-clamp-2 text-sm font-medium text-slate-100">
                  {art.title}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
