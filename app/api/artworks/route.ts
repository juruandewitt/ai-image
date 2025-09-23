import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.artwork.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const form = await req.formData()
  const title = String(form.get('title') || '')
  const price = Number(form.get('price') || 0)
  const thumbnail = String(form.get('thumbnail') || '')
  const artist = String(form.get('artist') || '')
  const tags = String(form.get('tags') || '').split(',').map(t=>t.trim()).filter(Boolean)

  if (!title || !price || !thumbnail || !artist) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const created = await prisma.artwork.create({ data: { title, price, thumbnail, artist, tags } })
  return NextResponse.redirect(new URL(`/artwork/${created.id}`, req.url), { status: 303 })
}
