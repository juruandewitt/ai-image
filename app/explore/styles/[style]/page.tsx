export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const PREVIEW_VERSION = 'v9'

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

const STYLE_BY_SLUG: Record<string, { key: string; label: string }> = {
  'van-gogh': { key: 'VAN_GOGH', label: 'Van Gogh' },
  dali: { key: 'DALI', label: 'Dalí' },
  'jackson-pollock': { key: 'POLLOCK', label: 'Jackson Pollock' },
  'johannes-vermeer': { key: 'VERMEER', label: 'Johannes Vermeer' },
  'claude-monet': { key: 'MONET', label: 'Claude Monet' },
  'pablo-picasso': { key: 'PICASSO', label: 'Pablo Picasso' },
  rembrandt: { key: 'REMBRANDT', label: 'Rembrandt' },
  caravaggio: { key: 'CARAVAGGIO', label: 'Caravaggio' },
  'leonardo-da-vinci': { key: 'DA_VINCI', label: 'Leonardo da Vinci' },
  michelangelo: { key: 'MICHELANGELO', label: 'Michelangelo' },
  'edvard-munch': { key: 'MUNCH', label: 'Edvard Munch' },
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

// These should lead each Master page.
const CORE_TITLE_PREFERENCES: Record<string, string[]> = {
  VAN_GOGH: [
    'Starry Night in Van Gogh Style',
    'Sunflowers in Van Gogh Style',
    'Cafe Terrace at Night in Van Gogh Style',
    'Irises in Van Gogh Style',
    'Wheatfield with Crows in Van Gogh Style',
    'Bedroom in Arles in Van Gogh Style',
    'The Potato Eaters in Van Gogh Style',
    'Almond Blossoms in Van Gogh Style',
    'Olive Trees in Van Gogh Style',
    'The Red Vineyard in Van Gogh Style',
  ],
  DALI: [
    'Persistence of Memory in Dali Style',
    'Swans Reflecting Elephants in Dali Style',
    'The Elephants in Dali Style',
    'The Burning Giraffe in Dali Style',
    'Dream Caused by the Flight of a Bee in Dali Style',
    'Metamorphosis of Narcissus in Dali Style',
    'Galatea of the Spheres in Dali Style',
    'Soft Construction with Boiled Beans in Dali Style',
    'The Temptation of Saint Anthony in Dali Style',
    'Christ of Saint John of the Cross in Dali Style',
  ],
  POLLOCK: [
    'Autumn Rhythm in Pollock Style',
    'Lavender Mist in Pollock Style',
    'Blue Poles in Pollock Style',
    'Convergence in Pollock Style',
    'Mural in Pollock Style',
    'Drip Composition in Pollock Style',
    'Action Painting in Pollock Style',
    'Splatter Field in Pollock Style',
    'Black and White Energy in Pollock Style',
    'Dynamic Color Field in Pollock Style',
  ],
  VERMEER: [
    'Girl with a Pearl Earring in Vermeer Style',
    'The Milkmaid in Vermeer Style',
    'View of Delft in Vermeer Style',
    'The Art of Painting in Vermeer Style',
    'Woman in Blue Reading a Letter in Vermeer Style',
    'Girl Reading a Letter by an Open Window in Vermeer Style',
    'Woman Holding a Balance in Vermeer Style',
    'The Music Lesson in Vermeer Style',
    'Young Woman with a Water Pitcher in Vermeer Style',
    'Woman with a Lute in Vermeer Style',
  ],
  MONET: [
    'Water Lilies in Monet Style',
    'Impression Sunrise in Monet Style',
    'Japanese Bridge in Monet Style',
    'Woman with Parasol in Monet Style',
    'Haystacks at Sunset in Monet Style',
    'Rouen Cathedral in Soft Light in Monet Style',
    'Parliament in Fog in Monet Style',
    'Poppies in a Field in Monet Style',
    'Boats on the Seine in Monet Style',
    'Lily Pond with Reflections in Monet Style',
  ],
  PICASSO: [
    'Guernica in Picasso Style',
    'Les Demoiselles d Avignon in Picasso Style',
    'The Weeping Woman in Picasso Style',
    'Girl before a Mirror in Picasso Style',
    'Three Musicians in Picasso Style',
    'Woman with a Mandolin in Picasso Style',
    'Portrait of Dora Maar in Picasso Style',
    'The Old Guitarist in Picasso Style',
    'Harlequin with Violin in Picasso Style',
    'Still Life with Guitar in Picasso Style',
  ],
  REMBRANDT: [
    'The Night Watch in Rembrandt Style',
    'The Return of the Prodigal Son in Rembrandt Style',
    'The Anatomy Lesson in Rembrandt Style',
    'The Jewish Bride in Rembrandt Style',
    'Self Portrait in Rembrandt Style',
    'Self Portrait with Two Circles in Rembrandt Style',
    'The Storm on the Sea of Galilee in Rembrandt Style',
    'The Syndics in Rembrandt Style',
    'Scholar at Candlelight in Rembrandt Style',
    'Old Man in Shadow in Rembrandt Style',
  ],
  CARAVAGGIO: [
    'The Calling of Saint Matthew in Caravaggio Style',
    'The Supper at Emmaus in Caravaggio Style',
    'The Taking of Christ in Caravaggio Style',
    'Bacchus in Caravaggio Style',
    'Boy with a Basket of Fruit in Caravaggio Style',
    'The Musicians in Caravaggio Style',
    'Medusa in Caravaggio Style',
    'Saint Jerome Writing in Caravaggio Style',
    'The Fortune Teller in Caravaggio Style',
    'The Cardsharps in Caravaggio Style',
  ],
  DA_VINCI: [
    'Mona Lisa in Da Vinci Style',
    'The Last Supper in Da Vinci Style',
    'Lady with an Ermine in Da Vinci Style',
    'Vitruvian Man in Da Vinci Style',
    'Salvator Mundi in Da Vinci Style',
    'Virgin of the Rocks in Da Vinci Style',
    'Annunciation in Da Vinci Style',
    'Adoration of the Magi in Da Vinci Style',
    'Saint John the Baptist in Da Vinci Style',
    'The Baptism of Christ in Da Vinci Style',
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
    'The Dance of Life in Munch Style',
    'The Scream in Munch Style',
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

// Common reinterpretation source titles we want to push later in the list.
const CROSSOVER_MARKERS = [
  'Mona Lisa',
  'Girl with a Pearl Earring',
  'The Last Supper',
  'Starry Night',
  'Water Lilies',
  'The Night Watch',
  'The Scream',
  'Persistence of Memory',
  'The Great Wave off Kanagawa',
  'American Gothic',
  'The School of Athens',
  'Liberty Leading the People',
  'Whistler Mother',
  'The Thinker',
  'View of Delft',
  'The Art of Painting',
  'The Music Lesson',
  'The Milkmaid',
  'The Love Letter',
  'The Glass of Wine',
  'Woman Holding a Balance',
  'Young Woman with a Water Pitcher',
  'Officer and Laughing Girl',
  'Girl Reading a Letter by an Open Window',
  'Woman with a Lute',
  'The Hay Wain',
  'The Red Vineyard',
  'Impression Sunrise',
  'Cafe Terrace at Night',
  'Bridge in a Garden',
  'Nighthawks',
  'Sunflowers',
  'Japanese Bridge',
  'Rouen Cathedral',
  'Parliament in Fog',
  'Woman with Parasol',
  'Boats on the Seine',
  'Golden Path through Flowers',
  'Evening Glow over Pond',
  'Rose Garden',
  'Wildflowers beside Water',
  'Garden Gate in Summer',
  'Pond with White Lilies',
  'Sunset Reflections',
  'Quiet Garden after Rain',
  'Golden Sky Reflections',
  'Small Boats at Dawn',
  'Evening Reflections on Water',
  'Woman by the Water Garden',
  'Morning Fog on Water',
  'Soft Light through Trees',
  'David',
  'Moses',
  'Sistine Chapel Ceiling Study',
  'The Last Judgement',
  'Renaissance Chapel Interior',
  'Marble Cloister',
  'Sacred Stone Arcade',
  'High Renaissance Chapel',
  'Vaulted Hall of Frescoes',
  'Golden Apse Light',
]

function isCrossoverTitle(title: string, styleLabel: string) {
  return CROSSOVER_MARKERS.some((marker) => {
    // allow titles that are genuinely native anchors for that master
    if (title === `${marker} in ${styleLabel} Style`) return true
    return title.includes(marker)
  })
}

type ArtworkRow = {
  id: string
  title: string
  createdAt: Date
}

function sortArtworks(styleKey: string, styleLabel: string, artworks: ArtworkRow[]) {
  const preferred = CORE_TITLE_PREFERENCES[styleKey] || []
  const preferredIndex = new Map(preferred.map((title, index) => [title, index]))

  return [...artworks].sort((a, b) => {
    const aPreferred = preferredIndex.has(a.title)
    const bPreferred = preferredIndex.has(b.title)

    if (aPreferred && bPreferred) {
      return preferredIndex.get(a.title)! - preferredIndex.get(b.title)!
    }
    if (aPreferred) return -1
    if (bPreferred) return 1

    const aCrossover = isCrossoverTitle(a.title, styleLabel)
    const bCrossover = isCrossoverTitle(b.title, styleLabel)

    if (aCrossover !== bCrossover) {
      return aCrossover ? 1 : -1
    }

    return a.createdAt.getTime() - b.createdAt.getTime()
  })
}

export default async function ExploreStylePage({
  params,
}: {
  params: { style: string }
}) {
  const styleInfo = STYLE_BY_SLUG[params.style]
  if (!styleInfo) notFound()

  const artworks = await prisma.artwork.findMany({
    where: {
      style: styleInfo.key as any,
      status: 'PUBLISHED',
      ...blobBackedWhere,
      ...cleanWhere,
    },
    orderBy: { createdAt: 'asc' },
    take: 200,
    select: {
      id: true,
      title: true,
      createdAt: true,
    },
  })

  const sorted = sortArtworks(styleInfo.key, styleInfo.label, artworks)

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Link href="/explore" className="text-sm text-amber-400 hover:underline">
          ← Back to Explore
        </Link>
        <h1 className="text-3xl font-semibold">{styleInfo.label}</h1>
        <p className="text-sm text-slate-400">
          {sorted.length} published works currently available
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="text-sm text-slate-400">No published works available yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {sorted.map((art) => (
            <Link
              key={art.id}
              href={`/artwork/${art.id}`}
              className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-amber-400/60 transition-colors"
            >
              <SafeImg
                src={`/api/artwork/preview/${art.id}?w=520&v=${PREVIEW_VERSION}`}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={art.title}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <div className="text-sm text-slate-100 line-clamp-2">{art.title}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
