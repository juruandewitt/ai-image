
export const STYLE_ORDER = [
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
export type StyleKey = typeof STYLE_ORDER[number]

export const STYLE_LABELS: Record<StyleKey, string> = {
  VAN_GOGH: 'Vincent van Gogh',
  REMBRANDT: 'Rembrandt van Rijn',
  PICASSO: 'Pablo Picasso',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  MICHELANGELO: 'Michelangelo',
  DALI: 'Salvador Dalí',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  POLLOCK: 'Jackson Pollock',
}

export const styleKeyToLabel = (key: string) =>
  STYLE_LABELS[key as StyleKey] ?? key

export const styleKeyToSlug = (key: string) =>
  key.toLowerCase().replace(/_/g, '-')

export const styleSlugToKey = (slug: string) =>
  slug.toUpperCase().replace(/-/g, '_') as StyleKey
