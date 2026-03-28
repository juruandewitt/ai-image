import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE_LABELS: Record<string, string> = {
  VAN_GOGH: 'Van Gogh',
  DALI: 'Dalí',
  POLLOCK: 'Jackson Pollock',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  PICASSO: 'Pablo Picasso',
  REMBRANDT: 'Rembrandt',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  MICHELANGELO: 'Michelangelo',
}

export async function GET() {
  try {
    const artworks = await prisma.artwork.findMany({
      select: {
        id: true,
        title: true,
        style: true,
        artist: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    let checked = 0
    let updated = 0
    let skipped = 0

    const samples: { id: string; title: string; from: string | null; to: string }[] = []

    for (const artwork of artworks) {
      checked++

      const styleKey = String(artwork.style)
      const properArtist = STYLE_LABELS[styleKey]

      if (!properArtist) {
        skipped++
        continue
      }

      if ((artwork.artist || '').trim() === properArtist) {
        skipped++
        continue
      }

      await prisma.artwork.update({
        where: { id: artwork.id },
        data: {
          artist: properArtist,
        },
      })

      updated++

      if (samples.length < 20) {
        samples.push({
          id: artwork.id,
          title: artwork.title,
          from: artwork.artist,
          to: properArtist,
        })
      }
    }

    return NextResponse.json({
      ok: true,
      checked,
      updated,
      skipped,
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
