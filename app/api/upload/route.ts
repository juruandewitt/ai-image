import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs' // sharp/file handling etc.

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const title = String(form.get('title') || '')
    const artist = String(form.get('artist') || '')
    const price = Number(form.get('price') || 0)
    const category = String(form.get('category') || 'ABSTRACT') as any
    const style = String(form.get('style') || 'VAN_GOGH') as any
    const tagsRaw = String(form.get('tags') || '')
    const featured = String(form.get('featured') || '') === 'on'

    if (!file || !title || !artist || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Vercel Blob (public)
    const objectName = `art/${Date.now()}-${file.name.replace(/\s+/g,'_')}`
    const blob = await put(objectName, buffer, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
      addRandomSuffix: true,
      token: process.env.BLOB_READ_WRITE_TOKEN, // IMPORTANT
    })

    const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : []

    // Save to DB (thumbnail points at Blob URL)
    const a = await prisma.artwork.create({
      data: {
        title, artist, price, category, style, tags,
        thumbnail: blob.url,
        status: 'PUBLISHED',
        featured,
      }
    })

    return NextResponse.json({ ok: true, id: a.id, url: blob.url })
  } catch (err: any) {
    console.error('upload error', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
