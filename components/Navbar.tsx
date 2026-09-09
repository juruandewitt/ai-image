'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  CART_UPDATED_EVENT,
  getCart,
} from '@/lib/cart'

export default function Navbar() {
  const pathname = usePathname()

  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    function updateCount() {
      setCartCount(getCart().length)
    }

    updateCount()

    window.addEventListener(
      CART_UPDATED_EVENT,
      updateCount
    )

    window.addEventListener(
      'storage',
      updateCount
    )

    return () => {
      window.removeEventListener(
        CART_UPDATED_EVENT,
        updateCount
      )

      window.removeEventListener(
        'storage',
        updateCount
      )
    }
  }, [])

  const links = [
    {
      href: '/cart',
      label:
        cartCount > 0
          ? `Cart (${cartCount})`
          : 'Cart',
    },
    {
      href: '/checkout',
      label: 'Checkout',
    },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-slate-100 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center"
        >
          <Image
            src="/logo.png"
            alt="AI Image"
            width={320}
            height={64}
            className="h-12 w-auto shrink-0 md:h-14"
            priority
          />
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {links.map((link) => {
            const active =
              pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  'transition-colors hover:text-amber-400 ' +
                  (active
                    ? 'font-semibold text-amber-400'
                    : 'text-slate-300')
                }
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
