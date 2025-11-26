'use client'
import Image, { ImageProps } from 'next/image'
import { useState } from 'react'

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src?: string | null
  alt?: string
  fallbackSrc?: string
}

export default function SafeImage({
  src,
  alt = '',
  fallbackSrc = '/logo.png',
  ...rest
}: Props) {
  const [broken, setBroken] = useState(false)
  const finalSrc = !broken && src ? src : fallbackSrc

  return (
    <Image
      {...rest}
      alt={alt}
      src={finalSrc}
      onError={() => setBroken(true)}
      // Use fill + object-cover to avoid needing width/height from DB
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      style={{ objectFit: 'cover' }}
      unoptimized
      priority={false}
    />
  )
}
