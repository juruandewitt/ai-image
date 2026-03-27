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
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

function isUsableSrc(value?: string | null) {
  if (!value) return false
  const src = value.trim()
  if (!src) return false

  const lower = src.toLowerCase()

  if (lower.includes('placeholder')) return false
  if (lower.includes('no-image')) return false
  if (lower.includes('no%20image')) return false

  return true
}

export default function SafeImg({
  src,
  fallbackSrc,
  onError,
  ...props
}: Props) {
  const fallback = fallbackSrc || FALLBACK_DATA_URL

  const initial = isUsableSrc(typeof src === 'string' ? src : '')
    ? (src as string)
    : fallback

  const [currentSrc, setCurrentSrc] = React.useState<string>(initial)

  React.useEffect(() => {
    const next = isUsableSrc(typeof src === 'string' ? src : '')
      ? (src as string)
      : fallback
    setCurrentSrc(next)
  }, [src, fallback])

  return (
    <img
      {...props}
      src={currentSrc}
      onError={(event) => {
        if (currentSrc !== fallback) {
          setCurrentSrc(fallback)
        }
        onError?.(event)
      }}
    />
  )
}
