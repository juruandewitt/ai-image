// app/api/generate/one/route.ts
import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'
export const maxDuration = 60
export const dynamic = 'force-dynamic'

type OpenAIImageItem = { url?: string; b64_json?: string }
type OpenAIImageResp = { data?: OpenAIImageItem[]; error?: { message?: string } }

const STYLE_PREFIX: Record<string, string> = {
  'van-gogh':
    "in the impasto brushwork and swirling night skies of Vincent van Gogh; bold, saturated complementary colors; late 1880s Post-Impressionism; no text.",
  rembrandt:
    "dramatic chiaroscuro and warm amber light of Rembrandt; baroque realism; deep shadows; no text.",
  picasso:
    "early cubist abstraction of Picasso; fractured planes, multiple viewpoints; geometric simplification; no text.",
  vermeer:
    "serene window-lit interiors of Vermeer; soft daylight; Delft realism; no text.",
  monet:
    "luminous, broken color and plein-air atmosphere of Monet; shimmering water; no text.",
  michelangelo:
    "heroic Renaissance anatomy and sculptural forms of Michelangelo; fresco/oil look; no text.",
  dali:
    "surreal dreamscapes of Salvador Dalí; long shadows, hyper-real textures; no text.",
  caravaggio:
    "tenebrism and visceral realism of Caravaggio; hard spotlight, deep blacks; no text.",
  'da-vinci':
    "sfumato and proportional harmony of Leonardo da Vinci; subtle gradations; no text.",
  pollock:
    "gestural drip painting of Jackson Pollock; dynamic all-over composition; no text.",
}

function buildPrompt(title: string, styleSlug: string) {
  const style = STYLE_PREFIX[styleSlug] ?? "museum-grade master painterly style; no text."
  return `${title}, ${style} High-quality fine-art image for large prints.`
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
  const timer = setTimeout(() => ctrl.abort(), ms)
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal })
    const text = await res.text()
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(`Non-JSON from upstream: ${text.slice(0, 180)}`)
    }
  } finally {
    clearTimeout(timer)
  }
}

async function callOpenAI(prompt: string, size: string, apiKey: string, perTryMs = 54000) {
  return (await fetchJSONWithTimeout(
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
        size,            // '1024x1024' | '1024x1536' | '1536x1024' | 'auto'
        // Let API choose format; we handle url OR b64_json below
      }),
      keepalive: true,
    },
    perTryMs
  )) as OpenAIImageResp
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

    // Try once, then one fast retry if we hit an abort/slow path.
    let data: OpenAIImageResp
    try {
      data = await callOpenAI(prompt, size, apiKey, 54000)
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        // quick retry with a slightly smaller time budget
        data = await callOpenAI(prompt, size, apiKey, 50000)
      } else {
        throw e
      }
    }

    if (data?.error?.message) {
      return NextResponse.json({ ok: false, error: data.error.message }, { status: 502 })
    }

    const item = data?.data?.[0]
    if (!item) {
      return NextResponse.json({ ok: false, error: 'No image returned' }, { status: 502 })
    }

    // Case 1: direct URL from OpenAI
    if (item.url) {
      return NextResponse.json({ ok: true, url: item.url, title, style, size })
    }

    // Case 2: b64 -> upload to Blob (no sharp involved to save time)
    if (item.b64_json) {
      const pngBuffer = Buffer.from(item.b64_json, 'base64')
      const filename = `art/${Date.now()}-${encodeURIComponent(title).slice(0, 60)}.png`
      const res = await put(filename, pngBuffer, {
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
  const url = new URL(`/api/generate/one?style=${style}&title=${title}&aspect=${aspect}`, 'http://localhost')
  return GET(new Request(url.toString()))
}
