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
        text-anchor="middle" dominant-baseline="middle">Category preview</text>
    </svg>`
  )

const CATEGORIES = [
  { label: 'Fantasy Kingdoms', slug: 'fantasy-kingdoms', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/fantasy-kingdoms/the-ultimate-fantasy-kingdom-fantasy-kingdoms-theme-sgQDFOoH7tMLgsQKm6zi34WR60XccC.png' },
  { label: 'Ancient Civilizations', slug: 'ancient-civilizations', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/ancient-civilizations/legacy-of-the-ancient-world-ancient-civilizations-theme-ummlj5u2ij8gfYovtPFan47pbnlP01.png' },
  { label: 'Space Galaxy', slug: 'space-galaxy', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-galaxy/the-infinite-galaxy-space-galaxy-theme-QUjjneNZvlQDMFDle1OHIXCyrJ8ZtV.png' },
  { label: 'Cars Automotive', slug: 'cars-automotive', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/cars-automotive/luxury-hypercar-collection-cars-automotive-theme-2G493900asVrEB74ak6Lv70mEYpFDU.png' },
  { label: 'Seasonal Holidays', slug: 'seasonal-holidays', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/seasonal-holidays/seasonal-celebration-collection-seasonal-holidays-theme-HWapdStZkpx74oxjpBUUaoYO6CXTnY.png' },
  { label: 'Spiritual Zen', slug: 'spiritual-zen', image: 'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/spiritual-zen/eternal-zen-horizon-spiritual-zen-theme-pRHk2J2NqjTq5Mg4Nfv59WkKjJa4Cm.png' },
  { label: 'Food Culinary', slug: 'food-culinary', image: '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=900&v=categories' },
  { label: 'Landscapes', slug: 'landscapes', image: '/api/artwork/preview/cmnn9t52k000lw3tgopbeunb0?w=900&v=categories' },
  { label: 'Wildlife', slug: 'wildlife', image: '/api/artwork/preview/cmnn9s9n2000cw3tgg0ummybt?w=900&v=categories' },
  { label: 'Architecture', slug: 'architecture', image: '/api/artwork/preview/cmnhvi3eo000r841p5ebfk5qp?w=900&v=categories' },
  { label: 'Ocean Marine', slug: 'ocean-marine', image: '/api/artwork/preview/cmnnh61340019y3h9yy5z7fvr?w=900&v=categories' },
  { label: 'Luxury Interiors', slug: 'luxury-interiors', image: '/api/artwork/preview/cmolyxwx8000o11ndl93k7rgm?w=900&v=categories' },
  { label: 'Cyberpunk', slug: 'cyberpunk', image: '/api/artwork/preview/cmokprbvq000fvg99k6vw2721?w=900&v=categories' },
  { label: 'Abstract', slug: 'abstract', image: '/api/artwork/preview/cmnp0zunq000outfte11v25my?w=900&v=categories' },
  { label: 'Steampunk', slug: 'steampunk', image: '/api/artwork/preview/cmokpr1q3000cvg99aimlopin?w=900&v=categories' },
  { label: 'Animals Pets', slug: 'animals-pets', image: '/api/artwork/preview/cmq19yeta000r113qf5p419i5?w=900&v=categories' },
  { label: 'Kids Nursery', slug: 'kids-nursery', image: '/api/artwork/preview/cmq238mna000u3ad49lbvutue?w=900&v=categories' },
  { label: 'Gaming Esports', slug: 'gaming-esports', image: '/api/artwork/preview/cmq2ojd3f000rvhpbrn701jsi?w=900&v=categories' },
  { label: 'Vintage Retro', slug: 'vintage-retro', image: '/api/artwork/preview/cmpy8gcuw000vu6yhe86zzv9c?w=900&v=categories' },
]

export default function CategoriesPage() {
  return (
    <main className="space-y-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <Link href="/" className="text-sm font-semibold text-amber-300 hover:underline">
          ← Back to home
        </Link>

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          Favorite Collections
        </h1>

        <p className="mt-4 max-w-3xl text-slate-400">
          Explore AI Image collections by category. Each collection opens into its own gallery.
        </p>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            href={`/explore/themes/${item.slug}`}
            className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60"
          >
            <SafeImg
              src={item.image}
              fallbackSrc={FALLBACK_DATA_URL}
              alt={item.label}
              className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="p-5">
              <div className="text-xl font-semibold text-white">{item.label}</div>
              <div className="mt-1 text-sm text-amber-300">Explore collection →</div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
