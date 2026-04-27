import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const title = String(body.title || '')
    const style = String(body.style || '')
    const candidateUrl = String(body.candidateUrl || '')

    if (!title || !style || !candidateUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing title, style, or candidateUrl' },
        { status: 400 }
      )
    }

    const artist = style === 'DA_VINCI' ? 'Leonardo da Vinci' : 'AI Image'

    const existing = await prisma.artwork.findFirst({
      where: {
        title,
        style: style as any,
      },
      select: { id: true },
    })

    const artwork = existing
      ? await prisma.artwork.update({
          where: { id: existing.id },
          data: {
            thumbnail: candidateUrl,
            artist,
            status: 'PUBLISHED' as any,
          },
          select: { id: true },
        })
      : await prisma.artwork.create({
          data: {
            title,
            style: style as any,
            artist,
            thumbnail: candidateUrl,
            status: 'PUBLISHED' as any,
            tags: [],
            price: 9.99,
          },
          select: { id: true },
        })

    await prisma.asset.create({
      data: {
        artworkId: artwork.id,
        originalUrl: candidateUrl,
        provider: 'approved-quality-candidate',
        prompt: `Approved quality candidate for ${title}`,
      },
    })

    return NextResponse.json({
      success: true,
      title,
      style,
      artworkId: artwork.id,
      appliedUrl: candidateUrl,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
