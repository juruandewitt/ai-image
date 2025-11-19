
// Central style registry: labels, prompts, order, and helpers.

export const STYLE_LABELS = {
  VAN_GOGH: 'Vincent van Gogh',
  DA_VINCI: 'Leonardo da Vinci',
  PICASSO: 'Pablo Picasso',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  MICHELANGELO: 'Michelangelo',
  DALI: 'Salvador Dalí',
  CARAVAGGIO: 'Caravaggio',
  REMBRANDT: 'Rembrandt',
  POLLOCK: 'Jackson Pollock',
} as const

export type StyleKey = keyof typeof STYLE_LABELS

// Order you want to feature on Explore & Featured carousels
export const STYLE_ORDER: StyleKey[] = [
  'DA_VINCI',
  'VAN_GOGH',
  'PICASSO',
  'VERMEER',
  'MONET',
  'MICHELANGELO',
  'DALI',
  'CARAVAGGIO',
  'REMBRANDT',
  'POLLOCK',
]

// Readable prompt hints to steer generation strongly toward each master
export const STYLE_PROMPTS: Record<StyleKey, string> = {
  VAN_GOGH:
    'post-impressionist, heavy impasto, swirling brush strokes, vivid complementary colors, starry glow',
  DA_VINCI:
    'Renaissance chiaroscuro, sfumato transitions, precise proportions, subtle harmonious palette',
  PICASSO:
    'cubist abstraction, fractured perspective, geometric planes, bold simplified forms',
  VERMEER:
    'Dutch Golden Age, camera obscura realism, soft window light, cool interiors, pearl highlights',
  MONET:
    'impressionist plein-air, broken color, shimmering reflections, atmospheric perspective',
  MICHELANGELO:
    'High Renaissance heroic anatomy, marble-like forms, dramatic contrapposto, monumental scale',
  DALI:
    'surrealist dream logic, hyperreal textures, melting transformations, desert horizons',
  CARAVAGGIO:
    'tenebrism, dramatic chiaroscuro, theatrical staging, lifelike textures, intense realism',
  REMBRANDT:
    'baroque chiaroscuro, warm earth palette, rich impasto highlights, introspective mood',
  POLLOCK:
    'abstract expressionist action painting, layered drips and splatters, gestural dynamism',
}

// Slugs for routes like /explore/styles/van-gogh
const SLUG_MAP: Record<StyleKey, string> = {
  VAN_GOGH: 'van-gogh',
  DA_VINCI: 'da-vinci',
  PICASSO: 'picasso',
  VERMEER: 'vermeer',
  MONET: 'monet',
  MICHELANGELO: 'michelangelo',
  DALI: 'dali',
  CARAVAGGIO: 'caravaggio',
  REMBRANDT: 'rembrandt',
  POLLOCK: 'pollock',
}

const INV_SLUG_MAP: Record<string, StyleKey> = Object.fromEntries(
  (Object.entries(SLUG_MAP) as [StyleKey, string][]).map(([k, v]) => [v, k])
) as Record<string, StyleKey>

// Helpers demanded by your components/pages
export function styleKeyToLabel(key: StyleKey): string {
  return STYLE_LABELS[key]
}

export function styleKeyToSlug(key: StyleKey): string {
  return SLUG_MAP[key]
}

export function styleSlugToKey(slug: string): StyleKey {
  const s = slug.trim().toLowerCase()
  const key = INV_SLUG_MAP[s]
  if (!key) {
    // default sensibly if bad slug
    return 'VAN_GOGH'
  }
  return key
}
