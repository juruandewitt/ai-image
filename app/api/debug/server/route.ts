// app/api/debug/server/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Quick env check
    const env = {
      HAS_DATABASE_URL: !!process.env.DATABASE_URL,
      HAS_OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
      HAS_BLOB_RW_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || null,
    }

    // Simple DB check: fetch a few latest artworks and include first asset url
    const rows = await prisma.artwork.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        style: true,
        tags: true,
        assets: {
          take: 1,
          orderBy: { createdAt: 'asc' },
          select: { originalUrl: true },
        },
      },
    })

    const sample = rows.map((r) => ({
      id: r.id,
      title: r.title,
      style: r.style,
      tags: r.tags,
      asset0: r.assets?.[0]?.originalUrl ?? null,
    }))

    return NextResponse.json({
      ok: true,
      env,
      count: rows.length,
      sample,
    })
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    )
  }
}
