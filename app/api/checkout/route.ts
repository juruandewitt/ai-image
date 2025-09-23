import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  const form = await req.formData()
  const artworkId = String(form.get('artworkId') || '')
  const title = String(form.get('title') || 'Artwork')
  const amount = Number(form.get('amount') || 0)
  if (!artworkId || !amount) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  await prisma.order.create({ data: { artworkId, amount } })

  if (env.STRIPE_SECRET_KEY) {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: amount, product_data: { name: title } } }],
      success_url: `${env.SITE_URL}/checkout/success`,
      cancel_url: `${env.SITE_URL}/explore`,
    })
    return NextResponse.redirect(session.url!, { status: 303 })
  }

  return NextResponse.redirect(new URL('/checkout/success', env.SITE_URL), { status: 303 })
}
