#!/usr/bin/env bash
set -euo pipefail

mkdir -p app components

# 1) Global dark background + ambient glows
cat > app/layout.tsx <<'TSX'
// app/layout.tsx
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = {
  title: 'AI Image',
  description: 'Discover & collect AI-generated artworks',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Dark global gradient + soft neon glows */}
      <body className="min-h-screen text-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 opacity-60 [background:
            radial-gradient(900px_600px_at_12%_-10%,rgba(99,102,241,0.25),transparent),
            radial-gradient(700px_450px_at_90%_0%,rgba(245,158,11,0.18),transparent)
          ]" />
        </div>

        <Navbar />

        <main className="container mx-auto px-4 py-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
TSX

# 2) Glassy dark navbar (sticky, blurred, subtle border)
cat > components/Navbar.tsx <<'TSX'
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="AI Image" width={320} height={64} className="h-10 w-auto md:h-12 shrink-0" priority />
        </Link>
        <nav className="flex gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "transition-colors " +
                (pathname === l.href ? 'text-indigo-300 font-semibold' : 'text-neutral-300 hover:text-indigo-300')
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
TSX

# 3) Dark hero (parallax/motion-ready)
cat > components/Hero.tsx <<'TSX'
'use client'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useRef } from 'react'

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] })
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const blur = useTransform(scrollYProgress, [0, 1], ['0px', '6px'])
  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7 } }
  const stagger = { animate: { transition: { staggerChildren: 0.12 } } }

  return (
    <section ref={ref} className="relative overflow-hidden rounded-2xl">
      {/* Dark neon gradient with parallax */}
      <motion.div
        style={{ y: yBg, filter: blur as any }}
        className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-800"
      />
      <div className="absolute inset-0 -z-10 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="relative text-center px-6 py-24 md:py-28 space-y-6"
      >
        <motion.h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white drop-shadow-lg" {...fadeIn}>
          Discover the Future of Art
        </motion.h1>
        <motion.p className="text-lg md:text-xl text-indigo-200 max-w-2xl mx-auto" {...fadeIn}>
          Explore, collect, and be inspired by stunning AI‑generated artworks crafted by digital creators worldwide.
        </motion.p>
        <motion.div className="flex flex-wrap justify-center gap-4" {...fadeIn}>
          <Link href="/explore" className="px-6 py-3 rounded-md bg-white text-indigo-800 font-semibold shadow-md hover:scale-105 transition-transform">
            Explore the Gallery
          </Link>
          <Link href="/explore" className="px-6 py-3 rounded-md border border-white/70 text-white font-semibold hover:bg-white/10 transition">
            Latest Drops
          </Link>
        </motion.div>
      </motion.div>
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black/40 to-transparent" />
    </section>
  )
}
TSX

# 4) Dark footer
cat > components/Footer.tsx <<'TSX'
export default function Footer() {
  return (
    <footer className="border-t border-white/10 text-sm text-neutral-400">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <p>© {new Date().getFullYear()} AI Image</p>
        <p>Built with Next.js & Prisma</p>
      </div>
    </footer>
  )
}
TSX

# 5) Homepage text tones: ensure headings/links fit dark
cat > app/page.tsx <<'TSX'
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
TSX

# 6) Globals: set dark color scheme; keep layout polish minimal
cat > app/globals.css <<'CSS'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
.container { max-width: 1100px; }
CSS

echo "✔ Dark mode files written."
