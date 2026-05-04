export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'

const HERO_IMAGE =
  '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=1200&v=hero' // Mona Lisa (strong trust anchor)

const FEATURED_MASTERS = [
  { label: 'Da Vinci', href: '/explore/styles/leonardo-da-vinci' },
  { label: 'Van Gogh', href: '/explore/styles/van-gogh' },
  { label: 'Monet', href: '/explore/styles/claude-monet' },
  { label: 'Rembrandt', href: '/explore/styles/rembrandt' },
  { label: 'Vermeer', href: '/explore/styles/johannes-vermeer' },
  { label: 'Michelangelo', href: '/explore/styles/michelangelo' },
]

const INSPIRED_COLLECTIONS = [
  { label: 'Dalí-Inspired', href: '/explore/styles/dali' },
  { label: 'Picasso-Inspired', href: '/explore/styles/pablo-picasso' },
  { label: 'Pollock-Inspired', href: '/explore/styles/jackson-pollock' },
]

export default function HomePage() {
  return (
    <main className="space-y-16">

      {/* HERO */}
      <section className="grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
            Timeless Masterpieces.
            <br />
            <span className="text-amber-400">Reimagined with AI.</span>
          </h1>

          <p className="text-slate-400 text-lg">
            Own high-quality digital artwork inspired by history’s greatest artists —
            crafted for modern collectors and commercial use.
          </p>

          <div className="flex gap-4">
            <Link
              href="/explore"
              className="px-6 py-3 rounded-xl bg-amber-400 text-black font-medium hover:bg-amber-300 transition"
            >
              Explore Collection
            </Link>

            <Link
              href="/explore/styles/leonardo-da-vinci"
              className="px-6 py-3 rounded-xl border border-slate-700 hover:border-amber-400 transition"
            >
              View Masters
            </Link>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800">
          <SafeImg
            src={HERO_IMAGE}
            alt="Featured artwork"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-2xl font-semibold">1000+</div>
          <div className="text-slate-400 text-sm">Artworks</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">11</div>
          <div className="text-slate-400 text-sm">Master Styles</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">HD</div>
          <div className="text-slate-400 text-sm">Download Quality</div>
        </div>
        <div>
          <div className="text-2xl font-semibold">✔</div>
          <div className="text-slate-400 text-sm">Commercial Rights</div>
        </div>
      </section>

      {/* FEATURED MASTERS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Explore the Masters</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURED_MASTERS.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-xl border border-slate-800 p-6 text-center hover:border-amber-400 transition"
            >
              <div className="text-sm">{m.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* INSPIRED COLLECTIONS */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">AI-Inspired Collections</h2>

        <div className="grid md:grid-cols-3 gap-6">
          {INSPIRED_COLLECTIONS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="group rounded-2xl border border-slate-800 p-8 hover:border-amber-400 transition"
            >
              <div className="text-xl font-medium mb-2">{c.label}</div>
              <div className="text-slate-400 text-sm">
                Unique, original compositions inspired by iconic styles.
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-6">
        <h2 className="text-3xl font-semibold">
          Start building your collection today
        </h2>

        <p className="text-slate-400">
          Download stunning artwork instantly and use it commercially.
        </p>

        <Link
          href="/explore"
          className="inline-block px-8 py-4 rounded-xl bg-amber-400 text-black font-medium hover:bg-amber-300 transition"
        >
          Browse All Artworks
        </Link>
      </section>

    </main>
  )
}
