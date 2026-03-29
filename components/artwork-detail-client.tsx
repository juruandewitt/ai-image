'use client'

import { useState } from 'react'
import SafeImg from '@/components/safe-img'

type Props = {
  artworkId: string
  title: string
  artist: string
  style: string
}

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="30"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="18"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

function formatStyleLabel(style: string) {
  switch (style) {
    case 'VAN_GOGH':
      return 'Van Gogh'
    case 'DALI':
      return 'Dalí'
    case 'POLLOCK':
      return 'Jackson Pollock'
    case 'VERMEER':
      return 'Johannes Vermeer'
    case 'MONET':
      return 'Claude Monet'
    case 'PICASSO':
      return 'Pablo Picasso'
    case 'REMBRANDT':
      return 'Rembrandt'
    case 'CARAVAGGIO':
      return 'Caravaggio'
    case 'DA_VINCI':
      return 'Leonardo da Vinci'
    case 'MICHELANGELO':
      return 'Michelangelo'
    default:
      return style
  }
}

export default function ArtworkDetailClient({
  artworkId,
  title,
  artist,
  style,
}: Props) {
  const [loadingQuality, setLoadingQuality] = useState<string | null>(null)
  const styleLabel = formatStyleLabel(style)

  async function startCheckout(quality: 'high' | 'very_high' | 'ultra') {
    try {
      setLoadingQuality(quality)

      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId, quality }),
      })

      const data = await res.json()

      if (!res.ok || !data?.url) {
        alert(data?.error || 'Could not start checkout')
        setLoadingQuality(null)
        return
      }

      window.location.href = data.url
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unknown checkout error')
      setLoadingQuality(null)
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="space-y-4">
          <div
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950"
            onContextMenu={(e) => e.preventDefault()}
          >
            <SafeImg
              src={`/api/artwork/preview/${artworkId}?w=1200`}
              fallbackSrc={FALLBACK_DATA_URL}
              alt={title}
              className="w-full h-auto max-h-[78vh] object-contain bg-slate-950 pointer-events-none select-none"
              draggable={false}
            />
          </div>

          <p className="text-xs text-slate-500">
            Preview shown is watermarked and reduced-resolution. Purchased downloads provide the full stored file.
          </p>
        </section>

        <aside className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-100">{title}</h1>
            <p className="text-sm text-slate-400">{artist}</p>
            <p className="text-sm text-slate-500">{styleLabel}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
            <h2 className="text-lg font-medium text-slate-100">Choose quality</h2>

            <button
              type="button"
              onClick={() => startCheckout('high')}
              disabled={loadingQuality !== null}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-amber-400 transition-colors disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">High Resolution</div>
                  <div className="text-sm text-slate-400">
                    Great for personal prints and digital use
                  </div>
                </div>
                <div className="text-amber-400 font-semibold">
                  {loadingQuality === 'high' ? 'Loading...' : '$9.99'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => startCheckout('very_high')}
              disabled={loadingQuality !== null}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-amber-400 transition-colors disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Very High Resolution</div>
                  <div className="text-sm text-slate-400">
                    Ideal for larger prints and premium display
                  </div>
                </div>
                <div className="text-amber-400 font-semibold">
                  {loadingQuality === 'very_high' ? 'Loading...' : '$19.99'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => startCheckout('ultra')}
              disabled={loadingQuality !== null}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-amber-400 transition-colors disabled:opacity-60"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-100">Ultra High Resolution</div>
                  <div className="text-sm text-slate-400">
                    Best for premium commercial-grade output
                  </div>
                </div>
                <div className="text-amber-400 font-semibold">
                  {loadingQuality === 'ultra' ? 'Loading...' : '$29.99'}
                </div>
              </div>
            </button>
          </div>
        </aside>
      </div>
    </main>
  )
}
