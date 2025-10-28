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
    <header className="sticky top-0 z-40 border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="AI Image" width={320} height={64} className="h-12 w-auto md:h-14 shrink-0" priority />
        </Link>
        <nav className="flex gap-6 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={"hover:text-indigo-600 " + (pathname === l.href ? 'text-indigo-600 font-semibold' : 'text-neutral-600')}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
