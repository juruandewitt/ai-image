export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'
import BackButton from '@/components/back-button'
import HorizontalScrollRow from '@/components/horizontal-scroll-row'

const PREVIEW_VERSION =
  'collections-overview-v1'

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
        Curated Collection
      </text>
    </svg>`
  )

/*
 * THE 30 GENERATED COLLECTIONS
 *
 * These are the exact theme slugs confirmed by the database audit.
 */
const COLLECTIONS = [
  {
    slug: 'abstract',
    label: 'Abstract',
  },

  {
    slug: 'ancient-civilizations',
    label: 'Ancient Civilizations',
  },

  {
    slug: 'animals-pets',
    label: 'Animals / Pets',
  },

  {
    slug: 'architecture',
    label: 'Architecture',
  },

  {
    slug: 'automotive',
    label: 'Automotive',
  },

  {
    slug: 'business-finance',
    label: 'Business / Finance',
  },

  {
    slug: 'cars-automotive',
    label: 'Cars / Automotive',
  },

  {
    slug: 'cyberpunk',
    label: 'Cyberpunk',
  },

  {
    slug: 'fantasy',
    label: 'Fantasy',
  },

  {
    slug: 'fantasy-kingdoms',
    label: 'Fantasy Kingdoms',
  },

  {
    slug: 'fashion-editorial',
    label: 'Fashion / Editorial',
  },

  {
    slug: 'food-culinary',
    label: 'Food / Culinary',
  },

  {
    slug: 'gaming-esports',
    label: 'Gaming / Esports',
  },

  {
    slug: 'health-wellness',
    label: 'Health / Wellness',
  },

  {
    slug: 'kids-nursery',
    label: 'Kids / Nursery',
  },

  {
    slug: 'landscapes',
    label: 'Landscapes',
  },

  {
    slug: 'luxury-interior',
    label: 'Luxury / Interior Decor',
  },

  {
    slug: 'luxury-lifestyle',
    label: 'Luxury Lifestyle',
  },

  {
    slug: 'music-performance',
    label: 'Music / Performance',
  },

  {
    slug: 'nature-botanical',
    label: 'Nature / Botanical',
  },

  {
    slug: 'ocean-marine',
    label: 'Ocean / Marine',
  },

  {
    slug: 'seasonal-holidays',
    label: 'Seasonal / Holidays',
  },

  {
    slug: 'space-galaxy',
    label: 'Space / Galaxy',
  },

  {
    slug: 'space-universe',
    label: 'Space & Universe',
  },

  {
    slug: 'spiritual-zen',
    label: 'Spiritual / Zen',
  },

  {
    slug: 'sports-action',
    label: 'Sports / Action',
  },

  {
    slug: 'steampunk',
    label: 'Steampunk',
  },

  {
    slug: 'travel-destinations',
    label: 'Travel / Destinations',
  },

  {
    slug: 'vintage-retro',
    label: 'Vintage / Retro',
  },

  {
    slug: 'wildlife',
    label: 'Wildlife',
  },
] as const

type CollectionDefinition =
  (typeof COLLECTIONS)[number]

type CollectionArtwork = {
  id: string
  title: string
}

/*
 * Keep this overview page intentionally simple:
 *
 * - artwork must be PUBLISHED
 * - artwork must have the exact theme:<slug> tag
 *
 * This prevents Masters and Masters Reimagined
 * from entering this page.
 */
async function getCollectionArtworks(
  collection: CollectionDefinition
): Promise<CollectionArtwork[]> {
  const tag =
    `theme:${collection.slug}`

  const artworks =
    await prisma.artwork.findMany({
      where: {
        status: 'PUBLISHED',

        tags: {
          has: tag,
        },
      },

      orderBy: {
        createdAt: 'asc',
      },

      /*
       * Each generated theme contains 50 artworks.
       * We allow a little headroom without ever
       * pulling unrelated records.
       */
      take: 80,

      select: {
        id: true,
        title: true,
      },
    })

  return artworks
}

export default async function CategoriesPage() {
  const groups =
    await Promise.all(
      COLLECTIONS.map(
        async (
          collection
        ) => {
          const artworks =
            await getCollectionArtworks(
              collection
            )

          return {
            ...collection,
            artworks,
          }
        }
      )
    )

  const totalArtworks =
    groups.reduce(
      (
        total,
        group
      ) =>
        total +
        group.artworks.length,
      0
    )

  return (
    <main className="space-y-14">

      {/* PAGE HEADER */}
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <BackButton />

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          Favorite Collections
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          Explore all 30 curated AI Image collections.
          Browse each collection horizontally, or open the
          complete collection to view every available artwork.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
            30 curated collections
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-300">
            {totalArtworks} themed artworks
          </div>
        </div>
      </section>

      {/* COLLECTION ROWS */}
      {groups.map(
        (
          group
        ) => (
          <section
            key={
              group.slug
            }
            className="space-y-6"
          >
            <div className="flex items-end justify-between gap-4">

              <div>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">
                  {group.label}
                </h2>

                <p className="mt-2 text-sm text-slate-400">
                  {group.artworks.length}{' '}
                  {group.artworks.length ===
                  1
                    ? 'artwork'
                    : 'artworks'}{' '}
                  in this collection.
                </p>
              </div>

              <Link
                href={`/explore/themes/${group.slug}`}
                className="shrink-0 text-sm font-semibold text-amber-300 hover:underline"
              >
                Explore all →
              </Link>
            </div>

            {group.artworks.length ===
            0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <div className="font-semibold text-white">
                  Collection currently unavailable
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  No published artworks were found for this
                  collection.
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
