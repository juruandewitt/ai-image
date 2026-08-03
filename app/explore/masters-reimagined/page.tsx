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
        Reimagined masterwork
      </text>
    </svg>`
  )

const MASTER_STYLES = [
  'CARAVAGGIO',
  'DA_VINCI',
  'DALI',
  'MICHELANGELO',
  'MONET',
  'MUNCH',
  'PICASSO',
  'POLLOCK',
  'REMBRANDT',
  'VAN_GOGH',
  'VERMEER',
] as const

const STYLE_LABELS: Record<string, string> = {
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  DALI: 'Salvador Dalí',
  MICHELANGELO: 'Michelangelo',
  MONET: 'Claude Monet',
  MUNCH: 'Edvard Munch',
  PICASSO: 'Pablo Picasso',
  POLLOCK: 'Jackson Pollock',
  REMBRANDT: 'Rembrandt',
  VAN_GOGH: 'Vincent van Gogh',
  VERMEER: 'Johannes Vermeer',
}

const STYLE_LINKS: Record<string, string> = {
  CARAVAGGIO: '/explore/styles/caravaggio',
  DA_VINCI: '/explore/styles/leonardo-da-vinci',
  DALI: '/explore/styles/dali',
  MICHELANGELO: '/explore/styles/michelangelo',
  MONET: '/explore/styles/claude-monet',
  MUNCH: '/explore/styles/edvard-munch',
  PICASSO: '/explore/styles/pablo-picasso',
  POLLOCK: '/explore/styles/jackson-pollock',
  REMBRANDT: '/explore/styles/rembrandt',
  VAN_GOGH: '/explore/styles/van-gogh',
  VERMEER: '/explore/styles/johannes-vermeer',
}

const ORIGINAL_WORKS: Record<string, string[]> = {
  CARAVAGGIO: [
    'The Calling of Saint Matthew',
  ],
  DA_VINCI: [
    'Mona Lisa',
    'The Last Supper',
  ],
  DALI: [
    'Persistence of Memory Inspired',
    'Persistence of Memory in Dali Style',
  ],
  MICHELANGELO: [
    'The Creation of Adam',
  ],
  MONET: [
    'Impression Sunrise in Monet Style',
  ],
  MUNCH: [
    'The Scream in Munch Style',
  ],
  PICASSO: [
    'Guernica in Picasso Style',
  ],
  POLLOCK: [
    'Autumn Rhythm',
  ],
  REMBRANDT: [
    'The Night Watch in Rembrandt Style',
  ],
  VAN_GOGH: [
    'Starry Night in Van Gogh Style',
    'Starry Night over the Rhone in Van Gogh Style',
  ],
  VERMEER: [
    'Girl with a Pearl Earring in Vermeer Style',
  ],
}

function isCanonicalOriginal(style: string, title: string) {
  return (ORIGINAL_WORKS[style] ?? []).some(
    (originalTitle) =>
      title.toLowerCase() === originalTitle.toLowerCase()
  )
}

export default async function MastersReimaginedPage() {
  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      style: {
        in: [...MASTER_STYLES] as any,
      },
      OR: [
        {
          title: {
            contains: ' in ',
            mode: 'insensitive',
          },
        },
        {
          title: {
            contains: 'reimagined',
            mode: 'insensitive',
          },
        },
      ],
    },
    orderBy: [
      {
        style: 'asc',
      },
      {
        title: 'asc',
      },
    ],
    take: 1000,
    select: {
      id: true,
      title: true,
      artist: true,
      style: true,
    },
  })

  const reimaginedArtworks = artworks.filter(
    (artwork) =>
      !isCanonicalOriginal(artwork.style, artwork.title)
  )

  const groupedArtworks = MASTER_STYLES.map((style) => ({
    style,
    label: STYLE_LABELS[style],
    href: STYLE_LINKS[style],
    artworks: reimaginedArtworks.filter(
      (artwork) => artwork.style === style
    ),
  })).filter((group) => group.artworks.length > 0)

  return (
    <main className="space-y-14">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <Link
          href="/"
          className="text-sm font-semibold text-amber-300 hover:underline"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          The Masters Reimagined
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          Discover famous artworks transformed through the visual languages
          of Leonardo da Vinci, Michelangelo, Van Gogh, Monet, Rembrandt,
          Caravaggio, Vermeer, Munch, Pollock, Dalí and Picasso.
        </p>

        <div className="mt-7 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
          {reimaginedArtworks.length} reimagined artworks
        </div>
      </section>

      {groupedArtworks.map((group) => (
        <section key={group.style} className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold text-white">
                Reimagined by {group.label}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                {group.artworks.length} works transformed into the visual
                language of {group.label}.
              </p>
            </div>

            <Link
              href={group.href}
              className="shrink-0 text-sm font-semibold text-amber-300 hover:underline"
            >
              Explore {group.label} →
            </Link>
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-3">
            <div className="flex gap-5">
              {group.artworks.map((artwork) => (
                <Link
                  key={artwork.id}
                  href={`/artwork/${artwork.id}`}
                  className="group min-w-[250px] max-w-[250px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[310px] md:max-w-[310px]"
                >
                  <SafeImg
                    src={`/api/artwork/preview/${artwork.id}?w=760&v=masters-reimagined-all-v1`}
                    fallbackSrc={FALLBACK_DATA_URL}
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
              ))}
            </div>
          </div>
        </section>
      ))}

      {groupedArtworks.length === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h2 className="text-xl font-semibold text-white">
            No reimagined works found
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            No published cross-master artworks could currently be identified.
          </p>
        </section>
      ) : null}
    </main>
  )
}
