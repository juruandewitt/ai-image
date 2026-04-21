export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const PREVIEW_VERSION = 'v10'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

const STYLE_LABELS: Record<string, string> = {
  VAN_GOGH: 'Van Gogh',
  DALI: 'Dalí',
  POLLOCK: 'Jackson Pollock',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  PICASSO: 'Pablo Picasso',
  REMBRANDT: 'Rembrandt',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  MICHELANGELO: 'Michelangelo',
  MUNCH: 'Edvard Munch',
}

const FEATURED_MASTERS = [
  { key: 'VAN_GOGH', label: 'Van Gogh', slug: 'van-gogh' },
  { key: 'DALI', label: 'Dalí', slug: 'dali' },
  { key: 'POLLOCK', label: 'Jackson Pollock', slug: 'jackson-pollock' },
  { key: 'VERMEER', label: 'Johannes Vermeer', slug: 'johannes-vermeer' },
  { key: 'MONET', label: 'Claude Monet', slug: 'claude-monet' },
  { key: 'PICASSO', label: 'Pablo Picasso', slug: 'pablo-picasso' },
  { key: 'REMBRANDT', label: 'Rembrandt', slug: 'rembrandt' },
  { key: 'CARAVAGGIO', label: 'Caravaggio', slug: 'caravaggio' },
  { key: 'DA_VINCI', label: 'Leonardo da Vinci', slug: 'leonardo-da-vinci' },
  { key: 'MICHELANGELO', label: 'Michelangelo', slug: 'michelangelo' },
  { key: 'MUNCH', label: 'Edvard Munch', slug: 'edvard-munch' },
] as const

const FEATURED_TITLE_PREFERENCES: Record<string, string[]> = {
  VAN_GOGH: [
    'Starry Night in Van Gogh Style',
    'Sunflowers in Van Gogh Style',
    'Cafe Terrace at Night in Van Gogh Style',
    'Irises in Van Gogh Style',
    'Wheatfield with Crows in Van Gogh Style',
  ],
  DALI: [
    'Persistence of Memory in Dali Style',
    'Swans Reflecting Elephants in Dali Style',
    'The Elephants in Dali Style',
    'The Burning Giraffe in Dali Style',
    'Dream Caused by the Flight of a Bee in Dali Style',
  ],
  POLLOCK: [
    'Autumn Rhythm in Pollock Style',
    'Lavender Mist in Pollock Style',
    'Blue Poles in Pollock Style',
    'Convergence in Pollock Style',
    'Number 5 in Pollock Style',
  ],
  VERMEER: [
    'Girl with a Pearl Earring in Vermeer Style',
    'The Milkmaid in Vermeer Style',
    'View of Delft in Vermeer Style',
    'The Art of Painting in Vermeer Style',
    'Woman in Blue Reading a Letter in Vermeer Style',
  ],
  MONET: [
    'Water Lilies in Monet Style',
    'Impression Sunrise in Monet Style',
    'Haystacks at Sunset in Monet Style',
    'Woman with Parasol in Monet Style',
    'Japanese Bridge in Monet Style',
  ],
  PICASSO: [
    'Guernica in Picasso Style',
    'Les Demoiselles d Avignon in Picasso Style',
    'The Weeping Woman in Picasso Style',
    'Girl before a Mirror in Picasso Style',
    'Three Musicians in Picasso Style',
  ],
  REMBRANDT: [
    'The Night Watch in Rembrandt Style',
    'The Return of the Prodigal Son in Rembrandt Style',
    'The Anatomy Lesson in Rembrandt Style',
    'The Jewish Bride in Rembrandt Style',
    'Self Portrait in Rembrandt Style',
  ],
  CARAVAGGIO: [
    'The Calling of Saint Matthew in Caravaggio Style',
    'The Supper at Emmaus in Caravaggio Style',
    'The Taking of Christ in Caravaggio Style',
    'Bacchus in Caravaggio Style',
    'Medusa in Caravaggio Style',
  ],
  DA_VINCI: [
    'Mona Lisa in Da Vinci Style',
    'The Last Supper in Da Vinci Style',
    'Lady with an Ermine in Da Vinci Style',
    'Vitruvian Man in Da Vinci Style',
    'Salvator Mundi in Da Vinci Style',
  ],
  MICHELANGELO: [
    'The Creation of Adam in Michelangelo Style',
    'The Scream in Michelangelo Style',
    'David in Michelangelo Style',
    'The Last Judgement in Michelangelo Style',
    'Moses in Michelangelo Style',
    'Doni Tondo in Michelangelo Style',
    'Sistine Chapel Ceiling Study in Michelangelo Style',
    'Prophet on Ceiling Fresco in Michelangelo Style',
    'Ignudi Figure Study in Michelangelo Style',
    'Renaissance Vault Fresco in Michelangelo Style',
  ],
  MUNCH: [
    'The Scream in Munch Style',
    'The Dance of Life in Munch Style',
    'Madonna in Munch Style',
    'Anxiety in Munch Style',
    'Girls on the Bridge in Munch Style',
    'Ashes in Munch Style',
    'Jealousy in Munch Style',
    'Melancholy in Munch Style',
    'Moonlight by the Shore in Munch Style',
    'Evening on Karl Johan Street in Munch Style',
  ],
}

function styleLabel(style: string | null) {
  if (!style) return 'AI Image'
  return STYLE_LABELS[String(style)] || String(style)
}

const blobBackedWhere = {
  OR: [
    {
      thumbnail: {
        contains: '.public.blob.vercel-storage.com',
        mode: 'insensitive' as const,
      },
    },
    {
      assets: {
        some: {
          originalUrl: {
            contains: '.public.blob.vercel-storage.com',
            mode: 'insensitive' as const,
          },
        },
      },
    },
  ],
}

const cleanWhere = {
  NOT: [
    { tags: { has: 'smoketest' } },
    { title: { contains: 'smoketest', mode: 'insensitive' as const } },
    { title: { contains: 'diagnostic', mode: 'insensitive' as const } },
    { title: { contains: 'test artwork', mode: 'insensitive' as const } },
    { title: { contains: 'db smoketest', mode: 'insensitive' as const } },
  ],
}

async function findFeaturedByExactTitle(style: string, title: string) {
  return prisma.artwork.findFirst({
    where: {
      style: style as any,
      status: 'PUBLISHED',
      title,
      ...blobBackedWhere,
      ...cleanWhere,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
    },
  })
}

async function getFeaturedArtworkForStyle(style: string) {
  const preferredTitles = FEATURED_TITLE_PREFERENCES[style] || []

  for (const title of preferredTitles) {
    const match = await findFeaturedByExactTitle(style, title)
    if (match) return match
  }

  return prisma.artwork.findFirst({
    where: {
      style: style as any,
      status: 'PUBLISHED',
      ...blobBackedWhere,
      ...cleanWhere,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
    },
  })
}

export default async function HomePage() {
  const newDrops = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      ...blobBackedWhere,
      ...cleanWhere,
    },
    orderBy: { createdAt: 'desc' },
    take: 12,
    select: {
      id: true,
      title: true,
      style: true,
    },
  })

  const masters = await Promise.all(
    FEATURED_MASTERS.map(async (master) => {
      const artwork = await getFeaturedArtworkForStyle(master.key)
      return { ...master, artwork }
    })
  )

  return (
    <main className="space-y-12">
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">New Drops</h2>
          <Link href="/explore" className="text-sm text-amber-400 hover:underline">
            Explore all →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {newDrops.length > 0 ? (
            newDrops.map((art) => (
              <Link
                key={art.id}
                href={`/artwork/${art.id}`}
                className="min-w-[240px] max-w-[240px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-amber-400/60 transition-colors"
              >
                <SafeImg
                  src={`/api/artwork/preview/${art.id}?w=520&v=${PREVIEW_VERSION}`}
                  fallbackSrc={FALLBACK_DATA_URL}
                  alt={art.title}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-3">
                  <div className="text-sm text-slate-100 line-clamp-1">{art.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    {styleLabel(String(art.style))}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-sm text-slate-400">No new drops available yet.</div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Masters</h2>
          <Link href="/explore" className="text-sm text-amber-400 hover:underline">
            Browse masters →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {masters.map((master) => (
            <Link
              key={master.key}
              href={`/explore/styles/${master.slug}`}
              className="min-w-[240px] max-w-[240px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-amber-400/60 transition-colors"
            >
              <SafeImg
                src={
                  master.key === 'MUNCH'
                    ? '/featured/munch-the-scream.png'
                    : master.artwork
                    ? `/api/artwork/preview/${master.artwork.id}?w=520&v=${PREVIEW_VERSION}`
                    : FALLBACK_DATA_URL
                }
                fallbackSrc={FALLBACK_DATA_URL}
                alt={master.label}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <div className="text-sm text-slate-100">{master.label}</div>
                <div className="text-xs text-slate-400 line-clamp-1">
                  {master.artwork?.title || 'Featured artwork coming soon'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
