import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const form = await req.formData()
  const artworkId = String(form.get('artworkId') || '')
  const format = String(form.get('format') || '')
  const resolution = Number(form.get('resolution') || 0)

  const variant = await prisma.variant.findFirst({
    where: { asset: { artworkId }, format: format as any, width: resolution }
  })
  if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })

  // TODO: integrate Stripe here; for now we respond with the calculated price
  return NextResponse.json({ ok: true, amount: variant.priceCents, url: variant.url })
}
