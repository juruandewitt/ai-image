// app/page.tsx
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import Hero from '@/components/Hero'
import { MotionCard } from '@/components/MotionCard'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featured = await prisma.artwork.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
  })

  return (
    <div className="space-y-24">
      <Hero />

      {/* FEATURED SECTION */}
      <section className="space-y-8 rounded-2xl">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold text-white drop-shadow">Featured Artworks</h2>
          <Link href="/explore" className="text-sm font-medium text-indigo-300 hover:underline">
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((a, i) => (
            <MotionCard key={a.id} delay={i * 0.05}>
              <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition">
                <Image
                  src={a.thumbnail}
                  alt={a.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-64 group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white space-y-1">
                  <h3 className="text-xl font-semibold drop-shadow">{a.title}</h3>
                  <p className="text-sm text-indigo-200">by {a.artist}</p>
                </div>
              </div>
            </MotionCard>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-16 bg-gradient-to-r from-indigo-950 via-slate-900 to-black text-white rounded-2xl">
        <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">Start Your AI Art Journey</h2>
        <p className="text-indigo-200 mb-8">
          Join a community of creators pushing the boundaries of technology and imagination.
        </p>
        <Link
          href="/explore"
          className="px-8 py-3 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-500 transition"
        >
          Browse Now →
        </Link>
      </section>
    </div>
  )
}
