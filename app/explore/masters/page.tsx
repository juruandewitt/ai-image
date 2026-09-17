export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'
import BackButton from '@/components/back-button'
import HorizontalScrollRow from '@/components/horizontal-scroll-row'
import {
  getMasterGallery,
} from '@/lib/master-gallery'

const PREVIEW_VERSION =
  'masters-highlights-v1'

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

const MASTERS = [
  {
    key: 'DA_VINCI',
    label: 'Leonardo da Vinci',
    href:
      '/explore/styles/leonardo-da-vinci',

    description:
      'Ten highlights from the Leonardo da Vinci collection.',
  },

  {
    key: 'MICHELANGELO',
    label: 'Michelangelo',
    href:
      '/explore/styles/michelangelo',

    description:
      'Ten highlights from the Michelangelo collection.',
  },

  {
    key: 'VAN_GOGH',
    label: 'Vincent van Gogh',
    href:
      '/explore/styles/van-gogh',

    description:
      'Ten highlights from the Vincent van Gogh collection.',
  },

  {
    key: 'MONET',
    label: 'Claude Monet',
    href:
      '/explore/styles/claude-monet',

    description:
      'Ten highlights from the Claude Monet collection.',
  },

  {
    key: 'REMBRANDT',
    label: 'Rembrandt',
    href:
      '/explore/styles/rembrandt',

    description:
      'Ten highlights from the Rembrandt collection.',
  },

  {
    key: 'CARAVAGGIO',
    label: 'Caravaggio',
    href:
      '/explore/styles/caravaggio',

    description:
      'Ten highlights from the Caravaggio collection.',
  },

  {
    key: 'VERMEER',
    label: 'Johannes Vermeer',
    href:
      '/explore/styles/johannes-vermeer',

    description:
      'Ten highlights from the Johannes Vermeer collection.',
  },

  {
    key: 'MUNCH',
    label: 'Edvard Munch',
    href:
      '/explore/styles/edvard-munch',

    description:
      'Ten highlights from the Edvard Munch collection.',
  },

  {
    key: 'POLLOCK',
    label: 'Jackson Pollock',
    href:
      '/explore/styles/jackson-pollock',

    description:
      'Ten highlights from the Jackson Pollock collection.',
  },

  {
    key: 'DALI',
    label: 'Salvador Dalí',
    href:
      '/explore/styles/dali',

    description:
      'Ten highlights from the Salvador Dalí collection.',
  },

  {
    key: 'PICASSO',
    label: 'Pablo Picasso',
    href:
      '/explore/styles/pablo-picasso',

    description:
      'Ten highlights from the Pablo Picasso collection.',
  },
] as const

/*
 * Extra defensive filter specifically for this
 * homepage-style Masters overview.
 *
 * Even if an old filler record happens to remain in the database,
 * it cannot appear among the ten public highlights.
 */
function isPublicHighlight(
  title: string
) {
  const normalized =
    title
      .toLowerCase()
      .trim()

  /*
   * Da Vinci Study #2
   * Monet Study #03
   * Picasso Study 12
   * etc.
   */
  if (
    /\bstudy\s*#?\s*\d+\b/i.test(
      normalized
    )
  ) {
    return false
  }

  /*
   * Other obvious filler naming.
   */
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
      'test artwork'
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

  return true
}

export default async function MastersPage() {
  /*
   * CRITICAL:
   *
   * We use the SAME getMasterGallery() function used by the
   * individual Master pages.
   *
   * Therefore the Da Vinci source here is the same source as:
   *
   * /explore/styles/leonardo-da-vinci
   *
   * We then take ONLY the first ten clean works for this
   * overview page.
   */
  const groups =
    await Promise.all(
      MASTERS.map(
        async (
          master
        ) => {
          const fullCollection =
            await getMasterGallery(
              master.key,
              master.label
            )

          const highlights =
            fullCollection
              .filter(
                (artwork) =>
                  isPublicHighlight(
                    artwork.title
                  )
              )
              .slice(
                0,
                10
              )

          return {
            ...master,

            /*
             * Number in the REAL full collection.
             *
             * This is informational only.
             */
            fullCount:
              fullCollection.length,

            /*
             * Only ten displayed here.
             */
            artworks:
              highlights,
          }
        }
      )
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
          Discover highlights from all 11 Master collections.
          Each row presents ten selected works. Choose
          Explore all to open that Master&apos;s complete collection.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
            11 Master collections
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
            10 highlights per Master
          </div>
        </div>
      </section>

      {/* MASTER ROWS */}
      {groups.map(
        (
          group
        ) => (
          <section
            key={
              group.key
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

                <p className="mt-1 text-xs text-slate-500">
                  {
                    group.fullCount
                  }{' '}
                  works in the full collection
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

            {group.artworks.length ===
            0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <div className="font-semibold text-white">
                  Collection awaiting review
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  No suitable public highlights are currently available.
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
                          src={`/api/artwork/preview/${artwork.id}?w=700&v=${PREVIEW_VERSION}`}
                          fallbackSrc={
                            FALLBACK_DATA_URL
                          }
                          alt={
                            artwork.title
                          }
                          className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
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
