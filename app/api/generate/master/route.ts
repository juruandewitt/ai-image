// app/api/generate/master/route.ts
import { NextResponse } from 'next/server'
import { buildStylePrompt } from '@/lib/generator'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { STYLE_LABELS, styleSlugToKey } from '@/lib/styles'
import { OpenAI } from 'openai'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const styleSlug = searchParams.get('style') || 'van-gogh'
    const title = (searchParams.get('title') || 'Untitled').slice(0, 120)

    const styleKey = styleSlugToKey(styleSlug)
    const prompt = buildStylePrompt(styleKey as any, title)

    // Generate image with OpenAI
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const gen = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
    })
    const url = gen.data?.[0]?.url
    if (!url) throw new Error('No image URL returned from OpenAI')

    // Fetch original
    const res = await fetch(url)
    const orig = Buffer.from(await res.arrayBuffer())

    // Upload original + a couple of derived variants
    const stamp = Date.now()
    const baseKey = `art/${stamp}`
    const upOrig = await put(`${baseKey}-orig.png`, orig, {
      access: 'public',
      contentType: 'image/png',
    })
    const s1024 = await sharp(orig).resize(1024).png().toBuffer()
    const s2048 = await sharp(orig).resize(2048).webp({ quality: 88 }).toBuffer()
    const up1024 = await put(`${baseKey}-1024.png`, s1024, { access: 'public', contentType: 'image/png' })
    const up2048 = await put(`${baseKey}-2048.webp`, s2048, { access: 'public', contentType: 'image/webp' })

    // DB rows (no 'smoketest' tag)
    const artwork = await prisma.artwork.create({
      data: {
        title,
        displayArtist: STYLE_LABELS[styleKey as any],
        style: styleKey as any,
        status: 'PUBLISHED',
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
