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

/*
 * These are recognised works that genuinely belong to
 * the Master's own library.
 *
 * A title such as:
 *
 *   The Creation of Adam in Michelangelo Style
 *
 * remains in Michelangelo.
 *
 * But:
 *
 *   The Scream in Michelangelo Style
 *
 * belongs only in Masters Reimagined.
 */
const OWN_MASTERWORK_TITLES: Record<
  string,
  string[]
> = {
  DA_VINCI: [
    'Mona Lisa',
    'The Last Supper',
    'Lady with an Ermine',
    'Vitruvian Man',
    'Salvator Mundi',
    'Virgin of the Rocks',
    'Annunciation',
    'Adoration of the Magi',
    'Saint John the Baptist',
    'The Baptism of Christ',
  ],

  MICHELANGELO: [
    'The Creation of Adam',
    'David',
    'Pieta',
    'The Last Judgement',
    'Moses',
    'Doni Tondo',
    'Sistine Chapel Ceiling Study',
    'Prophet on Ceiling Fresco',
    'Ignudi Figure Study',
    'Renaissance Vault Fresco',
  ],

  VAN_GOGH: [
    'Starry Night',
    'The Starry Night',
    'Sunflowers',
    'Cafe Terrace at Night',
    'Irises',
    'Wheatfield with Crows',
    'Bedroom in Arles',
    'The Potato Eaters',
    'Almond Blossoms',
    'Self Portrait',
    'The Night Cafe',
  ],

  MONET: [
    'Impression Sunrise',
    'Impression, Sunrise',
    'Water Lilies',
    'Japanese Bridge',
    'Woman with a Parasol',
    'Rouen Cathedral',
    'Parliament in Fog',
    'Poppy Field',
    'Haystacks',
    'Garden at Giverny',
    'Boats on the Seine',
  ],

  REMBRANDT: [
    'The Night Watch',
    'The Return of the Prodigal Son',
    'The Anatomy Lesson',
    'The Anatomy Lesson of Dr Nicolaes Tulp',
    'The Jewish Bride',
    'Self Portrait',
    'Self Portrait with Two Circles',
    'The Storm on the Sea of Galilee',
    'The Syndics',
    'Scholar at Candlelight',
    'Old Man in Shadow',
  ],

  CARAVAGGIO: [
    'The Calling of Saint Matthew',
    'The Supper at Emmaus',
    'The Taking of Christ',
    'Bacchus',
    'Boy with a Basket of Fruit',
    'The Musicians',
    'Medusa',
    'Saint Jerome Writing',
    'The Fortune Teller',
    'The Cardsharps',
  ],

  VERMEER: [
    'Girl with a Pearl Earring',
    'The Milkmaid',
    'View of Delft',
    'The Art of Painting',
    'Woman in Blue Reading a Letter',
    'Girl Reading a Letter by an Open Window',
    'Woman Holding a Balance',
    'The Music Lesson',
    'Young Woman with a Water Pitcher',
    'Woman with a Lute',
  ],

  MUNCH: [
    'The Scream',
    'The Dance of Life',
    'Madonna',
    'The Sick Child',
    'Anxiety',
    'Ashes',
    'Vampire',
    'Evening on Karl Johan Street',
    'Girls on the Bridge',
    'Self Portrait with Cigarette',
  ],

  POLLOCK: [
    'Autumn Rhythm',
    'Lavender Mist',
    'Blue Poles',
    'Convergence',
    'Mural',
    'Drip Composition',
    'Action Painting',
    'Splatter Field',
    'Black and White Energy',
    'Dynamic Color Field',
  ],

  DALI: [
    'Persistence of Memory',
    'The Persistence of Memory',
    'Persistence of Memory Inspired',
    'Dreamlike Desert Clocks',
    'Time Collapse Landscape',
    'Surreal Melting Landscape',
    'Floating Objects Composition',
    'Impossible Architecture Scene',
    'Surreal Reflections Study',
    'Distorted Reality Composition',
    'Hyperreal Dream Sequence',
    'Symbolic Surreal Study',
  ],

  PICASSO: [
    'Guernica',
    'Les Demoiselles d Avignon',
    'The Weeping Woman',
    'Girl before a Mirror',
    'Three Musicians',
    'Portrait of Dora Maar',
    'The Old Guitarist',
    'Harlequin with Violin',
    'Still Life with Guitar',
  ],
}

const STYLE_NAMES: Record<
  string,
  string[]
> = {
  DA_VINCI: [
    'da vinci',
    'leonardo da vinci',
  ],

  MICHELANGELO: [
    'michelangelo',
  ],

  VAN_GOGH: [
    'van gogh',
    'vincent van gogh',
  ],

  MONET: [
    'monet',
    'claude monet',
  ],

  REMBRANDT: [
    'rembrandt',
  ],

  CARAVAGGIO: [
    'caravaggio',
  ],

  VERMEER: [
    'vermeer',
    'johannes vermeer',
  ],

  MUNCH: [
    'munch',
    'edvard munch',
  ],

  POLLOCK: [
    'pollock',
    'jackson pollock',
  ],

  DALI: [
    'dali',
    'dalí',
    'salvador dali',
    'salvador dalí',
  ],

  PICASSO: [
    'picasso',
    'pablo picasso',
  ],
}

export function normalizeArtworkText(
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

export function isExplicitlyExcludedMasterArtwork(
  style: string,
  title: string
) {
  const exclusions =
    MASTER_ARTWORK_EXCLUSIONS[
      style
    ] ?? []

  const normalizedTitle =
    normalizeArtworkText(
      title
    )

  return exclusions.some(
    (excludedTitle) => {
      const normalizedExcluded =
        normalizeArtworkText(
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
 * Remove old filler/test titles from every public gallery.
 */
export function isPublicArtworkTitle(
  title: string
) {
  const normalized =
    normalizeArtworkText(
      title
    )

  if (
    /\bstudy\s*#?\s*\d+\b/i.test(
      title
    )
  ) {
    return false
  }

  if (
    normalized.includes(
      'placeholder'
    )
  ) {
    return false
  }

  if (
    normalized.includes(
      'coming soon'
    )
  ) {
    return false
  }

  if (
    normalized.includes(
      'smoketest'
    )
  ) {
    return false
  }

  if (
    normalized.includes(
      'diagnostic'
    )
  ) {
    return false
  }

  if (
    normalized.includes(
      'test artwork'
    )
  ) {
    return false
  }

  return true
}

/*
 * TRUE means:
 *
 * this work belongs ONLY in Masters Reimagined,
 * NOT in the normal Master collection.
 */
export function isReimaginedArtworkForStyle(
  style: string,
  title: string
) {
  const normalizedTitle =
    normalizeArtworkText(
      title
    )

  if (
    normalizedTitle.includes(
      'reimagined'
    )
  ) {
    return true
  }

  const styleNames =
    STYLE_NAMES[
      style
    ] ?? []

  let baseTitle:
    | string
    | null = null

  for (
    const styleName of styleNames
  ) {
    const suffix =
      ` in ${normalizeArtworkText(
        styleName
      )} style`

    if (
      normalizedTitle.endsWith(
        suffix
      )
    ) {
      baseTitle =
        normalizedTitle
          .slice(
            0,
            -suffix.length
          )
          .trim()

      break
    }
  }

  /*
   * It does not follow the
   * "X in Master Style" naming convention.
   *
   * Therefore it stays in the normal Master library.
   */
  if (!baseTitle) {
    return false
  }

  const ownTitles =
    OWN_MASTERWORK_TITLES[
      style
    ] ?? []

  const isOwnWork =
    ownTitles.some(
      (ownTitle) =>
        normalizeArtworkText(
          ownTitle
        ) ===
        baseTitle
    )

  /*
   * Example:
   *
   * The Creation of Adam in Michelangelo Style
   * -> own work -> FALSE
   *
   * The Scream in Michelangelo Style
   * -> not own work -> TRUE
   */
  return !isOwnWork
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
  if (
    !isPublicArtworkTitle(
      title
    )
  ) {
    return true
  }

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

  /*
   * CRITICAL NEW RULE:
   *
   * Reimagined works do NOT belong
   * in the normal Master gallery.
   */
  if (
    isReimaginedArtworkForStyle(
      style,
      title
    )
  ) {
    return true
  }

  return false
}
