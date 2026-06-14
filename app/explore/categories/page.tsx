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
  { label: 'Abstract', slug: 'abstract', id: 'cmp1lufi8000012ic39smonli' },
  { label: 'Ancient Civilizations', slug: 'ancient-civilizations', id: 'cmq6d1a57000014kn9c02er4x' },
  { label: 'Animals / Pets', slug: 'animals-pets', id: 'cmpyeyl3300002zoq2hvd1pio' },
  { label: 'Architecture', slug: 'architecture', id: 'cmp2yzmsu00006o55vsz0zogg' },
  { label: 'Automotive', slug: 'automotive', id: 'cmovzquvm000048vyfwatowi2' },
  { label: 'Business / Finance', slug: 'business-finance', id: 'cmpvovw9p00006qv16mxn90po' },
  { label: 'Cars / Automotive', slug: 'cars-automotive', id: 'cmq4wthpl0000165iuvclc0xg' },
  { label: 'Cyberpunk', slug: 'cyberpunk', id: 'cmp121h1e0000yczcn8zcasqi' },
  { label: 'Fantasy', slug: 'fantasy', id: 'cmoy09hv70000ikqtxprpng05' },
  { label: 'Fantasy Kingdoms', slug: 'fantasy-kingdoms', id: 'cmq80fdao0000o5blyggzox1h' },
  { label: 'Fashion / Editorial', slug: 'fashion-editorial', id: 'cmp57k0us0000rrpq1qen3cym' },
  { label: 'Food / Culinary', slug: 'food-culinary', id: 'cmpfxxocq00005d9waq7ulcng' },
  { label: 'Gaming / Esports', slug: 'gaming-esports', id: 'cmq23ftj50000vj3vyeco8mh4' },
  { label: 'Health / Wellness', slug: 'health-wellness', id: 'cmptsat77000048mqbnvpbhgr' },
  { label: 'Kids / Nursery', slug: 'kids-nursery', id: 'cmq1fjw330000alyeayr7dr1v' },
  { label: 'Landscapes', slug: 'landscapes', id: 'cmot5ty3v0000u3lypk20e5an' },
  { label: 'Luxury / Interior Decor', slug: 'luxury-interior', id: 'cmp33ehg70000474namojz2av' },
  { label: 'Luxury Lifestyle', slug: 'luxury-lifestyle', id: 'cmpllpx7y0000izhrrv1dl9q3' },
  { label: 'Music / Performance', slug: 'music-performance', id: 'cmpifdraz0000jreqv4ht5hok' },
  { label: 'Nature / Botanical', slug: 'nature-botanical', id: 'cmpd6gbye0000inxmqaksp6cn' },
  { label: 'Ocean / Marine', slug: 'ocean-marine', id: 'cmpbn3f0h0000ycb12edq3qk2' },
  { label: 'Seasonal / Holidays', slug: 'seasonal-holidays', id: 'cmq3u8dd10000k0dafyvhkg9l' },
  { label: 'Space / Galaxy', slug: 'space-galaxy', id: 'cmq5e2xjx0000308bbd8u2uvd' },
  { label: 'Space / Universe', slug: 'space-universe', id: 'cmoszx1eb0000s0gi0hsvp25o' },
  { label: 'Spiritual / Zen', slug: 'spiritual-zen', id: 'cmq3d8uhm0000u3feir9sucgq' },
  { label: 'Sports / Action', slug: 'sports-action', id: 'cmphfofoe00001bs4drfch79a' },
  { label: 'Steampunk', slug: 'steampunk', id: 'cmoxb6m9l000010d38wh2nt02' },
  { label: 'Travel / Destinations', slug: 'travel-destinations', id: 'cmpku0pdu0000wrli6vj5ttbx' },
  { label: 'Vintage / Retro', slug: 'vintage-retro', id: 'cmpx5aw9j0000oxlq33ww14zi' },
  { label: 'Wildlife', slug: 'wildlife', id: 'cmouj7uw00000eocoe574f7rg' },
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
          Explore all 30 curated AI Image collections. Each collection contains 50 published artworks.
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
              src={`/api/artwork/preview/${item.id}?w=900&v=categories-30`}
              fallbackSrc={FALLBACK_DATA_URL}
              alt={item.label}
              className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="p-5">
              <div className="text-xl font-semibold text-white">{item.label}</div>
              <div className="mt-1 text-sm text-slate-400">50 artworks</div>
              <div className="mt-3 text-sm font-semibold text-amber-300">Explore collection →</div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  )
}
