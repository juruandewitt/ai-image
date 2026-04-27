import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DA_VINCI'
const ARTIST = 'Leonardo da Vinci'

const ITEMS = [
  {
    title: 'Mona Lisa in Da Vinci Style',
    publicPath: '/featured/da-vinci-mona-lisa.png',
    prompt: 'Manual approved Mona Lisa replacement',
  },
  {
    title: 'The Last Supper in Da Vinci Style',
    publicPath: '/featured/da-vinci-last-supper.png',
    prompt: 'Manual approved Last Supper replacement',
  },
  {
    title: 'Lady with an Ermine in Da Vinci Style',
    publicPath: '/featured/da-vinci-lady-ermine.png',
    prompt: 'Manual approved Lady with an Ermine replacement',
  },
]

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

async function uploadFromPublic(origin: string, path: string, title: string) {
  const url = `${origin}${path}`
  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) throw new Error(`Failed to fetch ${path}`)

  const contentType = res.headers.get('content-type') || 'image/png'
  const buffer = await res.arrayBuffer()

  const blob = await put(
    `artworks/da-vinci/${safeFilePart(title)}-approved.png`,
    buffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${title}`)
  return blob.url
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const results = []

  for (const item of ITEMS) {
    try {
      const imageUrl = await uploadFromPublic(origin, item.publicPath, item.title)

      const existing = await prisma.artwork.findFirst({
        where: {
          title: item.title,
          style: STYLE as any,
        },
        select: { id: true },
      })

      const artwork = existing
        ? await prisma.artwork.update({
            where: { id: existing.id },
            data: {
              artist: ARTIST,
              thumbnail: imageUrl,
              status: 'PUBLISHED' as any,
            },
            select: { id: true },
          })
        : await prisma.artwork.create({
            data: {
              title: item.title,
              style: STYLE as any,
              artist: ARTIST,
              thumbnail: imageUrl,
              status: 'PUBLISHED' as any,
              tags: [],
              price: 9.99,
            },
            select: { id: true },
          })

      await prisma.asset.create({
        data: {
          artworkId: artwork.id,
          originalUrl: imageUrl,
          provider: 'manual-approved-blob',
          prompt: item.prompt,
        },
      })

      results.push({
        title: item.title,
        success: true,
        artworkId: artwork.id,
        imageUrl,
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
    message: 'Da Vinci approved images locked',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
