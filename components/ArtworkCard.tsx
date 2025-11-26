// components/ArtworkCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { getThumbUrl, MinimalArtwork } from '@/lib/catalog'

export default function ArtworkCard({ art }: { art: MinimalArtwork }) {
  const src = getThumbUrl(art)

  return (
    <Link
      href={`/artwork/${art.id}`}
      className="group block rounded-xl overflow-hidden bg-slate-900/40 ring-1 ring-slate-800 hover:ring-amber-400/40 transition"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
  src={src}
  alt={art.title}
  fill
  unoptimized
  sizes="(max-width: 768px) 100vw, 33vw"
  className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300"
  onError={(e) => {
    const img = e.currentTarget as HTMLImageElement
    img.src = '/placeholder.svg'
  }}
/>
      </div>

      <div className="p-3">
        <div className="text-sm text-slate-300 line-clamp-1">{art.title}</div>
        <div className="text-xs text-slate-400 mt-1">{art.style.replace(/_/g, ' ')}</div>
      </div>
    </Link>
  )
}
