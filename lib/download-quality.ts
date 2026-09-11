import sharp from 'sharp'

export type DownloadQuality =
  | 'high'
  | 'very_high'
  | 'ultra'

export const DOWNLOAD_QUALITY = {
  high: {
    label: 'High Resolution',
    pixels: 1024,
  },

  very_high: {
    label: 'Very High Resolution',
    pixels: 2048,
  },

  ultra: {
    label: 'Ultra High Resolution',
    pixels: 4096,
  },
} as const

export function isDownloadQuality(
  value: string
): value is DownloadQuality {
  return (
    value === 'high' ||
    value === 'very_high' ||
    value === 'ultra'
  )
}

export function qualityLabel(
  quality: string
) {
  if (
    isDownloadQuality(
      quality
    )
  ) {
    const config =
      DOWNLOAD_QUALITY[
        quality
      ]

    return `${config.label} · ${config.pixels}px`
  }

  return 'Digital Artwork'
}

export async function renderPurchasedArtwork(
  input: Buffer,
  quality: DownloadQuality
) {
  const config =
    DOWNLOAD_QUALITY[
      quality
    ]

  const image =
    sharp(input, {
      failOn: 'none',
    })

  const metadata =
    await image.metadata()

  const width =
    metadata.width ?? 0

  const height =
    metadata.height ?? 0

  if (
    width <= 0 ||
    height <= 0
  ) {
    throw new Error(
      'Could not determine artwork dimensions.'
    )
  }

  /*
   * Preserve aspect ratio.
   *
   * The selected quality represents the maximum
   * dimension of the delivered artwork.
   */
  const output =
    await sharp(input, {
      failOn: 'none',
    })
      .resize({
        width:
          config.pixels,
        height:
          config.pixels,
        fit: 'inside',
        withoutEnlargement:
          false,
        kernel:
          sharp.kernel
            .lanczos3,
      })
      .png({
        compressionLevel: 6,
        adaptiveFiltering:
          true,
      })
      .toBuffer({
        resolveWithObject:
          true,
      })

  return {
    buffer: output.data,

    width:
      output.info.width,

    height:
      output.info.height,

    label:
      config.label,

    pixels:
      config.pixels,

    originalWidth:
      width,

    originalHeight:
      height,
  }
}
