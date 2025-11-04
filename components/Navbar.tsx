'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const baseLinks = [
  { href: '/', label: 'Home' },
  { href: '/explore', label: 'Explore' },
]

export default function Navbar() {
  const pathname = usePathname()
  const showDashboard = process.env.NEXT_PUBLIC_SHOW_DASHBOARD === '1'
  const links = showDashboard ? [...baseLinks, { href: '/dashboard', label: 'Dashboard' }] : baseLinks

  return (
    // Dark solid header with subtle border + sticky effect
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
