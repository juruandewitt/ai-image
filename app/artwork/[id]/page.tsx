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
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

function isUsableSrc(value?: string | null) {
  if (!value) return false
  const src = value.trim()
  if (!src) return false

  const lower = src.toLowerCase()
  if (lower.includes('placeholder')) return false
  if (lower.includes('no-image')) return false
  if (lower.includes('no%20image')) return false

  return true
}

function pickImgSrc(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string | null }[]
}) {
  const candidates = [
    a.thumbnail,
    ...(a.assets?.map((x) => x.originalUrl) ?? []),
  ]

  const usable = candidates.find((x) => isUsableSrc(x))
  return usable || FALLBACK_DATA_URL
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
      ].filter((x) => isUsableSrc(x))
    )
  )

  return (
    <ArtworkDetailClient
      title={artwork.title}
      artist={artwork.artist}
      style={String(artwork.style)}
      mainSrc={mainSrc}
      gallery={gallery.length > 0 ? gallery : [FALLBACK_DATA_URL]}
    />
  )
}
