
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const total = await prisma.artwork.count()
    const latest = await prisma.artwork.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id:true, title:true, artist:true, status:true, createdAt:true, thumbnail:true }
    })
    return NextResponse.json({ ok: true, total, latest })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
