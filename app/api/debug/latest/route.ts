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

    // Some schemas use `originalUrl` instead of `url` on Asset. Normalize here.
    const sample = rows.map((r: any) => {
      const a0 = r.assets?.[0] ?? null
      const firstUrl = a0?.originalUrl ?? a0?.url ?? null
      return {
        id: r.id,
        title: r.title,
        style: r.style,
        tags: r.tags,
        asset0: firstUrl
      }
    })

    return NextResponse.json({ ok: true, sample })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
