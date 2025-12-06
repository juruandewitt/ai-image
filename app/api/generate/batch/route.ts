// app/api/generate/master/route.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { OpenAI } from 'openai'
import { prisma } from '@/lib/prisma'
import { styleSlugToKey, styleKeyToLabel } from '@/lib/styles'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Keep this local — do NOT import from '@/lib/styles'
function buildStylePrompt(styleKey: string, title: string) {
  const label = styleKeyToLabel ? styleKeyToLabel(styleKey as any) : styleKey

  const rules =
    styleKey === 'VAN_GOGH'
      ? `Post-Impressionist oil painting with thick impasto brushstrokes, vivid complementary colors, swirling energetic skies, expressive texture reminiscent of ${label}.`
      : styleKey === 'DALI'
      ? `Surrealist composition with dreamlike juxtapositions, smooth gradients, elongated forms, crisp shadows, meticulous classical rendering reminiscent of ${label}.`
      : styleKey === 'POLLOCK'
      ? `Abstract Expressionist drip painting with layered splatters, dynamic motion, dense overlapping strokes, high-contrast rhythm reminiscent of ${label}.`
      : styleKey === 'VERMEER'
      ? `Dutch Golden Age interior with soft daylight, precise perspective, calm tonality, delicate highlights reminiscent of ${label}.`
      : styleKey === 'MONET'
      ? `Impressionist plein-air palette, soft edges, optical color mixing, shimmering light on water and foliage reminiscent of ${label}.`
      : styleKey === 'PICASSO'
      ? `Cubist fragmentation with geometric planes, multiple viewpoints, muted earth palette, assertive linework reminiscent of ${label}.`
      : styleKey === 'REMBRANDT'
      ? `Baroque chiaroscuro, dramatic contrast, warm earth palette, painterly realism, rich textures reminiscent of ${label}.`
      : styleKey === 'CARAVAGGIO'
      ? `Baroque realism with intense chiaroscuro, theatrical lighting, naturalistic figures, dramatic staging reminiscent of ${label}.`
      : styleKey === 'DA_VINCI'
      ? `High Renaissance balance with sfumato, anatomical fidelity, atmospheric depth reminiscent of ${label}.`
      : styleKey === 'MICHELANGELO'
      ? `High Renaissance / Mannerist monumentality, powerful anatomy, sculptural forms, dynamic poses reminiscent of ${label}.`
      : `Coherent fine-art work reflecting core stylistic traits of ${label} (do not copy any single copyrighted work).`

  return `${title}. Create an original artwork using these style characteristics: ${rules} Avoid copying any specific copyrighted work; generate a new composition inspired by the traits.`
}

async function generateAndPersist(styleKey: string, title: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = buildStylePrompt(styleKey, title)

  // 1) Generate image
  const gen = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  })
  const url = gen?.data?.[0]?.url
  if (!url) throw new Error('No image URL returned from OpenAI')

  // 2) Fetch original
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch generated image: ${res.status}`)
  const original = Buffer.from(await res.arrayBuffer())

  // 3) Thumbnail
  const thumb = await sharp(original).resize(600).png({ quality: 90 }).toBuffer()

  // 4) Upload to Blob
  const ts = Date.now()
  const safe = encodeURIComponent(title)
  const origKey = `art/${ts}-${safe}.png`
  const thumbKey = `art/${ts}-${safe}-thumb.png`

  const [origPut, thumbPut] = await Promise.all([
    put(origKey, original, { access: 'public', contentType: 'image/png' }),
    put(thumbKey, thumb, { access: 'public', contentType: 'image/png' }),
  ])

  // 5) Persist DB rows (align with your schema)
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
        create: [{ provider: 'openai', prompt, originalUrl: origPut.url }],
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
