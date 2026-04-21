import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const artwork = await prisma.artwork.findFirst({
      where: {
        title: 'The Scream in Munch Style',
        style: 'MUNCH' as any,
      },
    })

    if (!artwork) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 })
    }

    const imageUrl = '/featured/munch-the-scream.png'

    await prisma.artwork.update({
      where: { id: artwork.id },
      data: {
        thumbnail: imageUrl,
        artist: 'Edvard Munch',
      },
    })

    await prisma.asset.create({
      data: {
        artworkId: artwork.id,
        originalUrl: imageUrl,
        provider: 'manual-fix',
        prompt: 'Correct Munch The Scream image',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Munch Scream updated',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update Munch Scream' },
      { status: 500 }
    )
  }
}
