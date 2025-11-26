// app/api/generate/one/route.ts — Edge, longer budget, region hint, quick timeout
import { NextResponse } from 'next/server'

export const runtime = 'edge'
// Ask Vercel for the longest Edge budget (Hobby/Pro allow up to ~30s)
export const maxDuration = 30
// Hint the closest region to reduce round trips (your builds show iad1)
export const preferredRegion = ['iad1']

export const dynamic = 'force-dynamic'

const STYLE_PREFIX: Record<string, string> = {
  'van-gogh':
    "in the expressive, impasto brushwork and vibrant complementary colors of Vincent van Gogh; swirling starfields, thick paint texture, bold outlines; late 1880s Post-Impressionism.",
  'rembrandt':
    "in the dramatic chiaroscuro and warm amber light of Rembrandt; baroque realism, intimate portraits, deep shadows.",
  'picasso':
    "in early Cubist abstraction of Pablo Picasso; fractured planes, multiple viewpoints, geometric simplification.",
  'vermeer':
    "in the serene, window-lit interiors of Johannes Vermeer; soft daylight, camera-obscura clarity, Delft realism.",
  'monet':
    "in Claude Monet’s luminous, broken color and plein-air atmosphere; shimmering water reflections.",
  'michelangelo':
    "in the heroic Renaissance anatomy and sculptural forms of Michelangelo; fresco/oil feel, High Renaissance tonality.",
  'dali':
    "in Salvador Dalí’s surreal dreamscapes; long shadows, hyper-real textures, melting forms, meticulous detail.",
  'caravaggio':
    "in Caravaggio’s tenebrism and visceral realism; strong spotlighting, deep blacks, baroque drama.",
  'da-vinci':
    "in Leonardo da Vinci’s sfumato, subtle gradations and proportional harmony; High Renaissance realism.",
  'pollock':
    "in Jackson Pollock’s gestural drip painting; all-over composition and dynamic splatters."
}

function buildPrompt(title: string, styleSlug: string) {
  const base =
    "High-quality fine-art image, museum-grade rendering for large prints. Avoid text overlays and watermarks."
  const style = STYLE_PREFIX[styleSlug] ?? "master painterly style"
  return `${title}, ${style}. ${base}`
}

type OpenAIImageResp = {
  data?: { url?: string }[]
  error?: { message?: string }
}

function pickSize(aspect?: string): '1024x1024' | '1024x1536' | '1536x1024' | 'auto' {
  if (!aspect) return '1024x1024'
  const a = aspect.toLowerCase()
  if (a === 'portrait' || a === '3:4' || a === '2:3') return '1024x1536'
  if (a === 'landscape' || a === '4:3' || a === '3:2') return '1536x1024'
  if (a === 'auto') return 'auto'
  return '1024x1024'
}

// Promise.race timeout helper (Edge-safe)
async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  const to = new Promise<T>((_, rej) =>
    setTimeout(() => rej(new Error(`client-timeout-after-${ms}ms`)), ms)
  ) as Promise<T>
  return Promise.race([p, to])
}

export async function GET(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY is missing' }, { status: 500 })
  }

  try {
    const url = new URL(req.url)
    const style = (url.searchParams.get('style') || '').toLowerCase().trim()
    const title = (url.searchParams.get('title') || '').trim()
    const aspect = (url.searchParams.get('aspect') || '').trim()
    if (!title) return NextResponse.json({ ok: false, error: 'Missing ?title' }, { status: 400 })

    const prompt = buildPrompt(title, style)
    const size = pickSize(aspect)

    const openaiCall = fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        size, // '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
      }),
      // A short keepalive reduces tail risk on slow networks
      keepalive: true
    }).then(r => r.json() as Promise<OpenAIImageResp>)

    // Cap total time spent waiting on OpenAI to ~25s (under Edge budget)
    const data = await withTimeout(openaiCall, 25_000)

    if (data?.error?.message) {
      return NextResponse.json({ ok: false, error: data.error.message }, { status: 502 })
    }
    const first = data?.data?.[0]?.url
    if (!first) {
      return NextResponse.json({ ok: false, error: 'No image URL returned' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, url: first, title, style, size })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const style = encodeURIComponent((body?.style || '').toString())
  const title = encodeURIComponent((body?.title || '').toString())
  const aspect = encodeURIComponent((body?.aspect || '').toString())
  const next = new URL(`/api/generate/one?style=${style}&title=${title}&aspect=${aspect}`, 'http://localhost')
  return GET(new Request(next.toString()))
}
