import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function isStableBlobSrc(value?: string | null) {
  if (!value) return false
  return value.toLowerCase().includes('.public.blob.vercel-storage.com/')
}

function pickStableImgSrc(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string | null }[]
}) {
  const stableAsset =
    a.assets?.find((x) => isStableBlobSrc(x.originalUrl))?.originalUrl || null

  const stableThumbnail = isStableBlobSrc(a.thumbnail) ? a.thumbnail : null

  return stableAsset || stableThumbnail || null
}

function clampWidth(value: number) {
  if (Number.isNaN(value)) return 900
  return Math.max(320, Math.min(1400, value))
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        thumbnail: true,
        assets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { originalUrl: true },
        },
      },
    })

    if (!artwork) {
      return new NextResponse('Artwork not found', { status: 404 })
    }

    const originalUrl = pickStableImgSrc(artwork)

    if (!originalUrl) {
      return new NextResponse('No image found', { status: 404 })
    }

    const widthParam = Number(request.nextUrl.searchParams.get('w') || '900')
    const targetWidth = clampWidth(widthParam)

    const imageRes = await fetch(originalUrl, { cache: 'no-store' })

    if (!imageRes.ok) {
      return new NextResponse('Could not fetch image', { status: 502 })
    }

    const arrayBuffer = await imageRes.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    const output = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 72 })
      .toBuffer()

    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return new NextResponse(
      err instanceof Error ? err.message : 'Preview failed',
      { status: 500 }
    )
  }
}
