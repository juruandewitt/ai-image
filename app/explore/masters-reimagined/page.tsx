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

type MasterStyle = (typeof MASTER_STYLES)[number]

const STYLE_LABELS: Record<MasterStyle, string> = {
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
 * These IDs define the preferred display order.
 *
 * Recognisable subjects are intentionally placed first.
 * Any additional valid reimagined works appear afterwards alphabetically.
 */
const PRIORITY_IDS: Record<MasterStyle, string[]> = {
  MICHELANGELO: [
    'cmnbfkgtb000m76b7fxhnwvcf', // The Scream
    'cmn7ym0kf000h16ddrrenxjd9', // Mona Lisa
    'cmn7ymb9l000i16ddkjc1ffq9', // Starry Night
    'cmnhviorn000x841p3q2wq6uz', // Girl with a Pearl Earring
    'cmnhviysf0010841p5cbof0l3', // The Night Watch
    'cmnbflybt000t76b7m18h6rmj', // Persistence of Memory
    'cmnhw4t01000312bs0kvaj0ue', // Guernica Reimagined
  ],

  VAN_GOGH: [
    'cmnnbf5dw000u7arey9doysq6', // Mona Lisa
    'cmnnbgeqa00197are9hbivfeu', // The Scream
    'cmnnbff89000x7are5ub1qd5r', // Girl with a Pearl Earring
    'cmnnbg5on00167arehw39q113', // The Night Watch
    'cmnnbfozw00107are9qpn4qd5', // The Last Supper
    'cmnnbgndf001c7areup9eimvc', // Persistence of Memory
  ],

  MONET: [
    'cmn7yhcwc000516ddv03zxjgc', // Starry Night
    'cmn7ygwpm000416ddfn08jx6n', // Mona Lisa
    'cmnbfj0aj000d76b74vyhg5zt', // The Scream
    'cmnbfic9s000876b7l7e2g0k0', // Girl with a Pearl Earring
    'cmnnl5wnq0000rnlqqm0t94pi', // The Night Watch
    'cmnati0sd0008yr8cntvi3ov6', // The Last Supper
    'cmn7yilj3000916dd5fkazc7w', // Guernica
  ],

  /*
   * Caravaggio begins with portraits and dramatic narrative scenes,
   * which are generally the strongest subjects for chiaroscuro.
   */
  CARAVAGGIO: [
    'cmnox8u470006j89qcsbi57i5', // Girl with a Pearl Earring
    'cmnox97k70009j89qgs9c4hjg', // The Last Supper
    'cmnoxa7ky000ij89qg5t0mz1p', // The Night Watch
    'cmnox8h020003j89qpjoihhtx', // Mona Lisa
    'cmnozdzl70003z3ol3xw42ove', // The Scream
    'cmnox9ioq000cj89qrcllzb9g', // Starry Night
    'cmnoxamga000lj89qxbncnld6', // Persistence of Memory
  ],

  PICASSO: [
    'cmnnmse1d001idff13avgm2uq', // Mona Lisa
    'cmnnn0npw0000lm6a1slfafjr', // The Scream
    'cmnnmt8tz001rdff10ivzgfyy', // Starry Night
    'cmnnmsqoy001ldff1odokex1x', // Girl with a Pearl Earring
    'cmnnmtyr1000331x6h0sync7l', // The Night Watch
    'cmnnmszsz001odff1yfzv9mfy', // The Last Supper
    'cmnnmubo6000631x6gzo0uvvh', // Persistence of Memory
    'cmnnmzl4g001r31x6l00cbuwz', // Impression Sunrise
  ],

  /*
   * Munch is explicitly populated here so it cannot disappear because
   * of title-filter differences.
   */
  MUNCH: [
    'cmnqg2f20000umvtoywjcdusb', // Mona Lisa
    'cmnqg1jvr000lmvtok0v8cnge', // Starry Night
    'cmnqg2pj4000xmvtoaxigb6tc', // Girl with a Pearl Earring
    'cmnqg2yan0010mvtopbk1hgcz', // The Last Supper
    'cmnqg3f840016mvto3pe9998o', // The Night Watch
    'cmnqg3po20019mvto3j1qmaky', // Persistence of Memory
    'cmnqgazmc002ruijqe3g19eyf', // Impression Sunrise
  ],

  /*
   * Pollock is also explicitly populated.
   */
  POLLOCK: [
    'cmnp14bje0000mgqegu1s7cdd', // Mona Lisa
    'cmnp14xs60006mgqe0bbghj0f', // The Scream
    'cmnp13lht001uutftkc630xal', // Starry Night
    'cmnp130lt001outftsb0z23na', // Girl with a Pearl Earring
    'cmnp13ahc001rutfthajeksch', // The Last Supper
    'cmnp14kqv0003mgqeyz3m4pr4', // The Night Watch
    'cmnp1574o0009mgqed76g9hxt', // Persistence of Memory
    'cmnp1a7i2001rmgqe22rvk6o9', // Impression Sunrise
  ],

  REMBRANDT: [
    'cmnotu8o900069edqbwdtcy8v', // Mona Lisa
    'cmnotvyg7000l9edquvi4hr9k', // The Scream
    'cmnotujms00099edqcjzrc8sn', // Girl with a Pearl Earring
    'cmnotuyfo000c9edqtkq947db', // The Last Supper
    'cmnotv825000f9edq9uiqi3ai', // Starry Night
    'cmnotw7l2000o9edqyqvktxia', // Persistence of Memory
    'cmnou3ipy000lnc18uwk9k4y7', // Impression Sunrise
  ],

  VERMEER: [
    'cmngg02kl000u37jq3sz6jvc0', // Mona Lisa
    'cmngg1syo001c37jqnqsm9izv', // The Scream
    'cmngg0dwv000x37jqkrh942f6', // Starry Night
    'cmngg0o3n001037jql606zr6f', // The Last Supper
    'cmngg2auf001i37jqp740of4g', // The Night Watch
    'cmngg17zb001637jqg83rzj4f', // Persistence of Memory
    'cmngg1i8l001937jqm4ojyyzd', // Guernica
    'cmngip8p10010da471vobh1wa', // Impression Sunrise
  ],

  DALI: [
    'cmnnocpnp001i1wxb4f577qew', // Mona Lisa
    'cmnnofivz000f10kfcu59ulp1', // The Scream
    'cmnnoehym000610kfpgeh2r47', // Starry Night
    'cmnnocxj4001l1wxbl27ga9w4', // Girl with a Pearl Earring
    'cmnnod5qt001o1wxbs3bf6h26', // The Last Supper
    'cmnnof5ll000c10kfb66ypmvr', // The Night Watch
    'cmnnotz2i0009estpojnxdtbc', // Impression Sunrise
  ],

  DA_VINCI: [
    'cmnghrohc00168jrsuk5tqcmj', // The Scream
    'cmnghpvjf000u8jrsx9ft3i4q', // Starry Night
    'cmnghqa54000x8jrsfvd1sxtt', // Girl with a Pearl Earring
    'cmnghrxpr00198jrsa45eqvhf', // The Night Watch
    'cmnghrbng00138jrsw2sbcdgq', // Persistence of Memory
  ],
}

const ORIGINAL_TITLES: Record<MasterStyle, string[]> = {
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

const STYLE_SEARCH_NAMES: Record<MasterStyle, string[]> = {
  MICHELANGELO: ['michelangelo'],
  VAN_GOGH: ['van gogh', 'vincent van gogh'],
  MONET: ['monet', 'claude monet'],
  CARAVAGGIO: ['caravaggio'],
  PICASSO: ['picasso', 'pablo picasso'],
  MUNCH: ['munch', 'edvard munch'],
  POLLOCK: ['pollock', 'jackson pollock'],
  REMBRANDT: ['rembrandt'],
  VERMEER: ['vermeer', 'johannes vermeer'],
  DALI: ['dali', 'salvador dali'],
  DA_VINCI: ['da vinci', 'leonardo da vinci'],
}

function normalizeText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function isOriginalArtwork(
  style: MasterStyle,
  title: string
) {
  const normalizedTitle = normalizeText(title)

  return ORIGINAL_TITLES[style].some(
    (originalTitle) =>
      normalizeText(originalTitle) === normalizedTitle
  )
}

function isReimaginedArtwork(
  style: MasterStyle,
  title: string
) {
  if (isOriginalArtwork(style, title)) {
    return false
  }

  const normalizedTitle = normalizeText(title)

  if (normalizedTitle.includes('reimagined')) {
    return true
  }

  return STYLE_SEARCH_NAMES[style].some((name) =>
    normalizedTitle.includes(
      `in ${normalizeText(name)} style`
    )
  )
}

function isStablePublicImage(
  thumbnail: string | null
) {
  return Boolean(
    thumbnail &&
      thumbnail.startsWith(PUBLIC_BLOB_PREFIX)
  )
}

function getSelectedStyle(
  value: string | string[] | undefined
) {
  const rawValue = Array.isArray(value)
    ? value[0]
    : value

  if (!rawValue) {
    return null
  }

  const normalizedValue =
    rawValue.toUpperCase() as MasterStyle

  return MASTER_STYLES.includes(normalizedValue)
    ? normalizedValue
    : null
}

function getPriorityIndex(
  style: MasterStyle,
  artworkId: string
) {
  const index =
    PRIORITY_IDS[style].indexOf(artworkId)

  return index === -1
    ? Number.MAX_SAFE_INTEGER
    : index
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

  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      style: {
        in: [...MASTER_STYLES] as any,
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
    },
  })

  /*
   * Only stable, permanent Vercel Blob images are included.
   * This removes records that would otherwise display broken icons.
   */
  const validReimaginedArtworks =
    artworks.filter((artwork) => {
      const style =
        artwork.style as MasterStyle

      if (!MASTER_STYLES.includes(style)) {
        return false
      }

      if (
        !isStablePublicImage(artwork.thumbnail)
      ) {
        return false
      }

      return isReimaginedArtwork(
        style,
        artwork.title
      )
    })

  const allGroups = MASTER_STYLES.map((style) => {
    const groupArtworks =
      validReimaginedArtworks
        .filter(
          (artwork) =>
            artwork.style === style
        )
        .sort((a, b) => {
          const aPriority =
            getPriorityIndex(style, a.id)

          const bPriority =
            getPriorityIndex(style, b.id)

          if (aPriority !== bPriority) {
            return aPriority - bPriority
          }

          return a.title.localeCompare(b.title)
        })

    return {
      style,
      label: STYLE_LABELS[style],
      artworks: groupArtworks,
    }
  })

  const displayedGroups = selectedStyle
    ? allGroups.filter(
        (group) =>
          group.style === selectedStyle
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
    ? `Explore all available masterpieces transformed into the visual language of ${STYLE_LABELS[selectedStyle]}.`
    : 'Discover famous and immediately recognisable artworks transformed through the visual languages of all 11 Masters.'

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
                The most recognisable and visually
                striking works are displayed first.
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
                Library awaiting review
              </div>

              <p className="mt-2 text-sm text-slate-400">
                No stable published reimagined images
                are currently available for{' '}
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
                  (artwork) => (
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
                        src={
                          artwork.thumbnail as string
                        }
                        fallbackSrc={
                          FALLBACK_DATA_URL
                        }
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
                )}
              </div>
            </div>
          )}
        </section>
      ))}
    </main>
  )
}
