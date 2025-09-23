import Image from 'next/image'
import { getArtwork } from '@/lib/db'

function formatPrice(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const a = await getArtwork(params.id)
  if (!a) return <p className="text-sm text-neutral-500">Not found.</p>
  return (
    <article className="grid md:grid-cols-2 gap-8">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
        <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{a.title}</h1>
        <p className="text-neutral-500">by {a.artist}</p>
        <form action="/api/checkout" method="POST" className="space-y-3">
          <input type="hidden" name="artworkId" value={a.id} />
          <input type="hidden" name="title" value={a.title} />
          <input type="hidden" name="amount" value={a.price} />
          <button className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white">
            Buy now ({formatPrice(a.price)})
          </button>
        </form>
      </div>
    </article>
  )
}
