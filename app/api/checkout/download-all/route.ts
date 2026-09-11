import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  DownloadQuality,
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

type PurchasedReference = {
  artworkId: string
  quality: DownloadQuality
}

type ZipInputFile = {
  filename: string
  data: Buffer
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
    .slice(0, 100)
}

const CRC_TABLE =
  (() => {
    const table =
      new Uint32Array(
        256
      )

    for (
      let index = 0;
      index < 256;
      index++
    ) {
      let value =
        index

      for (
        let bit = 0;
        bit < 8;
        bit++
      ) {
        value =
          value & 1
            ? 0xedb88320 ^
              (value >>> 1)
            : value >>>
              1
      }

      table[index] =
        value >>> 0
    }

    return table
  })()

function crc32(
  buffer: Buffer
) {
  let crc =
    0xffffffff

  for (
    let index = 0;
    index <
    buffer.length;
    index++
  ) {
    crc =
      CRC_TABLE[
        (crc ^
          buffer[index]) &
          0xff
      ] ^
      (crc >>> 8)
  }

  return (
    (crc ^
      0xffffffff) >>>
    0
  )
}

function getDosDateTime() {
  const date =
    new Date()

  const year =
    Math.max(
      1980,
      date.getFullYear()
    )

  const dosTime =
    (date.getHours() <<
      11) |
    (date.getMinutes() <<
      5) |
    Math.floor(
      date.getSeconds() /
        2
    )

  const dosDate =
    ((year - 1980) <<
      9) |
    ((date.getMonth() +
      1) <<
      5) |
    date.getDate()

  return {
    dosTime,
    dosDate,
  }
}

function createZip(
  files: ZipInputFile[]
) {
  const localParts:
    Buffer[] = []

  const centralParts:
    Buffer[] = []

  let offset = 0

  const {
    dosTime,
    dosDate,
  } = getDosDateTime()

  for (
    const file of files
  ) {
    const filenameBuffer =
      Buffer.from(
        file.filename,
        'utf8'
      )

    const data =
      file.data

    const checksum =
      crc32(data)

    const localHeader =
      Buffer.alloc(30)

    localHeader.writeUInt32LE(
      0x04034b50,
      0
    )

    localHeader.writeUInt16LE(
      20,
      4
    )

    localHeader.writeUInt16LE(
      0x0800,
      6
    )

    localHeader.writeUInt16LE(
      0,
      8
    )

    localHeader.writeUInt16LE(
      dosTime,
      10
    )

    localHeader.writeUInt16LE(
      dosDate,
      12
    )

    localHeader.writeUInt32LE(
      checksum,
      14
    )

    localHeader.writeUInt32LE(
      data.length,
      18
    )

    localHeader.writeUInt32LE(
      data.length,
      22
    )

    localHeader.writeUInt16LE(
      filenameBuffer.length,
      26
    )

    localHeader.writeUInt16LE(
      0,
      28
    )

    localParts.push(
      localHeader,
      filenameBuffer,
      data
    )

    const centralHeader =
      Buffer.alloc(46)

    centralHeader.writeUInt32LE(
      0x02014b50,
      0
    )

    centralHeader.writeUInt16LE(
      20,
      4
    )

    centralHeader.writeUInt16LE(
      20,
      6
    )

    centralHeader.writeUInt16LE(
      0x0800,
      8
    )

    centralHeader.writeUInt16LE(
      0,
      10
    )

    centralHeader.writeUInt16LE(
      dosTime,
      12
    )

    centralHeader.writeUInt16LE(
      dosDate,
      14
    )

    centralHeader.writeUInt32LE(
      checksum,
      16
    )

    centralHeader.writeUInt32LE(
      data.length,
      20
    )

    centralHeader.writeUInt32LE(
      data.length,
      24
    )

    centralHeader.writeUInt16LE(
      filenameBuffer.length,
      28
    )

    centralHeader.writeUInt16LE(
      0,
      30
    )

    centralHeader.writeUInt16LE(
      0,
      32
    )

    centralHeader.writeUInt16LE(
      0,
      34
    )

    centralHeader.writeUInt16LE(
      0,
      36
    )

    centralHeader.writeUInt32LE(
      0,
      38
    )

    centralHeader.writeUInt32LE(
      offset,
      42
    )

    centralParts.push(
      centralHeader,
      filenameBuffer
    )

    offset +=
      localHeader.length +
      filenameBuffer.length +
      data.length
  }

  const localDirectory =
    Buffer.concat(
      localParts
    )

  const centralDirectory =
    Buffer.concat(
      centralParts
    )

  const endRecord =
    Buffer.alloc(22)

  endRecord.writeUInt32LE(
    0x06054b50,
    0
  )

  endRecord.writeUInt16LE(
    0,
    4
  )

  endRecord.writeUInt16LE(
    0,
    6
  )

  endRecord.writeUInt16LE(
    files.length,
    8
  )

  endRecord.writeUInt16LE(
    files.length,
    10
  )

  endRecord.writeUInt32LE(
    centralDirectory.length,
    12
  )

  endRecord.writeUInt32LE(
    localDirectory.length,
    16
  )

  endRecord.writeUInt16LE(
    0,
    20
  )

  return Buffer.concat([
    localDirectory,
    centralDirectory,
    endRecord,
  ])
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

    let purchasedReferences:
      PurchasedReference[] =
      lineItems
        .map(
          (
            lineItem
          ) => {
            const product =
              lineItem
                ?.price
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
                product
                  .metadata
                  ?.artworkId ||
                  ''
              ).trim()

            const quality =
              String(
                product
                  .metadata
                  ?.quality ||
                  ''
              ).trim()

            if (
              !artworkId ||
              !isDownloadQuality(
                quality
              )
            ) {
              return null
            }

            return {
              artworkId,
              quality,
            }
          }
        )
        .filter(
          (
            item
          ): item is PurchasedReference =>
            item !==
            null
        )

    if (
      purchasedReferences.length ===
        0 &&
      session?.metadata
        ?.artworkId &&
      isDownloadQuality(
        String(
          session
            .metadata
            .quality ||
            ''
        )
      )
    ) {
      purchasedReferences =
        [
          {
            artworkId:
              String(
                session
                  .metadata
                  .artworkId
              ),

            quality:
              String(
                session
                  .metadata
                  .quality
              ) as DownloadQuality,
          },
        ]
    }

    if (
      purchasedReferences.length ===
      0
    ) {
      return NextResponse.json(
        {
          error:
            'No purchased artwork references were found.',
        },
        {
          status: 404,
        }
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

    /*
     * Deliberately process sequentially.
     *
     * 4096px artwork can consume substantial memory,
     * and this is safer on a serverless function.
     */
    const files:
      ZipInputFile[] =
      []

    for (
      let index = 0;
      index <
      purchasedReferences.length;
      index++
    ) {
      const reference =
        purchasedReferences[
          index
        ]

      const artwork =
        artworkMap.get(
          reference.artworkId
        )

      if (!artwork) {
        continue
      }

      const imageUrl =
        pickStableImgSrc(
          artwork
        )

      if (!imageUrl) {
        continue
      }

      try {
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
          continue
        }

        const sourceBuffer =
          Buffer.from(
            await imageResponse.arrayBuffer()
          )

        const rendered =
          await renderPurchasedArtwork(
            sourceBuffer,
            reference.quality
          )

        const title =
          safeFilename(
            artwork.title
          ) ||
          `Artwork-${
            index + 1
          }`

        const filename =
          `${String(
            index + 1
          ).padStart(
            2,
            '0'
          )} - ${title} - ${qualityLabel(
            reference.quality
          )} - ${rendered.width}x${rendered.height}.png`

        files.push({
          filename,
          data:
            rendered.buffer,
        })
      } catch {
        continue
      }
    }

    if (
      files.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            'None of the purchased artwork files could be prepared.',
        },
        {
          status: 500,
        }
      )
    }

    const zipBuffer =
      createZip(files)

    const shortSession =
      sessionId
        .replace(
          /[^a-zA-Z0-9]/g,
          ''
        )
        .slice(-10)

    const zipFilename =
      `AI-Image-Purchase-${shortSession}.zip`

    return new Response(
      zipBuffer,
      {
        status: 200,

        headers: {
          'Content-Type':
            'application/zip',

          'Content-Disposition':
            `attachment; filename="${zipFilename}"`,

          'Content-Length':
            String(
              zipBuffer.length
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
            : 'ZIP download failed.',
      },
      {
        status: 500,
      }
    )
  }
}
