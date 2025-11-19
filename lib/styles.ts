
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

export const STYLE_PROMPTS: Record<keyof typeof STYLE_LABELS, string> = {
  VAN_GOGH: "post-impressionist, heavy impasto, swirling brush strokes, vivid complementary colors, starry glow",
  DA_VINCI: "Renaissance chiaroscuro, sfumato transitions, precise proportions, subtle harmonious palette",
  PICASSO: "cubist abstraction, fractured perspective, geometric planes, bold simplified forms",
  VERMEER: "Dutch Golden Age, camera obscura realism, soft window light, cool interiors, pearl highlights",
  MONET: "impressionist plein-air, broken color, shimmering reflections, atmospheric perspective",
  MICHELANGELO: "High Renaissance heroic anatomy, marble-like forms, dramatic contrapposto, monumental scale",
  DALI: "surrealist dream logic, hyperreal textures, melting transformations, desert horizons",
  CARAVAGGIO: "tenebrism, dramatic chiaroscuro, theatrical staging, lifelike textures, intense realism",
  REMBRANDT: "baroque chiaroscuro, warm earth palette, rich impasto highlights, introspective mood",
  POLLOCK: "abstract expressionist action painting, layered drips and splatters, gestural dynamism",
}
