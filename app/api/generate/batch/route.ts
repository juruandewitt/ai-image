// app/api/generate/batch/route.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { styleSlugToKey, styleKeyToLabel } from '@/lib/styles'
import { OpenAI } from 'openai'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Local style-aware prompt builder
function buildStylePrompt(styleKey: string, title: string) {
  const label = styleKeyToLabel(styleKey as any)

  const rules =
    styleKey === 'VAN_GOGH'
      ? `Post-Impressionist oil painting with thick impasto brushstrokes, vivid complementary colors, swirling energetic sky, and expressive texture reminiscent of ${label}.`
      : styleKey === 'DALI'
      ? `Surrealist composition with dreamlike juxtapositions, smooth gradients, elongated forms, crisp shadows, and meticulous classical rendering reminiscent of ${label}.`
      : styleKey === 'POLLOCK'
      ? `Abstract Expressionist drip painting with layered splatters, dynamic motion, dense overlapping strokes, and high-contrast rhythm reminiscent of ${label}.`
      : styleKey === 'VERMEER'
      ? `Dutch Golden Age interior scene with soft daylight, precise perspective, calm tonality, and delicate highlights reminiscent of ${label}.`
      : styleKey === 'MONET'
      ? `Impressionist plein-air palette, soft edges, optical color mixing, shimmering light on water and foliage reminiscent of ${label}.`
      : styleKey === 'PICASSO'
      ? `Cubist fragmentation of form, geometric planes, multiple viewpoints, muted earth palette with strong linework reminiscent of ${label}.`
      : styleKey === 'REMBRANDT'
      ? `Baroque chiaroscuro portrait/scene, dramatic contrast, warm earth palette, painterly realism, rich textures reminiscent of ${label}.`
      : styleKey === 'CARAVAGGIO'
      ? `Baroque realism with intense chiaroscuro, theatrical lighting, naturalistic figures, and dramatic staging reminiscent of ${label}.`
      : styleKey === 'DA_VINCI'
      ? `High Renaissance composition with sfumato, balanced proportions, anatomical fidelity, and subtle atmospheric depth reminiscent of ${label}.`
      : styleKey === 'MICHELANGELO'
      ? `High Renaissance / Mannerist monumentality, powerful anatomy, sculptural forms, and dynamic poses reminiscent of ${label}.`
      : `Coherent, gallery-worthy fine-art piece that reflects core stylistic traits of ${label} without copying any specific work.` // ✅ fallback

  return `${title}. Create an original artwork in the style characteristics described: ${rules} Avoid copying any specific copyrighted work; generate a new composition inspired by those stylistic traits.`
}

async function generateOne(opts: { styleKey: string; title: string }) {
  const { styleKey, title } = opts
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = buildStylePrompt(styleKey, title)

  // 1) Generate with OpenAI Images
  const ai = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024', // supported: '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
  })

  const url = ai?.data?.[0]?.url
  if (!url) throw new Error('No image URL returned')

  // 2) Fetch original and build a thumbnail
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const originalBuffer = Buffer.from(await res.arrayBuffer())

  const thumbBuffer = await sharp(originalBuffer)
    .resize(600)
    .png({ quality: 90 })
    .toBuffer()

  // 3) Upload both to Blob
  const ts = Date.now()
  const safeTitle = encodeURIComponent(title)
  const origKey = `art/${ts}-${safeTitle}.png`
  const thumbKey = `art/${ts}-${safeTitle}-thumb.png`

  const [origPut, thumbPut] = await Promise.all([
    put(origKey, originalBuffer, { access: 'public', contentType: 'image/png' }),
    put(thumbKey, thumbBuffer, { access: 'public', contentType: 'image/png' }),
  ])

  // 4) Persist DB rows (schema-safe: includes artist, price, thumbnail)
  const created = await prisma.artwork.create({
    data: {
      title,
      style: styleKey as any,
      status: 'PUBLISHED',
      tags: [],
      artist: 'AI Studio',
      price: 0,
      thumbnail: thumbPut.url,
      assets: {
        create: [
          {
            provider: 'openai',
            prompt,
            originalUrl: origPut.url,
          },
        ],
      },
    },
    select: { id: true },
  })

  return {
    id: created.id,
    title,
    styleKey,
    originalUrl: origPut.url,
    thumbnail: thumbPut.url,
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const style = (body?.style || '').toString()
    const titles: string[] = Array.isArray(body?.titles) ? body.titles : []

    if (!style) {
      return NextResponse.json({ ok: false, error: 'Missing body.style' }, { status: 400 })
    }
    if (!titles.length) {
      return NextResponse.json({ ok: false, error: 'Provide body.titles: string[]' }, { status: 400 })
    }

    const styleKey = styleSlugToKey(style)
    const results: any[] = []

    for (const title of titles) {
      try {
        const r = await generateOne({ styleKey, title })
        results.push({ ok: true, ...r })
      } catch (e: any) {
        results.push({ ok: false, title, error: String(e?.message || e) })
      }
    }

    return NextResponse.json({ ok: true, styleKey, count: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const style = (searchParams.get('style') || '').toString()
    const count = Math.max(1, Math.min(50, parseInt(searchParams.get('count') || '5', 10)))

    if (!style) {
      return NextResponse.json({ ok: false, error: 'Missing style' }, { status: 400 })
    }

    const styleKey = styleSlugToKey(style)
    const label = styleKeyToLabel(styleKey as any)
    const titles = Array.from({ length: count }, (_, i) => `${label} Study ${i + 1}`)

    const results: any[] = []
    for (const t of titles) {
      try {
        const r = await generateOne({ styleKey, title: t })
        results.push({ ok: true, ...r })
      } catch (e: any) {
        results.push({ ok: false, title: t, error: String(e?.message || e) })
      }
    }

    return NextResponse.json({ ok: true, styleKey, count: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
