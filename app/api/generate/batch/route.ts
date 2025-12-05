import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { OpenAI } from 'openai'
import { prisma } from '@/lib/prisma'
import { styleSlugToKey, styleKeyToLabel } from '@/lib/styles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Local style-aware prompt builder (do NOT import from lib/styles)
function buildStylePrompt(styleKey: string, title: string) {
  const label = styleKeyToLabel ? styleKeyToLabel(styleKey as any) : styleKey

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
      : `Coherent, gallery-worthy fine-art piece that reflects core stylistic traits of ${label} without copying any specific work.`

  return `${title}. Create an original artwork in the style characteristics described: ${rules} Avoid copying any specific copyrighted work; generate a new composition inspired by those stylistic traits.`
}

async function generateAndPersist(styleKey: string, title: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = buildStylePrompt(styleKey, title)

  // 1) Generate with OpenAI Images
  const img = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  })
  const url = img?.data?.[0]?.url
  if (!url) throw new Error('No image URL returned from OpenAI')

  // 2) Download original
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch generated image: ${res.status}`)
  const original = Buffer.from(await res.arrayBuffer())

  // 3) Make thumbnail
  const thumb = await sharp(original).resize(600).png({ quality: 90 }).toBuffer()

  // 4) Upload both to Blob
  const ts = Date.now()
  const safe = encodeURIComponent(title)
  const origKey = `art/${ts}-${safe}.png`
  const thumbKey = `art/${ts}-${safe}-thumb.png`

  const [origPut, thumbPut] = await Promise.all([
    put(origKey, original, { access: 'public', contentType: 'image/png' }),
    put(thumbKey, thumb, { access: 'public', contentType: 'image/png' }),
  ])

  // 5) Persist DB (schema-safe: includes artist, price, thumbnail)
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
          { provider: 'openai', prompt, originalUrl: origPut.url },
        ],
      },
    },
    select: { id: true },
  })

  return { id: created.id, originalUrl: origPut.url, thumbnail: thumbPut.url }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const style = (searchParams.get('style') || '').toString()
    const title = (searchParams.get('title') || '').toString()

    if (!style) return NextResponse.json({ ok: false, error: 'Missing ?style' }, { status: 400 })
    if (!title) return NextResponse.json({ ok: false, error: 'Missing ?title' }, { status: 400 })

    const styleKey = styleSlugToKey(style)
    const result = await generateAndPersist(styleKey, title)

    return NextResponse.json({ ok: true, style: styleKey, title, ...result })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
