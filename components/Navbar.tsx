'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  FormEvent,
  useEffect,
  useState,
} from 'react'
import {
  usePathname,
  useRouter,
} from 'next/navigation'
import {
  CART_UPDATED_EVENT,
  getCart,
} from '@/lib/cart'

export default function Navbar() {
  const pathname =
    usePathname()

  const router =
    useRouter()

  const [cartCount, setCartCount] =
    useState(0)

  const [searchText, setSearchText] =
    useState('')

  /*
   * Keep cart count synchronized with localStorage.
   */
  useEffect(() => {
    function updateCount() {
      setCartCount(
        getCart().length
      )
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

  /*
   * Keep the navbar search field synchronized with
   * the current query whenever the user is on /search.
   *
   * We deliberately avoid useSearchParams() here because
   * Navbar is global and that previously caused Next.js
   * prerender/Suspense build errors across the entire site.
   */
  useEffect(() => {
    if (
      pathname !== '/search'
    ) {
      return
    }

    if (
      typeof window ===
      'undefined'
    ) {
      return
    }

    const params =
      new URLSearchParams(
        window.location.search
      )

    setSearchText(
      params.get('q') || ''
    )
  }, [pathname])

  /*
   * Keep search synchronized if browser Back / Forward
   * navigation changes the search URL.
   */
  useEffect(() => {
    function syncSearchFromUrl() {
      if (
        typeof window ===
        'undefined'
      ) {
        return
      }

      if (
        window.location.pathname !==
        '/search'
      ) {
        return
      }

      const params =
        new URLSearchParams(
          window.location.search
        )

      setSearchText(
        params.get('q') || ''
      )
    }

    window.addEventListener(
      'popstate',
      syncSearchFromUrl
    )

    return () => {
      window.removeEventListener(
        'popstate',
        syncSearchFromUrl
      )
    }
  }, [])

  function handleSearch(
    event: FormEvent
  ) {
    event.preventDefault()

    const query =
      searchText.trim()

    if (!query) {
      return
    }

    router.push(
      `/search?q=${encodeURIComponent(
        query
      )}`
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 text-slate-100 backdrop-blur">
      <div className="container mx-auto flex min-h-16 items-center gap-4 px-4 py-2">

        {/* LOGO */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
        >
          <Image
            src="/logo.png"
            alt="AI Image"
            width={320}
            height={64}
            className="h-11 w-auto shrink-0 md:h-14"
            priority
          />
        </Link>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-3">

          {/* DESKTOP SEARCH */}
          <form
            onSubmit={
              handleSearch
            }
            className="hidden w-full max-w-md md:block"
          >
            <div className="relative">
              <input
                type="search"
                value={
                  searchText
                }
                onChange={(
                  event
                ) =>
                  setSearchText(
                    event.target.value
                  )
                }
                placeholder="Search artworks…"
                aria-label="Search artworks"
                className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-4 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:bg-white/[0.07]"
              />

              <button
                type="submit"
                aria-label="Search"
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-amber-300"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          </form>

          {/* GLOBAL NAVIGATION */}
          <nav className="flex shrink-0 items-center gap-4 text-sm md:gap-6">

            <Link
              href="/cart"
              className={
                'transition-colors hover:text-amber-400 ' +
                (
                  pathname ===
                  '/cart'
                    ? 'font-semibold text-amber-400'
                    : 'text-slate-300'
                )
              }
            >
              {cartCount > 0
                ? `Cart (${cartCount})`
                : 'Cart'}
            </Link>

            <Link
              href="/checkout"
              className={
                'transition-colors hover:text-amber-400 ' +
                (
                  pathname ===
                  '/checkout'
                    ? 'font-semibold text-amber-400'
                    : 'text-slate-300'
                )
              }
            >
              Checkout
            </Link>

            <Link
              href="/contact"
              className={
                'transition-colors hover:text-amber-400 ' +
                (
                  pathname ===
                  '/contact'
                    ? 'font-semibold text-amber-400'
                    : 'text-slate-300'
                )
              }
            >
              Contact Us
            </Link>
          </nav>
        </div>
      </div>

      {/* MOBILE SEARCH */}
      <div className="border-t border-white/5 px-4 pb-3 pt-2 md:hidden">
        <form
          onSubmit={
            handleSearch
          }
        >
          <div className="relative">
            <input
              type="search"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Search artworks…"
              aria-label="Search artworks"
              className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-4 pr-11 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-300/60 focus:bg-white/[0.07]"
            />

            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-amber-300"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="11"
                  cy="11"
                  r="7"
                />

                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </header>
  )
}
