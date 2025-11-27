import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await prisma.artwork.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        style: true,
        tags: true,
        createdAt: true,
        assets: { take: 1, orderBy: { createdAt: 'asc' }, select: { originalUrl: true } },
      },
    })
    return NextResponse.json({
      ok: true,
      count: rows.length,
      withImage: rows.filter(r => r.assets?.[0]?.originalUrl).length,
      sample: rows.map(r => ({
        id: r.id,
        title: r.title,
        style: r.style,
        tags: r.tags,
        asset0: r.assets?.[0]?.originalUrl ?? null,
      })),
    })
  } catch (e:any) {
    return NextResponse.json({ ok:false, error: String(e) }, { status: 500 })
  }
}
