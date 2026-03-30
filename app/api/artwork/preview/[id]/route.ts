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

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function makeWatermarkSvg(
  width: number,
  height: number,
  title: string,
  artist: string
) {
  const bigFont = Math.max(54, Math.round(width * 0.085))
  const smallFont = Math.max(12, Math.round(width * 0.015))
  const footerTitleFont = Math.max(18, Math.round(width * 0.024))

  const safeTitle = escapeXml(title)
  const safeArtist = escapeXml(artist)

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.35"/>
      </filter>
      <linearGradient id="footerFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.52)" />
      </linearGradient>
    </defs>

    <!-- single large diagonal watermark -->
    <g transform="rotate(-28 ${width / 2} ${height / 2})" filter="url(#shadow)">
      <text
        x="50%"
        y="50%"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${bigFont}"
        fill="rgba(255,255,255,0.22)"
        font-weight="800"
        letter-spacing="8"
      >
        AI IMAGE PREVIEW
      </text>
    </g>

    <!-- footer -->
    <rect x="0" y="${height - 110}" width="${width}" height="110" fill="url(#footerFade)" />
    <rect x="0" y="${height - 72}" width="${width}" height="72" fill="rgba(0,0,0,0.26)" />

    <text
      x="18"
      y="${height - 42}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${footerTitleFont}"
      fill="rgba(255,255,255,0.88)"
      font-weight="700"
    >
      ${safeTitle}
    </text>

    <text
      x="18"
      y="${height - 16}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${smallFont}"
      fill="rgba(255,255,255,0.74)"
      font-weight="600"
      letter-spacing="1"
    >
      ${safeArtist} • Watermarked preview • Purchase for full-quality download
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
        title: true,
        artist: true,
        style: true,
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

    const watermarkSvg = Buffer.from(
      makeWatermarkSvg(
        width,
        height,
        artwork.title,
        artwork.artist || String(artwork.style)
      )
    )

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
