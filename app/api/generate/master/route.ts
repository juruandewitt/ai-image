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

    // --- Generate with OpenAI (b64 output, more robust than URL) ---
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const gen = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      response_format: 'b64_json',
    })
    const b64 = gen.data?.[0]?.b64_json
    if (!b64) throw new Error('OpenAI returned no image data (b64_json). Check API key/billing or prompt.')

    // Build original Buffer directly from base64
    const orig = Buffer.from(b64, 'base64')

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

    // --- Persist DB rows (include required fields) ---
    const artwork = await prisma.artwork.create({
      data: {
        title,
        artist: `AI Image – ${styleSlug}`, // shown on cards/detail
        style: styleKey as any,
        status: 'PUBLISHED',
        price: 1900,            // default price; adjust later as needed
        thumbnail: up1024.url,  // use 1024px variant as thumbnail
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
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
