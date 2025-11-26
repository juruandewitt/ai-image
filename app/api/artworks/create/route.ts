import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const title = (body?.title ?? '').toString().trim()
    const style = (body?.style ?? '').toString().trim()   // e.g. 'van-gogh'
    const url   = (body?.url   ?? '').toString().trim()   // public Blob URL
    const price = Number(body?.price ?? 4900)              // cents (49.00)
    const artist = (body?.artist ?? 'AI Studio').toString()

    if (!title || !url) {
      return NextResponse.json({ ok:false, error:'Missing title or url' }, { status: 400 })
    }

    // Your enum in Prisma is uppercase with underscores, we normalize:
    const styleKey = style.toUpperCase().replace(/-/g, '_')

    const created = await prisma.artwork.create({
      data: {
        title,
        artist,                 // <-- field names align with your schema (no displayArtist)
        price,
        style: styleKey as any, // Prisma enum
        status: 'PUBLISHED',
        tags: [],
        thumbnail: url,         // simple: use original as thumbnail for now
        assets: {
          create: [{
            provider: 'openai:gpt-image-1',
            prompt: title,
            originalUrl: url,
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
