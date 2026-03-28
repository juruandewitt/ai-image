import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const DEFAULT_ASSET_PROVIDER = 'migration-repair'

function isUsableSrc(value?: string | null) {
  if (!value) return false
  const src = value.trim()
  if (!src) return false

  const lower = src.toLowerCase()
  if (lower.includes('placeholder')) return false
  if (lower.includes('no-image')) return false
  if (lower.includes('no%20image')) return false
  if (lower.startsWith('data:image/svg+xml')) return false

  return true
}

export async function GET() {
  try {
    const artworks = await prisma.artwork.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
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

    let checked = 0
    let fixedThumbnail = 0
    let fixedAssets = 0
    let alreadyHealthy = 0
    let unresolved = 0

    const samples: {
      id: string
      title: string
      action: string
    }[] = []

    for (const artwork of artworks) {
      checked++

      const usableThumbnail = isUsableSrc(artwork.thumbnail) ? artwork.thumbnail : null
      const usableAsset =
        artwork.assets.find((a) => isUsableSrc(a.originalUrl))?.originalUrl || null

      if (usableThumbnail && usableAsset) {
        alreadyHealthy++
        continue
      }

      if (!usableThumbnail && usableAsset) {
        await prisma.artwork.update({
          where: { id: artwork.id },
          data: {
            thumbnail: usableAsset,
          },
        })

        fixedThumbnail++
        if (samples.length < 20) {
          samples.push({
            id: artwork.id,
            title: artwork.title,
            action: 'Copied asset URL into thumbnail',
          })
        }
        continue
      }

      if (usableThumbnail && !usableAsset) {
        await prisma.asset.create({
          data: {
            artworkId: artwork.id,
            originalUrl: usableThumbnail,
            provider: DEFAULT_ASSET_PROVIDER,
            prompt: `Repair asset created from existing thumbnail for artwork: ${artwork.title}`,
          },
        })

        fixedAssets++
        if (samples.length < 20) {
          samples.push({
            id: artwork.id,
            title: artwork.title,
            action: 'Created asset from thumbnail URL',
          })
        }
        continue
      }

      unresolved++
      if (samples.length < 20) {
        samples.push({
          id: artwork.id,
          title: artwork.title,
          action: 'Unresolved: no usable thumbnail or asset URL',
        })
      }
    }

    return NextResponse.json({
      ok: true,
      checked,
      alreadyHealthy,
      fixedThumbnail,
      fixedAssets,
      unresolved,
      samples,
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
