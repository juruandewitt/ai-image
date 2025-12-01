// components/ArtworkCard.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'

export type MinimalArtwork = {
  id: string
  title: string
  style: string
  assets: { originalUrl: string | null }[]
}

export default function ArtworkCard({ a }: { a: MinimalArtwork }) {
  const first = a.assets?.[0]?.originalUrl || ''
  const [src, setSrc] = useState(first || '/placeholder.svg')

  return (
    <Link
      href={`/artwork/${a.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-colors"
    >
      <div className="aspect-square w-full overflow-hidden bg-slate-800">
        {/* Use plain <img> so we’re not limited by Next/Image domain allowlist */}
        <img
          src={src}
          alt={a.title}
          className="h-full w-full object-cover"
          onError={() => setSrc('/placeholder.svg')}
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <div className="text-sm text-amber-400">{a.style?.replace(/_/g, ' ')}</div>
        <div className="font-medium">{a.title}</div>
      </div>
    </Link>
  )
}
