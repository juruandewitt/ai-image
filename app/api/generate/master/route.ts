import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const FIX = {
  style: 'DA_VINCI',
  artist: 'Leonardo da Vinci',
  title: 'Mona Lisa in Da Vinci Style',
  publicPath: '/featured/da-vinci-mona-lisa.png',
  prompt: 'Manual approved replacement for Da Vinci Mona Lisa',
}

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function publicImageToBlob(origin: string) {
  const publicUrl = `${origin}${FIX.publicPath}`
  const imageRes = await fetch(publicUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    throw new Error(`Could not fetch ${FIX.publicPath}: ${imageRes.status}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const blob = await put(
    `artworks/${safeFilePart(FIX.style)}/${safeFilePart(FIX.title)}-manual.png`,
    arrayBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${FIX.title}`)
  return blob.url
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.nextUrl.origin
    const blobUrl = await publicImageToBlob(origin)

    const existing = await prisma.artwork.findFirst({
      where: {
        title: FIX.title,
        style: FIX.style as any,
      },
      select: { id: true },
    })

    const artwork = existing
      ? await prisma.artwork.update({
          where: { id: existing.id },
          data: {
            artist: FIX.artist,
            thumbnail: blobUrl,
            status: 'PUBLISHED' as any,
          },
          select: { id: true },
        })
      : await prisma.artwork.create({
          data: {
            title: FIX.title,
            style: FIX.style as any,
            artist: FIX.artist,
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
        prompt: FIX.prompt,
      },
    })

    return NextResponse.json({
      message: 'Da Vinci Mona Lisa uploaded to blob and applied',
      result: {
        title: FIX.title,
        style: FIX.style,
        success: true,
        artworkId: artwork.id,
        blobUrl,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Da Vinci Mona Lisa update failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
