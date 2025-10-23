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
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="AI Image" width={32} height={32} />
          <span className="font-bold tracking-tight text-gray-900">AI Image</span>
        </Link>
        <nav className="flex gap-6 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={"hover:text-indigo-600 " + (pathname === l.href ? 'text-indigo-600 font-semibold' : 'text-neutral-600')}>{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  )
}