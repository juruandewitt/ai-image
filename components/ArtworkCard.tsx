// components/ArtworkCard.tsx — minimal card that tolerates missing asset URLs
import Link from 'next/link'
import Image from 'next/image'

type MinimalAsset = { originalUrl: string | null }
type ArtworkRow = {
  id: string
  title: string
  style?: string | null
  displayArtist?: string // computed on the page
  assets: MinimalAsset[]
}

export default function ArtworkCard({ a }: { a: ArtworkRow }) {
  const url = a.assets?.[0]?.originalUrl || null
  const label = a.displayArtist ?? 'Unknown'

  return (
    <Link
      href={`/artwork/${a.id}`}
      className="group block rounded-xl overflow-hidden bg-slate-900/60 ring-1 ring-slate-800 hover:ring-amber-400/40 transition"
    >
      <div className="relative aspect-[4/3]">
        {url ? (
          <Image
            src={url}
            alt={a.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-slate-800" />
        )}
      </div>
      <div className="p-3">
        <div className="text-slate-200 font-medium truncate">{a.title}</div>
        <div className="text-slate-400 text-xs mt-1">{label}</div>
      </div>
    </Link>
  )
}
