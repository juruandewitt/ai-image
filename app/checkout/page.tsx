'use client'

import Link from 'next/link'
import {
  useEffect,
  useState,
} from 'react'
import {
  CartItem,
  cartTotal,
  getCart,
} from '@/lib/cart'

export default function CheckoutPage() {
  const [items, setItems] =
    useState<CartItem[]>([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    setItems(getCart())
  }, [])

  const total =
    cartTotal(items)

  async function startCheckout() {
    if (
      items.length === 0 ||
      loading
    ) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response =
        await fetch(
          '/api/checkout/create-session',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                items:
                  items.map(
                    (item) => ({
                      artworkId:
                        item.artworkId,

                      quality:
                        item.quality,
                    })
                  ),
              }),
          }
        )

      const data =
        await response.json()

      if (
        !response.ok ||
        !data?.url
      ) {
        throw new Error(
          data?.error ||
            'Checkout could not be started.'
        )
      }

      window.location.href =
        data.url
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Checkout failed.'
      )

      setLoading(false)
    }
  }

  if (
    items.length === 0
  ) {
    return (
      <main className="mx-auto max-w-4xl py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
          <h1 className="text-4xl font-semibold text-white">
            Checkout
          </h1>

          <p className="mt-4 text-slate-400">
            Your cart is empty.
          </p>

          <Link
            href="/explore"
            className="mt-8 inline-block rounded-xl bg-amber-400 px-7 py-3 font-semibold text-black"
          >
            Browse Artworks
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 py-10">
      <div>
        <h1 className="text-4xl font-semibold text-white">
          Checkout
        </h1>

        <p className="mt-2 text-slate-400">
          Review your order before continuing to secure payment.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3">
          {items.map(
            (item) => (
              <div
                key={`${item.artworkId}-${item.quality}`}
                className="flex justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div>
                  <div className="font-semibold text-white">
                    {
                      item.title
                    }
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    {
                      item.qualityLabel
                    }
                  </div>
                </div>

                <div className="font-semibold text-white">
                  $
                  {item.price.toFixed(
                    2
                  )}
                </div>
              </div>
            )
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-semibold text-white">
            Order Total
          </h2>

          <div className="mt-5 flex justify-between border-b border-white/10 pb-5 text-2xl font-semibold">
            <span>
              Total
            </span>

            <span className="text-amber-300">
              $
              {total.toFixed(
                2
              )}
            </span>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={
              startCheckout
            }
            disabled={
              loading
            }
            className="mt-6 w-full rounded-xl bg-amber-400 px-5 py-4 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-50"
          >
            {loading
              ? 'Opening secure checkout…'
              : 'Continue to Payment'}
          </button>

          <Link
            href="/cart"
            className="mt-4 block text-center text-sm text-slate-400 hover:text-amber-300"
          >
            ← Back to Cart
          </Link>
        </aside>
      </div>
    </main>
  )
}
