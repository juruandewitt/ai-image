import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeBlobUrl(u: string) {
  // Fix double-encoding like ...Starry%2520Harbor.... -> ...Starry%20Harbor...
  try {
    // If already decoded, decodeURIComponent will throw; so try/catch and fallback.
    const once = decodeURIComponent(u)
    return once
  } catch {
    return u
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const title  = (body?.title  ?? '').toString().trim()
    const style  = (body?.style  ?? '').toString().trim()            // e.g. 'van-gogh'
    const urlRaw = (body?.url    ?? '').toString().trim()            // public Blob URL
    const price  = Number(body?.price ?? 4900)                        // cents
    const artist = (body?.artist ?? 'AI Studio').toString()

    if (!title || !urlRaw) {
      return NextResponse.json({ ok:false, error:'Missing title or url' }, { status: 400 })
    }

    const url = normalizeBlobUrl(urlRaw)
    const styleKey = style.toUpperCase().replace(/-/g, '_')

    // Persist the artwork + first asset (match your schema: `originalUrl`, not `url`)
    const created = await prisma.artwork.create({
      data: {
        title,
        artist,                  // your schema uses `artist` (not displayArtist)
        price,
        style: styleKey as any,
        status: 'PUBLISHED',
        tags: [],
        thumbnail: url,          // use original as thumbnail for now
        assets: {
          create: [{
            provider: 'openai:gpt-image-1',
            prompt: title,
            originalUrl: url,    // IMPORTANT: field is originalUrl in your schema
          }]
        }
      },
      select: { id: true }
    })

    return NextResponse.json({ ok:true, id: created.id })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: e?.message || String(e) }, { status: 500 })
  }
}
