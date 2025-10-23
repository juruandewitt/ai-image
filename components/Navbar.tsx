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
   <header className="border-b bg-white/80 backdrop-blur h-16 flex items-center overflow-hidden">
  <div className="container mx-auto px-4 flex items-center justify-between">
    <Link href="/" className="flex items-center">
      <Image
        src="/logo.png"               // or your file path
        alt="AI Image"
        width={320}                    // intrinsic size (can be larger than display)
        height={64}
        className="h-12 w-auto md:h-14 shrink-0"  // display size: fills but stays inside navbar
        priority
      />
    </Link>

    <nav className="flex gap-6 text-sm">
      <Link href="/" className="hover:text-indigo-600 text-neutral-600">Home</Link>
      <Link href="/explore" className="hover:text-indigo-600 text-neutral-600">Explore</Link>
    </nav>
  </div>
</header>

  )
}