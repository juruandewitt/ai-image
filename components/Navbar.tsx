// components/Navbar.tsx (dark theme to match background)
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
    // Dark solid header with subtle border
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-slate-100">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="AI Image"
            width={320}
            height={64}
            className="h-12 w-auto md:h-14 shrink-0"
            priority
          />
        </Link>
        <nav className="flex gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                "hover:text-amber-400 transition-colors " +
                (pathname === l.href ? 'text-amber-400 font-semibold' : 'text-slate-300')
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
