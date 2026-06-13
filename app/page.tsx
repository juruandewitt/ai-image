export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">
      <rect width="100%" height="100%" fill="#050816"/>
      <text x="50%" y="48%" fill="#d6bc7b" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">AI Image</text>
      <text x="50%" y="56%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Premium digital artwork</text>
    </svg>`
  )

const FEATURED_ARTWORKS = [
  {
    title: 'The Ultimate Fantasy Kingdom',
    collection: 'Fantasy Kingdoms',
    href: '/artwork/cmqbbygxw000r4ocodd0bpswl',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/fantasy-kingdoms/the-ultimate-fantasy-kingdom-fantasy-kingdoms-theme-sgQDFOoH7tMLgsQKm6zi34WR60XccC.png',
  },
  {
    title: 'Legacy Of The Ancient World',
    collection: 'Ancient Civilizations',
    href: '/artwork/cmq7y0h43000r13cgn0ktb0pv',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/ancient-civilizations/legacy-of-the-ancient-world-ancient-civilizations-theme-ummlj5u2ij8gfYovtPFan47pbnlP01.png',
  },
  {
    title: 'The Infinite Galaxy',
    collection: 'Space Galaxy',
    href: '/artwork/cmq5o2453000rwayy95nttfsx',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-galaxy/the-infinite-galaxy-space-galaxy-theme-QUjjneNZvlQDMFDle1OHIXCyrJ8ZtV.png',
  },
  {
    title: 'Luxury Hypercar Collection',
    collection: 'Cars Automotive',
    href: '/artwork/cmq535lez0000k0veyc94ew9k',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/cars-automotive/luxury-hypercar-collection-cars-automotive-theme-2G493900asVrEB74ak6Lv70mEYpFDU.png',
  },
  {
    title: 'Seasonal Celebration Collection',
    collection: 'Seasonal Holidays',
    href: '/artwork/cmq4axnfd000uq4rycj30jvfi',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/seasonal-holidays/seasonal-celebration-collection-seasonal-holidays-theme-HWapdStZkpx74oxjpBUUaoYO6CXTnY.png',
  },
  {
    title: 'Eternal Zen Horizon',
    collection: 'Spiritual Zen',
    href: '/artwork/cmq3t8vj40011hz6a0myt79e9',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/spiritual-zen/eternal-zen-horizon-spiritual-zen-theme-pRHk2J2NqjTq5Mg4Nfv59WkKjJa4Cm.png',
  },
]

const COLLECTIONS = [
  {
    label: 'Fantasy Kingdoms',
    slug: 'fantasy-kingdoms',
    count: '50 artworks',
    text: 'Dragons, castles, floating kingdoms and magical worlds.',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/fantasy-kingdoms/the-ultimate-fantasy-kingdom-fantasy-kingdoms-theme-sgQDFOoH7tMLgsQKm6zi34WR60XccC.png',
  },
  {
    label: 'Ancient Civilizations',
    slug: 'ancient-civilizations',
    count: '50 artworks',
    text: 'Egypt, Rome, Greece, Atlantis, Babylon and lost empires.',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/ancient-civilizations/legacy-of-the-ancient-world-ancient-civilizations-theme-ummlj5u2ij8gfYovtPFan47pbnlP01.png',
  },
  {
    label: 'Space Galaxy',
    slug: 'space-galaxy',
    count: '50 artworks',
    text: 'Deep space, galaxies, star harbors and cosmic kingdoms.',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-galaxy/the-infinite-galaxy-space-galaxy-theme-QUjjneNZvlQDMFDle1OHIXCyrJ8ZtV.png',
  },
  {
    label: 'Cars Automotive',
    slug: 'cars-automotive',
    count: '50 artworks',
    text: 'Luxury cars, hypercars, showrooms and automotive lifestyle.',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/cars-automotive/luxury-hypercar-collection-cars-automotive-theme-2G493900asVrEB74ak6Lv70mEYpFDU.png',
  },
  {
    label: 'Seasonal Holidays',
    slug: 'seasonal-holidays',
    count: '50 artworks',
    text: 'Christmas, autumn, spring, celebrations and festive scenes.',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/seasonal-holidays/seasonal-celebration-collection-seasonal-holidays-theme-HWapdStZkpx74oxjpBUUaoYO6CXTnY.png',
  },
  {
    label: 'Spiritual Zen',
    slug: 'spiritual-zen',
    count: '50 artworks',
    text: 'Meditation, temples, calm landscapes and wellness spaces.',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/spiritual-zen/eternal-zen-horizon-spiritual-zen-theme-pRHk2J2NqjTq5Mg4Nfv59WkKjJa4Cm.png',
  },
  {
    label: 'Food Culinary',
    slug: 'food-culinary',
    count: '50 artworks',
    text: 'Premium food, hospitality, dining and culinary wall art.',
    image: '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=800&v=launch',
  },
]

function FeaturedCard({ item }: { item: (typeof FEATURED_ARTWORKS)[number] }) {
  return (
    <Link
      href={item.href}
      className="group min-w-[240px] max-w-[240px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[300px] md:max-w-[300px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={FALLBACK_DATA_URL}
        alt={item.title}
        className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
      />
      <div className="space-y-1 p-5">
        <div className="line-clamp-1 text-sm font-semibold text-white">{item.title}</div>
        <div className="text-xs text-amber-300">{item.collection}</div>
      </div>
    </Link>
  )
}

function CollectionCard({ item }: { item: (typeof COLLECTIONS)[number] }) {
  return (
    <Link
      href={`/explore/themes/${item.slug}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-amber-300/60"
    >
      <div className="relative">
        <SafeImg
          src={item.image}
          fallbackSrc={FALLBACK_DATA_URL}
          alt={item.label}
          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-xl font-semibold text-white">{item.label}</div>
          <div className="mt-1 text-xs font-medium text-amber-300">{item.count}</div>
        </div>
      </div>
      <div className="p-5 text-sm leading-6 text-slate-300">{item.text}</div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="space-y-24">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070914] px-6 py-12 shadow-2xl shadow-black/30 md:px-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_35%)]" />

        <div className="relative grid items-center gap-10 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Premium AI digital art
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-7xl">
              Curated AI art for bold digital collections.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Explore 350 premium artworks across fantasy, ancient worlds, space,
              automotive luxury, spiritual calm, seasonal decor, and culinary art.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="rounded-2xl bg-amber-300 px-7 py-4 font-semibold text-black transition hover:bg-amber-200"
              >
                Explore Artworks
              </Link>
              <Link
                href="/explore/themes/fantasy-kingdoms"
                className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:border-amber-300/60"
              >
                View Fantasy Kingdoms
              </Link>
            </div>
          </div>

          <Link
            href="/artwork/cmqbbygxw000r4ocodd0bpswl"
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40"
          >
            <SafeImg
              src="https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/fantasy-kingdoms/the-ultimate-fantasy-kingdom-fantasy-kingdoms-theme-sgQDFOoH7tMLgsQKm6zi34WR60XccC.png"
              fallbackSrc={FALLBACK_DATA_URL}
              alt="The Ultimate Fantasy Kingdom"
              className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="border-t border-white/10 p-5">
              <div className="text-lg font-semibold text-white">The Ultimate Fantasy Kingdom</div>
              <div className="text-sm text-slate-400">Featured launch artwork</div>
            </div>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center md:grid-cols-4">
        <div>
          <div className="text-3xl font-semibold text-white">350</div>
          <div className="text-sm text-slate-400">Launch artworks</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">7</div>
          <div className="text-sm text-slate-400">Curated collections</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">$9.99</div>
          <div className="text-sm text-slate-400">Standard artwork price</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">HD</div>
          <div className="text-sm text-slate-400">Instant downloads</div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-white md:text-4xl">
              Featured launch artworks
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              A premium preview of the strongest collections in the AI Image catalog.
            </p>
          </div>
          <Link href="/explore" className="shrink-0 text-sm font-semibold text-amber-300 hover:underline">
            Browse all →
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {FEATURED_ARTWORKS.map((item) => (
              <FeaturedCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Explore collections
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Seven complete launch-ready collections, each with 50 premium artworks.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {COLLECTIONS.map((item) => (
            <CollectionCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
          <div className="text-xl font-semibold text-white">Commercial-ready</div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Premium AI-generated artwork prepared for digital products, creative projects,
            websites, social media, and private collections.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
          <div className="text-xl font-semibold text-white">Curated by theme</div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Each collection is built as a focused 50-piece set for easy browsing and a more
            professional marketplace feel.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
          <div className="text-xl font-semibold text-white">Instant access</div>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Simple pricing, clean artwork pages, and download-ready digital art designed for
            a smooth launch experience.
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-amber-300/20 via-purple-500/10 to-white/[0.04] p-8 text-center md:p-14">
        <h2 className="text-3xl font-semibold text-white md:text-5xl">
          Build your digital art collection today.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-slate-300">
          Discover premium AI-generated artwork across fantasy, history, space,
          luxury, wellness, celebrations, and culinary design.
        </p>
        <Link
          href="/explore"
          className="mt-8 inline-block rounded-2xl bg-amber-300 px-8 py-4 font-semibold text-black transition hover:bg-amber-200"
        >
          Browse All Artworks
        </Link>
      </section>
    </main>
  )
}
