// lib/styles.ts
export type StyleKey =
  | 'VAN_GOGH' | 'DA_VINCI' | 'PICASSO' | 'REMBRANDT' | 'VERMEER'
  | 'MONET' | 'MICHELANGELO' | 'CARAVAGGIO' | 'DALI' | 'POLLOCK'

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

// Slugs for URLs like /explore/styles/van-gogh
export function styleKeyToSlug(key: StyleKey) {
  return STYLE_LABELS[key].toLowerCase().replace(/\s+/g, '-').replace('é','e')
}
export function styleSlugToKey(slug: string): StyleKey {
  const map: Record<string, StyleKey> = {
    'van-gogh': 'VAN_GOGH',
    'da-vinci': 'DA_VINCI',
    'picasso': 'PICASSO',
    'rembrandt': 'REMBRANDT',
    'vermeer': 'VERMEER',
    'monet': 'MONET',
    'michelangelo': 'MICHELANGELO',
    'caravaggio': 'CARAVAGGIO',
    'dali': 'DALI',
    'pollock': 'POLLOCK',
  }
  return map[slug] ?? 'VAN_GOGH'
}

// Heavily-conditioned style prompts per master.
// Keep titles descriptive; we’ll interpolate them below.
export const STYLE_PROMPTS: Record<StyleKey, {prefix: string; suffix: string}> = {
  VAN_GOGH: {
    prefix: "Oil painting in the style of Vincent van Gogh (post-impressionist). Thick impasto, bold swirling brushstrokes, vibrant complementary colors (cobalt blue, cadmium yellow), short directional strokes, visible canvas grain. Subject:",
    suffix: "Composition like a small canvas (3:2). Expressive brushwork, painterly texture, no typography, no photo realism."
  },
  DA_VINCI: {
    prefix: "Renaissance portrait in the style of Leonardo da Vinci. Subtle sfumato, soft chiaroscuro, muted earth tones, anatomical accuracy, balanced perspective. Subject:",
    suffix: "Delicate lighting, enigmatic expression, fine glazes, no modern objects, no typography."
  },
  PICASSO: {
    prefix: "Cubist composition in the style of Pablo Picasso (Analytic/Cubist). Faceted planes, multiple viewpoints, desaturated palette, abstracted forms. Subject:",
    suffix: "Strong geometric decomposition, flattened depth, no realism, no typography."
  },
  REMBRANDT: {
    prefix: "Baroque painting in the style of Rembrandt. Dramatic chiaroscuro, warm umbers, rich textures, directional light from one candle or window. Subject:",
    suffix: "Deep shadows, painterly brushwork, period feel, no modern elements, no typography."
  },
  VERMEER: {
    prefix: "Dutch Golden Age interior in the style of Johannes Vermeer. Soft northern light, quiet domestic scene, lapis and warm ochres, precise detail. Subject:",
    suffix: "Calm mood, balanced composition, no modern objects, no typography."
  },
  MONET: {
    prefix: "Impressionist landscape in the style of Claude Monet. Broken color, shimmering light, loose brushwork, pastel palette. Subject:",
    suffix: "Atmospheric perspective, plein-air feeling, no hard outlines, no typography."
  },
  MICHELANGELO: {
    prefix: "High Renaissance figure study in the style of Michelangelo. Heroic anatomy, dynamic contrapposto, marble or fresco sensibility. Subject:",
    suffix: "Classical proportions, sculptural light, no modern clothing, no typography."
  },
  CARAVAGGIO: {
    prefix: "Baroque still life/scene in the style of Caravaggio. Intense chiaroscuro, tenebrism, dramatic spotlighting, rich reds and blacks. Subject:",
    suffix: "High contrast edges, tactile realism, period objects only, no typography."
  },
  DALI: {
    prefix: "Surrealist scene in the style of Salvador Dalí. Dream logic, elongated shadows, melted or morphing forms, desert-like horizons. Subject:",
    suffix: "Hyper-detailed textures, uncanny objects, no text overlays, no typography."
  },
  POLLOCK: {
    prefix: "Abstract expressionist drip painting in the style of Jackson Pollock. Energetic splatters, layered skeins, rhythmic all-over composition. Subject:",
    suffix: "Dynamic motion, varied viscosity, canvas edges visible, no figurative forms, no typography."
  },
}
