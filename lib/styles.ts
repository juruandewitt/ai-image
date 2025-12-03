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
  // fallback so pages don’t crash
  return 'VAN_GOGH'
}

/**
 * buildStylePrompt
 * Returns a concise, style-targeted prompt for the image generator.
 * You can tweak per-style guidance inside the switch for stronger results.
 */
export function buildStylePrompt(styleKey: StyleKey, title: string): string {
  const artist = STYLE_LABELS[styleKey]

  // Per-style guidance (short, distinctive cues)
  let cues = ''
  switch (styleKey) {
    case 'VAN_GOGH':
      cues = 'impasto brushwork, swirling skies, bold complementary colors, post-impressionist lighting'
      break
    case 'VERMEER':
      cues = 'soft northern light, domestic interior, meticulous detail, camera obscura feel, pearl-like highlights'
      break
    case 'DALI':
      cues = 'surreal dreamscape, elongated shadows, melting forms, hyperreal textures, Catalonian coastline vibes'
      break
    case 'MONET':
      cues = 'broken color, plein-air impressionism, shimmering light, soft edges, atmospheric perspective'
      break
    case 'PICASSO':
      cues = 'cubist geometry, fragmented planes, bold contour lines, limited palette, analytic abstraction'
      break
    case 'REMBRANDT':
      cues = 'dramatic chiaroscuro, warm earth tones, textured realism, baroque atmosphere, directional light'
      break
    case 'CARAVAGGIO':
      cues = 'tenebrism, high contrast, baroque theatricality, realistic figures, spotlighting from one side'
      break
    case 'DA_VINCI':
      cues = 'sfumato, delicate gradations, renaissance proportions, subtle anatomical realism, muted palette'
      break
    case 'MICHELANGELO':
      cues = 'heroic anatomy, sculptural forms, high renaissance drama, dynamic poses, monumental composition'
      break
    case 'POLLOCK':
      cues = 'all-over drip painting, gestural abstraction, layered splatters, energetic rhythm, large canvas feel'
      break
    default:
      cues = 'coherent composition, art-historical styling, museum-grade finish'
  }

  // Final prompt (keep short & directive)
  return [
    `${title} — painted in the style of ${artist}.`,
    cues,
    'rich texture, coherent perspective, exhibition quality, no text, no watermark',
  ].join(' | ')
}
