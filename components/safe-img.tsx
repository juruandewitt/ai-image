'use client'

import * as React from 'react'

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string
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

export default function SafeImg({ src, fallbackSrc, ...props }: Props) {
  const initial =
    (typeof src === 'string' && src.length > 0 ? src : undefined) ??
    fallbackSrc ??
    FALLBACK_DATA_URL

  const [currentSrc, setCurrentSrc] = React.useState<string>(initial)

  // If parent changes src, update (important when navigating between artworks)
  React.useEffect(() => {
    const next =
      (typeof src === 'string' && src.length > 0 ? src : undefined) ??
      fallbackSrc ??
      FALLBACK_DATA_URL
    setCurrentSrc(next)
  }, [src, fallbackSrc])

  return (
    <img
      {...props}
      src={currentSrc}
      onError={() => {
        const fb = fallbackSrc ?? FALLBACK_DATA_URL
        if (currentSrc !== fb) setCurrentSrc(fb)
      }}
    />
  )
}
