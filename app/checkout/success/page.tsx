export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="30"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="18"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

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

  return stableAsset || stableThumbnail || FALLBACK_DATA_URL
}

function qualityLabel(quality: string) {
  if (quality === 'high') return 'High Resolution'
  if (quality === 'very_high') return 'Very High Resolution'
  if (quality === 'ultra') return 'Ultra High Resolution'
  return quality
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  const sessionId = searchParams.session_id || ''
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY

  if (!sessionId || !stripeSecretKey) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Payment confirmation missing</h1>
        <p className="text-slate-400">
          We could not confirm your Stripe session.
        </p>
        <Link href="/" className="text-amber-400 hover:underline">
          Return home
        </Link>
      </main>
    )
  }

  const stripeRes = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
    {
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
      },
      cache: 'no-store',
    }
  )

  const session = await stripeRes.json()

  if (!stripeRes.ok) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Could not verify payment</h1>
        <p className="text-slate-400">
          {session?.error?.message || 'Stripe session lookup failed.'}
        </p>
        <Link href="/" className="text-amber-400 hover:underline">
          Return home
        </Link>
      </main>
    )
  }

  const artworkId = String(session?.metadata?.artworkId || '')
  const quality = String(session?.metadata?.quality || '')
  const isPaid = session?.payment_status === 'paid'

  if (!artworkId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Missing artwork reference</h1>
        <p className="text-slate-400">
          This checkout session does not contain an artwork reference.
        </p>
        <Link href="/" className="text-amber-400 hover:underline">
          Return home
        </Link>
      </main>
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
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 space-y-6">
        <h1 className="text-3xl font-semibold">Artwork not found</h1>
        <Link href="/" className="text-amber-400 hover:underline">
          Return home
        </Link>
      </main>
    )
  }

  const downloadUrl = pickStableImgSrc(artwork)

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">
          {isPaid ? 'Payment confirmed' : 'Payment not completed'}
        </h1>
        <p className="text-slate-400">
          {isPaid
            ? `Your ${qualityLabel(quality)} purchase is ready.`
            : 'Stripe has not marked this session as paid.'}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_380px]">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <SafeImg
            src={downloadUrl}
            fallbackSrc={FALLBACK_DATA_URL}
            alt={artwork.title}
            className="w-full h-auto max-h-[78vh] object-contain bg-slate-950"
          />
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
            <div className="text-2xl font-semibold text-slate-100">
              {artwork.title}
            </div>
            <div className="text-sm text-slate-400">
              {artwork.artist || artwork.style}
            </div>
            <div className="text-sm text-slate-500">
              Purchased tier: {qualityLabel(quality)}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
            {isPaid ? (
              <>
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full rounded-xl bg-amber-500 px-4 py-3 text-center font-medium text-black"
                >
                  Download your image
                </a>
                <p className="text-xs text-slate-500">
                  Launch version: all three quality tiers currently deliver the
                  current master image file. Multi-resolution delivery is the
                  next step.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-300">
                Payment is not marked as complete yet.
              </p>
            )}

            <Link
              href={`/artwork/${artwork.id}`}
              className="block text-sm text-amber-400 hover:underline"
            >
              Back to artwork
            </Link>
          </div>
        </aside>
      </div>
    </main>
  )
}
