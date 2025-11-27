// app/api/generate/one/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

function normalizeStyle(input?: string) {
  if (!input) return 'VAN_GOGH'
  const k = input.toUpperCase().replace(/-/g, '_')
  // Keep this list aligned with your Prisma enum Style
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

    // 1) Build a strong prompt
    const prompt = [
      `High-quality, photorealistic-but-stylized AI artwork in the style of ${styleKey.replace(/_/g,' ')}`,
      `Subject: ${title}`,
      `Use the master’s palette, brushwork, composition and lighting (do not copy an existing painting).`,
      `Single subject focus, gallery-ready, no text, no watermark.`,
    ].join('\n')

    // 2) Generate with OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
    const img = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024', // Supported: 1024x1024, 1024x1536, 1536x1024, auto
      // NO response_format here (caused errors before)
    })

    const url = img.data?.[0]?.url
    if (!url) {
      return NextResponse.json({ ok: false, error: 'No image URL returned' }, { status: 502 })
    }

    // 3) Fetch the image data
    const res = await fetch(url)
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: `Failed to fetch generated image (${res.status})` }, { status: 502 })
    }
    const arrayBuffer = await res.arrayBuffer()
    const buf = Buffer.from(arrayBuffer)

    // 4) Upload to Vercel Blob
    const filenameSafe = encodeURIComponent(title)
    const blobKey = `art/${Date.now()}-${filenameSafe}.png`
    const putRes = await put(blobKey, buf, {
      access: 'public',
      contentType: 'image/png',
      token: process.env.BLOB_READ_WRITE_TOKEN, // required on server
    })

    // 5) Persist both Artwork + Asset
    const artwork = await prisma.artwork.create({
      data: {
        title,
        style: styleKey as any,
        status: 'PUBLISHED',
        tags: [],
        assets: {
          create: [{
            provider: 'openai',
            prompt,
            originalUrl: putRes.url, // IMPORTANT: we save the blob URL here
          }],
        },
      },
      select: { id: true },
    })

    return NextResponse.json({
      ok: true,
      id: artwork.id,
      url: putRes.url,
      title,
      style: styleParam,
      size: '1024x1024',
    })
  } catch (e: any) {
    // Handle timeouts and provider JSON errors nicely
    const msg = typeof e?.message === 'string' ? e.message : String(e)
    const status = msg.includes('timed out') || msg.includes('AbortError') ? 504 : 500
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}
