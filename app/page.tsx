export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

const FEATURED_ARTWORKS = [
  {
    title: 'Mona Lisa',
    artist: 'Da Vinci',
    href: '/artwork/cmngh924c0000gfum690drnoh',
    image: '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=700&v=home-v2',
  },
  {
    title: 'Starry Night',
    artist: 'Van Gogh',
    href: '/explore/styles/van-gogh',
    image: '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=700&v=home-v2',
  },
  {
    title: 'Girl with a Pearl Earring',
    artist: 'Vermeer',
    href: '/explore/styles/johannes-vermeer',
    image: '/api/artwork/preview/cmngfwqth000037jqrfa2havj?w=700&v=home-v2',
  },
  {
    title: 'The Scream',
    artist: 'Munch',
    href: '/explore/styles/edvard-munch',
    image: '/api/artwork/preview/cmnqg55x60000uijqc07vfxob?w=700&v=home-v2',
  },
]

const MASTER_COLLECTIONS = [
  {
    label: 'Da Vinci',
    href: '/explore/styles/leonardo-da-vinci',
    image: '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=600&v=home-v2',
  },
  {
    label: 'Van Gogh',
    href: '/explore/styles/van-gogh',
    image: '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=600&v=home-v2',
  },
  {
    label: 'Monet',
    href: '/explore/styles/claude-monet',
    image: '/api/artwork/preview/cmnnla8tb0016rnlqgeqmkslu?w=600&v=home-v2',
  },
  {
    label: 'Rembrandt',
    href: '/explore/styles/rembrandt',
    image: '/api/artwork/preview/cmnotftfu0000jd2lgw17a20y?w=600&v=home-v2',
  },
  {
    label: 'Vermeer',
    href: '/explore/styles/johannes-vermeer',
    image: '/api/artwork/preview/cmngfwqth000037jqrfa2havj?w=600&v=home-v2',
  },
  {
    label: 'Michelangelo',
    href: '/explore/styles/michelangelo',
    image: '/api/artwork/preview/cmo8fdmat00004fp854r2lodn?w=600&v=home-v2',
  },
]

const INSPIRED_COLLECTIONS = [
  {
    label: 'Dalí-Inspired',
    href: '/explore/styles/dali',
    image: '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=700&v=home-v2',
    text: 'Surreal dream-world compositions with premium visual impact.',
  },
  {
    label: 'Picasso-Inspired',
    href: '/explore/styles/pablo-picasso',
    image: '/api/artwork/preview/cmolyv23t000011ndvoxcxgbw?w=700&v=home-v2',
    text: 'Original cubist-inspired works with bold modernist structure.',
  },
  {
    label: 'Pollock-Inspired',
    href: '/explore/styles/jackson-pollock',
    image: '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=700&v=home-v2',
    text: 'Energetic drip-painting compositions made for bold spaces.',
  },
]

export default function HomePage() {
  return (
    <main className="space-y-20">
      <section className="grid gap-10 md:grid-cols-[1fr_0.9fr] items-center">
        <div className="space-y-7">
          <div className="inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-xs font-medium text-amber-300">
            Premium AI art marketplace
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Timeless masterpieces.
            <br />
            <span className="text-amber-400">Modern digital ownership.</span>
          </h1>

          <p className="max-w-xl text-lg leading-8 text-slate-400">
            Explore accurate canonical masterworks and premium AI-inspired collections,
            curated for collectors, creators, and commercial use.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/explore"
              className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-black transition hover:bg-amber-300"
            >
              Explore Artworks
            </Link>

            <Link
              href="/explore/styles/leonardo-da-vinci"
              className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white transition hover:border-amber-400"
            >
              View Master Collections
            </Link>
          </div>
        </div>

        <Link
          href="/artwork/cmngh924c0000gfum690drnoh"
          className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 shadow-2xl"
        >
          <SafeImg
            src="/api/artwork/preview/cmngh924c0000gfum690drnoh?w=1100&v=home-v2"
            fallbackSrc={FALLBACK_DATA_URL}
            alt="Mona Lisa"
            className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="border-t border-slate-800 p-5">
            <div className="text-lg font-semibold">Mona Lisa</div>
            <div className="text-sm text-slate-400">Featured masterwork · Da Vinci</div>
          </div>
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-6 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 text-center md:grid-cols-4">
        <div>
          <div className="text-3xl font-semibold text-white">1000+</div>
          <div className="text-sm text-slate-400">Digital artworks</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">11</div>
          <div className="text-sm text-slate-400">Master collections</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">HD</div>
          <div className="text-sm text-slate-400">Download-ready</div>
        </div>
        <div>
          <div className="text-3xl font-semibold text-white">✔</div>
          <div className="text-sm text-slate-400">Commercial rights</div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold">Iconic works</h2>
            <p className="mt-2 text-sm text-slate-400">
              Recognition builds trust. Start with the strongest anchors.
            </p>
          </div>

          <Link href="/explore" className="text-sm text-amber-400 hover:underline">
            Browse all →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {FEATURED_ARTWORKS.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-amber-400/70"
            >
              <SafeImg
                src={item.image}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={item.title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="p-4">
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="text-xs text-slate-400">{item.artist}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold">Explore the Masters</h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {MASTER_COLLECTIONS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition hover:border-amber-400/70"
            >
              <SafeImg
                src={item.image}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={item.label}
                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="p-4 text-center text-sm font-semibold">{item.label}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold">AI-inspired collections</h2>
          <p className="mt-2 text-sm text-slate-400">
            Original, premium compositions inspired by modern visual languages.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {INSPIRED_COLLECTIONS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="group overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 transition hover:border-amber-400/70"
            >
              <SafeImg
                src={item.image}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={item.label}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="space-y-2 p-5">
                <div className="text-xl font-semibold">{item.label}</div>
                <div className="text-sm leading-6 text-slate-400">{item.text}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/15 to-slate-900 p-8 text-center md:p-12">
        <h2 className="text-3xl font-semibold md:text-4xl">
          Build a premium digital art collection today.
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Download high-quality artwork instantly and use it in commercial projects,
          creative campaigns, digital products, and private collections.
        </p>

        <Link
          href="/explore"
          className="mt-8 inline-block rounded-xl bg-amber-400 px-8 py-4 font-semibold text-black transition hover:bg-amber-300"
        >
          Browse All Artworks
        </Link>
      </section>
    </main>
  )
}
