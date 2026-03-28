// app/artwork/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArtworkDetailClient from '@/components/artwork-detail-client'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="30"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="18"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

function isStableBlobSrc(value?: string | null) {
  if (!value) return false
  return value.toLowerCase().includes('.public.blob.vercel-storage.com/')
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
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          originalUrl: true,
          provider: true,
        },
      },
    },
  })

  if (!artwork) return notFound()

  const stableAssets = artwork.assets
    .map((a) => a.originalUrl)
    .filter((x): x is string => !!x && isStableBlobSrc(x))

  const stableThumbnail = isStableBlobSrc(artwork.thumbnail)
    ? artwork.thumbnail
    : null

  const gallery = Array.from(
    new Set([...stableAssets, ...(stableThumbnail ? [stableThumbnail] : [])])
  )

  const mainSrc = gallery[0] || FALLBACK_DATA_URL

  return (
    <ArtworkDetailClient
      title={artwork.title}
      artist={artwork.artist || 'Unknown Artist'}
      style={String(artwork.style)}
      mainSrc={mainSrc}
      gallery={gallery.length > 0 ? gallery : [FALLBACK_DATA_URL]}
    />
  )
}
