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

const MASTERS = [
  { label: 'Da Vinci', href: '/explore/styles/leonardo-da-vinci', image: '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=700&v=home-masters', work: 'Mona Lisa' },
  { label: 'Michelangelo', href: '/explore/styles/michelangelo', image: '/api/artwork/preview/cmo8fdmat00004fp854r2lodn?w=700&v=home-masters', work: 'The Creation of Adam' },
  { label: 'Van Gogh', href: '/explore/styles/van-gogh', image: '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=700&v=home-masters', work: 'Starry Night' },
  { label: 'Monet', href: '/explore/styles/claude-monet', image: '/api/artwork/preview/cmnnla8tb0016rnlqgeqmkslu?w=700&v=home-masters', work: 'Impression Sunrise' },
  { label: 'Rembrandt', href: '/explore/styles/rembrandt', image: '/api/artwork/preview/cmnotftfu0000jd2lgw17a20y?w=700&v=home-masters', work: 'The Night Watch' },
  { label: 'Caravaggio', href: '/explore/styles/caravaggio', image: '/api/artwork/preview/cmnowyzys0000vtrya8t4lj2o?w=700&v=home-masters', work: 'Saint Matthew' },
  { label: 'Vermeer', href: '/explore/styles/johannes-vermeer', image: '/api/artwork/preview/cmngfwqth000037jqrfa2havj?w=700&v=home-masters', work: 'Girl with a Pearl Earring' },
  { label: 'Munch', href: '/explore/styles/edvard-munch', image: '/api/artwork/preview/cmnqg55x60000uijqc07vfxob?w=700&v=home-masters', work: 'The Scream' },
  { label: 'Pollock', href: '/explore/styles/jackson-pollock', image: '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=700&v=home-masters', work: 'Autumn Rhythm' },
  { label: 'Dalí', href: '/explore/styles/dali', image: '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=700&v=home-masters', work: 'Surrealist Collection' },
  { label: 'Picasso', href: '/explore/styles/pablo-picasso', image: '/api/artwork/preview/cmolyv23t000011ndvoxcxgbw?w=700&v=home-masters', work: 'Cubist Collection' },
]

const MASTERS_REIMAGINED = [
  { label: 'Dalí Reimagined', href: '/explore/styles/dali', image: '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=800&v=home-reimagined', text: 'Surreal dream-world compositions with premium visual impact.' },
  { label: 'Picasso Reimagined', href: '/explore/styles/pablo-picasso', image: '/api/artwork/preview/cmolyv23t000011ndvoxcxgbw?w=800&v=home-reimagined', text: 'Bold cubist-inspired works with modern structure and energy.' },
  { label: 'Pollock Reimagined', href: '/explore/styles/jackson-pollock', image: '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=800&v=home-reimagined', text: 'Expressive abstract works for bold contemporary spaces.' },
]

const FAVORITE_COLLECTIONS = [
  { label: 'Fantasy Kingdoms', slug: 'fantasy-kingdoms', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/fantasy-kingdoms/the-ultimate-fantasy-kingdom-fantasy-kingdoms-theme-sgQDFOoH7tMLgsQKm6zi34WR60XccC.png' },
  { label: 'Ancient Civilizations', slug: 'ancient-civilizations', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/ancient-civilizations/legacy-of-the-ancient-world-ancient-civilizations-theme-ummlj5u2ij8gfYovtPFan47pbnlP01.png' },
  { label: 'Space Galaxy', slug: 'space-galaxy', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-galaxy/the-infinite-galaxy-space-galaxy-theme-QUjjneNZvlQDMFDle1OHIXCyrJ8ZtV.png' },
  { label: 'Cars Automotive', slug: 'cars-automotive', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/cars-automotive/luxury-hypercar-collection-cars-automotive-theme-2G493900asVrEB74ak6Lv70mEYpFDU.png' },
  { label: 'Seasonal Holidays', slug: 'seasonal-holidays', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/seasonal-holidays/seasonal-celebration-collection-seasonal-holidays-theme-HWapdStZkpx74oxjpBUUaoYO6CXTnY.png' },
  { label: 'Spiritual Zen', slug: 'spiritual-zen', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/spiritual-zen/eternal-zen-horizon-spiritual-zen-theme-pRHk2J2NqjTq5Mg4Nfv59WkKjJa4Cm.png' },
  { label: 'Food Culinary', slug: 'food-culinary', image: '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=800&v=home-categories' },
  { label: 'Landscapes', slug: 'landscapes', image: '/api/artwork/preview/cmnn9t52k000lw3tgopbeunb0?w=800&v=home-categories' },
  { label: 'Wildlife', slug: 'wildlife', image: '/api/artwork/preview/cmnn9s9n2000cw3tgg0ummybt?w=800&v=home-categories' },
  { label: 'Architecture', slug: 'architecture', image: '/api/artwork/preview/cmnhvi3eo000r841p5ebfk5qp?w=800&v=home-categories' },
  { label: 'Ocean Marine', slug: 'ocean-marine', image: '/api/artwork/preview/cmnnh61340019y3h9yy5z7fvr?w=800&v=home-categories' },
  { label: 'Luxury Interiors', slug: 'luxury-interiors', image: '/api/artwork/preview/cmolyxwx8000o11ndl93k7rgm?w=800&v=home-categories' },
  { label: 'Cyberpunk', slug: 'cyberpunk', image: '/api/artwork/preview/cmokprbvq000fvg99k6vw2721?w=800&v=home-categories' },
  { label: 'Abstract', slug: 'abstract', image: '/api/artwork/preview/cmnp0zunq000outfte11v25my?w=800&v=home-categories' },
  { label: 'Steampunk', slug: 'steampunk', image: '/api/artwork/preview/cmokpr1q3000cvg99aimlopin?w=800&v=home-categories' },
]

const BESTSELLERS = [
  ...FAVORITE_COLLECTIONS.slice(0, 6).map((item) => ({
    title: item.label,
    href: `/explore/themes/${item.slug}`,
    image: item.image,
  })),
]

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string
  subtitle: string
  href?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm font-semibold text-amber-300 hover:underline">
          Explore all →
        </Link>
      ) : null}
    </div>
  )
}

function MasterCard({ item }: { item: (typeof MASTERS)[number] }) {
  return (
    <Link href={item.href} className="group min-w-[230px] max-w-[230px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[280px] md:max-w-[280px]">
      <SafeImg src={item.image} fallbackSrc={FALLBACK_DATA_URL} alt={item.label} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="p-5">
        <div className="font-semibold text-white">{item.label}</div>
        <div className="mt-1 text-xs text-amber-300">{item.work}</div>
      </div>
    </Link>
  )
}

function CollectionCard({ item }: { item: (typeof FAVORITE_COLLECTIONS)[number] }) {
  return (
    <Link href={`/explore/themes/${item.slug}`} className="group min-w-[230px] max-w-[230px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[280px] md:max-w-[280px]">
      <SafeImg src={item.image} fallbackSrc={FALLBACK_DATA_URL} alt={item.label} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="p-5">
        <div className="font-semibold text-white">{item.label}</div>
        <div className="mt-1 text-xs text-slate-400">Explore collection</div>
      </div>
    </Link>
  )
}

function ReimaginedCard({ item }: { item: (typeof MASTERS_REIMAGINED)[number] }) {
  return (
    <Link href={item.href} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60">
      <SafeImg src={item.image} fallbackSrc={FALLBACK_DATA_URL} alt={item.label} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
      <div className="space-y-2 p-5">
        <div className="text-xl font-semibold text-white">{item.label}</div>
        <div className="text-sm leading-6 text-slate-400">{item.text}</div>
      </div>
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
              Curated art collections for bold digital ownership.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Explore masterworks, AI-reimagined art, favorite collections, and bestselling digital artworks across a premium launch catalog.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/explore" className="rounded-2xl bg-amber-300 px-7 py-4 font-semibold text-black transition hover:bg-amber-200">
                Explore Artworks
              </Link>
              <Link href="/explore/masters" className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:border-amber-300/60">
                Explore Masters
              </Link>
            </div>
          </div>

          <Link href="/explore/themes/fantasy-kingdoms" className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40">
            <SafeImg src="https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/fantasy-kingdoms/the-ultimate-fantasy-kingdom-fantasy-kingdoms-theme-sgQDFOoH7tMLgsQKm6zi34WR60XccC.png" fallbackSrc={FALLBACK_DATA_URL} alt="The Ultimate Fantasy Kingdom" className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="border-t border-white/10 p-5">
              <div className="text-lg font-semibold text-white">The Ultimate Fantasy Kingdom</div>
              <div className="text-sm text-slate-400">Featured launch collection</div>
            </div>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center md:grid-cols-4">
        <div><div className="text-3xl font-semibold text-white">2000+</div><div className="text-sm text-slate-400">Launch artworks</div></div>
        <div><div className="text-3xl font-semibold text-white">30+</div><div className="text-sm text-slate-400">Curated collections</div></div>
        <div><div className="text-3xl font-semibold text-white">$9.99</div><div className="text-sm text-slate-400">Standard artwork price</div></div>
        <div><div className="text-3xl font-semibold text-white">HD</div><div className="text-sm text-slate-400">Instant downloads</div></div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="The Masters" subtitle="Explore all 11 master collections, each linked directly to its dedicated page." href="/explore/masters" />
        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {MASTERS.map((item) => <MasterCard key={item.label} item={item} />)}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="The Masters Reimagined" subtitle="Original AI-inspired collections based on iconic visual languages." href="/explore/masters-reimagined" />
        <div className="grid gap-6 md:grid-cols-3">
          {MASTERS_REIMAGINED.map((item) => <ReimaginedCard key={item.label} item={item} />)}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Favorite Collections" subtitle="A preview of the 30+ curated artwork categories available in AI Image." href="/explore/categories" />
        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {FAVORITE_COLLECTIONS.map((item) => <CollectionCard key={item.slug} item={item} />)}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader title="Bestsellers" subtitle="High-impact collections designed for strong first impressions and premium digital decor." href="/explore" />
        <div className="grid gap-6 md:grid-cols-3">
          {BESTSELLERS.map((item) => (
            <Link key={item.title} href={item.href} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60">
              <SafeImg src={item.image} fallbackSrc={FALLBACK_DATA_URL} alt={item.title} className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="p-5">
                <div className="text-xl font-semibold text-white">{item.title}</div>
                <div className="mt-1 text-sm text-amber-300">View collection</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
