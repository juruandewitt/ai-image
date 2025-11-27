// components/ArtworkCard.tsx
import Image from 'next/image'
import Link from 'next/link'

export type MinimalArtwork = {
  id: string
  title: string
  style?: string | null
  displayArtist?: string | null
  assets: { originalUrl: string | null }[]
}

export default function ArtworkCard({ a }: { a: MinimalArtwork }) {
  const src = a.assets?.[0]?.originalUrl ?? null

  // If no image URL, don’t render a broken card at all
  if (!src) return null

  const artist =
    a.displayArtist ??
    (a.style
      ? a.style
          .toString()
          .toLowerCase()
          .replace(/_/g, ' ')
          .replace(/\b\w/g, (m) => m.toUpperCase())
      : 'Unknown')

  return (
    <Link
      href={`/artwork/${a.id}`}
      className="group block overflow-hidden rounded-xl ring-1 ring-slate-800 bg-slate-900/40 hover:bg-slate-900/60 transition-colors"
    >
      <div className="relative aspect-[4/5]">
        <Image
          src={src}
          alt={a.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover"
          priority={false}
          // If you still see issues, temporarily force unoptimized:
          // unoptimized
        />
      </div>
      <div className="p-3">
        <div className="text-slate-100 font-medium leading-tight line-clamp-1">
          {a.title}
        </div>
        <div className="text-slate-400 text-sm line-clamp-1">{artist}</div>
      </div>
    </Link>
  )
}
