import { NextResponse } from 'next/server'
import { createArtworkWithVariants, crossStylePrompts, randomStylePrompts, PROVIDER } from '@/lib/generator'

export const runtime = 'nodejs' // need Node for sharp & blob

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const mode = body.mode || 'cross' // 'cross' | 'random'
    const limit = Number(body.limit || 20) // safety
    const provider = PROVIDER

    const batch = mode === 'cross' ? crossStylePrompts() : randomStylePrompts(50)
    const selected = batch.slice(0, limit)

    const results: any[] = []
    for (const item of selected) {
      const id = await createArtworkWithVariants({
        title: item.title,
        displayArtist: 'AI Studio',
        style: item.style,
        prompt: item.prompt,
        provider,
      })
      results.push({ id, title: item.title })
    }

    return NextResponse.json({ ok: true, created: results.length, items: results })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ ok: false, error: e?.message || 'generation failed' }, { status: 500 })
  }
}
