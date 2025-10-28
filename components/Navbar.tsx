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
