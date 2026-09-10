'use client'

import { useState } from 'react'
import Link from 'next/link'
import SafeImg from '@/components/safe-img'
import BackButton from '@/components/back-button'
import {
  addToCart,
  CartQuality,
  QUALITY_CONFIG,
} from '@/lib/cart'

type Props = {
  artworkId: string
  title: string
  artist: string
  style: string
}

const PREVIEW_VERSION = 'v7'

export default function ArtworkDetailClient({
  artworkId,
  title,
  artist,
  style,
}: Props) {
  const [addedQuality, setAddedQuality] =
    useState<CartQuality | null>(null)

  function handleAddToCart(
    quality: CartQuality
  ) {
    const config =
      QUALITY_CONFIG[quality]

    const added = addToCart({
      artworkId,
      title,
      artist,
      style,
      quality,
      qualityLabel:
        config.label,
      price:
        config.price,
    })

    setAddedQuality(quality)

    window.setTimeout(() => {
      setAddedQuality(null)
    }, 1800)

    return added
  }

  function buttonText(
    quality: CartQuality
  ) {
    if (
      addedQuality === quality
    ) {
      return 'Added to Cart ✓'
    }

    return 'Add to Cart'
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10">
      <div>
        <BackButton />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="space-y-4">
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
            onContextMenu={(event) =>
              event.preventDefault()
            }
          >
            <SafeImg
              src={`/api/artwork/preview/${artworkId}?w=1200&v=${PREVIEW_VERSION}`}
              alt={title}
              className="pointer-events-none h-auto w-full select-none object-contain"
              draggable={false}
            />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rotate-[-28deg] text-[clamp(40px,6vw,120px)] font-bold tracking-[0.2em] text-white/20">
                AI IMAGE PREVIEW
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Preview is low-resolution and watermarked.
            Purchase for full-quality download.
          </p>
        </section>

        <aside className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">
              {title}
            </h1>

            <p className="text-sm text-slate-400">
              {artist}
            </p>

            <p className="text-sm text-slate-500">
              {style}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Choose your resolution
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Add one or more artworks to your cart and
              purchase everything together.
            </p>
          </div>

          <div className="space-y-4">
            {(
              [
                'high',
                'very_high',
                'ultra',
              ] as CartQuality[]
            ).map((quality) => {
              const config =
                QUALITY_CONFIG[quality]

              return (
                <div
                  key={quality}
                  className="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">
                        {config.label}
                      </div>

                      <div className="mt-1 text-2xl font-semibold text-amber-300">
                        $
                        {config.price.toFixed(
                          2
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleAddToCart(
                        quality
                      )
                    }
                    className="mt-4 w-full rounded-xl bg-amber-400 px-4 py-3 font-semibold text-black transition hover:bg-amber-300"
                  >
                    {buttonText(
                      quality
                    )}
                  </button>
                </div>
              )
            })}
          </div>

          <Link
            href="/cart"
            className="block w-full rounded-xl border border-slate-700 px-5 py-3 text-center font-semibold text-white transition hover:border-amber-400"
          >
            View Cart
          </Link>
        </aside>
      </div>
    </main>
  )
}
