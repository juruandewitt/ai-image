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
  return Math.max(300, Math.min(1400, value))
}

function makeWatermarkSvg(width: number, height: number) {
  const fontSize = Math.max(26, Math.round(width * 0.045))
  const subFontSize = Math.max(12, Math.round(width * 0.018))

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="black" flood-opacity="0.45"/>
      </filter>
    </defs>

    <g transform="rotate(-28 ${width / 2} ${height / 2})" filter="url(#shadow)">
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        fill="rgba(255,255,255,0.22)"
        font-weight="700"
        letter-spacing="4"
      >
        AI IMAGE PREVIEW
      </text>
    </g>

    <rect x="0" y="${height - 42}" width="${width}" height="42" fill="rgba(0,0,0,0.38)"/>
    <text
      x="16"
      y="${height - 16}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${subFontSize}"
      fill="rgba(255,255,255,0.78)"
      font-weight="600"
      letter-spacing="1"
    >
      Preview only • Watermarked • Purchase for full-quality download
    </text>
  </svg>
  `
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
          take: 10,
          select: {
            originalUrl: true,
          },
        },
      },
    })

    if (!artwork) {
      return new NextResponse('Artwork not found', { status: 404 })
    }

    const originalUrl = pickStableImgSrc(artwork)

    if (!originalUrl) {
      return new NextResponse('No stable artwork image found', { status: 404 })
    }

    const widthParam = Number(request.nextUrl.searchParams.get('w') || '900')
    const targetWidth = clampWidth(widthParam)

    const imageRes = await fetch(originalUrl, { cache: 'no-store' })

    if (!imageRes.ok) {
      return new NextResponse('Could not fetch source image', { status: 502 })
    }

    const arrayBuffer = await imageRes.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)

    const resizedBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .toBuffer()

    const resizedMeta = await sharp(resizedBuffer).metadata()
    const width = resizedMeta.width || targetWidth
    const height = resizedMeta.height || targetWidth

    const watermarkSvg = Buffer.from(makeWatermarkSvg(width, height))

    const output = await sharp(resizedBuffer)
      .composite([
        {
          input: watermarkSvg,
          top: 0,
          left: 0,
        },
      ])
      .webp({ quality: 72 })
      .toBuffer()

    return new NextResponse(output, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (err) {
    return new NextResponse(
      err instanceof Error ? err.message : 'Preview generation failed',
      { status: 500 }
    )
  }
}
