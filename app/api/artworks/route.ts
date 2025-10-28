import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const form = await req.formData()
  const title = String(form.get('title') || '')
  const artist = String(form.get('artist') || '')
  const price = Number(form.get('price') || 0)
  const thumbnail = String(form.get('thumbnail') || '')
  const tagsRaw = String(form.get('tags') || '')
  const category = String(form.get('category') || 'ABSTRACT') as any

  if (!title || !artist || !price || !thumbnail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : []
  await prisma.artwork.create({ data: { title, artist, price, thumbnail, tags, category, status: 'PUBLISHED' } })
  return NextResponse.json({ ok: true })
}
