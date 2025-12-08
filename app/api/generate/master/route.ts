// app/api/generate/master/route.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'
import { OpenAI } from 'openai'

export const runtime = 'nodejs'

// ---- Style helpers (self-contained so no missing exports) ----
const STYLE_LABELS = {
  'VAN_GOGH': 'Vincent van Gogh',
  'SALVADOR_DALI': 'Salvador Dalí',
  'JACKSON_POLLOCK': 'Jackson Pollock',
  'CLAUDE_MONET': 'Claude Monet',
  'PABLO_PICASSO': 'Pablo Picasso',
  'LEONARDO_DA_VINCI': 'Leonardo da Vinci',
  'JOHANNES_VERMEER': 'Johannes Vermeer',
  'MICHELANGELO': 'Michelangelo',
} as const
type StyleKey = keyof typeof STYLE_LABELS

function styleSlugToKey(slug: string | null): StyleKey {
  const s = (slug || '').toLowerCase()
  if (s === 'van-gogh') return 'VAN_GOGH'
  if (s === 'dali' || s === 'salvador-dali') return 'SALVADOR_DALI'
  if (s === 'jackson-pollock' || s === 'pollock') return 'JACKSON_POLLOCK'
  if (s === 'claude-monet' || s === 'monet') return 'CLAUDE_MONET'
  if (s === 'pablo-picasso' || s === 'picasso') return 'PABLO_PICASSO'
  if (s === 'leonardo-da-vinci' || s === 'da-vinci') return 'LEONARDO_DA_VINCI'
  if (s === 'johannes-vermeer' || s === 'vermeer') return 'JOHANNES_VERMEER'
  if (s === 'michelangelo') return 'MICHELANGELO'
  // default so we never return null
  return 'VAN_GOGH'
}

function buildStylePrompt(styleKey: StyleKey, title: string): string {
  const label = STYLE_LABELS[styleKey]
  const rules =
    styleKey === 'VAN_GOGH'
      ? `Impasto textures, dynamic brushwork, bold complementary colors, swirling skies—evoke ${label} without copying any known painting.`
    : styleKey === 'SALVADOR_DALI'
      ? `Dreamlike, surreal juxtapositions, meticulous rendering, elongated shadows, and uncanny perspectives inspired by ${label}.`
    : styleKey === 'JACKSON_POLLOCK'
      ? `Action painting: layered drips, splatters, and gestural energy reminiscent of ${label}, with depth and rhythm.`
    : styleKey === 'CLAUDE_MONET'
      ? `Soft broken color, atmospheric light, shimmering water and foliage—Impressionist optics inspired by ${label}.`
    : styleKey === 'PABLO_PICASSO'
      ? `Cubist fragmentation, multiple viewpoints, geometric simplification, and bold contrasts in the spirit of ${label}.`
    : styleKey === 'LEONARDO_DA_VINCI'
      ? `Renaissance composition, sfumato transitions, anatomical sensitivity, and architectural balance inspired by ${label}.`
    : styleKey === 'JOHANNES_VERMEER'
      ? `Quiet domestic scene, lens-like lighting, subtle color, and precise realism inspired by ${label}.`
    : /* MICHELANGELO */ 
      `High Renaissance monumentality, powerful anatomy, sculptural forms, and dynamic poses reminiscent of ${label}.`

  return `${title}. Create an original composition using these stylistic characteristics: ${rules} Avoid copying any specific existing artwork; produce a new scene inspired by the traits only.`
}

// ---- Core generator (kept local to avoid import issues) ----
async function generateAndPersist(styleKey: StyleKey, title: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const prompt = buildStylePrompt(styleKey, title)

  // 1) Generate with OpenAI Images API
  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024', // supported: 1024x1024, 1024x1536, 1536x1024, auto
  })

  const url = resp.data?.[0]?.url
  if (!url) throw new Error('No image URL returned from OpenAI')

  // Fetch the image into a Buffer
  const fetchRes = await fetch(url)
  if (!fetchRes.ok) throw new Error(`Image fetch failed: ${fetchRes.status}`)
  const buf = Buffer.from(await fetchRes.arrayBuffer())

  // 2) Upload to Vercel Blob (public)
  const filename = `art/${Date.now()}-${encodeURIComponent(title)}.png`
  const { url: blobUrl } = await put(filename, buf, {
    access: 'public',
    contentType: 'image/png',
  })

  // 3) Persist DB rows (align with your schema: requires price, thumbnail, artist)
  const artwork = await prisma.artwork.create({
    data: {
      title,
      style: styleKey as any,
      status: 'PUBLISHED',
      tags: [],
      price: 0,                 // required by your schema
      thumbnail: blobUrl,       // required by your schema
      artist: 'AI Studio',      // required by your schema
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

  return { id: artwork.id, blobUrl }
}

// ---- HTTP handler ----
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const styleParam = searchParams.get('style')
    const titleParam = searchParams.get('title')

    if (!titleParam || !titleParam.trim()) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?title=...' },
        { status: 400 }
      )
    }

    const styleKey = styleSlugToKey(styleParam)
    const result = await generateAndPersist(styleKey, titleParam.trim())

    return NextResponse.json({
      ok: true,
      style: styleKey,
      title: titleParam.trim(),
      url: result.blobUrl,
      id: result.id,
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    )
  }
}
