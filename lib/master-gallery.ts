import { prisma } from '@/lib/prisma'
import {
  shouldHideFromMasterGallery,
} from '@/lib/master-artwork-exclusions'

export type MasterGalleryArtwork = {
  id: string
  title: string
  createdAt: Date
  tags: string[]
}

const blobBackedWhere = {
  OR: [
    {
      thumbnail: {
        contains:
          '.public.blob.vercel-storage.com',

        mode:
          'insensitive' as const,
      },
    },

    {
      assets: {
        some: {
          originalUrl: {
            contains:
              '.public.blob.vercel-storage.com',

            mode:
              'insensitive' as const,
          },
        },
      },
    },
  ],
}

const cleanWhere = {
  NOT: [
    {
      tags: {
        has: 'smoketest',
      },
    },

    {
      title: {
        contains:
          'smoketest',

        mode:
          'insensitive' as const,
      },
    },

    {
      title: {
        contains:
          'diagnostic',

        mode:
          'insensitive' as const,
      },
    },

    {
      title: {
        contains:
          'test artwork',

        mode:
          'insensitive' as const,
      },
    },

    {
      title: {
        contains:
          'db smoketest',

        mode:
          'insensitive' as const,
      },
    },
  ],
}

/*
 * These are the same ordering preferences used
 * by the existing individual Master pages.
 */
const CORE_TITLE_PREFERENCES: Record<
  string,
  string[]
> = {
  VAN_GOGH: [
    'Starry Night in Van Gogh Style',
    'Sunflowers in Van Gogh Style',
    'Cafe Terrace at Night in Van Gogh Style',
    'Irises in Van Gogh Style',
    'Wheatfield with Crows in Van Gogh Style',
    'Bedroom in Arles in Van Gogh Style',
    'The Potato Eaters in Van Gogh Style',
    'Almond Blossoms in Van Gogh Style',
    'Self Portrait in Van Gogh Style',
    'The Night Cafe in Van Gogh Style',
  ],

  DALI: [
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

  POLLOCK: [
    'Autumn Rhythm in Pollock Style',
    'Lavender Mist in Pollock Style',
    'Blue Poles in Pollock Style',
    'Convergence in Pollock Style',
    'Mural in Pollock Style',
    'Drip Composition in Pollock Style',
    'Action Painting in Pollock Style',
    'Splatter Field in Pollock Style',
    'Black and White Energy in Pollock Style',
    'Dynamic Color Field in Pollock Style',
  ],

  VERMEER: [
    'Girl with a Pearl Earring in Vermeer Style',
    'The Milkmaid in Vermeer Style',
    'View of Delft in Vermeer Style',
    'The Art of Painting in Vermeer Style',
    'Woman in Blue Reading a Letter in Vermeer Style',
    'Girl Reading a Letter by an Open Window in Vermeer Style',
    'Woman Holding a Balance in Vermeer Style',
    'The Music Lesson in Vermeer Style',
    'Young Woman with a Water Pitcher in Vermeer Style',
    'Woman with a Lute in Vermeer Style',
  ],

  MONET: [
    'Impression Sunrise in Monet Style',
    'Water Lilies in Monet Style',
    'Japanese Bridge in Monet Style',
    'Woman with a Parasol in Monet Style',
    'Rouen Cathedral in Monet Style',
    'Parliament in Fog in Monet Style',
    'Poppy Field in Monet Style',
    'Haystacks in Monet Style',
    'Garden at Giverny in Monet Style',
    'Boats on the Seine in Monet Style',
  ],

  PICASSO: [
    'Guernica in Picasso Style',
    'Les Demoiselles d Avignon in Picasso Style',
    'The Weeping Woman in Picasso Style',
    'Girl before a Mirror in Picasso Style',
    'Three Musicians in Picasso Style',
    'Portrait of Dora Maar in Picasso Style',
    'The Old Guitarist in Picasso Style',
    'Harlequin with Violin in Picasso Style',
    'Still Life with Guitar in Picasso Style',
  ],

  REMBRANDT: [
    'The Night Watch in Rembrandt Style',
    'The Return of the Prodigal Son in Rembrandt Style',
    'The Anatomy Lesson in Rembrandt Style',
    'The Jewish Bride in Rembrandt Style',
    'Self Portrait in Rembrandt Style',
    'Self Portrait with Two Circles in Rembrandt Style',
    'The Storm on the Sea of Galilee in Rembrandt Style',
    'The Syndics in Rembrandt Style',
    'Scholar at Candlelight in Rembrandt Style',
    'Old Man in Shadow in Rembrandt Style',
  ],

  CARAVAGGIO: [
    'The Calling of Saint Matthew in Caravaggio Style',
    'The Supper at Emmaus in Caravaggio Style',
    'The Taking of Christ in Caravaggio Style',
    'Bacchus in Caravaggio Style',
    'Boy with a Basket of Fruit in Caravaggio Style',
    'The Musicians in Caravaggio Style',
    'Medusa in Caravaggio Style',
    'Saint Jerome Writing in Caravaggio Style',
    'The Fortune Teller in Caravaggio Style',
    'The Cardsharps in Caravaggio Style',
  ],

  DA_VINCI: [
    'Mona Lisa in Da Vinci Style',
    'The Last Supper in Da Vinci Style',
    'Lady with an Ermine in Da Vinci Style',
    'Vitruvian Man in Da Vinci Style',
    'Salvator Mundi in Da Vinci Style',
    'Virgin of the Rocks in Da Vinci Style',
    'Annunciation in Da Vinci Style',
    'Adoration of the Magi in Da Vinci Style',
    'Saint John the Baptist in Da Vinci Style',
    'The Baptism of Christ in Da Vinci Style',
  ],

  MICHELANGELO: [
    'The Creation of Adam in Michelangelo Style',
    'David in Michelangelo Style',
    'Pieta in Michelangelo Style',
    'The Last Judgement in Michelangelo Style',
    'Moses in Michelangelo Style',
    'Doni Tondo in Michelangelo Style',
    'Sistine Chapel Ceiling Study in Michelangelo Style',
    'Prophet on Ceiling Fresco in Michelangelo Style',
    'Ignudi Figure Study in Michelangelo Style',
    'Renaissance Vault Fresco in Michelangelo Style',
    'The Scream in Michelangelo Style',
  ],

  MUNCH: [
    'The Scream in Munch Style',
    'The Dance of Life in Munch Style',
    'Madonna in Munch Style',
    'The Sick Child in Munch Style',
    'Anxiety in Munch Style',
    'Ashes in Munch Style',
    'Vampire in Munch Style',
    'Evening on Karl Johan Street in Munch Style',
    'Girls on the Bridge in Munch Style',
    'Self Portrait with Cigarette in Munch Style',
  ],
}

const CROSSOVER_MARKERS = [
  'Mona Lisa',
  'Girl with a Pearl Earring',
  'The Last Supper',
  'Starry Night',
  'Water Lilies',
  'The Night Watch',
  'The Scream',
  'Persistence of Memory',
  'The Great Wave off Kanagawa',
  'American Gothic',
  'The School of Athens',
  'Liberty Leading the People',
  'Whistler Mother',
  'The Thinker',
  'View of Delft',
  'The Art of Painting',
  'The Music Lesson',
  'The Milkmaid',
  'The Love Letter',
  'The Glass of Wine',
  'Woman Holding a Balance',
  'Young Woman with a Water Pitcher',
  'Officer and Laughing Girl',
  'Girl Reading a Letter by an Open Window',
  'Woman with a Lute',
  'The Hay Wain',
  'The Red Vineyard',
  'Impression Sunrise',
  'Cafe Terrace at Night',
  'Bridge in a Garden',
  'Nighthawks',
  'Sunflowers',
  'Japanese Bridge',
  'Rouen Cathedral',
  'Parliament in Fog',
  'Woman with Parasol',
  'Boats on the Seine',
]

function isCrossoverTitle(
  title: string,
  styleLabel: string
) {
  return CROSSOVER_MARKERS.some(
    (marker) => {
      /*
       * This Master's own correctly named work is allowed.
       */
      if (
        title ===
        `${marker} in ${styleLabel} Style`
      ) {
        return false
      }

      return title.includes(
        marker
      )
    }
  )
}

function isPlaceholderStudy(
  title: string
) {
  const normalized =
    title
      .toLowerCase()
      .trim()

  /*
   * Remove old database filler such as:
   *
   * Da Vinci Study #3
   * Michelangelo Study #07
   * Monet Study #12
   *
   * These should never appear on the public site.
   */
  if (
    /\bstudy\s*#?\s*\d+\b/i.test(
      normalized
    )
  ) {
    return true
  }

  if (
    /\bplaceholder\b/i.test(
      normalized
    )
  ) {
    return true
  }

  return false
}

function sortArtworks(
  styleKey: string,
  styleLabel: string,
  artworks: MasterGalleryArtwork[]
) {
  const preferred =
    CORE_TITLE_PREFERENCES[
      styleKey
    ] || []

  const preferredIndex =
    new Map(
      preferred.map(
        (title, index) => [
          title,
          index,
        ]
      )
    )

  return [
    ...artworks,
  ].sort(
    (a, b) => {
      const aPreferred =
        preferredIndex.has(
          a.title
        )

      const bPreferred =
        preferredIndex.has(
          b.title
        )

      if (
        aPreferred &&
        bPreferred
      ) {
        return (
          preferredIndex.get(
            a.title
          )! -
          preferredIndex.get(
            b.title
          )!
        )
      }

      if (aPreferred) {
        return -1
      }

      if (bPreferred) {
        return 1
      }

      const aCrossover =
        isCrossoverTitle(
          a.title,
          styleLabel
        )

      const bCrossover =
        isCrossoverTitle(
          b.title,
          styleLabel
        )

      if (
        aCrossover !==
        bCrossover
      ) {
        return aCrossover
          ? 1
          : -1
      }

      return (
        a.createdAt.getTime() -
        b.createdAt.getTime()
      )
    }
  )
}

export async function getMasterGallery(
  styleKey: string,
  styleLabel: string
): Promise<
  MasterGalleryArtwork[]
> {
  const artworks =
    await prisma.artwork.findMany(
      {
        where: {
          style:
            styleKey as any,

          status:
            'PUBLISHED',

          ...blobBackedWhere,

          ...cleanWhere,
        },

        orderBy: {
          createdAt:
            'asc',
        },

        take: 500,

        select: {
          id: true,
          title: true,
          createdAt: true,
          tags: true,
        },
      }
    )

  /*
   * Exactly the same public cleanup is now shared by
   * BOTH the individual Master page and /explore/masters.
   */
  const cleaned =
    artworks.filter(
      (artwork) => {
        if (
          shouldHideFromMasterGallery(
            {
              style:
                styleKey,

              title:
                artwork.title,

              tags:
                artwork.tags,
            }
          )
        ) {
          return false
        }

        if (
          isPlaceholderStudy(
            artwork.title
          )
        ) {
          return false
        }

        return true
      }
    )

  return sortArtworks(
    styleKey,
    styleLabel,
    cleaned
  )
}
