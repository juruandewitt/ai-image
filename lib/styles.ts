// lib/styles.ts
// Canonical mapping between URL slugs (lowercase/kebab) and your Prisma Style enum keys.
// Make sure these enum keys exist in your Prisma schema (enum Style { ... }).

export const STYLE_LABELS: Record<string, string> = {
  VAN_GOGH: 'Vincent van Gogh',
  DALI: 'Salvador Dalí',
  JACKSON_POLLOCK: 'Jackson Pollock',
  JOHANNES_VERMEER: 'Johannes Vermeer',
  CLAUDE_MONET: 'Claude Monet',
  PABLO_PICASSO: 'Pablo Picasso',
  LEONARDO_DA_VINCI: 'Leonardo da Vinci',
}

export const STYLE_SLUG_TO_KEY: Record<string, string> = {
  'van-gogh': 'VAN_GOGH',
  'dali': 'DALI',
  'jackson-pollock': 'JACKSON_POLLOCK',
  'johannes-vermeer': 'JOHANNES_VERMEER',
  'claude-monet': 'CLAUDE_MONET',
  'pablo-picasso': 'PABLO_PICASSO',
  'leonardo-da-vinci': 'LEONARDO_DA_VINCI',
}

export function styleSlugToKey(slug: string): string | null {
  if (!slug) return null
  const s = slug.toLowerCase()
  return STYLE_SLUG_TO_KEY[s] ?? null
}

export function styleKeyToLabel(key: string): string {
  return STYLE_LABELS[key] ?? key
}

// Convenient ordered list for Explore index pages (if you need it).
export const STYLE_ORDER: string[] = [
  'VAN_GOGH',
  'DALI',
  'JACKSON_POLLOCK',
  'JOHANNES_VERMEER',
  'CLAUDE_MONET',
  'PABLO_PICASSO',
  'LEONARDO_DA_VINCI',
]

// Utility to make a slug from a style key if you need to link out.
export function styleKeyToSlug(key: string): string {
  const entry = Object.entries(STYLE_SLUG_TO_KEY).find(([, v]) => v === key)
  return entry ? entry[0] : key.toLowerCase().replace(/_/g, '-')
}
