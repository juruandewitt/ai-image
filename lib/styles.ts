// lib/styles.ts
// — One canonical place for style keys, labels, order, slugs, and prompt templates —

export type StyleKey =
  | 'VAN_GOGH'
  | 'DA_VINCI'
  | 'PICASSO'
  | 'REMBRANDT'
  | 'VERMEER'
  | 'MONET'
  | 'MICHELANGELO'
  | 'CARAVAGGIO'
  | 'DALI'
  | 'POLLOCK'

// Human-readable labels used across the site
export const STYLE_LABELS: Record<StyleKey, string> = {
  VAN_GOGH: 'Vincent van Gogh',
  DA_VINCI: 'Leonardo da Vinci',
  PICASSO: 'Pablo Picasso',
  REMBRANDT: 'Rembrandt',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  MICHELANGELO: 'Michelangelo',
  CARAVAGGIO: 'Caravaggio',
  DALI: 'Salvador Dalí',
  POLLOCK: 'Jackson Pollock',
}

// Some code imports this helper name — export it for convenience
export function styleKeyToLabel(key: StyleKey) {
  return STYLE_LABELS[key]
}

// Some code expects STYLE_ORDER — export a default display order for explore/home
export const STYLE_ORDER: StyleKey[] = [
  'VAN_GOGH',
  'DA_VINCI',
  'REMBRANDT',
  'VERMEER',
  'MONET',
  'MICHELANGELO',
  'CARAVAGGIO',
  'PICASSO',
  'DALI',
  'POLLOCK',
]

// Slug helpers for routes like /explore/styles/van-gogh
export function styleKeyToSlug(key: StyleKey) {
  return STYLE_LABELS[key]
    .toLowerCase()
    .replace(/á/g, 'a') // normalize a bit
    .replace(/\s+/g, '-')
}

export function styleSlugToKey(slug: string): StyleKey {
  const map: Record<string, StyleKey> = {
    'vincent-van-gogh': 'VAN_GOGH',
    'van-gogh': 'VAN_GOGH',
    'leonardo-da-vinci': 'DA_VINCI',
    'da-vinci': 'DA_VINCI',
    'pablo-picasso': 'PICASSO',
    'picasso': 'PICASSO',
    'rembrandt': 'REMBRANDT',
    'johannes-vermeer': 'VERMEER',
    'vermeer': 'VERMEER',
    'claude-monet': 'MONET',
    'monet': 'MONET',
    'michelangelo': 'MICHELANGELO',
    'caravaggio': 'CARAVAGGIO',
    'salvador-dali': 'DALI',
    'dali': 'DALI',
    'jackson-pollock': 'POLLOCK',
    'pollock': 'POLLOCK',
  }
  return (map[slug] as StyleKey) ?? 'VAN_GOGH'
}

// Strong style prompt templates used by the generator
export const STYLE_PROMPTS: Record<
  StyleKey,
  { prefix: string; suffix: string }
> = {
  VAN_GOGH: {
    prefix:
      'Oil painting in the style of Vincent van Gogh (post-impressionist). Thick impasto, bold swirling brushstrokes, vibrant complementary colors (cobalt blue, cadmium yellow), short directional strokes, visible canvas grain. Subject:',
    suffix:
      'Composition like a small canvas (3:2). Expressive brushwork, painterly texture, no typography, no photorealism.',
  },
  DA_VINCI: {
    prefix:
      'Renaissance portrait in the style of Leonardo da Vinci. Subtle sfumato, soft chiaroscuro, muted earth tones, anatomical accuracy, balanced perspective. Subject:',
    suffix:
      'Delicate lighting, enigmatic expression, fine glazes, no modern objects, no typography.',
  },
  PICASSO: {
    prefix:
      'Cubist composition in the style of Pablo Picasso (Analytic/Cubist). Faceted planes, multiple viewpoints, desaturated palette, abstracted forms. Subject:',
    suffix:
      'Strong geometric decomposition, flattened depth, no realism, no typography.',
  },
  REMBRANDT: {
    prefix:
      'Baroque painting in the style of Rembrandt. Dramatic chiaroscuro, warm umbers, rich textures, directional light from one candle or window. Subject:',
    suffix:
      'Deep shadows, painterly brushwork, period feel, no modern elements, no typography.',
  },
  VERMEER: {
    prefix:
      'Dutch Golden Age interior in the style of Johannes Vermeer. Soft northern light, quiet domestic scene, lapis and warm ochres, precise detail. Subject:',
    suffix:
      'Calm mood, balanced composition, no modern objects, no typography.',
  },
  MONET: {
    prefix:
      'Impressionist landscape in the style of Claude Monet. Broken color, shimmering light, loose brushwork, pastel palette. Subject:',
    suffix:
      'Atmospheric perspective, plein-air feeling, no hard outlines, no typography.',
  },
  MICHELANGELO: {
    prefix:
      'High Renaissance figure study in the style of Michelangelo. Heroic anatomy, dynamic contrapposto, marble or fresco sensibility. Subject:',
    suffix:
      'Classical proportions, sculptural light, no modern clothing, no typography.',
  },
  CARAVAGGIO: {
    prefix:
      'Baroque still life/scene in the style of Caravaggio. Intense chiaroscuro, tenebrism, dramatic spotlighting, rich reds and blacks. Subject:',
    suffix:
      'High contrast edges, tactile realism, period objects only, no typography.',
  },
  DALI: {
    prefix:
      'Surrealist scene in the style of Salvador Dalí. Dream logic, elongated shadows, melted or morphing forms, desert-like horizons. Subject:',
    suffix:
      'Hyper-detailed textures, uncanny objects, no text overlays, no typography.',
  },
  POLLOCK: {
    prefix:
      'Abstract expressionist drip painting in the style of Jackson Pollock. Energetic splatters, layered skeins, rhythmic all-over composition. Subject:',
    suffix:
      'Dynamic motion, varied viscosity, canvas edges visible, no figurative forms, no typography.',
  },
}

// Helper to build the final prompt given a style + title
export function buildStylePrompt(style: StyleKey, title: string) {
  const t = title?.trim() || 'Untitled'
  const cfg = STYLE_PROMPTS[style] || STYLE_PROMPTS['VAN_GOGH']
  return `${cfg.prefix} ${t}. ${cfg.suffix}`
}
