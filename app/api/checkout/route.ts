import { NextResponse } from 'next/server'
export async function POST() {
  // Placeholder: wire to Stripe later
  return NextResponse.json({ ok: true, message: 'Checkout stubbed in dev.' })
}
