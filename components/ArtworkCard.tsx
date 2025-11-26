import Link from 'next/link'
import SafeImage from './SafeImage'

type ArtworkRow = {
  id: string
  title: string
  style: string | null
  displayArtist?: string | null
  assets?: { originalUrl: string | null }[]
}

export default function ArtworkCard({ a }: { a: ArtworkRow }) {
  const url = a.assets?.[0]?.originalUrl || null

  return (
    <Link
      href={`/artwork/${a.id}`}
      className="group relative block rounded-xl overflow-hidden bg-slate-900/40 ring-1 ring-slate-800 hover:ring-amber-400/50 transition"
    >
      <div className="relative aspect-[4/3]">
        <SafeImage
          src={url}
          alt={a.title || 'Artwork'}
          fallbackSrc="/logo.png"
        />
      </div>
      <div className="p-3">
        <div className="text-slate-100 font-medium truncate">{a.title}</div>
        <div className="text-slate-400 text-sm truncate">
          {a.displayArtist || a.style || 'AI Studio'}
        </div>
      </div>
    </Link>
  )
}
