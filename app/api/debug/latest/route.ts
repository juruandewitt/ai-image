import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const rows = await prisma.artwork.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { assets: { orderBy: { createdAt: 'asc' } } }
    })
    return NextResponse.json({
      ok:true,
      sample: rows.map(r => ({
        id: r.id, title: r.title, style: r.style, tags: r.tags,
        asset0: r.assets?.[0]?.url ?? null
      }))
    })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:String(e) }, { status: 500 })
  }
}
