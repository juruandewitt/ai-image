// app/api/generate/master/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { styleSlugToKey, buildStylePrompt } from '@/lib/styles'
import { OpenAI } from 'openai'

export const runtime = 'nodejs'

// Allow GET for easy testing from the browser
export async function GET(req: Request) {
  return POST(req)
}

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const styleSlug = (searchParams.get('style') || 'van-gogh').toLowerCase()
    const title = (searchParams.get('title') || 'Untitled').slice(0, 120)

    const styleKey = styleSlugToKey(styleSlug)
    const prompt = buildStylePrompt(styleKey as any, title)

    // --- Generate with OpenAI (accept b64_json or url) ---
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const gen = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      // no response_format here — some deployments reject it
    })

    const first = gen.data?.[0]
    if (!first) throw new Error('OpenAI returned no image in response data')

    let orig: Buffer
    if (first.b64_json) {
      // Preferred: decode base64 directly
      orig = Buffer.from(first.b64_json, 'base64')
    } else if (first.url) {
      // Fallback: fetch the URL
      const res = await fetch(first.url)
      if (!res.ok) throw new Error(`Failed to fetch image URL (${res.status})`)
      orig = Buffer.from(await res.arrayBuffer())
    } else {
      throw new Error('OpenAI image had neither b64_json nor url')
    }

    // --- Upload to Vercel Blob: original + variants ---
    const stamp = Date.now()
    const baseKey = `art/${stamp}`

    const upOrig = await put(`${baseKey}-orig.png`, orig, {
      access: 'public',
      contentType: 'image/png',
    })

    const s1024 = await sharp(orig).resize(1024).png().toBuffer()
    const up1024 = await put(`${baseKey}-1024.png`, s1024, {
      access: 'public',
      contentType: 'image/png',
    })

    const s2048 = await sharp(orig).resize(2048).webp({ quality: 88 }).toBuffer()
    const up2048 = await put(`${baseKey}-2048.webp`, s2048, {
      access: 'public',
      contentType: 'image/webp',
    })

    // --- Persist DB rows (include required fields for your schema) ---
    const artwork = await prisma.artwork.create({
      data: {
        title,
        artist: `AI Image – ${styleSlug}`, // what shows in UI
        style: styleKey as any,
        status: 'PUBLISHED',
        price: 1900,
        thumbnail: up1024.url,
        tags: [],
        assets: {
          create: [
            { provider: 'blob', prompt, originalUrl: upOrig.url },
            { provider: 'blob', prompt, originalUrl: up1024.url },
            { provider: 'blob', prompt, originalUrl: up2048.url },
          ],
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: artwork.id })
  } catch (e: any) {
    // Surface a clearer reason to help debugging
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    )
  }
}
