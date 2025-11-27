// app/api/generate/one/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

function normalizeStyle(input?: string) {
  if (!input) return 'VAN_GOGH'
  const k = input.toUpperCase().replace(/-/g, '_')
  const allowed = [
    'VAN_GOGH','REMBRANDT','PICASSO','VERMEER','MONET',
    'MICHELANGELO','DALI','CARAVAGGIO','DA_VINCI','POLLOCK'
  ]
  return allowed.includes(k) ? k : 'VAN_GOGH'
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const title = searchParams.get('title') || 'Untitled'
    const styleParam = searchParams.get('style') || 'van-gogh'
    const styleKey = normalizeStyle(styleParam)

    // Strong prompt to encourage master-style outputs (not replicas)
    const prompt = [
      `High-quality AI artwork evocative of ${styleKey.replace(/_/g,' ')}`,
      `Subject: ${title}`,
      `Respect palette, brushwork, lighting, composition of that master without copying a known painting.`,
      `Gallery-ready, no text, no watermark.`,
    ].join('\n')

    // 1) Call OpenAI Images
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const img = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024', // supported: '1024x1024', '1024x1536', '1536x1024', 'auto'
    })

    const url = img.data?.[0]?.url
    if (!url) {
      return NextResponse.json({ ok: false, error: 'No image URL returned' }, { status: 502 })
    }

    // 2) Fetch and buffer the image
    const fetchRes = await fetch(url)
    if (!fetchRes.ok) {
      return NextResponse.json({ ok: false, error: `Failed to fetch generated image (${fetchRes.status})` }, { status: 502 })
    }
    const arrayBuffer = await fetchRes.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)

    // 3) Upload to Vercel Blob
    const filenameSafe = encodeURIComponent(title)
    const blobKey = `art/${Date.now()}-${filenameSafe}.png`
    const uploaded = await put(blobKey, buf, {
      access: 'public',
      contentType: 'image/png',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // 4) Persist Artwork + Asset
    // NOTE: 'artist', 'price', and 'thumbnail' are required by your schema.
    // - 'price' is set to 0 for now; adjust later if you want.
    // - 'thumbnail' uses the same uploaded image (you can swap to a resized version later).
    const artwork = await prisma.artwork.create({
      data: {
        title,
        style: styleKey as any,
        status: 'PUBLISHED',
        tags: [],
        artist: 'AI Studio',
        price: 0 as any,
        thumbnail: uploaded.url,
        assets: {
          create: [
            {
              provider: 'openai',
              prompt,
              originalUrl: uploaded.url,
            } as any,
          ],
        },
      },
      select: { id: true },
    })

    return NextResponse.json({
      ok: true,
      id: artwork.id,
      url: uploaded.url,
      title,
      style: styleParam,
      size: '1024x1024',
    })
  } catch (e: any) {
    const msg = typeof e?.message === 'string' ? e.message : String(e)
    const status = msg.includes('timed out') || msg.includes('AbortError') ? 504 : 500
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}
