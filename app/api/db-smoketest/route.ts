
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
export const runtime = 'nodejs'
export async function GET() {
  try {
    const a = await prisma.artwork.create({
      data: {
        title: 'DB Smoketest',
        artist: 'System',
        price: 1900,
        category: 'ABSTRACT',
        status: 'PUBLISHED',
        featured: false,
        style: 'VAN_GOGH',
        tags: ['smoketest'],
        // use a public placeholder so you can see it instantly
        thumbnail: 'https://picsum.photos/seed/dbtest/1024/1024'
      }
    })
    return NextResponse.json({ ok: true, id: a.id })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 })
  }
}
