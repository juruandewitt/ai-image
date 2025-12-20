// app/artwork/[id]/page.tsx
export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="18"
        text-anchor="middle" dominant-baseline="middle">No image</text>
    </svg>`
  )

function pickImgSrc(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string }[]
}) {
  return a.thumbnail || a.assets?.[0]?.originalUrl || FALLBACK_DATA_URL
}

export default async function ArtworkPage({
  params,
}: {
  params: { id: string }
}) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      style: true,
      artist: true,
      thumbnail: true,
      assets: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          originalUrl: true,
        },
      },
    },
  })

  if (!artwork) return notFound()

  const mainSrc = pickImgSrc(artwork)

  // Build a small gallery list (unique, truthy)
  const gallery = Array.from(
    new Set(
      [
        artwork.thumbnail ?? '',
        ...(artwork.assets?.map((a) => a.originalUrl ?? '') ?? []),
      ].filter((x) => typeof x === 'string' && x.length > 0)
    )
  )

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">
            {artwork.title}
          </h1>
          <p className="text-sm text-slate-400">
            {artwork.artist} • {String(artwork.style)}
          </p>
        </div>

        <Link href="/explore" className="text-amber-400 hover:underline text-sm">
          ← Back to Explore
        </Link>
      </div>

      {/* Main image */}
      <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40">
        <SafeImg
          src={mainSrc}
          fallbackSrc={FALLBACK_DATA_URL}
          alt={artwork.title}
          className="w-full max-h-[78vh] object-contain bg-black/30"
          loading="eager"
        />
      </div>

      {/* Optional thumbnail strip */}
      {gallery.length > 1 ? (
        <div className="space-y-2">
          <div className="text-sm text-slate-400">More</div>
          <div className="grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
            {gallery.slice(0, 12).map((src) => (
              <div
                key={src}
                className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40"
              >
                <SafeImg
                  src={src}
                  fallbackSrc={FALLBACK_DATA_URL}
                  alt={artwork.title}
                  className="w-full aspect-square object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
