export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

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

type MasterStyle = (typeof MASTER_STYLES)[number]

const STYLE_LABELS: Record<MasterStyle, string> = {
  DA_VINCI: 'Leonardo da Vinci',
  MICHELANGELO: 'Michelangelo',
  VAN_GOGH: 'Vincent van Gogh',
  MONET: 'Claude Monet',
  REMBRANDT: 'Rembrandt',
  CARAVAGGIO: 'Caravaggio',
  VERMEER: 'Johannes Vermeer',
  MUNCH: 'Edvard Munch',
  POLLOCK: 'Jackson Pollock',
  DALI: 'Salvador Dalí',
  PICASSO: 'Pablo Picasso',
}

/*
 * These exact titles represent the canonical or original works that should
 * not be included in the Masters Reimagined collection.
 */
const ORIGINAL_TITLES: Record<MasterStyle, string[]> = {
  DA_VINCI: [
    'Mona Lisa in Da Vinci Style',
    'The Last Supper in Da Vinci Style',
  ],

  MICHELANGELO: [
    'The Creation of Adam in Michelangelo Style',
  ],

  VAN_GOGH: [
    'Starry Night in Van Gogh Style',
    'Starry Night over the Rhone in Van Gogh Style',
  ],

  MONET: [
    'Impression Sunrise in Monet Style',
  ],

  REMBRANDT: [
    'The Night Watch in Rembrandt Style',
  ],

  CARAVAGGIO: [
    'The Calling of Saint Matthew in Caravaggio Style',
  ],

  VERMEER: [
    'Girl with a Pearl Earring in Vermeer Style',
  ],

  MUNCH: [
    'The Scream in Munch Style',
  ],

  POLLOCK: [
    'Autumn Rhythm in Pollock Style',
    'Autumn Rhythm',
  ],

  DALI: [
    'Persistence of Memory Inspired',
    'Persistence of Memory in Dali Style',
  ],

  PICASSO: [
    'Guernica in Picasso Style',
  ],
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function isOriginalArtwork(style: MasterStyle, title: string) {
  const normalizedTitle = normalizeText(title)

  return ORIGINAL_TITLES[style].some(
    (originalTitle) =>
      normalizeText(originalTitle) === normalizedTitle
  )
}

function isReimaginedArtwork(style: MasterStyle, title: string) {
  if (isOriginalArtwork(style, title)) {
    return false
  }

  const normalizedTitle = normalizeText(title)
  const styleLabel = normalizeText(STYLE_LABELS[style])

  const shorterStyleNames: Record<MasterStyle, string[]> = {
    DA_VINCI: ['da vinci', 'leonardo da vinci'],
    MICHELANGELO: ['michelangelo'],
    VAN_GOGH: ['van gogh', 'vincent van gogh'],
    MONET: ['monet', 'claude monet'],
    REMBRANDT: ['rembrandt'],
    CARAVAGGIO: ['caravaggio'],
    VERMEER: ['vermeer', 'johannes vermeer'],
    MUNCH: ['munch', 'edvard munch'],
    POLLOCK: ['pollock', 'jackson pollock'],
    DALI: ['dali', 'dalí', 'salvador dali', 'salvador dalí'],
    PICASSO: ['picasso', 'pablo picasso'],
  }

  const hasReimaginedWord =
    normalizedTitle.includes('reimagined')

  const hasStylePhrase = shorterStyleNames[style].some(
    (name) =>
      normalizedTitle.includes(
        `in ${normalizeText(name)} style`
      )
  )

  const hasFullStylePhrase = normalizedTitle.includes(
    `in ${styleLabel} style`
  )

  return hasReimaginedWord || hasStylePhrase || hasFullStylePhrase
}

function getSelectedStyle(value: string | string[] | undefined) {
  const rawValue = Array.isArray(value) ? value[0] : value

  if (!rawValue) {
    return null
  }

  const normalizedValue = rawValue.toUpperCase()

  if (
    MASTER_STYLES.includes(
      normalizedValue as MasterStyle
    )
  ) {
    return normalizedValue as MasterStyle
  }

  return null
}

export default async function MastersReimaginedPage({
  searchParams,
}: {
  searchParams?: {
    style?: string | string[]
  }
}) {
  const selectedStyle = getSelectedStyle(
    searchParams?.style
  )

  /*
   * We retrieve all published artworks belonging to the 11 Master styles.
   *
   * Filtering the titles happens afterwards in JavaScript. This is more
   * reliable than Prisma title filtering because the database contains
   * several different title formats.
   */
  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      style: {
        in: [...MASTER_STYLES] as any,
      },
    },

    orderBy: [
      {
        style: 'asc',
      },
      {
        title: 'asc',
      },
    ],

    take: 3000,

    select: {
      id: true,
      title: true,
      artist: true,
      style: true,
      thumbnail: true,
    },
  })

  const reimaginedArtworks = artworks.filter(
    (artwork) => {
      const style = artwork.style as MasterStyle

      if (!MASTER_STYLES.includes(style)) {
        return false
      }

      return isReimaginedArtwork(
        style,
        artwork.title
      )
    }
  )

  const allGroups = MASTER_STYLES.map((style) => {
    const groupArtworks = reimaginedArtworks.filter(
      (artwork) => artwork.style === style
    )

    return {
      style,
      label: STYLE_LABELS[style],
      artworks: groupArtworks,
    }
  })

  /*
   * When a style is selected, only that Master's reimagined library is shown.
   * Otherwise, all 11 Master groups are displayed.
   */
  const displayedGroups = selectedStyle
    ? allGroups.filter(
        (group) => group.style === selectedStyle
      )
    : allGroups

  const displayedArtworkCount =
    displayedGroups.reduce(
      (total, group) =>
        total + group.artworks.length,
      0
    )

  const pageTitle = selectedStyle
    ? `Reimagined by ${STYLE_LABELS[selectedStyle]}`
    : 'The Masters Reimagined'

  const pageDescription = selectedStyle
    ? `Explore all published masterpieces transformed into the visual language of ${STYLE_LABELS[selectedStyle]}.`
    : 'Discover famous artworks transformed through the visual languages of all 11 Masters.'

  return (
    <main className="space-y-14">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <Link
          href="/"
          className="text-sm font-semibold text-amber-300 hover:underline"
        >
          ← Back to home
        </Link>

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
            {displayedArtworkCount} reimagined artworks
          </div>

          {!selectedStyle ? (
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
              11 Master collections
            </div>
          ) : null}
        </div>
      </section>

      {!selectedStyle ? (
        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">
            Browse by Master
          </h2>

          <div className="flex flex-wrap gap-3">
            {allGroups.map((group) => (
              <Link
                key={group.style}
                href={`/explore/masters-reimagined?style=${group.style}`}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-amber-300/60 hover:text-amber-300"
              >
                {group.label}
                <span className="ml-2 text-slate-500">
                  {group.artworks.length}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {displayedGroups.map((group) => (
        <section
          key={group.style}
          className="space-y-6"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Reimagined by {group.label}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {group.artworks.length}{' '}
                {group.artworks.length === 1
                  ? 'artwork'
                  : 'artworks'}{' '}
                transformed into the visual language of{' '}
                {group.label}.
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

          {group.artworks.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
              <div className="font-semibold text-white">
                No reimagined works found
              </div>

              <p className="mt-2 text-sm text-slate-400">
                No published cross-master works are currently
                available for {group.label}.
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
                {group.artworks.map((artwork) => {
                  const previewUrl =
                    `/api/artwork/preview/${artwork.id}` +
                    '?w=800&v=masters-reimagined-v2'

                  return (
                    <Link
                      key={artwork.id}
                      href={`/artwork/${artwork.id}`}
                      className={
                        selectedStyle
                          ? 'group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60'
                          : 'group min-w-[250px] max-w-[250px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[310px] md:max-w-[310px]'
                      }
                    >
                      <SafeImg
                        /*
                         * Use the stored thumbnail directly first.
                         * This fixes many legacy artworks that do not
                         * render through the preview endpoint.
                         *
                         * If the stored thumbnail fails, SafeImg then
                         * tries the preview endpoint.
                         */
                        src={
                          artwork.thumbnail ||
                          previewUrl
                        }
                        fallbackSrc={previewUrl}
                        alt={artwork.title}
                        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="p-5">
                        <div className="line-clamp-2 font-semibold text-white">
                          {artwork.title}
                        </div>

                        <div className="mt-2 text-sm text-amber-300">
                          {group.label}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ))}

      {displayedArtworkCount === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-xl font-semibold text-white">
            No reimagined works found
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            No published cross-master artworks could currently
            be identified.
          </p>
        </section>
      ) : null}
    </main>
  )
}
