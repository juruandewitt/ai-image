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
