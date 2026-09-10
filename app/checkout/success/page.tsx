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

  return (
    quality ||
    'Digital Artwork'
  )
}

type StripeProduct = {
  metadata?: {
    artworkId?: string
    quality?: string
    [key: string]: string | undefined
  }
}

type StripeLineItem = {
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
    process.env
      .STRIPE_SECRET_KEY

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

  if (
    !sessionResponse.ok
  ) {
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

  if (
    !lineItemsResponse.ok
  ) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <h1 className="text-3xl font-semibold text-white">
          Could not retrieve purchased artworks
        </h1>

        <p className="text-slate-400">
          {lineItemsData?.error
            ?.message ||
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

  let purchasedReferences: PurchasedReference[] =
    stripeLineItems
      .map((lineItem) => {
        const product =
          lineItem?.price
            ?.product

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
   * Backwards compatibility with old
   * single-artwork purchases.
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

        <Link
          href="/"
          className="text-amber-400 hover:underline"
        >
          Return home
        </Link>
      </main>
    )
  }

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
            in:
              artworkIds,
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
        > =>
          item !== null
      )

  const amountTotal =
    typeof session.amount_total ===
    'number'
      ? session.amount_total /
        100
      : null

  const currency =
    String(
      session.currency ||
        'usd'
    ).toUpperCase()

  const zipDownloadUrl =
    `/api/checkout/download-all?session_id=${encodeURIComponent(
      sessionId
    )}`

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

      {isPaid ? (
        <section className="overflow-hidden rounded-[2rem] border border-amber-300/30 bg-gradient-to-br from-amber-300/10 to-white/[0.03] p-7 md:p-9">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-2xl font-semibold text-white md:text-3xl">
                Download your complete order
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Download all {purchasedItems.length}{' '}
                {purchasedItems.length ===
                1
                  ? 'artwork'
                  : 'artworks'}{' '}
                together in one ZIP file.
              </p>
            </div>

            <a
              href={zipDownloadUrl}
              className="inline-flex min-w-[230px] items-center justify-center rounded-xl bg-amber-400 px-7 py-4 text-center font-semibold text-black transition hover:bg-amber-300"
            >
              Download All as ZIP
            </a>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            Purchased Artworks
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            You can also download individual artworks below.
          </p>
        </div>

        <div className="space-y-4">
          {purchasedItems.map(
            (item, index) => (
              <article
                key={`${item.artwork.id}-${item.quality}-${index}`}
                className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:grid-cols-[130px_1fr_auto]"
              >
                <div className="overflow-hidden rounded-xl bg-slate-950">
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
                    className="aspect-square h-full w-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <Link
                    href={`/artwork/${item.artwork.id}`}
                    className="text-lg font-semibold text-white hover:text-amber-300"
                  >
                    {
                      item.artwork
                        .title
                    }
                  </Link>

                  <div className="mt-1 text-sm text-slate-400">
                    {
                      item.artwork
                        .artist ||
                      'AI Image'
                    }
                  </div>

                  <div className="mt-2 text-sm text-amber-300">
                    {qualityLabel(
                      item.quality
                    )}
                  </div>

                  {item.amountTotal !==
                  null ? (
                    <div className="mt-1 text-xs text-slate-500">
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
                </div>

                <div className="flex items-center">
                  {isPaid ? (
                    <a
                      href={
                        item.downloadUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="w-full rounded-xl border border-white/15 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-amber-300/60 hover:text-amber-300 sm:w-auto"
                    >
                      Download
                    </a>
                  ) : (
                    <div className="text-sm text-slate-500">
                      Awaiting payment
                    </div>
                  )}
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
          Your complete purchase can be downloaded as one ZIP file,
          or each artwork can be downloaded individually above.
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
