export const dynamic = 'force-dynamic'

import Link from 'next/link'

const THEMES = [
  { slug: 'landscapes', title: 'Landscapes' },
  { slug: 'space-universe', title: 'Space & Universe' },
  { slug: 'wildlife', title: 'Wildlife' },
  { slug: 'automotive', title: 'Automotive' },
  { slug: 'steampunk', title: 'Steampunk' },
  { slug: 'fantasy', title: 'Fantasy' },
  { slug: 'abstract', title: 'Abstract' },
  { slug: 'architecture', title: 'Architecture' },
  { slug: 'ocean-marine', title: 'Ocean & Marine' },
  { slug: 'luxury-interior', title: 'Luxury Interiors' }, // ✅ FIXED
  { slug: 'cyberpunk', title: 'Cyberpunk' },
  { slug: 'nature-botanical', title: 'Nature & Botanical' },
]

export default function ThemesPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-semibold">Explore Themes</h1>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {THEMES.map((theme) => (
            <Link
              key={theme.slug}
              href={`/explore/themes/${theme.slug}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition hover:border-white/30 hover:bg-white/10"
            >
              <span className="text-sm font-medium">{theme.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
