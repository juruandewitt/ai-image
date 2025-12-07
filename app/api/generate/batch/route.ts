// app/api/generate/batch/route.ts
import { NextResponse } from 'next/server'
import { OpenAI } from 'openai'
import sharp from 'sharp'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { styleSlugToKey } from '@/lib/styles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// --- Local prompt helper so we don't depend on '@/lib/styles' exports ---
function buildStylePrompt(styleKey: string, title: string): string {
  const label = styleKey
    .toLowerCase()
    .split('_')
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join(' ')

  const rules =
    styleKey === 'VAN_GOGH'
      ? `Impasto brushwork, swirling skies, bold complementary colors, high contrast, expressive movement inspired by ${label}.`
      : styleKey === 'DALI'
      ? `Surrealist dreamscapes, melting/elongated forms, precise draftsmanship, hyperreal textures, uncanny juxtapositions in the spirit of ${label}.`
      : styleKey === 'PICASSO'
      ? `Cubist fragmentation, geometric planes, shifting perspectives, bold simplified palettes informed by ${label}.`
      : styleKey === 'MONET'
      ? `Impressionist light studies, soft broken color, atmospheric landscapes/water, transient effects echoing ${label}.`
      : styleKey === 'VERMEER'
      ? `Dutch Golden Age interior lighting, camera-obscura realism, quiet domestic scenes, pearl-like highlights reminiscent of ${label}.`
      : styleKey === 'LEONARDO_DA_VINCI'
      ? `Renaissance sfumato, subtle chiaroscuro, anatomical accuracy, harmonious proportions and calm expressions associated with ${label}.`
      : styleKey === 'JACKSON_POLLOCK'
      ? `Action painting gestures, all-over drip/splash techniques, dynamic layers, energetic movement inspired by ${label}.`
      : styleKey === 'MICHELANGELO'
      ? `High Renaissance monumentality, powerful anatomy, sculptural forms, dynamic poses reminiscent of ${label}.`
      : `Create in the recognizable stylistic traits associated with ${label}.`

  return `${title}. Create an original artwork in the stylistic characteristics described: ${rules} Avoid copying any specific copyrighted work; generate a new composition inspired by those traits.`
}

// --- Generate image via OpenAI, upload to Blob, persist Artwork+Asset ---
async function generateAndPersist(styleKey: string, title: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing')
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is missing')
  }

  const prompt = buildStylePrompt(styleKey, title)

  // Call OpenAI Images
  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  })

  const imageUrl = resp?.data?.[0]?.url
  if (!imageUrl) throw new Error('No image URL returned from OpenAI')

  // Fetch the image and normalize (png) with sharp
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to fetch generated image (${imgRes.status})`)
  const buf = Buffer.from(await imgRes.arrayBuffer())
  const png = await sharp(buf).png().toBuffer()

  // Upload to Vercel Blob (public)
  const safeTitle = title.replace(/[^a-z0-9\-_. ]/gi, '').trim().replace(/\s+/g, '%20')
  const filename = `${Date.now()}-${safeTitle}.png`
  const { url: blobUrl } = await put(`art/${filename}`, png, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/png',
  })

  // Persist DB: Artwork + Asset (schema-aligned: includes artist/price/thumbnail)
  // Adjust these defaults if your schema differs.
  const artwork = await prisma.artwork.create({
    data: {
      title,
      style: styleKey as any,
      status: 'PUBLISHED',
      tags: [],
      artist: 'AI Studio',
      price: 0,
      thumbnail: blobUrl,
      assets: {
        create: [
          {
            provider: 'openai',
            prompt,
            originalUrl: blobUrl,
          },
        ],
      },
    },
    select: { id: true },
  })

  return { id: artwork.id, url: blobUrl }
}

// GET /api/generate/batch?style=<slug>&title=<text>
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const styleParam = (searchParams.get('style') || '').trim()
    const title = (searchParams.get('title') || '').trim()

    if (!styleParam) {
      return NextResponse.json({ ok: false, error: 'Missing ?style' }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ ok: false, error: 'Missing ?title' }, { status: 400 })
    }

    const styleKey = styleSlugToKey(styleParam)
    if (!styleKey) {
      return NextResponse.json(
        { ok: false, error: `Unknown style '${styleParam}'` },
        { status: 400 }
      )
    }

    const result = await generateAndPersist(styleKey, title)
    return NextResponse.json({ ok: true, style: styleKey, title, ...result })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    )
  }
}
