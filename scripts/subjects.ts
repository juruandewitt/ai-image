
export type MasterKey =
  | 'van-gogh' | 'rembrandt' | 'picasso' | 'vermeer' | 'monet'
  | 'michelangelo' | 'dali' | 'caravaggio' | 'da-vinci' | 'pollock'

// A few canonical "famous-work" hooks per master for recognisable vibes.
// We’ll combine these with generic subjects to produce 50+ varied titles.
const CANON: Record<MasterKey,string[]> = {
  'van-gogh': [
    'Starry Harbor Over Canal', 'Sunflowers in Night Café', 'Wheatfield with Neon Crows',
    'Bedroom with Lantern Glow', 'Olive Trees and Electric Moon', 'Almond Blossoms in Wind'
  ],
  'rembrandt': [
    'Self Portrait with Soft Candle', 'Night Watch on Narrow Street', 'Anatomy Lesson in Studio',
    'Old Woman Reading by Hearth', 'Young Musician with Lute', 'The Goldsmith’s Workshop'
  ],
  'picasso': [
    'Harlequin with Blue Guitar', 'Weeping Woman with Hat', 'Three Musicians in Café',
    'Cubist Still Life with Bottle', 'Minotaur at the Table', 'Bull and Lamp in Studio'
  ],
  'vermeer': [
    'Girl with Pearl Pendant, Window Light', 'Milkmaid Pouring at Dawn', 'Letter Writer Beside Lattice',
    'Lace Maker at Quiet Desk', 'Astronomer with Brass Instruments', 'Pearl Necklace Before Mirror'
  ],
  'monet': [
    'Water Lilies at Clouded Noon', 'Rouen Cathedral in Gold Mist', 'Haystacks in Frost',
    'Seine at Sunrise, Pastel', 'Japanese Bridge, Silver Dawn', 'Garden Path in Spring'
  ],
  'michelangelo': [
    'Creation Study of Hands', 'Pietà Study in Marble Light', 'Ignudo with Garland',
    'Sibyl with Scroll and Drapery', 'Adam Reclining, Red Chalk', 'Hero with Shield in Niche'
  ],
  'dali': [
    'Persistence of Clouds over Harbor', 'Melting Clock on Piano', 'Desert of Drawers',
    'Elephants on Spindly Legs', 'Chromed Egg over Shore', 'Crutches and Veils'
  ],
  'caravaggio': [
    'Calling of the Fisherman', 'Cardsharps in Red Velvet', 'Judith with Tenebrism',
    'Supper by Candlelight', 'Saint with Book and Skull', 'Bacchus with Grapes and Basin'
  ],
  'da-vinci': [
    'Portrait with Subtle Smile', 'Study of Flying Machine', 'Virgin and Child with Cat',
    'Anatomical Study of Shoulder', 'Landscape in Sfumato', 'Engineer’s Siege Device'
  ],
  'pollock': [
    'Black Enamel over Amber Field', 'White Drip in Night', 'Number 32 with Vermilion',
    'Blue Poles Variant', 'Signals in Asphalt', 'Vortex of Ash and Lead'
  ],
}

// Generic subjects we’ll mix in so we can hit 50+ images cleanly per master.
const SUBJECTS = [
  'harbor at dusk', 'city roofs in rain', 'orchard in bloom', 'bridge over canal',
  'violin on chair', 'flowers in vase', 'windmill field', 'quiet kitchen interior',
  'river bend at twilight', 'lantern-lit alley', 'studio corner with stool',
  'table with fruit and bottle', 'girl reading letter', 'astronomer’s desk',
  'cathedral facade in fog', 'haystacks in winter', 'boat by reed marsh',
  'portrait in profile', 'mask on a table', 'mirror before window',
  'storm over seaside cliffs', 'olive grove', 'iris garden', 'snowy street',
  'pilgrims at gate', 'merchant by window', 'cartographer and globe',
  'marble drapery study', 'heroic torso sketch', 'red chalk anatomy study',
  'melting hourglass on shelf', 'elephant with spindly legs', 'crutch in desert',
  'fruit basket and knife', 'candle over playing cards', 'saint with book',
  'sfumato mountain landscape', 'flying machine study', 'architectural study',
  'drip vortex over ochre field', 'aluminium enamel mesh', 'black enamel storm',
]

// Style descriptors steer the generation strongly.
export const STYLE_GUIDE: Record<MasterKey,string> = {
  'van-gogh': "post-impressionist, heavy impasto, swirling brushwork, cobalt blues, chrome yellow, expressive night skies, Arles mood",
  'rembrandt': "baroque tenebrism, deep chiaroscuro, candlelit faces, warm umbers, textured oils, Dutch Golden Age",
  'picasso': "analytic/cubist geometry, fractured planes, bold outlines, limited palette, blue/rose period influences",
  'vermeer': "quiet Dutch interior, north-facing window light, pearly highlights, Delft palette, precise perspective",
  'monet': "impressionist light study, broken color, soft edges, atmosphere-first, plein air, shimmering reflections",
  'michelangelo': "renaissance monumental anatomy, marble-like forms, contrapposto, red chalk study, sculptural mass",
  'dali': "surrealist dream logic, hyper-detailed textures, long shadows, symbolic objects, Catalan shoreline vibe",
  'caravaggio': "dramatic baroque tenebrism, theatrical spotlighting, gritty realism, strong diagonals",
  'da-vinci': "sfumato gradations, subtle chiaroscuro, anatomical precision, proto-engineering drawings",
  'pollock': "gestural action painting, all-over drip, enamel skeins, layered improvisation, large canvas feel",
}

// Build N titles mixing canonical hooks and generic subjects.
export function makeTitles(style: MasterKey, count: number): string[] {
  const base = CANON[style].slice()
  let i = 0
  while (base.length < count) {
    const s = SUBJECTS[i % SUBJECTS.length]
    // Capitalize subject nicely
    const title = s.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    base.push(title)
    i++
  }
  return base.slice(0, count)
}
