// app/artwork/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArtworkDetailClient from '@/components/artwork-detail-client'

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

  const gallery = Array.from(
    new Set(
      [
        artwork.thumbnail ?? '',
        ...(artwork.assets?.map((a) => a.originalUrl ?? '') ?? []),
      ].filter((x) => typeof x === 'string' && x.length > 0)
    )
  )

  return (
    <ArtworkDetailClient
      title={artwork.title}
      artist={artwork.artist}
      style={String(artwork.style)}
      mainSrc={mainSrc}
      gallery={gallery}
    />
  )
}
