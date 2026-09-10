export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text
        x="50%"
        y="46%"
        fill="#cbd5e1"
        font-family="sans-serif"
        font-size="30"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        Artwork
      </text>
      <text
        x="50%"
        y="54%"
        fill="#94a3b8"
        font-family="sans-serif"
        font-size="18"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        Image preview unavailable
      </text>
    </svg>`
  )

function isStableBlobSrc(
  value?: string | null
) {
  if (!value) {
    return false
  }

  return value
    .toLowerCase()
    .includes(
      '.public.blob.vercel-storage.com/'
    )
}

function pickStableImgSrc(artwork: {
  thumbnail?: string | null

  assets?: {
    originalUrl: string | null
  }[]
}) {
  const stableAsset =
    artwork.assets?.find(
      (asset) =>
        isStableBlobSrc(
          asset.originalUrl
        )
    )?.originalUrl ?? null

  const stableThumbnail =
    isStableBlobSrc(
      artwork.thumbnail
    )
      ? artwork.thumbnail
      : null

  return (
    stableAsset ||
    stableThumbnail ||
    FALLBACK_DATA_URL
  )
}

function qualityLabel(
  quality: string
) {
  if (quality === 'high') {
    return 'High Resolution'
  }

  if (quality === 'very_high') {
    return 'Very High Resolution'
  }

  if (quality === 'ultra') {
    return 'Ultra High Resolution'
  }

  return quality || 'Digital Artwork'
}

type StripeProduct = {
  id?: string

  metadata?: {
    artworkId?: string
    quality?: string
    [key: string]: string | undefined
  }
}

type StripeLineItem = {
  id?: string

  description?: string

  quantity?: number

  amount_total?: number

  currency?: string

  price?: {
    product?:
      | string
      | StripeProduct
  }
}

type PurchasedReference = {
  artworkId: string
  quality: string
  amountTotal: number | null
  currency: string
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: {
    session_id?: string
  }
}) {
  const sessionId =
    searchParams.session_id || ''

  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY

  if (
    !sessionId ||
    !stripeSecretKey
  ) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">
          Payment confirmation missing
        </h1>

        <p className="text-slate-400">
          We could not confirm your Stripe checkout session.
        </p>

        <Link
          href="/"
          className="text-amber-400 hover:underline"
        >
          Return home
        </Link>
      </main>
    )
  }

  /*
   * First retrieve the Stripe Checkout Session itself.
   */
  const sessionResponse =
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(
        sessionId
      )}`,
      {
        headers: {
          Authorization:
            `Bearer ${stripeSecretKey}`,
        },

        cache: 'no-store',
      }
    )

  const session =
    await sessionResponse.json()

  if (!sessionResponse.ok) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">
          Could not verify payment
        </h1>

        <p className="text-slate-400">
          {session?.error?.message ||
            'Stripe session lookup failed.'}
        </p>

        <Link
          href="/"
          className="text-amber-400 hover:underline"
        >
          Return home
        </Link>
      </main>
    )
  }

  const isPaid =
    session?.payment_status ===
    'paid'

  /*
   * Retrieve ALL line items from the Checkout Session.
   *
   * We expand price.product because the artworkId and quality
   * were stored in product metadata when the cart Checkout
   * Session was created.
   */
  const lineItemsUrl =
    new URL(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(
        sessionId
      )}/line_items`
    )

  lineItemsUrl.searchParams.set(
    'limit',
    '100'
  )

  lineItemsUrl.searchParams.append(
    'expand[]',
    'data.price.product'
  )

  const lineItemsResponse =
    await fetch(
      lineItemsUrl.toString(),
      {
        headers: {
          Authorization:
            `Bearer ${stripeSecretKey}`,
        },

        cache: 'no-store',
      }
    )

  const lineItemsData =
    await lineItemsResponse.json()

  if (!lineItemsResponse.ok) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">
          Could not retrieve purchased artworks
        </h1>

        <p className="text-slate-400">
          {lineItemsData?.error?.message ||
            'Stripe line item lookup failed.'}
        </p>

        <Link
          href="/"
          className="text-amber-400 hover:underline"
        >
          Return home
        </Link>
      </main>
    )
  }

  const stripeLineItems: StripeLineItem[] =
    Array.isArray(
      lineItemsData?.data
    )
      ? lineItemsData.data
      : []

  /*
   * Extract artwork references from each Stripe product.
   */
  let purchasedReferences: PurchasedReference[] =
    stripeLineItems
      .map((lineItem) => {
        const product =
          lineItem?.price?.product

        if (
          !product ||
          typeof product ===
            'string'
        ) {
          return null
        }

        const artworkId =
          String(
            product.metadata
              ?.artworkId || ''
          ).trim()

        const quality =
          String(
            product.metadata
              ?.quality || ''
          ).trim()

        if (!artworkId) {
          return null
        }

        return {
          artworkId,

          quality,

          amountTotal:
            typeof lineItem.amount_total ===
            'number'
              ? lineItem.amount_total
              : null,

          currency:
            String(
              lineItem.currency ||
                'usd'
            ).toUpperCase(),
        }
      })
      .filter(
        (
          item
        ): item is PurchasedReference =>
          item !== null
      )

  /*
   * Backwards compatibility:
   *
   * Old single-artwork Stripe sessions stored artworkId
   * and quality directly on session.metadata.
   */
  if (
    purchasedReferences.length ===
      0 &&
    session?.metadata?.artworkId
  ) {
    purchasedReferences = [
      {
        artworkId:
          String(
            session.metadata
              .artworkId
          ),

        quality:
          String(
            session.metadata
              .quality || ''
          ),

        amountTotal:
          typeof session.amount_total ===
          'number'
            ? session.amount_total
            : null,

        currency:
          String(
            session.currency ||
              'usd'
          ).toUpperCase(),
      },
    ]
  }

  if (
    purchasedReferences.length ===
    0
  ) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">
          Purchased artwork references could not be found
        </h1>

        <p className="text-slate-400">
          The Stripe payment session was found, but no artwork
          references were attached to its line items.
        </p>

        <p className="text-sm text-slate-500">
          Session: {sessionId}
        </p>

        <Link
          href="/"
          className="text-amber-400 hover:underline"
        >
          Return home
        </Link>
      </main>
    )
  }

  /*
   * Remove duplicate artwork IDs before querying Prisma.
   */
  const artworkIds =
    Array.from(
      new Set(
        purchasedReferences.map(
          (item) =>
            item.artworkId
        )
      )
    )

  const artworks =
    await prisma.artwork.findMany(
      {
        where: {
          id: {
            in: artworkIds,
          },
        },

        select: {
          id: true,
          title: true,
          artist: true,
          style: true,
          thumbnail: true,

          assets: {
            orderBy: {
              createdAt:
                'desc',
            },

            take: 10,

            select: {
              originalUrl:
                true,
            },
          },
        },
      }
    )

  const artworkMap =
    new Map(
      artworks.map(
        (artwork) => [
          artwork.id,
          artwork,
        ]
      )
    )

  const purchasedItems =
    purchasedReferences
      .map((reference) => {
        const artwork =
          artworkMap.get(
            reference.artworkId
          )

        if (!artwork) {
          return null
        }

        return {
          ...reference,

          artwork,

          downloadUrl:
            pickStableImgSrc(
              artwork
            ),
        }
      })
      .filter(
        (
          item
        ): item is NonNullable<
          typeof item
        > => item !== null
      )

  if (
    purchasedItems.length ===
    0
  ) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">
          Purchased artworks could not be loaded
        </h1>

        <p className="text-slate-400">
          Stripe confirmed the order, but the purchased artwork
          records could not be found in the AI Image database.
        </p>

        <Link
          href="/"
          className="text-amber-400 hover:underline"
        >
          Return home
        </Link>
      </main>
    )
  }

  const amountTotal =
    typeof session.amount_total ===
    'number'
      ? session.amount_total /
        100
      : null

  const currency =
    String(
      session.currency || 'usd'
    ).toUpperCase()

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-12">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl text-emerald-300">
          ✓
        </div>

        <h1 className="mt-6 text-4xl font-semibold text-white">
          {isPaid
            ? 'Payment confirmed'
            : 'Payment not completed'}
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          {isPaid
            ? `Your order containing ${purchasedItems.length} ${
                purchasedItems.length ===
                1
                  ? 'artwork'
                  : 'artworks'
              } is ready.`
            : 'Stripe has not yet marked this checkout session as paid.'}
        </p>

        {amountTotal !== null ? (
          <div className="mt-6 text-lg font-semibold text-amber-300">
            Order total:{' '}
            {currency}{' '}
            {amountTotal.toFixed(
              2
            )}
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            Your artworks
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Download each purchased artwork below.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {purchasedItems.map(
            (item) => (
              <article
                key={`${item.artwork.id}-${item.quality}`}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
              >
                <div className="overflow-hidden bg-slate-950">
                  <SafeImg
                    src={
                      item.downloadUrl
                    }
                    fallbackSrc={
                      FALLBACK_DATA_URL
                    }
                    alt={
                      item.artwork
                        .title
                    }
                    className="aspect-square w-full object-contain"
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {
                        item.artwork
                          .title
                      }
                    </div>

                    <div className="mt-1 text-sm text-slate-400">
                      {item.artwork
                        .artist ||
                        item.artwork
                          .style ||
                        'AI Image'}
                    </div>

                    <div className="mt-2 text-sm text-amber-300">
                      {qualityLabel(
                        item.quality
                      )}
                    </div>
                  </div>

                  {item.amountTotal !==
                  null ? (
                    <div className="text-sm text-slate-400">
                      {
                        item.currency
                      }{' '}
                      {(
                        item.amountTotal /
                        100
                      ).toFixed(
                        2
                      )}
                    </div>
                  ) : null}

                  {isPaid ? (
                    <a
                      href={
                        item.downloadUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full rounded-xl bg-amber-400 px-4 py-3 text-center font-semibold text-black transition hover:bg-amber-300"
                    >
                      Download artwork
                    </a>
                  ) : (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-400">
                      Download becomes
                      available once
                      payment is
                      confirmed.
                    </div>
                  )}

                  <Link
                    href={`/artwork/${item.artwork.id}`}
                    className="block text-center text-sm text-slate-400 hover:text-amber-300"
                  >
                    View artwork
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-lg font-semibold text-white">
          Order complete
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          Keep this page available until you have downloaded all
          purchased files.
        </p>

        <div className="mt-5 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-amber-300/60"
          >
            Return home
          </Link>

          <Link
            href="/explore"
            className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300"
          >
            Continue shopping
          </Link>
        </div>
      </section>

      <p className="text-xs text-slate-600">
        Stripe session: {sessionId}
      </p>
    </main>
  )
}
