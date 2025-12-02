// lib/styles.ts
// Canonical style keys (must match your Prisma enum names)
export const STYLE_KEYS = [
  'VAN_GOGH',
  'REMBRANDT',
  'PICASSO',
  'VERMEER',
  'MONET',
  'MICHELANGELO',
  'DALI',
  'CARAVAGGIO',
  'DA_VINCI',
  'POLLOCK',
] as const

export type StyleKey = typeof STYLE_KEYS[number]

export const STYLE_LABELS: Record<StyleKey, string> = {
  VAN_GOGH: 'Vincent van Gogh',
  REMBRANDT: 'Rembrandt',
  PICASSO: 'Pablo Picasso',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  MICHELANGELO: 'Michelangelo',
  DALI: 'Salvador Dalí',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  POLLOCK: 'Jackson Pollock',
}

// Order they appear in Explore
export const STYLE_ORDER: StyleKey[] = [
  'VAN_GOGH',
  'VERMEER',
  'DALI',
  'MONET',
  'PICASSO',
  'REMBRANDT',
  'CARAVAGGIO',
  'DA_VINCI',
  'MICHELANGELO',
  'POLLOCK',
]

// slug <-> key helpers
export function styleKeyToSlug(key: StyleKey): string {
  return key.toLowerCase().replace(/_/g, '-')
}

export function styleSlugToKey(slug: string): StyleKey {
  const k = slug.trim().toUpperCase().replace(/-/g, '_')
  if ((STYLE_KEYS as readonly string[]).includes(k)) {
    return k as StyleKey
  }
  // default fallback so the page won’t crash
  return 'VAN_GOGH'
}
