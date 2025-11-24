import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const mode = searchParams.get('mode') // 'with-assets' or null

    if (id) {
      const row = await prisma.artwork.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          tags: { set: [] } // nuke all tags; simplest way to drop 'smoketest'
        },
        include: { assets: true }
      })
      return NextResponse.json({ ok: true, changed: 1, id: row.id, assets: row.assets.length })
    }

    if (mode === 'with-assets') {
      const rows = await prisma.artwork.findMany({
        where: {
          tags: { has: 'smoketest' },
          assets: { some: {} }
        },
        select: { id: true }
      })

      let changed = 0
      for (const r of rows) {
        await prisma.artwork.update({
          where: { id: r.id },
          data: {
            status: 'PUBLISHED',
            tags: { set: [] }
          }
        })
        changed++
      }
      return NextResponse.json({ ok: true, changed })
    }

    return NextResponse.json({ ok: false, error: 'Provide ?id=ARTWORK_ID or ?mode=with-assets' }, { status: 400 })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status: 500 })
  }
}
