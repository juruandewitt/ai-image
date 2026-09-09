'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import SafeImg from '@/components/safe-img'
import {
  CartItem,
  cartTotal,
  getCart,
  removeFromCart,
} from '@/lib/cart'

export default function CartPage() {
  const [items, setItems] =
    useState<CartItem[]>([])

  useEffect(() => {
    setItems(getCart())
  }, [])

  function removeItem(
    item: CartItem
  ) {
    removeFromCart(
      item.artworkId,
      item.quality
    )

    setItems(getCart())
  }

  const total =
    cartTotal(items)

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl space-y-8 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <h1 className="text-4xl font-semibold text-white">
            Your Cart
          </h1>

          <p className="mt-4 text-slate-400">
            Your cart is currently empty.
          </p>

          <Link
            href="/explore"
            className="mt-8 inline-block rounded-xl bg-amber-400 px-7 py-3 font-semibold text-black transition hover:bg-amber-300"
          >
            Browse Artworks
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 py-10">
      <div>
        <h1 className="text-4xl font-semibold text-white">
          Your Cart
        </h1>

        <p className="mt-2 text-slate-400">
          {items.length}{' '}
          {items.length === 1
            ? 'artwork'
            : 'artworks'}{' '}
          selected.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-4">
          {items.map(
            (item) => (
              <div
                key={`${item.artworkId}-${item.quality}`}
                className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[150px_1fr]"
              >
                <Link
                  href={`/artwork/${item.artworkId}`}
                  className="overflow-hidden rounded-xl"
                >
                  <SafeImg
                    src={`/api/artwork/preview/${item.artworkId}?w=400&v=cart-v1`}
                    alt={
                      item.title
                    }
                    className="aspect-square w-full object-cover"
                  />
                </Link>

                <div className="flex flex-col justify-between gap-4">
                  <div>
                    <Link
                      href={`/artwork/${item.artworkId}`}
                      className="text-lg font-semibold text-white hover:text-amber-300"
                    >
                      {
                        item.title
                      }
                    </Link>

                    <div className="mt-1 text-sm text-slate-400">
                      {
                        item.artist
                      }
                    </div>

                    <div className="mt-3 text-sm text-amber-300">
                      {
                        item.qualityLabel
                      }
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item
                        )
                      }
                      className="text-sm text-slate-400 transition hover:text-red-300"
                    >
                      Remove
                    </button>

                    <div className="text-lg font-semibold text-white">
                      $
                      {item.price.toFixed(
                        2
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold text-white">
            Order Summary
          </h2>

          <div className="mt-6 space-y-3 border-b border-white/10 pb-5">
            <div className="flex justify-between text-sm text-slate-400">
              <span>
                Items
              </span>

              <span>
                {
                  items.length
                }
              </span>
            </div>

            <div className="flex justify-between text-lg font-semibold text-white">
              <span>
                Total
              </span>

              <span>
                $
                {total.toFixed(
                  2
                )}
              </span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block w-full rounded-xl bg-amber-400 px-5 py-4 text-center font-semibold text-black transition hover:bg-amber-300"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/explore"
            className="mt-3 block text-center text-sm text-slate-400 hover:text-amber-300"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </main>
  )
}
