import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: params.id },
      include: {
        assets: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!artwork) {
      return new NextResponse('Not found', { status: 404 })
    }

    // 🔥 Priority order
    const imageUrl =
      artwork.thumbnail ||
      artwork.assets?.[0]?.originalUrl ||
      null

    if (!imageUrl) {
      return new NextResponse('No image', { status: 404 })
    }

    // 🔥 Fetch image directly
    const img = await fetch(imageUrl, { cache: 'no-store' })

    if (!img.ok) {
      // 👉 CRITICAL: fallback instead of breaking
      return NextResponse.redirect(imageUrl)
    }

    const contentType = img.headers.get('content-type') || 'image/png'
    const buffer = await img.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    // 👉 FINAL fallback: never break UI
    return new NextResponse('Preview error', { status: 500 })
  }
}
