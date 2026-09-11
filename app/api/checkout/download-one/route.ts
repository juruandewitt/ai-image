import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  isDownloadQuality,
  qualityLabel,
  renderPurchasedArtwork,
} from '@/lib/download-quality'

export const dynamic =
  'force-dynamic'

export const maxDuration =
  300

type StripeProduct = {
  metadata?: {
    artworkId?: string
    quality?: string
    [key: string]:
      | string
      | undefined
  }
}

type StripeLineItem = {
  price?: {
    product?:
      | string
      | StripeProduct
  }
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

function safeFilename(
  value: string
) {
  return value
    .normalize('NFKD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .replace(
      /[^a-zA-Z0-9 _.-]/g,
      ''
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
    .slice(0, 120)
}

export async function GET(
  request: Request
) {
  try {
    const stripeSecretKey =
      process.env
        .STRIPE_SECRET_KEY

    if (
      !stripeSecretKey
    ) {
      return NextResponse.json(
        {
          error:
            'Missing STRIPE_SECRET_KEY',
        },
        {
          status: 500,
        }
      )
    }

    const requestUrl =
      new URL(request.url)

    const sessionId =
      requestUrl.searchParams.get(
        'session_id'
      ) || ''

    const artworkId =
      requestUrl.searchParams.get(
        'artwork_id'
      ) || ''

    const quality =
      requestUrl.searchParams.get(
        'quality'
      ) || ''

    if (!sessionId) {
      return NextResponse.json(
        {
          error:
            'Missing Stripe session ID.',
        },
        {
          status: 400,
        }
      )
    }

    if (!artworkId) {
      return NextResponse.json(
        {
          error:
            'Missing artwork ID.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      !isDownloadQuality(
        quality
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid or missing image quality.',
        },
        {
          status: 400,
        }
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

          cache:
            'no-store',
        }
      )

    const session =
      await sessionResponse.json()

    if (
      !sessionResponse.ok
    ) {
      return NextResponse.json(
        {
          error:
            session?.error
              ?.message ||
            'Could not verify Stripe session.',
        },
        {
          status: 400,
        }
      )
    }

    if (
      session.payment_status !==
      'paid'
    ) {
      return NextResponse.json(
        {
          error:
            'This checkout session has not been paid.',
        },
        {
          status: 403,
        }
      )
    }

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

          cache:
            'no-store',
        }
      )

    const lineItemsData =
      await lineItemsResponse.json()

    if (
      !lineItemsResponse.ok
    ) {
      return NextResponse.json(
        {
          error:
            lineItemsData
              ?.error
              ?.message ||
            'Could not retrieve purchased artworks.',
        },
        {
          status: 400,
        }
      )
    }

    const lineItems:
      StripeLineItem[] =
      Array.isArray(
        lineItemsData?.data
      )
        ? lineItemsData.data
        : []

    /*
     * The artwork AND quality must both match.
     *
     * This prevents someone who purchased the
     * 1024px tier from requesting the 4096px tier.
     */
    const purchased =
      lineItems.some(
        (lineItem) => {
          const product =
            lineItem
              ?.price
              ?.product

          if (
            !product ||
            typeof product ===
              'string'
          ) {
            return false
          }

          return (
            String(
              product.metadata
                ?.artworkId ||
                ''
            ).trim() ===
              artworkId &&
            String(
              product.metadata
                ?.quality ||
                ''
            ).trim() ===
              quality
          )
        }
      )

    const legacyPurchased =
      String(
        session?.metadata
          ?.artworkId || ''
      ).trim() ===
        artworkId &&
      String(
        session?.metadata
          ?.quality || ''
      ).trim() ===
        quality

    if (
      !purchased &&
      !legacyPurchased
    ) {
      return NextResponse.json(
        {
          error:
            'This artwork and resolution were not purchased in this checkout session.',
        },
        {
          status: 403,
        }
      )
    }

    const artwork =
      await prisma.artwork.findUnique(
        {
          where: {
            id: artworkId,
          },

          select: {
            id: true,
            title: true,
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

    if (!artwork) {
      return NextResponse.json(
        {
          error:
            'Artwork record could not be found.',
        },
        {
          status: 404,
        }
      )
    }

    const imageUrl =
      pickStableImgSrc(
        artwork
      )

    if (!imageUrl) {
      return NextResponse.json(
        {
          error:
            'No downloadable artwork file is available.',
        },
        {
          status: 404,
        }
      )
    }

    const imageResponse =
      await fetch(
        imageUrl,
        {
          cache:
            'no-store',
        }
      )

    if (
      !imageResponse.ok
    ) {
      return NextResponse.json(
        {
          error:
            'Artwork source file could not be retrieved.',
        },
        {
          status: 500,
        }
      )
    }

    const sourceBuffer =
      Buffer.from(
        await imageResponse.arrayBuffer()
      )

    const rendered =
      await renderPurchasedArtwork(
        sourceBuffer,
        quality
      )

    const filenameBase =
      safeFilename(
        artwork.title
      ) ||
      'AI-Image-Artwork'

    const filename =
      `${filenameBase} - ${rendered.width}x${rendered.height}.png`

    return new Response(
      rendered.buffer,
      {
        status: 200,

        headers: {
          'Content-Type':
            'image/png',

          'Content-Disposition':
            `attachment; filename="${filename}"`,

          'Content-Length':
            String(
              rendered.buffer
                .length
            ),

          'X-AI-Image-Quality':
            qualityLabel(
              quality
            ),

          'X-AI-Image-Dimensions':
            `${rendered.width}x${rendered.height}`,

          'Cache-Control':
            'private, no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Individual download failed.',
      },
      {
        status: 500,
      }
    )
  }
}
