// components/ArtworkCard.tsx
import Image from 'next/image'
import Link from 'next/link'
import { getPrimaryImage } from '@/lib/img'   // ← add this line

type ArtworkCardProps = {
  artwork: {
    id: string
    title: string
    displayArtist?: string | null
    style?: string | null
    thumbnail?: string | null
    assets?: Array<{ originalUrl?: string | null }>
  }
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const src = getPrimaryImage(artwork) // ← use the helper

  return (
    <Link
      href={`/artwork/${artwork.id}`}
      className="group block rounded-2xl overflow-hidden bg-slate-900/60 ring-1 ring-slate-800 hover:ring-amber-400/40 transition"
    >
      <div className="relative aspect-[4/3]">
        {src ? (
          <Image
            src={src}
            alt={artwork.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-slate-500 text-sm">
            No preview
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-sm text-slate-300">
          {artwork.displayArtist ?? artwork.style ?? '—'}
        </div>
        <div className="font-medium text-slate-100">{artwork.title}</div>
      </div>
    </Link>
  )
}
