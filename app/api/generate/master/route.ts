import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const FIXES = [
  {
    style: 'MUNCH',
    artist: 'Edvard Munch',
    title: 'The Scream in Munch Style',
    publicPath: '/featured/munch-the-scream.png',
    prompt: 'Manual approved replacement for Munch The Scream',
  },
  {
    style: 'MONET',
    artist: 'Claude Monet',
    title: 'Impression Sunrise in Monet Style',
    publicPath: '/featured/monet-impression-sunrise.png',
    prompt: 'Manual approved replacement for Monet Impression Sunrise',
  },
]

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function publicImageToBlob(origin: string, fix: (typeof FIXES)[number]) {
  const publicUrl = `${origin}${fix.publicPath}`
  const imageRes = await fetch(publicUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    throw new Error(`Could not fetch ${fix.publicPath}: ${imageRes.status}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const blob = await put(
    `artworks/${safeFilePart(fix.style)}/${safeFilePart(fix.title)}-manual.png`,
    arrayBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${fix.title}`)
  return blob.url
}

async function applyFix(origin: string, fix: (typeof FIXES)[number]) {
  const blobUrl = await publicImageToBlob(origin, fix)

  const existing = await prisma.artwork.findFirst({
    where: {
      title: fix.title,
      style: fix.style as any,
    },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: fix.artist,
          thumbnail: blobUrl,
          status: 'PUBLISHED' as any,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: fix.title,
          style: fix.style as any,
          artist: fix.artist,
          thumbnail: blobUrl,
          status: 'PUBLISHED' as any,
          tags: [],
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: blobUrl,
      provider: 'manual-approved-blob',
      prompt: fix.prompt,
    },
  })

  return {
    title: fix.title,
    style: fix.style,
    success: true,
    artworkId: artwork.id,
    blobUrl,
  }
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin
    const results = []

    for (const fix of FIXES) {
      results.push(await applyFix(origin, fix))
    }

    return NextResponse.json({
      message: 'Manual featured images uploaded to blob and applied',
      results,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Manual featured image update failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
