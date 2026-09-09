import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic =
  'force-dynamic'

const QUALITY_CONFIG: Record<
  string,
  {
    label: string
    amount: number
    description: string
  }
> = {
  high: {
    label:
      'High Resolution',
    amount: 999,
    description:
      'Great for personal prints and digital use',
  },

  very_high: {
    label:
      'Very High Resolution',
    amount: 1999,
    description:
      'Ideal for larger prints and premium display',
  },

  ultra: {
    label:
      'Ultra High Resolution',
    amount: 2999,
    description:
      'Best for premium commercial-grade output',
  },
}

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

function pickStableImgSrc(
  artwork: {
    thumbnail?:
      | string
      | null

    assets?: {
      originalUrl:
        | string
        | null
    }[]
  }
) {
  const stableAsset =
    artwork.assets?.find(
      (asset) =>
        isStableBlobSrc(
          asset.originalUrl
        )
    )?.originalUrl ??
    null

  const stableThumbnail =
    isStableBlobSrc(
      artwork.thumbnail
    )
      ? artwork.thumbnail
      : null

  return (
    stableAsset ||
    stableThumbnail ||
    null
  )
}

type RequestedItem = {
  artworkId: string
  quality: string
}

export async function POST(
  request: Request
) {
  try {
    const stripeSecretKey =
      process.env
        .STRIPE_SECRET_KEY

    const siteUrl =
      process.env
        .NEXT_PUBLIC_SITE_URL

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Missing STRIPE_SECRET_KEY',
        },
        {
          status: 500,
        }
      )
    }

    if (!siteUrl) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Missing NEXT_PUBLIC_SITE_URL',
        },
        {
          status: 500,
        }
      )
    }

    const body =
      await request.json()

    let requestedItems: RequestedItem[] =
      []

    if (
      Array.isArray(
        body?.items
      )
    ) {
      requestedItems =
        body.items.map(
          (item: any) => ({
            artworkId:
              String(
                item?.artworkId ||
                  ''
              ).trim(),

            quality:
              String(
                item?.quality ||
                  ''
              ).trim(),
          })
        )
    } else if (
      body?.artworkId &&
      body?.quality
    ) {
      requestedItems = [
        {
          artworkId:
            String(
              body.artworkId
            ).trim(),

          quality:
            String(
              body.quality
            ).trim(),
        },
      ]
    }

    requestedItems =
      requestedItems.filter(
        (item) =>
          item.artworkId &&
          QUALITY_CONFIG[
            item.quality
          ]
      )

    if (
      requestedItems.length ===
      0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Cart is empty or contains invalid items.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      requestedItems.length >
      50
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Maximum 50 artworks per checkout.',
        },
        {
          status: 400,
        }
      )
    }

    const artworkIds =
      Array.from(
        new Set(
          requestedItems.map(
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

    for (
      const requestedItem of
      requestedItems
    ) {
      if (
        !artworkMap.has(
          requestedItem.artworkId
        )
      ) {
        return NextResponse.json(
          {
            ok: false,

            error:
              `Artwork not found: ${requestedItem.artworkId}`,
          },

          {
            status: 404,
          }
        )
      }
    }

    const params =
      new URLSearchParams()

    params.set(
      'mode',
      'payment'
    )

    params.set(
      'success_url',
      `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    )

    params.set(
      'cancel_url',
      `${siteUrl}/cart?canceled=1`
    )

    requestedItems.forEach(
      (
        requestedItem,
        index
      ) => {
        const artwork =
          artworkMap.get(
            requestedItem.artworkId
          )!

        const quality =
          QUALITY_CONFIG[
            requestedItem.quality
          ]

        const imageUrl =
          pickStableImgSrc(
            artwork
          )

        const prefix =
          `line_items[${index}]`

        params.set(
          `${prefix}[quantity]`,
          '1'
        )

        params.set(
          `${prefix}[price_data][currency]`,
          'usd'
        )

        params.set(
          `${prefix}[price_data][unit_amount]`,
          String(
            quality.amount
          )
        )

        params.set(
          `${prefix}[price_data][product_data][name]`,
          `${artwork.title} — ${quality.label}`
        )

        params.set(
          `${prefix}[price_data][product_data][description]`,
          `${
            artwork.artist ||
            artwork.style
          } • ${
            quality.description
          }`
        )

        params.set(
          `${prefix}[price_data][product_data][metadata][artworkId]`,
          artwork.id
        )

        params.set(
          `${prefix}[price_data][product_data][metadata][quality]`,
          requestedItem.quality
        )

        if (imageUrl) {
          params.set(
            `${prefix}[price_data][product_data][images][0]`,
            imageUrl
          )
        }
      }
    )

    params.set(
      'metadata[checkoutType]',
      'cart'
    )

    params.set(
      'metadata[itemCount]',
      String(
        requestedItems.length
      )
    )

    const stripeRes =
      await fetch(
        'https://api.stripe.com/v1/checkout/sessions',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${stripeSecretKey}`,

            'Content-Type':
              'application/x-www-form-urlencoded',
          },

          body:
            params.toString(),

          cache:
            'no-store',
        }
      )

    const stripeData =
      await stripeRes.json()

    if (
      !stripeRes.ok
    ) {
      return NextResponse.json(
        {
          ok: false,

          error:
            stripeData
              ?.error
              ?.message ||
            'Stripe session creation failed',
        },

        {
          status: 500,
        }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        url:
          stripeData.url,
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof
          Error
            ? error.message
            : 'Unknown checkout error',
      },

      {
        status: 500,
      }
    )
  }
}
