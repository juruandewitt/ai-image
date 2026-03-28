'use client'

import { useMemo, useState } from 'react'
import SafeImg from '@/components/safe-img'

type Props = {
  title: string
  artist: string
  style: string
  mainSrc: string
  gallery: string[]
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
  title,
  artist,
  style,
  mainSrc,
  gallery,
}: Props) {
  const images = useMemo(() => {
    const unique = Array.from(new Set([mainSrc, ...gallery].filter(Boolean)))
    return unique.length > 0 ? unique : [FALLBACK_DATA_URL]
  }, [mainSrc, gallery])

  const [selected, setSelected] = useState(images[0] || FALLBACK_DATA_URL)

  const styleLabel = formatStyleLabel(style)

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
            <SafeImg
              src={selected}
              fallbackSrc={FALLBACK_DATA_URL}
              alt={title}
              className="w-full h-auto max-h-[78vh] object-contain bg-slate-950"
            />
          </div>

          {images.length > 1 ? (
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
              {images.map((img, index) => (
                <button
                  key={`${img}-${index}`}
                  type="button"
                  onClick={() => setSelected(img)}
                  className={`overflow-hidden rounded-xl border ${
                    selected === img
                      ? 'border-amber-400'
                      : 'border-slate-800 hover:border-slate-600'
                  } bg-slate-950 transition-colors`}
                >
                  <SafeImg
                    src={img}
                    fallbackSrc={FALLBACK_DATA_URL}
                    alt={`${title} preview ${index + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <aside className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-100">{title}</h1>
            <p className="text-sm text-slate-400">{artist}</p>
            <p className="text-sm text-slate-500">{styleLabel}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
            <h2 className="text-lg font-medium text-slate-100">Choose quality</h2>

            <div className="space-y-3">
              <button
                type="button"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-100">High Resolution</div>
                    <div className="text-sm text-slate-400">
                      Great for personal prints and digital use
                    </div>
                  </div>
                  <div className="text-amber-400 font-semibold">$9.99</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-100">Very High Resolution</div>
                    <div className="text-sm text-slate-400">
                      Ideal for larger prints and premium display
                    </div>
                  </div>
                  <div className="text-amber-400 font-semibold">$19.99</div>
                </div>
              </button>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-4 text-left hover:border-amber-400 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-slate-100">Ultra High Resolution</div>
                    <div className="text-sm text-slate-400">
                      Best for premium commercial-grade output
                    </div>
                  </div>
                  <div className="text-amber-400 font-semibold">$29.99</div>
                </div>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
