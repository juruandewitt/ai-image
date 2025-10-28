import Image from 'next/image'
import Link from 'next/link'

function money(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default function ArtworkCard({ a }: { a: any }) {
  return (
    <Link href={`/artwork/${a.id}`} className="group block rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition">
      <div className="relative aspect-[4/3]">
        <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="text-white">
            <div className="text-base font-semibold drop-shadow">{a.title}</div>
            <div className="text-xs text-indigo-200">by {a.artist}</div>
          </div>
          <div className="text-sm font-semibold text-amber-300 drop-shadow">{money(a.price)}</div>
        </div>
      </div>
    </Link>
  )
}
