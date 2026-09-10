import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

type StripeProduct = {
  metadata?: {
    artworkId?: string
    quality?: string
    [key: string]: string | undefined
  }
}

type StripeLineItem = {
  price?: {
    product?: string | StripeProduct
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

function extensionFromUrl(
  url: string
) {
  try {
    const pathname =
      new URL(url).pathname

    const match =
      pathname.match(
        /\.([a-zA-Z0-9]{2,5})$/
      )

    if (match?.[1]) {
      return match[1].toLowerCase()
    }
  } catch {
    // Ignore malformed URL.
  }

  return 'png'
}

function contentTypeFromExtension(
  extension: string
) {
  switch (
    extension.toLowerCase()
  ) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'

    case 'webp':
      return 'image/webp'

    case 'gif':
      return 'image/gif'

    case 'png':
    default:
      return 'image/png'
  }
}

export async function GET(
  request: Request
) {
  try {
    const stripeSecretKey =
      process.env
        .STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
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

    /*
     * Verify the Stripe session.
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

    /*
     * Retrieve purchased line items and expand
     * each Stripe product.
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

    const lineItems: StripeLineItem[] =
      Array.isArray(
        lineItemsData?.data
      )
        ? lineItemsData.data
        : []

    /*
     * Confirm that this specific artwork belongs to the paid session.
     */
    const artworkPurchased =
      lineItems.some(
        (lineItem) => {
          const product =
            lineItem?.price
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
                ?.artworkId || ''
            ).trim() ===
            artworkId
          )
        }
      )

    /*
     * Backwards compatibility with older single-artwork sessions.
     */
    const legacyArtworkPurchased =
      String(
        session?.metadata
          ?.artworkId || ''
      ).trim() ===
      artworkId

    if (
      !artworkPurchased &&
      !legacyArtworkPurchased
    ) {
      return NextResponse.json(
        {
          error:
            'This artwork was not purchased in this checkout session.',
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
          cache: 'no-store',
        }
      )

    if (
      !imageResponse.ok
    ) {
      return NextResponse.json(
        {
          error:
            'Artwork file could not be retrieved.',
        },
        {
          status: 500,
        }
      )
    }

    const arrayBuffer =
      await imageResponse.arrayBuffer()

    const imageBuffer =
      Buffer.from(
        arrayBuffer
      )

    const extension =
      extensionFromUrl(
        imageUrl
      )

    const filenameBase =
      safeFilename(
        artwork.title
      ) ||
      'AI-Image-Artwork'

    const filename =
      `${filenameBase}.${extension}`

    return new Response(
      imageBuffer,
      {
        status: 200,

        headers: {
          'Content-Type':
            contentTypeFromExtension(
              extension
            ),

          'Content-Disposition':
            `attachment; filename="${filename}"`,

          'Content-Length':
            String(
              imageBuffer.length
            ),

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
