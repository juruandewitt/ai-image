export type ThemeCollection = {
  slug: string
  title: string
  description: string
  tag: string
}

export const themeCollections: ThemeCollection[] = [
  {
    slug: 'space-universe',
    title: 'Space & Universe',
    description: 'Galaxies, nebulae, planets, deep space, cosmic scenes, and sci-fi-inspired universe artwork.',
    tag: 'theme:space-universe',
  },
  {
    slug: 'landscapes',
    title: 'Landscapes',
    description: 'Mountains, deserts, coastlines, forests, valleys, rivers, and premium natural scenery.',
    tag: 'theme:landscapes',
  },
  {
    slug: 'wildlife',
    title: 'Wildlife',
    description: 'Premium animal portraits, safari scenes, birds, marine life, and cinematic nature artwork.',
    tag: 'theme:wildlife',
  },
  {
    slug: 'automotive',
    title: 'Automotive',
    description: 'Luxury cars, supercars, classic vehicles, futuristic concepts, and cinematic automotive artwork.',
    tag: 'theme:automotive',
  },
  {
    slug: 'steampunk',
    title: 'Steampunk',
    description: 'Clockwork machines, brass cities, airships, gears, Victorian industrial worlds, and copper fantasy scenes.',
    tag: 'theme:steampunk',
  },
  {
    slug: 'fantasy',
    title: 'Fantasy',
    description: 'Dragons, castles, enchanted forests, magical ruins, crystal realms, and epic fantasy worlds.',
    tag: 'theme:fantasy',
  },
  {
    slug: 'cyberpunk',
    title: 'Cyberpunk',
    description: 'Neon megacities, futuristic streets, holograms, rainy skylines, and sci-fi urban worlds.',
    tag: 'theme:cyberpunk',
  },
  {
    slug: 'abstract',
    title: 'Abstract',
    description: 'Modern abstract artwork, premium textures, marble, metallic forms, gradients, and luxury wall decor.',
    tag: 'theme:abstract',
  },
  {
    slug: 'architecture',
    title: 'Architecture',
    description: 'Modern villas, skyscrapers, interiors, museums, courtyards, luxury buildings, and architectural spaces.',
    tag: 'theme:architecture',
  },
  {
    slug: 'luxury-interior',
    title: 'Luxury / Interior Decor',
    description: 'High-end interiors, luxury rooms, penthouses, spa spaces, warm neutral homes, and premium decor scenes.',
    tag: 'theme:luxury-interior',
  },
  {
    slug: 'fashion-editorial',
    title: 'Fashion / Editorial',
    description: 'High-fashion editorial scenes, couture styling, studio looks, luxury fashion, and magazine-style artwork.',
    tag: 'theme:fashion-editorial',
  },
]

export function getThemeCollection(slug: string) {
  return themeCollections.find((theme) => theme.slug === slug)
}
