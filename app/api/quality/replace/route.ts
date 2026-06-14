import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

export async function GET() {
  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      tags: true,
    },
    take: 5000,
  })

  const themeCounts = new Map<string, number>()
  const examples = new Map<string, { id: string; title: string }>()

  for (const artwork of artworks) {
    for (const tag of artwork.tags ?? []) {
      if (typeof tag !== 'string') continue
      if (!tag.startsWith('theme:')) continue

      const theme = tag.replace('theme:', '').trim()

      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1)

      if (!examples.has(theme)) {
        examples.set(theme, {
          id: artwork.id,
          title: artwork.title,
        })
      }
    }
  }

  const themes = Array.from(themeCounts.entries())
    .map(([theme, count]) => ({
      theme,
      count,
      example: examples.get(theme),
    }))
    .sort((a, b) => a.theme.localeCompare(b.theme))

  return NextResponse.json({
    message: 'Published theme audit complete',
    totalPublishedArtworksChecked: artworks.length,
    totalThemesFound: themes.length,
    themes,
  })
}
