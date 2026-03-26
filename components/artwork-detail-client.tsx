'use client'

import * as React from 'react'
import Link from 'next/link'
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="18"
        text-anchor="middle" dominant-baseline="middle">No image</text>
    </svg>`
  )

function getOrientationLabel(width: number, height: number) {
  if (width > height) return 'Landscape'
  if (height > width) return 'Portrait'
  return 'Square'
}

export default function ArtworkDetailClient({
  title,
  artist,
  style,
  mainSrc,
  gallery,
}: Props) {
  const [selectedSrc, setSelectedSrc] = React.useState(mainSrc)
  const [orientation, setOrientation] = React.useState<string>('Loading orientation...')

  React.useEffect(() => {
    setSelectedSrc(mainSrc)
  }, [mainSrc])

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{title}</h1>
          <p className="text-sm text-slate-400">
            {artist} • {style} • {orientation}
          </p>
        </div>

        <Link href="/explore" className="text-amber-400 hover:underline text-sm">
          ← Back to Explore
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40">
        <SafeImg
          src={selectedSrc}
          fallbackSrc={FALLBACK_DATA_URL}
          alt={title}
          className="w-full max-h-[78vh] object-contain bg-black/30"
          loading="eager"
          onLoad={(event) => {
            const img = event.currentTarget
            if (img.naturalWidth && img.naturalHeight) {
              setOrientation(getOrientationLabel(img.naturalWidth, img.naturalHeight))
            } else {
              setOrientation('Unknown orientation')
            }
          }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <button
          className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-left hover:border-amber-400/60 transition-colors"
          type="button"
        >
          <div className="text-sm font-medium text-slate-100">High Resolution</div>
          <div className="text-xs text-slate-400 mt-1">
            Best for screens, wallpapers, and standard prints
          </div>
          <div className="text-amber-400 font-semibold mt-3">$9.99</div>
        </button>

        <button
          className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-left hover:border-amber-400/60 transition-colors"
          type="button"
        >
          <div className="text-sm font-medium text-slate-100">Very High Resolution</div>
          <div className="text-xs text-slate-400 mt-1">
            Best for premium prints, posters, and canvas work
          </div>
          <div className="text-amber-400 font-semibold mt-3">$19.99</div>
        </button>

        <button
          className="rounded-xl border border-slate-700 bg-slate-900/50 p-4 text-left hover:border-amber-400/60 transition-colors"
          type="button"
        >
          <div className="text-sm font-medium text-slate-100">Ultra High Resolution</div>
          <div className="text-xs text-slate-400 mt-1">
            Best for large-format printing and maximum detail
          </div>
          <div className="text-amber-400 font-semibold mt-3">$29.99</div>
        </button>
      </div>

      {gallery.length > 1 ? (
        <div className="space-y-2">
          <div className="text-sm text-slate-400">More</div>
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
            {gallery.slice(0, 12).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setSelectedSrc(src)}
                className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 hover:border-amber-400/60 transition-colors"
              >
                <SafeImg
                  src={src}
                  fallbackSrc={FALLBACK_DATA_URL}
                  alt={title}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
