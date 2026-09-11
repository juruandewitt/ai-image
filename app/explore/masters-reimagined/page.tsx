export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'
import BackButton from '@/components/back-button'

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
        Reimagined Masterwork
      </text>
    </svg>`
  )

const PUBLIC_BLOB_PREFIX =
  'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/'

const MASTER_STYLES = [
  'MICHELANGELO',
  'VAN_GOGH',
  'MONET',
  'CARAVAGGIO',
  'PICASSO',
  'MUNCH',
  'POLLOCK',
  'REMBRANDT',
  'VERMEER',
  'DALI',
  'DA_VINCI',
] as const

type MasterStyle =
  (typeof MASTER_STYLES)[number]

const STYLE_LABELS: Record<
  MasterStyle,
  string
> = {
  MICHELANGELO: 'Michelangelo',
  VAN_GOGH: 'Vincent van Gogh',
  MONET: 'Claude Monet',
  CARAVAGGIO: 'Caravaggio',
  PICASSO: 'Pablo Picasso',
  MUNCH: 'Edvard Munch',
  POLLOCK: 'Jackson Pollock',
  REMBRANDT: 'Rembrandt',
  VERMEER: 'Johannes Vermeer',
  DALI: 'Salvador Dalí',
  DA_VINCI: 'Leonardo da Vinci',
}

/*
 * DESIGNATED FIRST REIMAGINED ARTWORK
 *
 * These are deliberately independent of the artwork's stored
 * Prisma style metadata.
 *
 * The homepage preview work must always be first on the matching
 * Reimagined Master page.
 */
const HERO_ARTWORKS: Partial<
  Record<
    MasterStyle,
    {
      id: string
      title: string
      image: string
    }
  >
> = {
  MICHELANGELO: {
    id: 'cmnbfkgtb000m76b7fxhnwvcf',
    title: 'The Scream in Michelangelo Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/michelangelo/the-scream-in-michelangelo-style-uhrlG2bs3WxMg24vEymrsIUlB8XQtj.png',
  },

  VAN_GOGH: {
    id: 'cmnnbf5dw000u7arey9doysq6',
    title: 'Mona Lisa in Van Gogh Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/van-gogh/mona-lisa-in-van-gogh-style-ZCAnXSHS9H7UPFWdmf5SEtbdf76gVk.png',
  },

  MONET: {
    id: 'cmn7yhcwc000516ddv03zxjgc',
    title: 'Starry Night in Monet Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/monet/starry-night-in-monet-style-XClaCopIFppIKq49pOoI0w9gzo95bG.png',
  },

  CARAVAGGIO: {
    id: 'cmnox8u470006j89qcsbi57i5',
    title: 'Girl with a Pearl Earring in Caravaggio Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/caravaggio/girl-with-a-pearl-earring-in-caravaggio-style-iIUSvkTN9tvpsnf8fp2JhvAReCe1WY.png',
  },

  PICASSO: {
    id: 'cmnnmtyr1000331x6h0sync7l',
    title: 'The Night Watch in Picasso Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/picasso/the-night-watch-in-picasso-style-R99D9eVFQJCetMGt3Al3FaLbQD9ITP.png',
  },

  MUNCH: {
    id: 'cmnqg2yan0010mvtopbk1hgcz',
    title: 'The Last Supper in Munch Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/munch/the-last-supper-in-munch-style-9OzzojXQ2ByWF497ZyThGAlIpVe875.png',
  },

  POLLOCK: {
    id: 'cmnp1a7i2001rmgqe22rvk6o9',
    title: 'Impression Sunrise in Pollock Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/pollock/impression-sunrise-in-pollock-style-yYBU0MY607MyHQWDW0RKRZUaU0DZXw.png',
  },

  REMBRANDT: {
    id: 'cmnotw7l2000o9edqyqvktxia',
    title: 'Persistence of Memory in Rembrandt Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/rembrandt/persistence-of-memory-in-rembrandt-style-mbmGzGwU5wvni3vkwrLUmoqWc33x1A.png',
  },

  VERMEER: {
    id: 'cmngg1i8l001937jqm4ojyyzd',
    title: 'Guernica in Vermeer Style',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/vermeer/guernica-in-vermeer-style-QaOXgAP2l1gGJjUkkKBdJpLP5Exfp6.png',
  },
}

/*
 * SECONDARY PRIORITY TITLES
 *
 * After the designated homepage hero, recognizable works
 * are displayed before less familiar reinterpretations.
 */
const PRIORITY_TITLES: Partial<
  Record<MasterStyle, string[]>
> = {
  MICHELANGELO: [
    'Mona Lisa in Michelangelo Style',
    'The Last Supper in Michelangelo Style',
    'Starry Night in Michelangelo Style',
    'Girl with a Pearl Earring in Michelangelo Style',
    'The Night Watch in Michelangelo Style',
    'Persistence of Memory in Michelangelo Style',
    'Guernica in Michelangelo Style',
  ],

  VAN_GOGH: [
    'Girl with a Pearl Earring in Van Gogh Style',
    'The Last Supper in Van Gogh Style',
    'The Scream in Van Gogh Style',
    'The Night Watch in Van Gogh Style',
    'Persistence of Memory in Van Gogh Style',
    'Guernica in Van Gogh Style',
  ],

  MONET: [
    'Mona Lisa in Monet Style',
    'Girl with a Pearl Earring in Monet Style',
    'The Last Supper in Monet Style',
    'The Scream in Monet Style',
    'The Night Watch in Monet Style',
    'Persistence of Memory in Monet Style',
    'Guernica in Monet Style',
  ],

  CARAVAGGIO: [
    'Mona Lisa in Caravaggio Style',
    'The Last Supper in Caravaggio Style',
    'Starry Night in Caravaggio Style',
    'The Scream in Caravaggio Style',
    'The Night Watch in Caravaggio Style',
    'Persistence of Memory in Caravaggio Style',
    'Guernica in Caravaggio Style',
  ],

  PICASSO: [
    'Mona Lisa in Picasso Style',
    'Girl with a Pearl Earring in Picasso Style',
    'The Last Supper in Picasso Style',
    'Starry Night in Picasso Style',
    'The Scream in Picasso Style',
    'Persistence of Memory in Picasso Style',
  ],

  MUNCH: [
    'Mona Lisa in Munch Style',
    'Girl with a Pearl Earring in Munch Style',
    'Starry Night in Munch Style',
    'The Night Watch in Munch Style',
    'Persistence of Memory in Munch Style',
    'Guernica in Munch Style',
  ],

  POLLOCK: [
    'Mona Lisa in Pollock Style',
    'Girl with a Pearl Earring in Pollock Style',
    'The Last Supper in Pollock Style',
    'Starry Night in Pollock Style',
    'The Scream in Pollock Style',
    'The Night Watch in Pollock Style',
    'Persistence of Memory in Pollock Style',
    'Guernica in Pollock Style',
  ],

  REMBRANDT: [
    'Mona Lisa in Rembrandt Style',
    'Girl with a Pearl Earring in Rembrandt Style',
    'The Last Supper in Rembrandt Style',
    'Starry Night in Rembrandt Style',
    'The Scream in Rembrandt Style',
    'Guernica in Rembrandt Style',
  ],

  VERMEER: [
    'Mona Lisa in Vermeer Style',
    'The Last Supper in Vermeer Style',
    'Starry Night in Vermeer Style',
    'The Scream in Vermeer Style',
    'The Night Watch in Vermeer Style',
    'Persistence of Memory in Vermeer Style',
  ],
}

/*
 * These are the Master's own works.
 * They must NOT appear on that same Master's
 * Reimagined page.
 */
const ORIGINAL_TITLES: Partial<
  Record<MasterStyle, string[]>
> = {
  MICHELANGELO: [
    'The Creation of Adam in Michelangelo Style',
    'David in Michelangelo Style',
    'Pieta in Michelangelo Style',
    'The Last Judgement in Michelangelo Style',
  ],

  VAN_GOGH: [
    'Starry Night in Van Gogh Style',
    'Sunflowers in Van Gogh Style',
    'Cafe Terrace at Night in Van Gogh Style',
    'Irises in Van Gogh Style',
  ],

  MONET: [
    'Impression Sunrise in Monet Style',
    'Water Lilies in Monet Style',
    'Japanese Bridge in Monet Style',
  ],

  CARAVAGGIO: [
    'The Calling of Saint Matthew in Caravaggio Style',
    'The Supper at Emmaus in Caravaggio Style',
  ],

  PICASSO: [
    'Guernica in Picasso Style',
    'The Weeping Woman in Picasso Style',
  ],

  MUNCH: [
    'The Scream in Munch Style',
  ],

  POLLOCK: [
    'Autumn Rhythm',
    'Autumn Rhythm in Pollock Style',
  ],

  REMBRANDT: [
    'The Night Watch in Rembrandt Style',
  ],

  VERMEER: [
    'Girl with a Pearl Earring in Vermeer Style',
  ],

  DALI: [
    'Persistence of Memory Inspired',
    'Persistence of Memory in Dali Style',
  ],

  DA_VINCI: [
    'Mona Lisa in Da Vinci Style',
    'The Last Supper in Da Vinci Style',
  ],
}

const STYLE_SEARCH_NAMES: Record<
  MasterStyle,
  string[]
> = {
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

  CARAVAGGIO: [
    'caravaggio',
  ],

  PICASSO: [
    'picasso',
    'pablo picasso',
  ],

  MUNCH: [
    'munch',
    'edvard munch',
  ],

  POLLOCK: [
    'pollock',
    'jackson pollock',
  ],

  REMBRANDT: [
    'rembrandt',
  ],

  VERMEER: [
    'vermeer',
    'johannes vermeer',
  ],

  DALI: [
    'dali',
    'dalí',
    'salvador dali',
    'salvador dalí',
  ],

  DA_VINCI: [
    'da vinci',
    'leonardo da vinci',
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

function isOriginalArtwork(
  style: MasterStyle,
  title: string
) {
  const originals =
    ORIGINAL_TITLES[
      style
    ] ?? []

  const normalizedTitle =
    normalizeText(title)

  return originals.some(
    (originalTitle) =>
      normalizeText(
        originalTitle
      ) === normalizedTitle
  )
}

function isReimaginedArtwork(
  style: MasterStyle,
  title: string
) {
  if (
    isOriginalArtwork(
      style,
      title
    )
  ) {
    return false
  }

  const normalizedTitle =
    normalizeText(title)

  if (
    normalizedTitle.includes(
      'reimagined'
    )
  ) {
    return true
  }

  return STYLE_SEARCH_NAMES[
    style
  ].some((name) =>
    normalizedTitle.includes(
      `in ${normalizeText(
        name
      )} style`
    )
  )
}

function isStablePublicImage(
  value?: string | null
) {
  return Boolean(
    value &&
      value.startsWith(
        PUBLIC_BLOB_PREFIX
      )
  )
}

type ArtworkRow = {
  id: string
  title: string
  artist: string | null
  style: unknown
  thumbnail: string | null

  assets: {
    originalUrl: string | null
  }[]
}

type DisplayArtwork = {
  id: string
  title: string
  image: string
}

function resolveImage(
  artwork: ArtworkRow
) {
  if (
    isStablePublicImage(
      artwork.thumbnail
    )
  ) {
    return artwork.thumbnail
  }

  const stableAsset =
    artwork.assets.find(
      (asset) =>
        isStablePublicImage(
          asset.originalUrl
        )
    )

  return (
    stableAsset?.originalUrl ??
    null
  )
}

function getSelectedStyle(
  value:
    | string
    | string[]
    | undefined
) {
  const raw =
    Array.isArray(value)
      ? value[0]
      : value

  if (!raw) {
    return null
  }

  const normalized =
    raw.toUpperCase() as MasterStyle

  return MASTER_STYLES.includes(
    normalized
  )
    ? normalized
    : null
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
    normalizeText(title)

  const index =
    priorities.findIndex(
      (priority) =>
        normalizeText(
          priority
        ) === normalizedTitle
    )

  return index === -1
    ? Number.MAX_SAFE_INTEGER
    : index
}

export default async function MastersReimaginedPage({
  searchParams,
}: {
  searchParams?: {
    style?:
      | string
      | string[]
  }
}) {
  const selectedStyle =
    getSelectedStyle(
      searchParams?.style
    )

  /*
   * The hero IDs are included explicitly in the query.
   *
   * This is critical because some older artwork records have
   * inconsistent style metadata.
   */
  const heroIds =
    Object.values(
      HERO_ARTWORKS
    )
      .map(
        (hero) =>
          hero?.id
      )
      .filter(
        (
          id
        ): id is string =>
          Boolean(id)
      )

  const artworks =
    await prisma.artwork.findMany(
      {
        where: {
          status:
            'PUBLISHED',

          OR: [
            {
              style: {
                in: [
                  ...MASTER_STYLES,
                ] as any,
              },
            },

            {
              id: {
                in:
                  heroIds,
              },
            },
          ],
        },

        orderBy: {
          title: 'asc',
        },

        take: 4000,

        select: {
          id: true,
          title: true,
          artist: true,
          style: true,
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

  const artworkById =
    new Map<
      string,
      ArtworkRow
    >()

  for (
    const artwork of artworks
  ) {
    artworkById.set(
      artwork.id,
      artwork as ArtworkRow
    )
  }

  const allGroups =
    MASTER_STYLES.map(
      (style) => {
        const hero =
          HERO_ARTWORKS[
            style
          ]

        const regularItems: DisplayArtwork[] =
          artworks
            .filter(
              (artwork) =>
                artwork.style ===
                  style &&
                isReimaginedArtwork(
                  style,
                  artwork.title
                )
            )
            .map(
              (artwork) => {
                const image =
                  resolveImage(
                    artwork as ArtworkRow
                  )

                if (!image) {
                  return null
                }

                return {
                  id:
                    artwork.id,

                  title:
                    artwork.title,

                  image,
                }
              }
            )
            .filter(
              (
                artwork
              ): artwork is DisplayArtwork =>
                artwork !==
                null
            )

        /*
         * Remove the hero from the normal list if it already
         * happened to survive the regular filtering.
         *
         * We will insert it manually at position zero.
         */
        const withoutHero =
          hero
            ? regularItems.filter(
                (artwork) =>
                  artwork.id !==
                  hero.id
              )
            : regularItems

        withoutHero.sort(
          (a, b) => {
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

            return a.title.localeCompare(
              b.title
            )
          }
        )

        /*
         * HERO INJECTION
         *
         * The designated homepage artwork is inserted manually
         * and therefore cannot disappear because of incorrect
         * legacy style metadata.
         */
        let heroItem:
          | DisplayArtwork
          | null = null

        if (hero) {
          const databaseHero =
            artworkById.get(
              hero.id
            )

          heroItem = {
            id:
              hero.id,

            title:
              databaseHero
                ?.title ||
              hero.title,

            /*
             * We deliberately use the known-good image here.
             */
            image:
              hero.image,
          }
        }

        const groupArtworks =
          heroItem
            ? [
                heroItem,
                ...withoutHero,
              ]
            : withoutHero

        /*
         * Final de-duplication.
         */
        const seen =
          new Set<string>()

        const unique =
          groupArtworks.filter(
            (artwork) => {
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

          label:
            STYLE_LABELS[
              style
            ],

          artworks:
            unique,
        }
      }
    )

  const displayedGroups =
    selectedStyle
      ? allGroups.filter(
          (group) =>
            group.style ===
            selectedStyle
        )
      : allGroups

  const displayedArtworkCount =
    displayedGroups.reduce(
      (total, group) =>
        total +
        group.artworks.length,
      0
    )

  const pageTitle =
    selectedStyle
      ? `Reimagined by ${
          STYLE_LABELS[
            selectedStyle
          ]
        }`
      : 'The Masters Reimagined'

  const pageDescription =
    selectedStyle
      ? `Explore masterpieces transformed into the visual language of ${
          STYLE_LABELS[
            selectedStyle
          ]
        }.`
      : 'Discover famous artworks transformed through the visual languages of the Masters.'

  return (
    <main className="space-y-14">

      {/* HEADER */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <BackButton />

        {selectedStyle ? (
          <Link
            href="/explore/masters-reimagined"
            className="ml-5 text-sm font-semibold text-slate-400 hover:text-amber-300"
          >
            View all Masters
          </Link>
        ) : null}

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          {pageTitle}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          {pageDescription}
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
            {displayedArtworkCount}{' '}
            reimagined artworks
          </div>

          {!selectedStyle ? (
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
              11 Master collections
            </div>
          ) : null}
        </div>
      </section>

      {/* MASTER FILTERS */}
      {!selectedStyle ? (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">
            Browse by Master
          </h2>

          <div className="flex flex-wrap gap-3">
            {allGroups.map(
              (group) => (
                <Link
                  key={
                    group.style
                  }
                  href={`/explore/masters-reimagined?style=${group.style}`}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/60 hover:text-amber-300"
                >
                  {
                    group.label
                  }

                  <span className="ml-2 text-slate-500">
                    {
                      group
                        .artworks
                        .length
                    }
                  </span>
                </Link>
              )
            )}
          </div>
        </section>
      ) : null}

      {/* MASTER GROUPS */}
      {displayedGroups.map(
        (group) => (
          <section
            key={
              group.style
            }
            className="space-y-6"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  Reimagined by{' '}
                  {
                    group.label
                  }
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  Recognisable masterpieces interpreted through
                  the visual language of {group.label}.
                </p>
              </div>

              {!selectedStyle ? (
                <Link
                  href={`/explore/masters-reimagined?style=${group.style}`}
                  className="shrink-0 text-sm font-semibold text-amber-300 hover:underline"
                >
                  Explore all →
                </Link>
              ) : null}
            </div>

            {group.artworks.length ===
            0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <div className="font-semibold text-white">
                  Library awaiting review
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  No published
                  reimagined works
                  are currently
                  available for{' '}
                  {group.label}.
                </p>
              </div>
            ) : (
              <div
                className={
                  selectedStyle
                    ? 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4'
                    : '-mx-4 overflow-x-auto px-4 pb-3'
                }
              >
                <div
                  className={
                    selectedStyle
                      ? 'contents'
                      : 'flex gap-5'
                  }
                >
                  {group.artworks.map(
                    (
                      artwork
                    ) => (
                      <Link
                        key={
                          artwork.id
                        }
                        href={`/artwork/${artwork.id}`}
                        className={
                          selectedStyle
                            ? 'group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60'
                            : 'group min-w-[250px] max-w-[250px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[310px] md:max-w-[310px]'
                        }
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
              </div>
            )}
          </section>
        )
      )}
    </main>
  )
}
