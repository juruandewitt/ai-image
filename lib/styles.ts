// lib/styles.ts
// Central mapping between human slugs in URLs and your DB enum keys & labels.

export type StyleKey =
  | 'VAN_GOGH'
  | 'SALVADOR_DALI'
  | 'JACKSON_POLLOCK'
  | 'JOHANNES_VERMEER'
  | 'CLAUDE_MONET'
  | 'PABLO_PICASSO'
  | 'LEONARDO_DA_VINCI'

// URL slug  -> DB enum-style key
const SLUG_TO_KEY: Record<string, StyleKey> = {
  'van-gogh': 'VAN_GOGH',
  'dali': 'SALVADOR_DALI',
  'salvador-dali': 'SALVADOR_DALI',
  'jackson-pollock': 'JACKSON_POLLOCK',
  'pollock': 'JACKSON_POLLOCK',
  'johannes-vermeer': 'JOHANNES_VERMEER',
  'vermeer': 'JOHANNES_VERMEER',
  'claude-monet': 'CLAUDE_MONET',
  'monet': 'CLAUDE_MONET',
  'pablo-picasso': 'PABLO_PICASSO',
  'picasso': 'PABLO_PICASSO',
  'leonardo-da-vinci': 'LEONARDO_DA_VINCI',
  'da-vinci': 'LEONARDO_DA_VINCI',
}

// DB enum-style key -> nice label
const KEY_TO_LABEL: Record<StyleKey, string> = {
  VAN_GOGH: 'Van Gogh',
  SALVADOR_DALI: 'Salvador Dalí',
  JACKSON_POLLOCK: 'Jackson Pollock',
  JOHANNES_VERMEER: 'Johannes Vermeer',
  CLAUDE_MONET: 'Claude Monet',
  PABLO_PICASSO: 'Pablo Picasso',
  LEONARDO_DA_VINCI: 'Leonardo da Vinci',
}

// The canonical slug for each key (used when generating links)
const KEY_TO_SLUG: Record<StyleKey, string> = {
  VAN_GOGH: 'van-gogh',
  SALVADOR_DALI: 'dali',
  JACKSON_POLLOCK: 'jackson-pollock',
  JOHANNES_VERMEER: 'johannes-vermeer',
  CLAUDE_MONET: 'claude-monet',
  PABLO_PICASSO: 'pablo-picasso',
  LEONARDO_DA_VINCI: 'leonardo-da-vinci',
}

export function styleSlugToKey(slug: string): StyleKey | null {
  return SLUG_TO_KEY[slug.toLowerCase()] ?? null
}

export function styleKeyToLabel(key: StyleKey): string {
  return KEY_TO_LABEL[key]
}

export function styleKeyToSlug(key: StyleKey): string {
  return KEY_TO_SLUG[key]
}

// Useful for Explore directory lists
export const STYLE_SLUGS: Array<{ slug: string; key: StyleKey; label: string }> =
  (Object.keys(SLUG_TO_KEY) as string[])
    .filter((slug) => KEY_TO_SLUG[SLUG_TO_KEY[slug]] === slug) // de-dupe alternates
    .map((slug) => {
      const key = SLUG_TO_KEY[slug]
      return { slug, key, label: KEY_TO_LABEL[key] }
    })
