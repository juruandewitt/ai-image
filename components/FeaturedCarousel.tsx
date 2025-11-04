'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'

export default function FeaturedCarousel({ items }: { items: any[] }) {
  const ref = useRef<HTMLDivElement>(null)

  const scrollBy = (dx: number) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dx, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">Featured</h2>
        <div className="hidden md:flex gap-2">
          <button onClick={()=>scrollBy(-400)} className="rounded-md border border-white/10 bg-black/30 px-3 py-1.5 hover:bg-black/40">←</button>
          <button onClick={()=>scrollBy(400)} className="rounded-md border border-white/10 bg-black/30 px-3 py-1.5 hover:bg-black/40">→</button>
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {/* hide scrollbars cross-browser */}
        <style jsx>{`
          div::-webkit-scrollbar { display: none; }
        `}</style>

        {items.map((a) => (
          <Link
            key={a.id}
            href={`/artwork/${a.id}`}
            className="group relative snap-start shrink-0 w-[80%] sm:w-[55%] md:w-[40%] lg:w-[32%] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition"
          >
            <div className="relative aspect-[4/3]">
              <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                <div className="text-white">
                  <div className="text-base font-semibold drop-shadow">{a.title}</div>
                  <div className="text-xs text-indigo-200">by {a.artist}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
