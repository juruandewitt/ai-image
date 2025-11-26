// app/api/generate/one/route.ts — Node runtime, longer timeout, robust timeouts/retries
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
// Allow more time than Edge (Edge ~30s). Node Serverless commonly allows up to 60s.
export const maxDuration = 60
export const dynamic = 'force-dynamic'

// Optional: pin region close to your build logs (iad1), but Node runtime may ignore this.
// export const preferredRegion = ['iad1']

type OpenAIImageResp = {
  data?: { url?: string }[]
  error?: { message?: string }
}

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
    "in Jackson Pollock’s gestural drip painting; all-over composition and dynamic splatters.",
}

function buildPrompt(title: string, styleSlug: string) {
  const base =
    "High-quality fine-art image, museum-grade rendering for large prints. Avoid text overlays and watermarks."
  const style = STYLE_PREFIX[styleSlug] ?? "master painterly style"
  return `${title}, ${style}. ${base}`
}

function pickSize(aspect?: string): '1024x1024' | '1024x1536' | '1536x1024' | 'auto' {
  if (!aspect) return '1024x1024'
  const a = aspect.toLowerCase()
  if (a === 'portrait' || a === '3:4' || a === '2:3') return '1024x1536'
  if (a === 'landscape' || a === '4:3' || a === '3:2') return '1536x1024'
  if (a === 'auto') return 'auto'
  return '1024x1024'
}

// Abortable fetch with timeout
async function fetchJSONWithTimeout(url: string, init: RequestInit, ms: number) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal })
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`Non-JSON from upstream: ${text.slice(0, 200)}`)
    }
  } finally {
    clearTimeout(t)
  }
}

// Tiny retry helper for transient upstream slowness
async function retry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 800): Promise<T> {
  let lastErr: any
  for (let i = 0; i < attempts; i++) {
    try { return await fn() } catch (e) {
      lastErr = e
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs))
    }
  }
  throw lastErr
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
    const size = pickSize(aspect)

    if (!title) return NextResponse.json({ ok: false, error: 'Missing ?title' }, { status: 400 })

    const prompt = buildPrompt(title, style)

    const data = await retry<OpenAIImageResp>(() =>
      fetchJSONWithTimeout(
        'https://api.openai.com/v1/images/generations',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt,
            size,              // '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
            // quality: 'standard', // default
          }),
          // keepalive helps on some networks
          keepalive: true,
        },
        // Give upstream up to ~55s; route has maxDuration=60s
        55_000
      ),
    )

    if (data?.error?.message) {
      return NextResponse.json({ ok: false, error: data.error.message }, { status: 502 })
    }
    const first = data?.data?.[0]?.url
    if (!first) {
      return NextResponse.json({ ok: false, error: 'No image URL returned' }, { status: 502 })
    }

    return NextResponse.json({ ok: true, url: first, title, style, size })
  } catch (e: any) {
    const msg = e?.name === 'AbortError'
      ? 'Timed out calling OpenAI (AbortError)'
      : (e?.message || String(e))
    return NextResponse.json({ ok: false, error: msg }, { status: 504 })
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
