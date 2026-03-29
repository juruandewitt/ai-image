// app/artwork/[id]/page.tsx
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ArtworkDetailClient from '@/components/artwork-detail-client'

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
    },
  })

  if (!artwork) return notFound()

  return (
    <ArtworkDetailClient
      artworkId={artwork.id}
      title={artwork.title}
      artist={artwork.artist || 'Unknown Artist'}
      style={String(artwork.style)}
    />
  )
}
