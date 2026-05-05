export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
    <rect width="100%" height="100%" fill="#0b1220"/>
    <text x="50%" y="50%" fill="#cbd5e1" font-size="20" text-anchor="middle">Preview</text>
  </svg>`)

const THEMES = [
  {
    label: 'Space & Universe',
    slug: 'space-universe',
    image: '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=600&v=theme-home',
  },
  {
    label: 'Wildlife',
    slug: 'wildlife',
    image: '/api/artwork/preview/cmnn9s9n2000cw3tgg0ummybt?w=600&v=theme-home',
  },
  {
    label: 'Automotive',
    slug: 'automotive',
    image: '/api/artwork/preview/cmnp10673000rutftpjr8f49d?w=600&v=theme-home',
  },
  {
    label: 'Steampunk',
    slug: 'steampunk',
    image: '/api/artwork/preview/cmokpr1q3000cvg99aimlopin?w=600&v=theme-home',
  },
  {
    label: 'Landscapes',
    slug: 'landscapes',
    image: '/api/artwork/preview/cmnn9t52k000lw3tgopbeunb0?w=600&v=theme-home',
  },
  {
    label: 'Abstract',
    slug: 'abstract',
    image: '/api/artwork/preview/cmnp0zunq000outfte11v25my?w=600&v=theme-home',
  },
]

function ThemeCard({ item }: { item: (typeof THEMES)[number] }) {
  return (
    <Link
      href={`/explore/themes/${item.slug}`}
      className="group min-w-[220px] max-w-[220px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-amber-400 transition"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={FALLBACK_DATA_URL}
        alt={item.label}
        className="aspect-square w-full object-cover group-hover:scale-105 transition"
      />
      <div className="p-4 text-sm font-semibold text-center">
        {item.label}
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="space-y-20">

      {/* EXISTING SECTIONS ABOVE REMAIN UNCHANGED */}

      {/* 🔥 NEW THEMES SECTION */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">Popular Themes</h2>
          <p className="text-sm text-slate-400 mt-2">
            Browse artwork by high-demand categories.
          </p>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-4">
            {THEMES.map((item) => (
              <ThemeCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
