// app/api/generate/batch/route.ts (GET handler only)
import { NextResponse } from 'next/server'
import { styleSlugToKey } from '@/lib/styles'

// ...keep your other imports and code above...

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const styleParam = (searchParams.get('style') || '').trim()
    const title = (searchParams.get('title') || '').trim()

    if (!styleParam) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?style' },
        { status: 400 }
      )
    }
    if (!title) {
      return NextResponse.json(
        { ok: false, error: 'Missing ?title' },
        { status: 400 }
      )
    }

    const styleKey = styleSlugToKey(styleParam)
    if (!styleKey) {
      return NextResponse.json(
        { ok: false, error: `Unknown style '${styleParam}'` },
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
