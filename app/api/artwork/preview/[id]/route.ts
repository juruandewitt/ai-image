import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/*
 * PUBLIC PREVIEW SECURITY
 *
 * No public preview will ever be larger than 700 px
 * on its longest dimension.
 *
 * Paid download routes are completely separate and are
 * not affected by this value.
 */
const MAX_PUBLIC_PREVIEW_SIZE = 700

const DEFAULT_PREVIEW_SIZE = 600
const MIN_PREVIEW_SIZE = 240

function getRequestedSize(req: Request) {
  const url = new URL(req.url)

  const rawWidth =
    Number(
      url.searchParams.get('w')
    )

  if (
    !Number.isFinite(rawWidth) ||
    rawWidth <= 0
  ) {
    return DEFAULT_PREVIEW_SIZE
  }

  return Math.max(
    MIN_PREVIEW_SIZE,
    Math.min(
      MAX_PUBLIC_PREVIEW_SIZE,
      Math.round(rawWidth)
    )
  )
}

function createWatermarkSvg(
  width: number,
  height: number
) {
  /*
   * Responsive watermark size.
   */
  const fontSize =
    Math.max(
      18,
      Math.round(
        Math.min(
          width,
          height
        ) * 0.045
      )
    )

  /*
   * Multiple low-opacity marks make cropping one watermark
   * substantially less useful while keeping the artwork
   * pleasant to browse.
   */
  return Buffer.from(
    `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        .mark {
          fill: rgba(255,255,255,0.28);
          stroke: rgba(0,0,0,0.18);
          stroke-width: 1px;
          paint-order: stroke;
          font-family: Arial, Helvetica, sans-serif;
          font-size: ${fontSize}px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
      </style>

      <g
        transform="rotate(-28 ${width / 2} ${height / 2})"
      >
        <text
          x="12%"
          y="30%"
          class="mark"
          text-anchor="middle"
        >
          AI IMAGE · PREVIEW
        </text>

        <text
          x="55%"
          y="48%"
          class="mark"
          text-anchor="middle"
        >
          AI IMAGE · PREVIEW
        </text>

        <text
          x="88%"
          y="70%"
          class="mark"
          text-anchor="middle"
        >
          AI IMAGE · PREVIEW
        </text>
      </g>
    </svg>
    `
  )
}

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      id: string
    }
  }
) {
  try {
    const artwork =
      await prisma.artwork.findUnique(
        {
          where: {
            id: params.id,
          },

          include: {
            assets: {
              orderBy: {
                createdAt:
                  'desc',
              },

              take: 10,
            },
          },
        }
      )

    if (!artwork) {
      return new NextResponse(
        'Not found',
        {
          status: 404,
        }
      )
    }

    /*
     * Find a usable source image.
     */
    const imageUrl =
      artwork.thumbnail ||
      artwork.assets.find(
        (asset) =>
          Boolean(
            asset.originalUrl
          )
      )?.originalUrl ||
      null

    if (!imageUrl) {
      return new NextResponse(
        'No image',
        {
          status: 404,
        }
      )
    }

    /*
     * Fetch the protected source on the SERVER.
     *
     * We never redirect the browser to the original Blob URL.
     */
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
      console.error(
        'Preview source fetch failed:',
        imageResponse.status,
        imageUrl
      )

      return new NextResponse(
        'Preview unavailable',
        {
          status: 502,
        }
      )
    }

    const sourceBuffer =
      Buffer.from(
        await imageResponse.arrayBuffer()
      )

    const requestedSize =
      getRequestedSize(
        req
      )

    /*
     * STEP 1
     *
     * Create a genuinely reduced-resolution preview.
     *
     * "inside" preserves aspect ratio.
     * "withoutEnlargement" prevents a smaller source from
     * being artificially enlarged.
     */
    const resized =
      await sharp(
        sourceBuffer
      )
        .rotate()
        .resize({
          width:
            requestedSize,

          height:
            requestedSize,

          fit:
            'inside',

          withoutEnlargement:
            true,
        })
        .toBuffer({
          resolveWithObject:
            true,
        })

    const outputWidth =
      resized.info.width ||
      requestedSize

    const outputHeight =
      resized.info.height ||
      requestedSize

    /*
     * STEP 2
     *
     * Apply watermark to the reduced public preview.
     */
    const watermark =
      createWatermarkSvg(
        outputWidth,
        outputHeight
      )

    /*
     * STEP 3
     *
     * Return a compressed WebP preview.
     *
     * The browser never receives the original source file.
     */
    const protectedPreview =
      await sharp(
        resized.data
      )
        .composite([
          {
            input:
              watermark,

            top: 0,
            left: 0,
          },
        ])
        .webp({
          quality: 84,
          effort: 4,
        })
        .toBuffer()

    return new NextResponse(
      protectedPreview,
      {
        headers: {
          'Content-Type':
            'image/webp',

          /*
           * Safe to cache because this is only the protected
           * derivative, never the paid original.
           */
          'Cache-Control':
            'public, max-age=86400, stale-while-revalidate=604800',

          /*
           * Prevent browsers from trying to interpret the
           * response as another type of content.
           */
          'X-Content-Type-Options':
            'nosniff',
        },
      }
    )
  } catch (error) {
    console.error(
      'Artwork preview error:',
      error
    )

    return new NextResponse(
      'Preview error',
      {
        status: 500,
      }
    )
  }
}
