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

// Order for Explore directory sections
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

// Slug helpers
export function styleKeyToSlug(key: StyleKey): string {
  return key.toLowerCase().replace(/_/g, '-')
}

export function styleSlugToKey(slug: string): StyleKey {
  const k = slug.trim().toUpperCase().replace(/-/g, '_')
  if ((STYLE_KEYS as readonly string[]).includes(k)) return k as StyleKey
  return 'VAN_GOGH'
}

// NEW: label helper expected by Explore pages/components
export function styleKeyToLabel(key: StyleKey): string {
  return STYLE_LABELS[key]
}

/**
 * Style-aware prompt builder for image generation
 */
export function buildStylePrompt(styleKey: StyleKey, title: string): string {
  const artist = STYLE_LABELS[styleKey]
  let cues = ''

  switch (styleKey) {
    case 'VAN_GOGH':
      cues = 'impasto brushwork, swirling skies, bold complementary colors, post-impressionist lighting'
      break
    case 'VERMEER':
      cues = 'soft northern light, domestic interior, meticulous detail, camera obscura look'
      break
    case 'DALI':
      cues = 'surreal dreamscape, elongated shadows, melting forms, hyperreal textures'
      break
    case 'MONET':
      cues = 'broken color, plein-air impressionism, shimmering light, soft edges'
      break
    case 'PICASSO':
      cues = 'cubist geometry, fragmented planes, bold contour lines, limited palette'
      break
    case 'REMBRANDT':
      cues = 'dramatic chiaroscuro, warm earth tones, textured realism, baroque atmosphere'
      break
    case 'CARAVAGGIO':
      cues = 'tenebrism, high contrast, realistic figures, theatrical composition'
      break
    case 'DA_VINCI':
      cues = 'sfumato, delicate gradations, renaissance proportions, subtle anatomy'
      break
    case 'MICHELANGELO':
      cues = 'heroic anatomy, sculptural forms, high renaissance drama, dynamic poses'
      break
    case 'POLLOCK':
      cues = 'all-over drip painting, gestural abstraction, layered splatters, energetic rhythm'
      break
    default:
      cues = 'coherent composition, art-historical styling, museum-grade finish'
  }

  return [
    `${title} — painted in the style of ${artist}.`,
    cues,
    'rich texture, coherent perspective, exhibition quality, no text, no watermark',
  ].join(' | ')
}
