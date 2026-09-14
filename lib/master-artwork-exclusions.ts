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
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/*
 * Returns TRUE when a particular artwork title has been
 * explicitly rejected from that Master's public library.
 *
 * The matching deliberately catches both:
 *
 * "The Scream"
 *
 * and:
 *
 * "The Scream in Rembrandt Style"
 */
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
    (excludedTitle) => {
      const normalizedExcluded =
        normalizeText(
          excludedTitle
        )

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

/*
 * Theme collections must NEVER leak into a Master library.
 *
 * Examples:
 *
 * theme:space-universe
 * theme:landscapes
 *
 * This is the safeguard that should remove the strange Pollock
 * contamination you noticed.
 */
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

/*
 * Main public Master-gallery guard.
 */
export function shouldHideFromMasterGallery({
  style,
  title,
  tags,
}: {
  style: string
  title: string
  tags?: string[]
}) {
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
