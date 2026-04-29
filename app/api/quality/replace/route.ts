import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'POLLOCK'
const ARTIST = 'Jackson Pollock'

const ITEMS = [
  {
    title: 'Number 1A Inspired Drip Composition',
    prompt:
      'authentic jackson pollock drip painting, chaotic layered paint splatter, raw canvas, energetic movement, thick paint trails, no gradients, real paint physics',
  },
  {
    title: 'Autumn Rhythm Inspired Drip Field',
    prompt:
      'large scale pollock drip painting, flowing black and brown lines, rhythmic composition, natural motion, splattered paint, highly detailed',
  },
  {
    title: 'Lavender Mist Inspired Composition',
    prompt:
      'soft grey and lavender pollock drip painting, delicate layered splatter, atmospheric but chaotic, real paint texture',
  },
  {
    title: 'Blue Poles Inspired Structure',
    prompt:
      'pollock drip painting with strong vertical blue structures, chaotic splatter around, bold contrast, real paint strokes',
  },
  {
    title: 'Convergence Inspired Chaos',
    prompt:
      'intense pollock style action painting, dense chaotic splatter, multicolor paint, overlapping layers, energetic composition',
  },
  {
    title: 'Number 31 Inspired Energy Field',
    prompt:
      'black and white pollock drip painting, high contrast, dense network of lines, raw expressive energy',
  },
  {
    title: 'Black Pour Inspired Minimal Drip',
    prompt:
      'minimalist pollock painting, black paint drips on raw canvas, simple but expressive, real fluid motion',
  },
  {
    title: 'Multicolor Drip Explosion',
    prompt:
      'vibrant pollock drip painting, bright colors splattered dynamically, energetic motion, layered paint texture',
  },
  {
    title: 'Dense Layered Drip Composition',
    prompt:
      'very dense pollock style painting, heavy layering of paint splashes, chaotic but balanced, thick texture',
  },
  {
    title: 'Controlled Chaos Drip Study',
    prompt:
      'controlled pollock drip painting, structured chaos, deliberate splatter placement, realistic paint behavior',
  },
]

async function upsertArtwork(item: (typeof ITEMS)[number]) {
  const existing = await prisma.artwork.findFirst({
    where: { title: item.title, style: STYLE as any },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: ARTIST,
          status: 'PUBLISHED' as any,
        },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          status: 'PUBLISHED' as any,
          price: 9.99,
        },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: '',
      provider: 'ai-generated',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const artworkId = await upsertArtwork(item)

      results.push({
        title: item.title,
        success: true,
        artworkId,
      })
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Pollock inspired top 10 created',
    style: STYLE,
    results,
  })
}
