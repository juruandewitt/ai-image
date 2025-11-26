// app/api/debug/fix-missing-assets/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // We'll use your deployed site's logo as a safe placeholder image.
    // It already exists (Navbar loads /logo.png).
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      'https://ai-image-gallery-iota.vercel.app'
    const placeholderUrl = `${siteUrl}/logo.png`

    // Find artworks that have ZERO assets
    const artworks = await prisma.artwork.findMany({
      where: { assets: { none: {} } },
      select: { id: true, title: true },
      take: 100, // safety limit
    })

    let created = 0

    for (const a of artworks) {
      await prisma.asset.create({
        data: {
          artworkId: a.id,
          provider: 'PLACEHOLDER',
          prompt: 'Autofill placeholder until a real asset is generated',
          originalUrl: placeholderUrl,
        },
      })
      created++
    }

    return NextResponse.json({
      ok: true,
      inspected: artworks.length,
      created,
      placeholderUrl,
      note:
        'Placeholders created only for artworks with zero assets. Real generator can overwrite by adding more assets later.',
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
