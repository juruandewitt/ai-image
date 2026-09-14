export const dynamic =
  'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

type SearchType =
  | 'all'
  | 'masters'
  | 'reimagined'
  | 'collections'

const STYLE_LABELS: Record<
  string,
  string
> = {
  DA_VINCI:
    'Leonardo da Vinci',

  MICHELANGELO:
    'Michelangelo',

  VAN_GOGH:
    'Vincent van Gogh',

  MONET:
    'Claude Monet',

  REMBRANDT:
    'Rembrandt',

  CARAVAGGIO:
    'Caravaggio',

  VERMEER:
    'Johannes Vermeer',

  MUNCH:
    'Edvard Munch',

  POLLOCK:
    'Jackson Pollock',

  DALI:
    'Salvador Dalí',

  PICASSO:
    'Pablo Picasso',
}

const STYLE_SEARCH_TERMS: Record<
  string,
  string[]
> = {
  DA_VINCI: [
    'da vinci',
    'leonardo',
    'leonardo da vinci',
  ],

  MICHELANGELO: [
    'michelangelo',
  ],

  VAN_GOGH: [
    'van gogh',
    'vincent van gogh',
    'vincent',
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

const THEMES = [
  {
    slug: 'abstract',
    label: 'Abstract',
  },
  {
    slug:
      'ancient-civilizations',
    label:
      'Ancient Civilizations',
  },
  {
    slug:
      'animals-pets',
    label:
      'Animals / Pets',
  },
  {
    slug:
      'architecture',
    label:
      'Architecture',
  },
  {
    slug:
      'automotive',
    label:
      'Automotive',
  },
  {
    slug:
      'business-finance',
    label:
      'Business / Finance',
  },
  {
    slug:
      'cars-automotive',
    label:
      'Cars / Automotive',
  },
  {
    slug:
      'cyberpunk',
    label:
      'Cyberpunk',
  },
  {
    slug:
      'fantasy',
    label:
      'Fantasy',
  },
  {
    slug:
      'fantasy-kingdoms',
    label:
      'Fantasy Kingdoms',
  },
  {
    slug:
      'fashion-editorial',
    label:
      'Fashion / Editorial',
  },
  {
    slug:
      'food-culinary',
    label:
      'Food / Culinary',
  },
  {
    slug:
      'gaming-esports',
    label:
      'Gaming / Esports',
  },
  {
    slug:
      'health-wellness',
    label:
      'Health / Wellness',
  },
  {
    slug:
      'kids-nursery',
    label:
      'Kids / Nursery',
  },
  {
    slug:
      'landscapes',
    label:
      'Landscapes',
  },
  {
    slug:
      'luxury-interior',
    label:
      'Luxury / Interior Decor',
  },
  {
    slug:
      'luxury-lifestyle',
    label:
      'Luxury Lifestyle',
  },
  {
    slug:
      'music-performance',
    label:
      'Music / Performance',
  },
  {
    slug:
      'nature-botanical',
    label:
      'Nature / Botanical',
  },
  {
    slug:
      'ocean-marine',
    label:
      'Ocean / Marine',
  },
  {
    slug:
      'seasonal-holidays',
    label:
      'Seasonal / Holidays',
  },
  {
    slug:
      'space-galaxy',
    label:
      'Space / Galaxy',
  },
  {
    slug:
      'space-universe',
    label:
      'Space & Universe',
  },
  {
    slug:
      'spiritual-zen',
    label:
      'Spiritual / Zen',
  },
  {
    slug:
      'sports-action',
    label:
      'Sports / Action',
  },
  {
    slug:
      'steampunk',
    label:
      'Steampunk',
  },
  {
    slug:
      'travel-destinations',
    label:
      'Travel / Destinations',
  },
  {
    slug:
      'vintage-retro',
    label:
      'Vintage / Retro',
  },
  {
    slug:
      'wildlife',
    label:
      'Wildlife',
  },
] as const

const ORIGINAL_TITLES: Record<
  string,
  string[]
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

function getThemeSlug(
  tags: string[]
) {
  const tag =
    tags.find(
      (value) =>
        value.startsWith(
          'theme:'
        )
    )

  return tag
    ? tag.slice(
        'theme:'.length
      )
    : null
}

function getThemeLabel(
  slug: string | null
) {
  if (!slug) {
    return null
  }

  return (
    THEMES.find(
      (theme) =>
        theme.slug ===
        slug
    )?.label ?? slug
  )
}

function isOriginalMasterWork(
  style: string,
  title: string
) {
  const originals =
    ORIGINAL_TITLES[
      style
    ] ?? []

  const normalized =
    normalizeText(title)

  return originals.some(
    (candidate) =>
      normalizeText(
        candidate
      ) === normalized
  )
}

function classifyArtwork(
  artwork: {
    title: string
    style: string
    tags: string[]
  }
): Exclude<
  SearchType,
  'all'
> {
  const theme =
    getThemeSlug(
      artwork.tags
    )

  if (theme) {
    return 'collections'
  }

  const normalized =
    normalizeText(
      artwork.title
    )

  const hasStylePhrase =
    normalized.includes(
      ' style'
    )

  if (
    hasStylePhrase &&
    !isOriginalMasterWork(
      artwork.style,
      artwork.title
    )
  ) {
    return 'reimagined'
  }

  return 'masters'
}

function resultSubtitle(
  artwork: {
    title: string
    artist: string | null
    style: string
    tags: string[]
  }
) {
  const type =
    classifyArtwork(
      artwork
    )

  if (
    type ===
    'collections'
  ) {
    const theme =
      getThemeLabel(
        getThemeSlug(
          artwork.tags
        )
      )

    return `Collection · ${
      theme ||
      'AI Image'
    }`
  }

  const master =
    STYLE_LABELS[
      artwork.style
    ] ||
    artwork.artist ||
    'AI Image'

  if (
    type ===
    'reimagined'
  ) {
    return `Masters Reimagined · ${master}`
  }

  return `Master Collection · ${master}`
}

function scoreArtwork(
  artwork: {
    title: string
    artist: string | null
    style: string
    tags: string[]
  },
  query: string
) {
  const q =
    normalizeText(query)

  const title =
    normalizeText(
      artwork.title
    )

  const artist =
    normalizeText(
      artwork.artist || ''
    )

  const styleLabel =
    normalizeText(
      STYLE_LABELS[
        artwork.style
      ] || ''
    )

  const themeLabel =
    normalizeText(
      getThemeLabel(
        getThemeSlug(
          artwork.tags
        )
      ) || ''
    )

  let score = 0

  if (title === q) {
    score += 1200
  } else if (
    title.startsWith(q)
  ) {
    score += 900
  } else if (
    title.includes(q)
  ) {
    score += 650
  }

  if (artist === q) {
    score += 500
  } else if (
    artist.includes(q)
  ) {
    score += 300
  }

  if (
    styleLabel === q
  ) {
    score += 500
  } else if (
    styleLabel.includes(q)
  ) {
    score += 300
  }

  if (
    themeLabel === q
  ) {
    score += 550
  } else if (
    themeLabel.includes(q)
  ) {
    score += 320
  }

  return score
}

function validType(
  value?: string
): SearchType {
  if (
    value === 'masters' ||
    value ===
      'reimagined' ||
    value ===
      'collections'
  ) {
    return value
  }

  return 'all'
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    q?: string
    type?: string
  }
}) {
  const query =
    (
      searchParams.q || ''
    ).trim()

  const type =
    validType(
      searchParams.type
    )

  if (!query) {
    return (
      <main className="mx-auto max-w-6xl space-y-8 py-12">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
          <h1 className="text-4xl font-semibold text-white">
            Search AI Image
          </h1>

          <p className="mt-4 max-w-2xl text-slate-400">
            Search by artwork
            title, Master,
            collection or
            subject using the
            search box above.
          </p>
        </section>
      </main>
    )
  }

  const normalizedQuery =
    normalizeText(query)

  const matchedStyleKeys =
    Object.entries(
      STYLE_SEARCH_TERMS
    )
      .filter(
        ([, terms]) =>
          terms.some(
            (term) => {
              const normalizedTerm =
                normalizeText(
                  term
                )

              return (
                normalizedTerm.includes(
                  normalizedQuery
                ) ||
                normalizedQuery.includes(
                  normalizedTerm
                )
              )
            }
          )
      )
      .map(
        ([style]) =>
          style
      )

  const matchedThemeTags =
    THEMES.filter(
      (theme) => {
        const label =
          normalizeText(
            theme.label
          )

        const slug =
          normalizeText(
            theme.slug
          )

        return (
          label.includes(
            normalizedQuery
          ) ||
          normalizedQuery.includes(
            label
          ) ||
          slug.includes(
            normalizedQuery
          )
        )
      }
    ).map(
      (theme) =>
        `theme:${theme.slug}`
    )

  const orConditions: any[] =
    [
      {
        title: {
          contains:
            query,

          mode:
            'insensitive',
        },
      },

      {
        artist: {
          contains:
            query,

          mode:
            'insensitive',
        },
      },
    ]

  if (
    matchedStyleKeys.length >
    0
  ) {
    orConditions.push({
      style: {
        in:
          matchedStyleKeys,
      },
    })
  }

  if (
    matchedThemeTags.length >
    0
  ) {
    orConditions.push({
      tags: {
        hasSome:
          matchedThemeTags,
      },
    })
  }

  const rawResults =
    await prisma.artwork.findMany(
      {
        where: {
          status:
            'PUBLISHED',

          OR:
            orConditions,
        },

        take: 300,

        select: {
          id: true,
          title: true,
          artist: true,
          style: true,
          tags: true,
        },
      }
    )

  const ranked =
    rawResults
      .map(
        (artwork) => ({
          ...artwork,

          category:
            classifyArtwork({
              title:
                artwork.title,

              style:
                String(
                  artwork.style
                ),

              tags:
                artwork.tags,
            }),

          score:
            scoreArtwork(
              {
                title:
                  artwork.title,

                artist:
                  artwork.artist,

                style:
                  String(
                    artwork.style
                  ),

                tags:
                  artwork.tags,
              },
              query
            ),
        })
      )
      .filter(
        (artwork) =>
          type === 'all' ||
          artwork.category ===
            type
      )
      .sort(
        (a, b) => {
          if (
            b.score !==
            a.score
          ) {
            return (
              b.score -
              a.score
            )
          }

          return a.title.localeCompare(
            b.title
          )
        }
      )
      .slice(0, 120)

  const searchUrl =
    `/search?q=${encodeURIComponent(
      query
    )}${
      type !== 'all'
        ? `&type=${encodeURIComponent(
            type
          )}`
        : ''
    }`

  const filters: {
    key: SearchType
    label: string
  }[] = [
    {
      key: 'all',
      label: 'All',
    },
    {
      key: 'masters',
      label: 'Masters',
    },
    {
      key:
        'reimagined',
      label:
        'Reimagined',
    },
    {
      key:
        'collections',
      label:
        'Collections',
    },
  ]

  return (
    <main className="mx-auto max-w-7xl space-y-8 py-10">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 md:p-10">
        <h1 className="text-3xl font-semibold text-white md:text-5xl">
          Search results
        </h1>

        <p className="mt-3 text-slate-400">
          {ranked.length}{' '}
          {ranked.length === 1
            ? 'result'
            : 'results'}{' '}
          for{' '}
          <span className="font-semibold text-white">
            “{query}”
          </span>
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {filters.map(
            (filter) => {
              const href =
                filter.key ===
                'all'
                  ? `/search?q=${encodeURIComponent(
                      query
                    )}`
                  : `/search?q=${encodeURIComponent(
                      query
                    )}&type=${filter.key}`

              const active =
                type ===
                filter.key

              return (
                <Link
                  key={
                    filter.key
                  }
                  href={href}
                  className={
                    active
                      ? 'rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-black'
                      : 'rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-amber-300/50 hover:text-amber-300'
                  }
                >
                  {
                    filter.label
                  }
                </Link>
              )
            }
          )}
        </div>
      </section>

      {ranked.length ===
      0 ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-xl font-semibold text-white">
            No matching
            artworks found
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Try a broader
            artwork title,
            Master name,
            collection or
            subject.
          </p>

          <Link
            href="/"
            className="mt-6 inline-block text-sm font-semibold text-amber-300 hover:underline"
          >
            Back to main page
          </Link>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {ranked.map(
            (artwork) => {
              const destination =
                `/artwork/${artwork.id}?from=${encodeURIComponent(
                  searchUrl
                )}`

              return (
                <Link
                  key={
                    artwork.id
                  }
                  href={
                    destination
                  }
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60"
                >
                  <SafeImg
                    src={`/api/artwork/preview/${artwork.id}?w=620&v=search-v1`}
                    alt={
                      artwork.title
                    }
                    className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  <div className="p-4">
                    <div className="line-clamp-2 font-semibold text-white">
                      {
                        artwork.title
                      }
                    </div>

                    <div className="mt-2 line-clamp-1 text-xs text-amber-300">
                      {resultSubtitle(
                        {
                          title:
                            artwork.title,

                          artist:
                            artwork.artist,

                          style:
                            String(
                              artwork.style
                            ),

                          tags:
                            artwork.tags,
                        }
                      )}
                    </div>
                  </div>
                </Link>
              )
            }
          )}
        </section>
      )}
    </main>
  )
}
