import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'space-universe'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'

// Use an existing valid Style enum.
// Theme pages rely on tags, not style.
const STYLE = 'POLLOCK'

const ITEMS = [
  {
    title: 'Nebula Dreamscape - Space Universe Theme',
    imageUrl:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-universe/nebula-dreamscape-space-universe-theme-NuKZII6jkuRCPNIZzXgIpfTtwlnRDi.png',
    prompt:
      'premium cinematic space artwork, Nebula Dreamscape, ultra detailed, deep cosmic atmosphere, dramatic lighting, vibrant nebula colors, high-end digital art, commercial poster quality, no text, no watermark',
  },
  {
    title: 'Galaxy Core - Space Universe Theme',
    imageUrl:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-universe/galaxy-core-space-universe-theme-lha2yp55NTnaP4haxWJJlGC5Qmg4zM.png',
    prompt:
      'premium cinematic space artwork, Galaxy Core, ultra detailed, deep cosmic atmosphere, dramatic lighting, vibrant nebula colors, high-end digital art, commercial poster quality, no text, no watermark',
  },
  {
    title: 'Deep Space Horizon - Space Universe Theme',
    imageUrl:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-universe/deep-space-horizon-space-universe-theme-04uGmAdUbsA4mS6wiVFmYTk6171h6n.png',
    prompt:
      'premium cinematic space artwork, Deep Space Horizon, ultra detailed, deep cosmic atmosphere, dramatic lighting, vibrant nebula colors, high-end digital art, commercial poster quality, no text, no watermark',
  },
  {
    title: 'Cosmic Storm - Space Universe Theme',
    imageUrl:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-universe/cosmic-storm-space-universe-theme-UoZfAilCsDKHqsQQrapnfGFF9UqA5H.png',
    prompt:
      'premium cinematic space artwork, Cosmic Storm, ultra detailed, deep cosmic atmosphere, dramatic lighting, vibrant nebula colors, high-end digital art, commercial poster quality, no text, no watermark',
  },
  {
    title: 'Planetary Rings - Space Universe Theme',
    imageUrl:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/themes/space-universe/planetary-rings-space-universe-theme-ER0qFIB5NYtY1FgexdmXj4JleLfYl9.png',
    prompt:
      'premium cinematic space artwork, Planetary Rings, ultra detailed, deep cosmic atmosphere, dramatic lighting, vibrant nebula colors, high-end digital art, commercial poster quality, no text, no watermark',
  },
]

async function upsertArtwork(item: (typeof ITEMS)[number]) {
  const tags = [
    THEME_TAG,
    'theme',
    'space',
    'universe',
    'galaxy',
    'sci-fi',
    'wallpaper',
  ]

  const existing = await prisma.artwork.findFirst({
    where: { title: item.title },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: ARTIST,
          thumbnail: item.imageUrl,
          status: 'PUBLISHED' as any,
          tags,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: item.imageUrl,
          status: 'PUBLISHED' as any,
          tags,
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: item.imageUrl,
      provider: 'theme-ai-generated-blob',
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
        imageUrl: item.imageUrl,
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
    message: 'Space & Universe theme batch 1 repaired',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
