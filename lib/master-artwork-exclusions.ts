export const MASTER_ARTWORK_EXCLUSIONS: Record<
  string,
  string[]
> = {
  MICHELANGELO: [
    'Marble Youth',
    'Nighthawks',
    'Monumental Figure in Shadow',
    'Fresco Vault with Light Beams',
    'Renaissance Sanctuary',
    'Still Life in a Chapel Room',
  ],

  MONET: [
    'Garden in Bloom',
    'Figure near Lily Pond',
  ],

  REMBRANDT: [
    'The Scream',
    'Woman by the Water Garden',
    'David',
  ],

  CARAVAGGIO: [
    'The Scream',
    'Cafe Terrace at Night',
    'The Last Judgement',
  ],

  MUNCH: [
    'Self Portrait',
    'The Sun',
    'Emotional Portrait',
    'Solitary Figure in Open Landscape',
    'The Milkmaid',
    'Rose Garden',
  ],

  POLLOCK: [
    'Splintered Color Rain',
  ],

  DALI: [
    'Golden Sky Reflections',
  ],

  PICASSO: [
    'Woman with a Mandolin',
    'Rose Period Acrobat',
  ],
}

function normalizeText(
  value: string
) {
  return value
    .normalize('NFKD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function isExplicitlyExcludedMasterArtwork(
  style: string,
  title: string
) {
  const exclusions =
    MASTER_ARTWORK_EXCLUSIONS[
      style
    ] ?? []

  const normalizedTitle =
    normalizeText(title)

  return exclusions.some(
    (excluded) => {
      const normalizedExcluded =
        normalizeText(
          excluded
        )

      /*
       * Catch:
       *
       * Marble Youth
       *
       * AND:
       *
       * Marble Youth in Michelangelo Style
       *
       * But deliberately do NOT broadly hide unrelated titles
       * such as "Self Portrait with Cigarette".
       */
      return (
        normalizedTitle ===
          normalizedExcluded ||
        normalizedTitle.startsWith(
          `${normalizedExcluded} in `
        )
      )
    }
  )
}

export function isThemeCollectionArtwork(
  tags?: string[]
) {
  return Boolean(
    tags?.some(
      (tag) =>
        tag
          .toLowerCase()
          .startsWith(
            'theme:'
          )
    )
  )
}

export function shouldHideFromMasterGallery({
  style,
  title,
  tags,
}: {
  style: string
  title: string
  tags?: string[]
}) {
  /*
   * Absolute rule:
   *
   * Theme collections never belong inside
   * Masters or Masters Reimagined.
   */
  if (
    isThemeCollectionArtwork(
      tags
    )
  ) {
    return true
  }

  if (
    isExplicitlyExcludedMasterArtwork(
      style,
      title
    )
  ) {
    return true
  }

  return false
}
