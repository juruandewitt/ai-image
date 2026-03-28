import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const QUALITY_CONFIG: Record<
  string,
  { label: string; amount: number; description: string }
> = {
  high: {
    label: 'High Resolution',
    amount: 999,
    description: 'Great for personal prints and digital use',
  },
  very_high: {
    label: 'Very High Resolution',
    amount: 1999,
    description: 'Ideal for larger prints and premium display',
  },
  ultra: {
    label: 'Ultra High Resolution',
    amount: 2999,
    description: 'Best for premium commercial-grade output',
  },
}

function isStableBlobSrc(value?: string | null) {
  if (!value) return false
  return value.toLowerCase().includes('.public.blob.vercel-storage.com/')
}

function pickStableImgSrc(a: {
  thumbnail?: string | null
  assets?: { originalUrl: string | null }[]
}) {
  const stableAsset =
    a.assets?.find((x) => isStableBlobSrc(x.originalUrl))?.originalUrl || null

  const stableThumbnail = isStableBlobSrc(a.thumbnail) ? a.thumbnail : null

  return stableAsset || stableThumbnail || null
}

export async function POST(request: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!stripeSecretKey) {
      return NextResponse.json(
        { ok: false, error: 'Missing STRIPE_SECRET_KEY' },
        { status: 500 }
      )
    }

    if (!siteUrl) {
      return NextResponse.json(
        { ok: false, error: 'Missing NEXT_PUBLIC_SITE_URL' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const artworkId = String(body?.artworkId || '').trim()
    const quality = String(body?.quality || '').trim()

    if (!artworkId) {
      return NextResponse.json(
        { ok: false, error: 'Missing artworkId' },
        { status: 400 }
      )
    }

    if (!QUALITY_CONFIG[quality]) {
      return NextResponse.json(
        { ok: false, error: 'Invalid quality' },
        { status: 400 }
      )
    }

    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: {
        id: true,
        title: true,
        artist: true,
        style: true,
        thumbnail: true,
        assets: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            originalUrl: true,
          },
        },
      },
    })

    if (!artwork) {
      return NextResponse.json(
        { ok: false, error: 'Artwork not found' },
        { status: 404 }
      )
    }

    const imageUrl = pickStableImgSrc(artwork)
    const qualityConfig = QUALITY_CONFIG[quality]

    const params = new URLSearchParams()
    params.set('mode', 'payment')
    params.set(
      'success_url',
      `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    )
    params.set('cancel_url', `${siteUrl}/artwork/${artwork.id}?canceled=1`)

    params.set('line_items[0][quantity]', '1')
    params.set('line_items[0][price_data][currency]', 'usd')
    params.set(
      'line_items[0][price_data][unit_amount]',
      String(qualityConfig.amount)
    )
    params.set(
      'line_items[0][price_data][product_data][name]',
      `${artwork.title} — ${qualityConfig.label}`
    )
    params.set(
      'line_items[0][price_data][product_data][description]',
      `${artwork.artist || artwork.style} • ${qualityConfig.description}`
    )

    if (imageUrl) {
      params.set('line_items[0][price_data][product_data][images][0]', imageUrl)
    }

    params.set('metadata[artworkId]', artwork.id)
    params.set('metadata[quality]', quality)
    params.set('metadata[artworkTitle]', artwork.title)
    params.set('metadata[artist]', artwork.artist || String(artwork.style))

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    })

    const stripeData = await stripeRes.json()

    if (!stripeRes.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: stripeData?.error?.message || 'Stripe session creation failed',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      url: stripeData.url,
    })
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
