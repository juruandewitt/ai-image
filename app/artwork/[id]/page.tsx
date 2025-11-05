import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'

function money(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const a = await prisma.artwork.findUnique({
    where: { id: params.id },
    include: { assets: { include: { variants: true } } }
  })
  if (!a) return notFound()

  const variants = a.assets.flatMap(x => x.variants).sort((x,y) => x.width - y.width || x.format.localeCompare(y.format))
  const first = variants[0]

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-white/10">
          <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{a.title}</h1>
            <p className="text-neutral-300">by {a.artist}</p>
          </div>

          {/* Variant selector */}
          <form action="/api/checkout" method="POST" className="space-y-3">
            <input type="hidden" name="artworkId" value={a.id} />
            <label className="block text-sm opacity-80">Choose format</label>
            <select name="format" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
              {[...new Set(variants.map(v=>v.format))].map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
            </select>
            <label className="block text-sm opacity-80">Choose resolution</label>
            <select name="resolution" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
              {[...new Set(variants.map(v=>v.width))].map(w => <option key={w} value={w}>{w} × {w}</option>)}
            </select>

            {/* For now we compute on server side in /api/checkout using selected format/resolution */}
            <button className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white">
              Buy now
            </button>
          </form>

          {first && <p className="text-sm text-neutral-400">From {money(first.priceCents)} · Higher resolutions cost more</p>}
        </div>
      </div>
    </div>
  )
}
