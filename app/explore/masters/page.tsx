export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'
import BackButton from '@/components/back-button'
import HorizontalScrollRow from '@/components/horizontal-scroll-row'
import {
  shouldHideFromMasterGallery,
} from '@/lib/master-artwork-exclusions'

const PREVIEW_VERSION =
  'masters-overview-v3'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">
      <rect width="100%" height="100%" fill="#050816"/>
      <text
        x="50%"
        y="48%"
        fill="#d6bc7b"
        font-family="sans-serif"
        font-size="24"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        AI Image
      </text>
      <text
        x="50%"
        y="56%"
        fill="#94a3b8"
        font-family="sans-serif"
        font-size="15"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        Master Collection
      </text>
    </svg>`
  )

const MASTER_STYLES = [
  'DA_VINCI',
  'MICHELANGELO',
  'VAN_GOGH',
  'MONET',
  'REMBRANDT',
  'CARAVAGGIO',
  'VERMEER',
  'MUNCH',
  'POLLOCK',
  'DALI',
  'PICASSO',
] as const

type MasterStyle =
  (typeof MASTER_STYLES)[number]

const MASTER_CONFIG: Record<
  MasterStyle,
  {
    label: string
    href: string
    description: string
  }
> = {
  DA_VINCI: {
    label: 'Leonardo da Vinci',
    href: '/explore/styles/leonardo-da-vinci',
    description:
      'Explore works inspired by the extraordinary artistic legacy of Leonardo da Vinci.',
  },

  MICHELANGELO: {
    label: 'Michelangelo',
    href: '/explore/styles/michelangelo',
    description:
      'Explore monumental Renaissance works inspired by Michelangelo.',
  },

  VAN_GOGH: {
    label: 'Vincent van Gogh',
    href: '/explore/styles/van-gogh',
    description:
      'Explore expressive works inspired by the colour, movement and unmistakable visual language of Vincent van Gogh.',
  },

  MONET: {
    label: 'Claude Monet',
    href: '/explore/styles/claude-monet',
    description:
      'Explore atmospheric works inspired by the light and colour of Claude Monet.',
  },

  REMBRANDT: {
    label: 'Rembrandt',
    href: '/explore/styles/rembrandt',
    description:
      'Explore dramatic works inspired by Rembrandt’s extraordinary use of light and shadow.',
  },

  CARAVAGGIO: {
    label: 'Caravaggio',
    href: '/explore/styles/caravaggio',
    description:
      'Explore powerful works inspired by Caravaggio’s theatrical compositions and dramatic chiaroscuro.',
  },

  VERMEER: {
    label: 'Johannes Vermeer',
    href: '/explore/styles/johannes-vermeer',
    description:
      'Explore luminous and intimate works inspired by Johannes Vermeer.',
  },

  MUNCH: {
    label: 'Edvard Munch',
    href: '/explore/styles/edvard-munch',
    description:
      'Explore emotionally charged works inspired by Edvard Munch.',
  },

  POLLOCK: {
    label: 'Jackson Pollock',
    href: '/explore/styles/jackson-pollock',
    description:
      'Explore energetic abstract works inspired by Jackson Pollock.',
  },

  DALI: {
    label: 'Salvador Dalí',
    href: '/explore/styles/dali',
    description:
      'Explore surreal works inspired by the dreamlike imagination of Salvador Dalí.',
  },

  PICASSO: {
    label: 'Pablo Picasso',
    href: '/explore/styles/pablo-picasso',
    description:
      'Explore bold works inspired by the revolutionary visual language of Pablo Picasso.',
  },
}

/*
 * IMPORTANT:
 *
 * These titles determine which recognizable works appear
 * first in each horizontal row.
 */
const PRIORITY_TITLES: Partial<
  Record<MasterStyle, string[]>
> = {
  DA_VINCI: [
    'Mona Lisa',
    'Mona Lisa in Da Vinci Style',
    'The Last Supper',
    'The Last Supper in Da Vinci Style',
    'Lady with an Ermine',
    'Saint John the Baptist',
    'Saint John the Baptist in Da Vinci Style',
    'Vitruvian Man',
    'Salvator Mundi',
    'Virgin of the Rocks',
  ],

  MICHELANGELO: [
    'The Creation of Adam',
    'The Creation of Adam in Michelangelo Style',
    'David',
    'David in Michelangelo Style',
    'Pieta',
    'Pieta in Michelangelo Style',
    'The Last Judgement',
    'The Last Judgement in Michelangelo Style',
    'Moses',
  ],

  VAN_GOGH: [
    'The Starry Night',
    'Starry Night',
    'Starry Night in Van Gogh Style',
    'Sunflowers',
    'Sunflowers in Van Gogh Style',
    'Cafe Terrace at Night',
    'Cafe Terrace at Night in Van Gogh Style',
    'Irises',
    'Irises in Van Gogh Style',
    'Almond Blossoms',
  ],

  MONET: [
    'Impression, Sunrise',
    'Impression Sunrise',
    'Impression Sunrise in Monet Style',
    'Water Lilies',
    'Water Lilies in Monet Style',
    'Japanese Bridge',
    'Japanese Bridge in Monet Style',
    'Woman with a Parasol',
    'Rouen Cathedral',
  ],

  REMBRANDT: [
    'The Night Watch',
    'The Night Watch in Rembrandt Style',
    'The Anatomy Lesson of Dr Nicolaes Tulp',
    'The Anatomy Lesson',
    'The Jewish Bride',
    'Self Portrait',
    'The Return of the Prodigal Son',
  ],

  CARAVAGGIO: [
    'The Calling of Saint Matthew',
    'The Calling of Saint Matthew in Caravaggio Style',
    'The Supper at Emmaus',
    'The Supper at Emmaus in Caravaggio Style',
    'Judith Beheading Holofernes',
    'Bacchus',
    'Medusa',
  ],

  VERMEER: [
    'Girl with a Pearl Earring',
    'Girl with a Pearl Earring in Vermeer Style',
    'The Milkmaid',
    'View of Delft',
    'The Art of Painting',
    'Woman Holding a Balance',
    'The Music Lesson',
  ],

  MUNCH: [
    'The Scream',
    'The Scream in Munch Style',
    'Madonna',
    'The Dance of Life',
    'Anxiety',
    'The Sick Child',
    'Vampire',
  ],

  POLLOCK: [
    'Autumn Rhythm',
    'Autumn Rhythm in Pollock Style',
    'Number 1A',
    'Blue Poles',
    'Convergence',
    'Lavender Mist',
    'Mural',
  ],

  DALI: [
    'The Persistence of Memory',
    'Persistence of Memory',
    'Persistence of Memory Inspired',
    'Persistence of Memory in Dali Style',
    'The Elephants',
    'Metamorphosis of Narcissus',
  ],

  PICASSO: [
    'Guernica',
    'Guernica in Picasso Style',
    'The Weeping Woman',
    'The Weeping Woman in Picasso Style',
    'Les Demoiselles d Avignon',
    'Three Musicians',
    'The Old Guitarist',
  ],
}

/*
 * These help distinguish a Master's own collection
 * from Masters Reimagined.
 */
const STYLE_SEARCH_NAMES: Record<
  MasterStyle,
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

const REIMAGINED_SOURCE_WORKS = [
  'Mona Lisa',
  'The Last Supper',
  'Starry Night',
  'The Starry Night',
  'Girl with a Pearl Earring',
  'The Scream',
  'The Night Watch',
  'Persistence of Memory',
  'The Persistence of Memory',
  'Guernica',
  'Impression Sunrise',
  'Impression, Sunrise',
  'The Creation of Adam',
  'American Gothic',
  'The Great Wave off Kanagawa',
  'The School of Athens',
  'Liberty Leading the People',
] as const

type ArtworkRow = {
  id: string
  title: string
  style: unknown
  tags: string[]
  createdAt: Date
}

type DisplayArtwork = {
  id: string
  title: string
  image: string
  createdAt: Date
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
    .replace(
      /[’‘]/g,
      "'"
    )
    .replace(
      /[^a-z0-9]+/g,
      ' '
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}

/*
 * This is deliberately simple and reliable.
 *
 * We do NOT attempt to locate the Blob URL here.
 *
 * Every image is served through the existing preview API,
 * exactly like your working individual Master pages.
 */
function artworkPreviewUrl(
  artworkId: string
): string {
  return `/api/artwork/preview/${artworkId}?w=800&v=${PREVIEW_VERSION}`
}

function isKnownMasterWork(
  style: MasterStyle,
  title: string
) {
  const priorities =
    PRIORITY_TITLES[
      style
    ] ?? []

  const normalized =
    normalizeText(
      title
    )

  return priorities.some(
    (candidate) =>
      normalizeText(
        candidate
      ) ===
      normalized
  )
}

/*
 * Determine whether this artwork belongs in
 * Masters Reimagined rather than The Masters.
 *
 * We intentionally keep known canonical works in
 * the normal Master library.
 */
function isReimaginedArtwork(
  style: MasterStyle,
  title: string
) {
  if (
    isKnownMasterWork(
      style,
      title
    )
  ) {
    return false
  }

  const normalizedTitle =
    normalizeText(
      title
    )

  if (
    normalizedTitle.includes(
      'reimagined'
    )
  ) {
    return true
  }

  const mentionsThisStyle =
    STYLE_SEARCH_NAMES[
      style
    ].some(
      (name) =>
        normalizedTitle.includes(
          `in ${normalizeText(
            name
          )} style`
        )
    )

  if (
    !mentionsThisStyle
  ) {
    return false
  }

  return REIMAGINED_SOURCE_WORKS.some(
    (sourceWork) =>
      normalizedTitle.startsWith(
        normalizeText(
          sourceWork
        )
      )
  )
}

function getPriorityIndex(
  style: MasterStyle,
  title: string
) {
  const priorities =
    PRIORITY_TITLES[
      style
    ] ?? []

  const normalizedTitle =
    normalizeText(
      title
    )

  const index =
    priorities.findIndex(
      (priority) =>
        normalizeText(
          priority
        ) ===
        normalizedTitle
    )

  return index === -1
    ? Number.MAX_SAFE_INTEGER
    : index
}

export default async function MastersPage() {
  const artworks =
    await prisma.artwork.findMany(
      {
        where: {
          status:
            'PUBLISHED',

          style: {
            in: [
              ...MASTER_STYLES,
            ] as any,
          },
        },

        orderBy: {
          createdAt:
            'asc',
        },

        take:
          4000,

        select: {
          id: true,
          title: true,
          style: true,
          tags: true,
          createdAt: true,
        },
      }
    )

  const groups =
    MASTER_STYLES.map(
      (style) => {
        const config =
          MASTER_CONFIG[
            style
          ]

        const masterArtworks: DisplayArtwork[] =
          artworks
            .filter(
              (
                artwork
              ) => {
                if (
                  artwork.style !==
                  style
                ) {
                  return false
                }

                /*
                 * Apply our existing blacklist and automatically
                 * remove theme:* contamination.
                 */
                if (
                  shouldHideFromMasterGallery(
                    {
                      style,

                      title:
                        artwork.title,

                      tags:
                        artwork.tags,
                    }
                  )
                ) {
                  return false
                }

                /*
                 * Reimagined artworks stay in their own section.
                 */
                if (
                  isReimaginedArtwork(
                    style,
                    artwork.title
                  )
                ) {
                  return false
                }

                return true
              }
            )
            .map(
              (
                artwork
              ): DisplayArtwork => ({
                id:
                  artwork.id,

                title:
                  artwork.title,

                createdAt:
                  artwork.createdAt,

                /*
                 * KEY FIX:
                 *
                 * Always use the proven preview API.
                 */
                image:
                  artworkPreviewUrl(
                    artwork.id
                  ),
              })
            )

        masterArtworks.sort(
          (
            a,
            b
          ) => {
            const aPriority =
              getPriorityIndex(
                style,
                a.title
              )

            const bPriority =
              getPriorityIndex(
                style,
                b.title
              )

            if (
              aPriority !==
              bPriority
            ) {
              return (
                aPriority -
                bPriority
              )
            }

            return (
              a.createdAt.getTime() -
              b.createdAt.getTime()
            )
          }
        )

        /*
         * Defensive ID de-duplication.
         */
        const seen =
          new Set<string>()

        const unique =
          masterArtworks.filter(
            (
              artwork
            ) => {
              if (
                seen.has(
                  artwork.id
                )
              ) {
                return false
              }

              seen.add(
                artwork.id
              )

              return true
            }
          )

        return {
          style,

          ...config,

          artworks:
            unique,
        }
      }
    )

  const totalArtworks =
    groups.reduce(
      (
        total,
        group
      ) =>
        total +
        group.artworks
          .length,
      0
    )

  return (
    <main className="space-y-14">

      {/* PAGE HEADER */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <BackButton />

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          The Masters
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          Explore our collections inspired by 11 of the world&apos;s most celebrated Masters. Browse each collection below, or open the complete gallery for any Master.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
            11 Master collections
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
            {totalArtworks}{' '}
            artworks
          </div>
        </div>
      </section>

      {/* MASTER COLLECTIONS */}
      {groups.map(
        (
          group
        ) => (
          <section
            key={
              group.style
            }
            className="space-y-6"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">
                  {
                    group.label
                  }
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  {
                    group.description
                  }
                </p>
              </div>

              <Link
                href={
                  group.href
                }
                className="shrink-0 text-sm font-semibold text-amber-300 hover:underline"
              >
                Explore all →
              </Link>
            </div>

            {group.artworks
              .length ===
            0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <div className="font-semibold text-white">
                  Collection awaiting review
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  No published artworks are currently available in this Master collection.
                </p>
              </div>
            ) : (
              <HorizontalScrollRow>
                <div className="flex gap-5">
                  {group.artworks.map(
                    (
                      artwork
                    ) => (
                      <Link
                        key={
                          artwork.id
                        }
                        href={`/artwork/${artwork.id}`}
                        className="group min-w-[250px] max-w-[250px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[310px] md:max-w-[310px]"
                      >
                        <SafeImg
                          src={
                            artwork.image
                          }
                          fallbackSrc={
                            FALLBACK_DATA_URL
                          }
                          alt={
                            artwork.title
                          }
                          className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                        />

                        <div className="p-5">
                          <div className="line-clamp-2 font-semibold text-white">
                            {
                              artwork.title
                            }
                          </div>

                          <div className="mt-2 text-sm text-amber-300">
                            {
                              group.label
                            }
                          </div>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              </HorizontalScrollRow>
            )}
          </section>
        )
      )}
    </main>
  )
}
