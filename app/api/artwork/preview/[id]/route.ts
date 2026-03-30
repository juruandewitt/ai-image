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

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function makeOverlaySvg(width: number, height: number, title: string, artist: string) {
  const footerTitleFont = Math.max(18, Math.round(width * 0.024))
  const footerSmallFont = Math.max(12, Math.round(width * 0.015))
  const cx = width / 2
  const cy = height / 2

  const safeTitle = escapeXml(title)
  const safeArtist = escapeXml(artist)

  return `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="footerFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(0,0,0,0)" />
        <stop offset="100%" stop-color="rgba(0,0,0,0.54)" />
      </linearGradient>
      <filter id="shadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="black" flood-opacity="0.35"/>
      </filter>
    </defs>

    <!-- strong diagonal translucent band -->
    <g transform="rotate(-28 ${cx} ${cy})">
      <rect
        x="${-width * 0.2}"
        y="${cy - Math.max(42, height * 0.06)}"
        width="${width * 1.4}"
        height="${Math.max(84, height * 0.12)}"
        rx="${Math.max(12, height * 0.01)}"
        fill="rgba(255,255,255,0.16)"
      />
      <rect
        x="${-width * 0.2}"
        y="${cy - Math.max(26, height * 0.036)}"
        width="${width * 1.4}"
        height="${Math.max(52, height * 0.072)}"
        rx="${Math.max(10, height * 0.008)}"
        fill="rgba(0,0,0,0.16)"
      />
    </g>

    <!-- center label capsule -->
    <g filter="url(#shadow)">
      <rect
        x="${cx - Math.min(180, width * 0.22)}"
        y="${cy - 24}"
        width="${Math.min(360, width * 0.44)}"
        height="48"
        rx="24"
        fill="rgba(0,0,0,0.34)"
      />
      <circle cx="${cx - Math.min(145, width * 0.18)}" cy="${cy}" r="6" fill="rgba(255,255,255,0.55)"/>
      <circle cx="${cx + Math.min(145, width * 0.18)}" cy="${cy}" r="6" fill="rgba(255,255,255,0.55)"/>
    </g>

    <!-- footer -->
    <rect x="0" y="${height - 112}" width="${width}" height="112" fill="url(#footerFade)" />
    <rect x="0" y="${height - 72}" width="${width}" height="72" fill="rgba(0,0,0,0.28)" />

    <text
      x="18"
      y="${height - 42}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${footerTitleFont}"
      fill="rgba(255,255,255,0.90)"
      font-weight="700"
    >
      ${safeTitle}
    </text>

    <text
      x="18"
      y="${height - 16}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${footerSmallFont}"
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

    const overlaySvg = Buffer.from(
      makeOverlaySvg(
        width,
        height,
        artwork.title,
        artwork.artist || String(artwork.style)
      )
    )

    const output = await sharp(resizedBuffer)
      .composite([
        {
          input: overlaySvg,
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
