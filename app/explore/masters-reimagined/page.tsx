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
  MICHELANGELO:
    'Michelangelo',

  VAN_GOGH:
    'Vincent van Gogh',

  MONET:
    'Claude Monet',

  CARAVAGGIO:
    'Caravaggio',

  PICASSO:
    'Pablo Picasso',

  MUNCH:
    'Edvard Munch',

  POLLOCK:
    'Jackson Pollock',

  REMBRANDT:
    'Rembrandt',

  VERMEER:
    'Johannes Vermeer',

  DALI:
    'Salvador Dalí',

  DA_VINCI:
    'Leonardo da Vinci',
}

/*
 * FEATURED FIRST ARTWORK
 *
 * This is the most important ordering rule.
 *
 * For each Master, this ID is deliberately pinned to position #1.
 *
 * Where a Master is represented on the homepage in
 * "The Masters Reimagined", the SAME artwork is used here.
 */
const FEATURED_FIRST_ID: Record<
  MasterStyle,
  string
> = {
  MICHELANGELO:
    'cmnbfkgtb000m76b7fxhnwvcf',

  VAN_GOGH:
    'cmnnbf5dw000u7arey9doysq6',

  MONET:
    'cmn7yhcwc000516ddv03zxjgc',

  CARAVAGGIO:
    'cmnox8u470006j89qcsbi57i5',

  PICASSO:
    'cmnnmtyr1000331x6h0sync7l',

  MUNCH:
    'cmnqg2yan0010mvtopbk1hgcz',

  POLLOCK:
    'cmnp1a7i2001rmgqe22rvk6o9',

  REMBRANDT:
    'cmnotw7l2000o9edqyqvktxia',

  VERMEER:
    'cmngg1i8l001937jqm4ojyyzd',

  DALI:
    'cmnnocpnp001i1wxb4f577qew',

  DA_VINCI:
    'cmnghrohc00168jrsuk5tqcmj',
}

/*
 * KNOWN-GOOD FEATURED IMAGE URLS
 *
 * Some older records have thumbnails that are not reliable even
 * though we know that a permanent Vercel Blob image exists.
 *
 * These explicit URLs ensure that the homepage-selected hero work
 * can never disappear from the corresponding reimagined page.
 */
const FEATURED_IMAGE_OVERRIDES:
  Partial<Record<string, string>> = {
  /*
   * Michelangelo
   * The Scream
   */
  cmnbfkgtb000m76b7fxhnwvcf:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/michelangelo/the-scream-in-michelangelo-style-uhrlG2bs3WxMg24vEymrsIUlB8XQtj.png',

  /*
   * Van Gogh
   * Mona Lisa
   */
  cmnnbf5dw000u7arey9doysq6:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/van-gogh/mona-lisa-in-van-gogh-style-ZCAnXSHS9H7UPFWdmf5SEtbdf76gVk.png',

  /*
   * Monet
   * Starry Night
   */
  cmn7yhcwc000516ddv03zxjgc:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/monet/starry-night-in-monet-style-XClaCopIFppIKq49pOoI0w9gzo95bG.png',

  /*
   * Caravaggio
   * Girl with a Pearl Earring
   */
  cmnox8u470006j89qcsbi57i5:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/caravaggio/girl-with-a-pearl-earring-in-caravaggio-style-iIUSvkTN9tvpsnf8fp2JhvAReCe1WY.png',

  /*
   * Picasso
   * The Night Watch
   */
  cmnnmtyr1000331x6h0sync7l:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/picasso/the-night-watch-in-picasso-style-R99D9eVFQJCetMGt3Al3FaLbQD9ITP.png',

  /*
   * Munch
   * The Last Supper
   */
  cmnqg2yan0010mvtopbk1hgcz:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/munch/the-last-supper-in-munch-style-9OzzojXQ2ByWF497ZyThGAlIpVe875.png',

  /*
   * Pollock
   * Impression, Sunrise
   */
  cmnp1a7i2001rmgqe22rvk6o9:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/pollock/impression-sunrise-in-pollock-style-yYBU0MY607MyHQWDW0RKRZUaU0DZXw.png',

  /*
   * Rembrandt
   * Persistence of Memory
   */
  cmnotw7l2000o9edqyqvktxia:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/rembrandt/persistence-of-memory-in-rembrandt-style-mbmGzGwU5wvni3vkwrLUmoqWc33x1A.png',

  /*
   * Vermeer
   * Guernica
   */
  cmngg1i8l001937jqm4ojyyzd:
    'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/vermeer/guernica-in-vermeer-style-QaOXgAP2l1gGJjUkkKBdJpLP5Exfp6.png',
}

/*
 * DISPLAY PRIORITY
 *
 * The FIRST ID in every array matches FEATURED_FIRST_ID.
 *
 * The remaining works are ordered with easily recognisable
 * masterpieces first.
 */
const PRIORITY_IDS: Record<
  MasterStyle,
  string[]
> = {
  MICHELANGELO: [
    'cmnbfkgtb000m76b7fxhnwvcf',
    'cmn7ym0kf000h16ddrrenxjd9',
    'cmn7ymb9l000i16ddkjc1ffq9',
    'cmnhviorn000x841p3q2wq6uz',
    'cmnhviysf0010841p5cbof0l3',
    'cmnbflybt000t76b7m18h6rmj',
    'cmnhw4t01000312bs0kvaj0ue',
  ],

  VAN_GOGH: [
    'cmnnbf5dw000u7arey9doysq6',
    'cmnnbgeqa00197are9hbivfeu',
    'cmnnbff89000x7are5ub1qd5r',
    'cmnnbg5on00167arehw39q113',
    'cmnnbfozw00107are9qpn4qd5',
    'cmnnbgndf001c7areup9eimvc',
  ],

  MONET: [
    'cmn7yhcwc000516ddv03zxjgc',
    'cmn7ygwpm000416ddfn08jx6n',
    'cmnbfj0aj000d76b74vyhg5zt',
    'cmnbfic9s000876b7l7e2g0k0',
    'cmnnl5wnq0000rnlqqm0t94pi',
    'cmnati0sd0008yr8cntvi3ov6',
    'cmn7yilj3000916dd5fkazc7w',
  ],

  CARAVAGGIO: [
    'cmnox8u470006j89qcsbi57i5',
    'cmnox97k70009j89qgs9c4hjg',
    'cmnoxa7ky000ij89qg5t0mz1p',
    'cmnox8h020003j89qpjoihhtx',
    'cmnozdzl70003z3ol3xw42ove',
    'cmnox9ioq000cj89qrcllzb9g',
    'cmnoxamga000lj89qxbncnld6',
  ],

  PICASSO: [
    /*
     * Homepage preview first:
     * The Night Watch in Picasso Style
     */
    'cmnnmtyr1000331x6h0sync7l',

    'cmnnmse1d001idff13avgm2uq',
    'cmnnn0npw0000lm6a1slfafjr',
    'cmnnmt8tz001rdff10ivzgfyy',
    'cmnnmsqoy001ldff1odokex1x',
    'cmnnmszsz001odff1yfzv9mfy',
    'cmnnmubo6000631x6gzo0uvvh',
    'cmnnmzl4g001r31x6l00cbuwz',
  ],

  MUNCH: [
    /*
     * Homepage preview first:
     * The Last Supper in Munch Style
     */
    'cmnqg2yan0010mvtopbk1hgcz',

    'cmnqg2f20000umvtoywjcdusb',
    'cmnqg1jvr000lmvtok0v8cnge',
    'cmnqg2pj4000xmvtoaxigb6tc',
    'cmnqg3f840016mvto3pe9998o',
    'cmnqg3po20019mvto3j1qmaky',
    'cmnqgazmc002ruijqe3g19eyf',
  ],

  POLLOCK: [
    /*
     * Homepage preview first:
     * Impression Sunrise in Pollock Style
     */
    'cmnp1a7i2001rmgqe22rvk6o9',

    'cmnp14bje0000mgqegu1s7cdd',
    'cmnp14xs60006mgqe0bbghj0f',
    'cmnp13lht001uutftkc630xal',
    'cmnp130lt001outftsb0z23na',
    'cmnp13ahc001rutfthajeksch',
    'cmnp14kqv0003mgqeyz3m4pr4',
    'cmnp1574o0009mgqed76g9hxt',
  ],

  REMBRANDT: [
    /*
     * Homepage preview first:
     * Persistence of Memory
     */
    'cmnotw7l2000o9edqyqvktxia',

    'cmnotu8o900069edqbwdtcy8v',
    'cmnotvyg7000l9edquvi4hr9k',
    'cmnotujms00099edqcjzrc8sn',
    'cmnotuyfo000c9edqtkq947db',
    'cmnotv825000f9edq9uiqi3ai',
    'cmnou3ipy000lnc18uwk9k4y7',
  ],

  VERMEER: [
    /*
     * Homepage preview first:
     * Guernica
     */
    'cmngg1i8l001937jqm4ojyyzd',

    'cmngg02kl000u37jq3sz6jvc0',
    'cmngg1syo001c37jqnqsm9izv',
    'cmngg0dwv000x37jqkrh942f6',
    'cmngg0o3n001037jql606zr6f',
    'cmngg2auf001i37jqp740of4g',
    'cmngg17zb001637jqg83rzj4f',
    'cmngip8p10010da471vobh1wa',
  ],

  DALI: [
    'cmnnocpnp001i1wxb4f577qew',
    'cmnnofivz000f10kfcu59ulp1',
    'cmnnoehym000610kfpgeh2r47',
    'cmnnocxj4001l1wxbl27ga9w4',
    'cmnnod5qt001o1wxbs3bf6h26',
    'cmnnof5ll000c10kfb66ypmvr',
    'cmnnotz2i0009estpojnxdtbc',
  ],

  DA_VINCI: [
    'cmnghrohc00168jrsuk5tqcmj',
    'cmnghpvjf000u8jrsx9ft3i4q',
    'cmnghqa54000x8jrsfvd1sxtt',
    'cmnghrxpr00198jrsa45eqvhf',
    'cmnghrbng00138jrsw2sbcdgq',
  ],
}

/*
 * ORIGINAL WORKS
 *
 * These titles represent the Master's own canonical/original
 * collection and must not appear in Masters Reimagined.
 */
const ORIGINAL_TITLES: Record<
  MasterStyle,
  string[]
> = {
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

  CARAVAGGIO: [
    'The Calling of Saint Matthew in Caravaggio Style',
  ],

  PICASSO: [
    'Guernica in Picasso Style',
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
    'salvador dali',
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
    .replace(
      /[’‘]/g,
      "'"
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}

function isOriginalArtwork(
  style: MasterStyle,
  title: string
) {
  const normalizedTitle =
    normalizeText(title)

  return ORIGINAL_TITLES[
    style
  ].some(
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

type ArtworkAsset = {
  originalUrl:
    | string
    | null
}

type ArtworkRow = {
  id: string
  title: string
  artist:
    | string
    | null
  style: unknown
  thumbnail:
    | string
    | null
  assets:
    ArtworkAsset[]
}

/*
 * IMAGE RESOLUTION
 *
 * Priority:
 *
 * 1. Explicit known-good featured URL
 * 2. Stable artwork thumbnail
 * 3. Stable Asset.originalUrl
 *
 * This prevents older thumbnail metadata from hiding
 * otherwise perfectly valid reimagined artwork.
 */
function getStableImage(
  artwork: ArtworkRow
) {
  const override =
    FEATURED_IMAGE_OVERRIDES[
      artwork.id
    ]

  if (override) {
    return override
  }

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

  if (
    stableAsset?.originalUrl
  ) {
    return stableAsset.originalUrl
  }

  return null
}

function getSelectedStyle(
  value:
    | string
    | string[]
    | undefined
) {
  const rawValue =
    Array.isArray(value)
      ? value[0]
      : value

  if (!rawValue) {
    return null
  }

  const normalizedValue =
    rawValue.toUpperCase() as MasterStyle

  return MASTER_STYLES.includes(
    normalizedValue
  )
    ? normalizedValue
    : null
}

function getPriorityIndex(
  style: MasterStyle,
  artworkId: string
) {
  const index =
    PRIORITY_IDS[
      style
    ].indexOf(
      artworkId
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
          title: 'asc',
        },

        take: 3000,

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

  /*
   * Build valid Reimagined records.
   *
   * IMPORTANT:
   *
   * We no longer discard an artwork simply because its
   * Artwork.thumbnail field is old or unstable.
   *
   * A permanent Asset.originalUrl or an explicit featured
   * image override is equally valid.
   */
  const validReimaginedArtworks =
    artworks
      .filter(
        (artwork) => {
          const style =
            artwork.style as MasterStyle

          if (
            !MASTER_STYLES.includes(
              style
            )
          ) {
            return false
          }

          if (
            !isReimaginedArtwork(
              style,
              artwork.title
            )
          ) {
            return false
          }

          return Boolean(
            getStableImage(
              artwork as ArtworkRow
            )
          )
        }
      )
      .map(
        (artwork) => ({
          ...artwork,

          resolvedImage:
            getStableImage(
              artwork as ArtworkRow
            ) as string,
        })
      )

  const allGroups =
    MASTER_STYLES.map(
      (style) => {
        const groupArtworks =
          validReimaginedArtworks
            .filter(
              (artwork) =>
                artwork.style ===
                style
            )
            .sort(
              (a, b) => {
                /*
                 * Absolute rule:
                 *
                 * Featured artwork always comes first.
                 */
                const aFeatured =
                  a.id ===
                  FEATURED_FIRST_ID[
                    style
                  ]

                const bFeatured =
                  b.id ===
                  FEATURED_FIRST_ID[
                    style
                  ]

                if (
                  aFeatured &&
                  !bFeatured
                ) {
                  return -1
                }

                if (
                  bFeatured &&
                  !aFeatured
                ) {
                  return 1
                }

                const aPriority =
                  getPriorityIndex(
                    style,
                    a.id
                  )

                const bPriority =
                  getPriorityIndex(
                    style,
                    b.id
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

        return {
          style,
          label:
            STYLE_LABELS[
              style
            ],
          artworks:
            groupArtworks,
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
      ? `Explore all available masterpieces transformed into the visual language of ${
          STYLE_LABELS[
            selectedStyle
          ]
        }.`
      : 'Discover famous and immediately recognisable artworks transformed through the visual languages of all 11 Masters.'

  return (
    <main className="space-y-14">

      {/* PAGE HEADER */}
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

      {/* MASTER FILTER BUTTONS */}
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

      {/* REIMAGINED COLLECTIONS */}
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
                  The featured work is displayed first,
                  followed by the most recognisable and
                  visually striking reinterpretations.
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

            {group.artworks
              .length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                <div className="font-semibold text-white">
                  Library awaiting review
                </div>

                <p className="mt-2 text-sm text-slate-400">
                  No stable
                  published
                  reimagined images
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
                      artwork,
                      index
                    ) => {
                      const isFeatured =
                        index ===
                        0

                      return (
                        <Link
                          key={
                            artwork.id
                          }
                          href={`/artwork/${artwork.id}`}
                          className={
                            selectedStyle
                              ? `group overflow-hidden rounded-3xl border bg-white/[0.04] transition hover:-translate-y-1 ${
                                  isFeatured
                                    ? 'border-amber-300/50 hover:border-amber-300'
                                    : 'border-white/10 hover:border-amber-300/60'
                                }`
                              : `group min-w-[250px] max-w-[250px] overflow-hidden rounded-3xl border bg-white/[0.04] transition hover:-translate-y-1 md:min-w-[310px] md:max-w-[310px] ${
                                  isFeatured
                                    ? 'border-amber-300/50 hover:border-amber-300'
                                    : 'border-white/10 hover:border-amber-300/60'
                                }`
                          }
                        >
                          <SafeImg
                            src={
                              artwork.resolvedImage
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
                            {isFeatured ? (
                              <div className="mb-3 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-200">
                                Featured
                              </div>
                            ) : null}

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
                    }
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
