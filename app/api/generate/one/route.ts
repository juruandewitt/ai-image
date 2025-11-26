// app/api/generate/one/route.ts — fast, URL-only version
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Bump a bit to avoid 504s; plan limits still apply
export const maxDuration = 30

// very small style->prompt helpers (tuned for masters)
const STYLE_PREFIX: Record<string, string> = {
  'van-gogh':
    "in the expressive, impasto brushwork and vibrant complementary colors of Vincent van Gogh; starry skies, swirling motion, thick paint texture, bold outlines; late 1880s Dutch Post-Impressionism.",
  'rembrandt':
    "in the dramatic chiaroscuro and warm amber light of Rembrandt; baroque realism, deep shadows, intimate portraits, textured oil paint, 17th-century Dutch Golden Age.",
  'picasso':
    "in the Cubist abstraction of Pablo Picasso; fractured planes, multiple viewpoints, geometric simplification, early 20th-century avant-garde.",
  'vermeer':
    "in the serene interior light and meticulous realism of Johannes Vermeer; soft daylight, camera-obscura clarity, Delft interiors.",
  'monet':
    "in the luminous, broken color and plein-air brushwork of Claude Monet; Impressionist atmosphere, shimmering water reflections.",
  'michelangelo':
    "in the heroic Renaissance anatomy and sculptural forms of Michelangelo; fresco/oil feel, muscular figures, High Renaissance tonality.",
  'dali':
    "in the surreal dreamscapes of Salvador Dalí; long shadows, hyper-real textures, melting forms, meticulous detail.",
  'caravaggio':
    "in the tenebrism and visceral realism of Caravaggio; strong spotlighting, deep blacks, Baroque drama.",
  'da-vinci':
    "in the sfumato, subtle gradations and proportional harmony of Leonardo da Vinci; High Renaissance realism.",
  'pollock':
    "in the gestural drip painting of Jackson Pollock; all-over composition, splatters, 1940s Abstract Expressionism."
}

function buildPrompt(title: string, styleSlug: string) {
  const base =
    "High-quality fine-art image, museum-grade digital rendering suitable for large prints. Avoid text overlays and watermarks."
  const style = STYLE_PREFIX[styleSlug] ?? "master painterly style"
  return `${title}, ${style}. ${base}`
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const style = (url.searchParams.get('style') || '').toLowerCase().trim()
    const title = (url.searchParams.get('title') || '').trim()
    if (!title) {
      return NextResponse.json({ ok: false, error: 'Missing ?title' }, { status: 400 })
    }
    const prompt = buildPrompt(title, style)

    const { OpenAI } = await import('openai')
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    // Use a smaller size for speed; you can raise to 1024 later
    const resp = await client.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '512x512'
    })

    const first = resp.data?.[0]
    if (!first?.url) {
      return NextResponse.json({ ok: false, error: 'No image URL returned' }, { status: 502 })
    }

    // Fast path: return the OpenAI URL directly (no Blob upload)
    return NextResponse.json({
      ok: true,
      url: first.url,
      title,
      style
    })
  } catch (e: any) {
    console.error('[generate/one] error', e)
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// Optional POST that forwards to GET for dashboard compatibility
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const style = encodeURIComponent((body?.style || '').toString())
  const title = encodeURIComponent((body?.title || '').toString())
  const next = new URL(`/api/generate/one?style=${style}&title=${title}`, 'http://localhost')
  // call GET handler
  return GET(new Request(next.toString()))
}
