// lib/styles.ts

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

export function styleKeyToSlug(key: StyleKey): string {
  return key.toLowerCase().replace(/_/g, '-')
}

// Strong slug resolver: recognizes aliases and never silently falls back to VAN_GOGH
export function styleSlugToKey(slug: string): StyleKey {
  const s = slug.trim().toLowerCase()
  const map: Record<string, StyleKey> = {
    'van-gogh': 'VAN_GOGH',
    'vangogh': 'VAN_GOGH',
    'vermeer': 'VERMEER',
    'dali': 'DALI',
    'dalí': 'DALI',
    'monet': 'MONET',
    'picasso': 'PICASSO',
    'rembrandt': 'REMBRANDT',
    'caravaggio': 'CARAVAGGIO',
    'da-vinci': 'DA_VINCI',
    'leonardo': 'DA_VINCI',
    'michelangelo': 'MICHELANGELO',
    'pollock': 'POLLOCK',
  }
  const k = map[s] || (s.replace(/-/g, '_').toUpperCase() as StyleKey)
  if ((STYLE_KEYS as readonly string[]).includes(k)) return k
  // if it’s unknown, return POLLOCK (anything but silently Van Gogh),
  // so mistakes are obvious during testing
  return 'POLLOCK'
}

export function styleKeyToLabel(key: StyleKey): string {
  return STYLE_LABELS[key]
}
