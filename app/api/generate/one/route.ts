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

    const prompt = [
      `High-quality AI artwork evocative of ${styleKey.replace(/_/g,' ')}`,
      `Subject: ${title}`,
      `Respect palette, brushwork, lighting, and composition of that master without copying an existing painting.`,
      `Gallery-ready, no text, no watermark.`,
    ].join('\n')

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

    // Request an image. Some accounts/models return b64_json (most reliable),
    // some return url. We'll handle both.
    const img = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      // Do NOT set response_format — some SDK versions reject it.
    })

    const first = img.data?.[0]
    if (!first) {
      return NextResponse.json({ ok: false, error: 'No image returned (empty data array)' }, { status: 502 })
    }

    // Prefer b64_json if present; fallback to url
    let pngBuffer: Buffer | null = null

    if (first.b64_json) {
      pngBuffer = Buffer.from(first.b64_json, 'base64')
    } else if (first.url) {
      const r = await fetch(first.url)
      if (!r.ok) {
        return NextResponse.json({ ok: false, error: `Fetch of image url failed (${r.status})` }, { status: 502 })
      }
      const ab = await r.arrayBuffer()
      pngBuffer = Buffer.from(ab)
    }

    if (!pngBuffer) {
      return NextResponse.json({ ok: false, error: 'No image URL or b64_json returned' }, { status: 502 })
    }

    // Upload to Blob
    const filenameSafe = encodeURIComponent(title)
    const blobKey = `art/${Date.now()}-${filenameSafe}.png`
    const uploaded = await put(blobKey, pngBuffer, {
      access: 'public',
      contentType: 'image/png',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    // Persist Artwork + Asset (match your required fields)
    const artwork = await prisma.artwork.create({
      data: {
        title,
        style: styleKey as any,
        status: 'PUBLISHED',
        tags: [],
        artist: 'AI Studio',
        price: 0 as any,           // adjust later if Decimal, use "0.00"
        thumbnail: uploaded.url,   // same as original for now
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
    const status = /timed out|AbortError/i.test(msg) ? 504 : 500
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}
