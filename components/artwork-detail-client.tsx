'use client'

import { useState } from 'react'
import SafeImg from '@/components/safe-img'

type Props = {
  artworkId: string
  title: string
  artist: string
  style: string
}

const PREVIEW_VERSION = 'v5'

export default function ArtworkDetailClient({
  artworkId,
  title,
  artist,
  style,
}: Props) {
  const [loadingQuality, setLoadingQuality] = useState<string | null>(null)

  async function startCheckout(quality: 'high' | 'very_high' | 'ultra') {
    try {
      setLoadingQuality(quality)

      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, quality }),
      })

      const data = await res.json()

      if (!data?.url) {
        alert('Checkout failed')
        setLoadingQuality(null)
        return
      }

      window.location.href = data.url
    } catch {
      alert('Error starting checkout')
      setLoadingQuality(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px]">

        {/* IMAGE */}
        <section className="space-y-4">
          <div
            className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
            onContextMenu={(e) => e.preventDefault()}
          >
            <SafeImg
              src={`/api/artwork/preview/${artworkId}?w=1200&v=${PREVIEW_VERSION}`}
              alt={title}
              className="w-full h-auto object-contain pointer-events-none select-none"
              draggable={false}
            />

            {/* 🔥 CLEAN DIAGONAL WATERMARK */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rotate-[-28deg] text-white/20 text-[clamp(40px,6vw,120px)] font-bold tracking-[0.2em]">
                AI IMAGE PREVIEW
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Preview is low-resolution and watermarked. Purchase for full-quality download.
          </p>
        </section>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-slate-100">{title}</h1>
            <p className="text-sm text-slate-400">{artist}</p>
            <p className="text-sm text-slate-500">{style}</p>
          </div>

          <div className="space-y-3">

            <button
              onClick={() => startCheckout('high')}
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-left hover:border-amber-400"
            >
              High Resolution — $9.99
            </button>

            <button
              onClick={() => startCheckout('very_high')}
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-left hover:border-amber-400"
            >
              Very High Resolution — $19.99
            </button>

            <button
              onClick={() => startCheckout('ultra')}
              className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-left hover:border-amber-400"
            >
              Ultra High Resolution — $29.99
            </button>

          </div>
        </aside>
      </div>
    </main>
  )
}
