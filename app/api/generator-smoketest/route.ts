
import { NextResponse } from 'next/server'
import { createArtworkWithVariants } from '@/lib/generator'
export const runtime = 'nodejs'
export async function POST() {
  try {
    const id = await createArtworkWithVariants({
      title: 'Generator Smoketest',
      displayArtist: 'AI Studio',
      style: 'VAN_GOGH',
      tags: ['smoketest','gen'],
      prompt: 'A dreamy night cityscape with swirling skies, painterly texture, in the style of van gogh',
      provider: 'openai'
    })
    return NextResponse.json({ ok: true, id })
  } catch (e:any) {
    console.error('GENERATOR_SMOKETEST_FAILED', e)
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
