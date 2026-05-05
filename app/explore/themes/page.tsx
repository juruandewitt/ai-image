import Link from 'next/link'

const THEMES = [
  { name: 'Landscapes', slug: 'landscapes' },
  { name: 'Space & Universe', slug: 'space-universe' },
  { name: 'Wildlife', slug: 'wildlife' },
  { name: 'Automotive', slug: 'automotive' },
  { name: 'Steampunk', slug: 'steampunk' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Abstract', slug: 'abstract' },
  { name: 'Architecture', slug: 'architecture' },
  { name: 'Ocean & Marine', slug: 'ocean-marine' },
  { name: 'Luxury Interiors', slug: 'luxury-interiors' },
  { name: 'Cyberpunk', slug: 'cyberpunk' },
  { name: 'Nature & Botanical', slug: 'nature-botanical' },
]

export default function ThemesPage() {
  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">Themes</h1>
        <p className="mt-3 text-slate-400">
          Browse commercial-ready AI artwork by popular download categories.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {THEMES.map((theme) => (
          <Link
            key={theme.slug}
            href={`/explore/themes/${theme.slug}`}
            className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-amber-400"
          >
            <div className="text-xl font-semibold">{theme.name}</div>
            <div className="mt-2 text-sm text-slate-400">Explore collection →</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
