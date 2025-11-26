// app/api/generate/one/route.ts
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { styleSlugToKey, buildStylePrompt } from '@/lib/styles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 10


// Generate ONE artwork quickly (no heavy resizes, store a single 1024 PNG)
async function generateAndSave(styleSlug: string, title: string) {
  const styleKey = styleSlugToKey(styleSlug)
  const prompt   = buildStylePrompt(styleKey as any, title)

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  })

  const first = resp.data?.[0]
  if (!first) throw new Error('OpenAI returned no image')

  let pngBuffer: Buffer
  if ((first as any).b64_json) {
    pngBuffer = Buffer.from((first as any).b64_json, 'base64')
  } else if (first.url) {
    const r = await fetch(first.url)
    if (!r.ok) throw new Error(`Failed to fetch URL ${r.status}`)
    pngBuffer = Buffer.from(await r.arrayBuffer())
  } else {
    throw new Error('No b64_json or url in OpenAI response')
  }

  const key = `art/${Date.now()}-${Math.random().toString(36).slice(2,8)}-1024.png`
  const uploaded = await put(key, pngBuffer, {
    access: 'public',
    contentType: 'image/png',
  })

  // Save Prisma rows (match your schema: title, artist, style, status, price, thumbnail, tags, assets)
  const created = await prisma.artwork.create({
    data: {
      title,
      artist: `AI Image – ${styleSlug}`,
      style: styleKey as any,
      status: 'PUBLISHED',
      price: 1900,
      thumbnail: uploaded.url,
      tags: [],
      assets: {
        create: [
          { provider: 'blob', prompt, originalUrl: uploaded.url }
        ]
      }
    },
    select: { id: true, title: true, style: true }
  })

  return { id: created.id, url: uploaded.url }
}

// GET: /api/generate/one?style=van-gogh&title=Starry%20Harbor
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const style = (searchParams.get('style') || 'van-gogh').toLowerCase()
    const title = searchParams.get('title') || 'Untitled'
    const result = await generateAndSave(style, title)
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// POST: { style: 'van-gogh', title: 'Starry Harbor' }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const style = (body.style || 'van-gogh').toLowerCase()
    const title = body.title || 'Untitled'
    const result = await generateAndSave(style, title)
    return NextResponse.json({ ok: true, ...result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
