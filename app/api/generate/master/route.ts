import { NextResponse } from 'next/server'
import { styleSlugToKey } from '@/lib/styles'
// keep your other imports (OpenAI, prisma, put, sharp, generateAndPersist, etc.)

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // Coerce to string and validate
    const style = (searchParams.get('style') ?? '').trim()
    const title = (searchParams.get('title') ?? '').trim()

    if (!style) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?style query param' },
        { status: 400 }
      )
    }
    if (!title) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?title query param' },
        { status: 400 }
      )
    }

    const styleKey = styleSlugToKey(style)
    if (!styleKey) {
      return NextResponse.json(
        { ok: false, error: `Unknown style slug: "${style}"` },
        { status: 400 }
      )
    }

    // NOTE: generateAndPersist must accept (styleKey: string, title: string)
    const result = await generateAndPersist(styleKey, title)

    return NextResponse.json({ ok: true, style: styleKey, title, ...result })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    )
  }
}
