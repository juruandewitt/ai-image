// app/api/generate/one/route.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import sharp from 'sharp'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

type OpenAIImageItem = { url?: string; b64_json?: string }
type OpenAIImageResp = { data?: OpenAIImageItem[]; error?: { message?: string } }

const STYLE_PREFIX: Record<string, string> = {
  'van-gogh':
    "in the expressive, impasto brushwork and vibrant complementary colors of Vincent van Gogh; swirling starfields, thick paint texture, bold outlines; late 1880s Post-Impressionism.",
  rembrandt:
    "in the dramatic chiaroscuro and warm amber light of Rembrandt; baroque realism, deep shadows.",
  picasso:
    "in early Cubist abstraction of Pablo Picasso; fractured planes, multiple viewpoints, geometric simplification.",
  vermeer:
    "in the serene, window-lit interiors of Johannes Vermeer; soft daylight, Delft realism.",
  monet:
    "in Claude Monet’s luminous, broken color and plein-air atmosphere; shimmering water reflections.",
  michelangelo:
    "in heroic Renaissance anatomy and sculptural forms of Michelangelo; fresco/oil feel.",
  dali:
    "in Salvador Dalí’s surreal dreamscapes; long shadows, hyper-real textures, melting forms.",
  caravaggio:
    "in Caravaggio’s tenebrism and visceral realism; strong spotlighting, deep blacks.",
  'da-vinci':
    "in Leonardo da Vinci’s sfumato and proportional harmony; subtle gradations, High Renaissance realism.",
  pollock:
    "in Jackson Pollock’s gestural drip painting; all-over composition and dynamic splatters.",
}

function buildPrompt(title: string, styleSlug: string) {
  const base =
    "High-quality fine-art image for large prints. Avoid text overlays and watermarks."
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

export async function GET(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY is missing' }, { status: 500 })
  }

  try {
    const u = new URL(req.url)
    const style = (u.searchParams.get('style') || '').toLowerCase().trim()
    const title = (u.searchParams.get('title') || '').trim()
    const aspect = (u.searchParams.get('aspect') || '').trim()
    const size = pickSize(aspect)
    if (!title) return NextResponse.json({ ok: false, error: 'Missing ?title' }, { status: 400 })

    const prompt = buildPrompt(title, style)

    // Call OpenAI Images REST endpoint (returns items that may contain url or b64_json)
    const data = (await fetchJSONWithTimeout(
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
          size, // '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
        }),
        keepalive: true,
      },
      55_000
    )) as OpenAIImageResp

    if (data?.error?.message) {
      return NextResponse.json({ ok: false, error: data.error.message }, { status: 502 })
    }

    const item = data?.data?.[0]
    if (!item) {
      return NextResponse.json({ ok: false, error: 'No image returned' }, { status: 502 })
    }

    // Case 1: we got a URL directly
    if (item.url) {
      return NextResponse.json({ ok: true, url: item.url, title, style, size })
    }

    // Case 2: we got b64_json -> convert to PNG buffer, upload to Blob, return Blob URL
    if (item.b64_json) {
      const raw = Buffer.from(item.b64_json, 'base64')
      const png = await sharp(raw).png().toBuffer()
      const filename = `art/${Date.now()}-${encodeURIComponent(title).slice(0, 60)}.png`
      const res = await put(filename, png, {
        access: 'public',
        contentType: 'image/png',
      })
      return NextResponse.json({ ok: true, url: res.url, title, style, size })
    }

    return NextResponse.json({ ok: false, error: 'No image URL or b64_json returned' }, { status: 502 })
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
