#!/bin/bash
set -euo pipefail

mkdir -p components app

# Update layout to include Navbar/Footer
cat > app/layout.tsx <<'EOF'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export const metadata = { title: 'AI Image Gallery', description: 'Discover & collect AI artworks' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
EOF

# Navbar component
cat > components/Navbar.tsx <<'EOF'
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
]

export default function Navbar() {
  const pathname = usePathname()
  return (
    <header className="border-b bg-white/70 backdrop-blur">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-tight">AI Image Gallery</Link>
        <nav className="flex gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={"hover:underline " + (pathname === l.href ? 'font-semibold' : 'text-neutral-600')}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
EOF

# Footer component
cat > components/Footer.tsx <<'EOF'
export default function Footer() {
  return (
    <footer className="border-t text-sm text-neutral-500">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <p>© {new Date().getFullYear()} AI Image Gallery</p>
        <p>Built with Next.js & Prisma</p>
      </div>
    </footer>
  )
}
EOF

# Hero + Featured on Home
cat > app/page.tsx <<'EOF'
import Link from 'next/link'
import ArtworkCard from '@/components/ArtworkCard'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const featured = await prisma.artwork.findMany({ orderBy: { createdAt: 'desc' }, take: 3 })
  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Discover & Collect<br />AI‑Generated Art</h1>
          <p className="text-neutral-600 max-w-prose">Browse a curated gallery of AI‑created artworks. Find your next favorite piece and support digital artists.</p>
          <div className="flex gap-3">
            <Link href="/explore" className="inline-flex items-center px-5 py-2.5 rounded-md bg-black text-white">Explore Gallery →</Link>
            <Link href="/explore" className="inline-flex items-center px-5 py-2.5 rounded-md border">Latest Drops</Link>
          </div>
        </div>
        <div className="rounded-2xl border p-4">
          <div className="aspect-[4/3] w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200 via-pink-100 to-yellow-100 rounded-xl" />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured Artworks</h2>
          <Link href="/explore" className="text-sm underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map(a => (<ArtworkCard key={a.id} a={a as any} />))}
        </div>
      </section>
    </div>
  )
}
EOF

# Basic container utility (Tailwind)
if ! grep -q "@tailwind" app/globals.css 2>/dev/null; then
  mkdir -p app
  cat > app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: light; }
.container { max-width: 1100px; }
EOF
fi

echo "✔ Homepage polished: Navbar, Footer, Hero, Featured."