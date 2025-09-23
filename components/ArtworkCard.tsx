import Link from 'next/link'
import Image from 'next/image'
import type { Artwork } from '@prisma/client'

function formatPrice(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default function ArtworkCard({ a }: { a: Artwork }) {
  return (
    <Link href={`/artwork/${a.id}`} className="block border rounded-lg overflow-hidden hover:shadow">
      <div className="relative aspect-[4/3]"><Image src={a.thumbnail} alt={a.title} fill className="object-cover" /></div>
      <div className="flex items-center justify-between p-3">
        <div>
          <h3 className="font-semibold">{a.title}</h3>
          <p className="text-sm text-neutral-500">{a.artist}</p>
        </div>
        <div className="font-semibold">{formatPrice(a.price)}</div>
      </div>
    </Link>
  )
}
