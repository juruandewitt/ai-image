import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featured = await prisma.artwork.findMany({ orderBy: { createdAt: 'desc' }, take: 3 })
  return (
    <div className="space-y-24">
      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-amber-500">
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="relative z-10 text-white space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg">
            Discover the Future of Art
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto">
            Explore, collect, and be inspired by stunning AI-generated artworks crafted by digital creators worldwide.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/explore" className="px-6 py-3 rounded-md bg-white text-indigo-700 font-semibold shadow-md hover:scale-105 transition-transform">
              Explore the Gallery
            </Link>
            <Link href="/explore" className="px-6 py-3 rounded-md border border-white text-white font-semibold hover:bg-white/10 transition">
              Latest Drops
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </section>

      {/* FEATURED SECTION */}
      <section className="space-y-8">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold text-gray-900">Featured Artworks</h2>
          <Link href="/explore" className="text-sm font-medium text-indigo-600 hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featured.map((a) => (
            <div key={a.id} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition">
              <Image src={a.thumbnail} alt={a.title} width={600} height={400} className="object-cover w-full h-64 group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-4 left-4 text-white space-y-1">
                <h3 className="text-xl font-semibold drop-shadow">{a.title}</h3>
                <p className="text-sm text-indigo-200">by {a.artist}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-16 bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 text-white rounded-2xl">
        <h2 className="text-4xl font-bold mb-4">Start Your AI Art Journey</h2>
        <p className="text-indigo-200 mb-8">Join a community of creators pushing the boundaries of technology and imagination.</p>
        <Link href="/explore" className="px-8 py-3 rounded-md bg-indigo-500 text-white font-semibold hover:bg-indigo-400 transition">
          Browse Now →
        </Link>
      </section>
    </div>
  )
}