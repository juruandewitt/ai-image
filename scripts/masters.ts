
// scripts/masters.ts
export type MasterKey =
  | 'van-gogh' | 'rembrandt' | 'picasso' | 'vermeer' | 'monet'
  | 'michelangelo' | 'dali' | 'caravaggio' | 'da-vinci' | 'pollock'

export const MASTER_TITLES: Record<MasterKey, string[]> = {
  'van-gogh': [
    'Starry Harbor Over Canal',
    'Sunflowers in Night Café',
    'Wheatfield with Neon Crows',
    'Nocturne over Windmill Village',
    'Self Portrait under Indigo Sky',
    'Iris Garden at Dusk',
    'Olive Trees and Electric Moon',
    'Storm over Arles Rooftops',
    'Bedroom with Lantern Glow',
    'Harvesters at Twilight',
    'View of Saint-Rémy by Lantern',
    'Almond Blossoms in Wind'
  ],
  'rembrandt': [
    'Self Portrait with Soft Candle',
    'Scholar by Window with Quill',
    'Night Watch on Narrow Street',
    'Portrait of Merchant in Furs',
    'Old Woman Reading by Hearth',
    'Anatomy Lesson of the Weaver',
    'Candlelit Violinist',
    'The Goldsmith’s Workshop',
    'Pilgrims at the Bridge',
    'Miller’s Cottage by Dusk'
  ],
  'picasso': [
    'Harlequin with Blue Guitar',
    'Cubist Still Life with Bottle',
    'Woman in Chair, Split Profile',
    'Bull and Lamp in Studio',
    'Blue Period Violinist',
    'Weeping Woman with Hat',
    'Minotaur at the Table',
    'Three Musicians in Cafe',
    'Portrait with Mandolin, Cubes',
    'Dove over Broken Mirror'
  ],
  'vermeer': [
    'Girl with Pearl Pendant, Window Light',
    'Milkmaid Pouring at Dawn',
    'Cartographer with Map and Globe',
    'Letter Writer Beside Lattice',
    'Lace Maker at Quiet Desk',
    'Woman in Blue by Open Window',
    'Astronomer with Brass Instruments',
    'Pearl Necklace Before Mirror',
    'Stillness of Delft Room',
    'Music Lesson in Yellow Light'
  ],
  'monet': [
    'Water Lilies at Clouded Noon',
    'Rouen Cathedral in Gold Mist',
    'Haystacks in Frost',
    'Seine at Sunrise, Pastel',
    'Poppies at Argenteuil',
    'Japanese Bridge, Silver Dawn',
    'Storm over Étretat',
    'Boats at Giverny',
    'Snow in Vétheuil',
    'Garden Path in Spring'
  ],
  'michelangelo': [
    'Sibyl with Scroll and Drapery',
    'Creation Study of Hands',
    'Marble David Study, Torso',
    'Prophet under Coffered Arch',
    'Ignudo with Garland',
    'Pietà Study in Marble Light',
    'Athlete Twisting in Contrapposto',
    'Hero with Shield in Niche',
    'Adam Reclining, Red Chalk',
    'Architectural Study, Massive Orders'
  ],
  'dali': [
    'Persistence of Clouds over Harbor',
    'Melting Clock on Piano',
    'Desert of Drawers',
    'Elephants on Spindly Legs',
    'Chromed Egg over Shore',
    'Crutches and Veils',
    'Soft Skull in Desert Wind',
    'Tigers Leaping from Pomegranate',
    'Narcissus by Mirror Lake',
    'Spectral Train through Room'
  ],
  'caravaggio': [
    'Calling of the Fisherman',
    'Fruit Basket with Hidden Blade',
    'Young Musician with Lute',
    'Judith with Tenebrism',
    'Cardsharps in Red Velvet',
    'Saint with Book and Skull',
    'Supper by Candlelight',
    'Martyr in Shadowed Niche',
    'Bacchus with Grapes and Basin',
    'Pilgrims before the Tavern'
  ],
  'da-vinci': [
    'Portrait with Subtle Smile',
    'Study of Flying Machine',
    'Virgin and Child with Cat',
    'Anatomical Study of Shoulder',
    'Landscape in Sfumato',
    'Madonna by the River',
    'Engineer’s Siege Device',
    'Study of Drapery in Silver',
    'Vitruvian Proportion Study',
    'Horse and Rider in Motion'
  ],
  'pollock': [
    'Black Enamel over Amber Field',
    'White Drip in Night',
    'Number 32 with Vermilion',
    'Silver and Bone on Canvas',
    'Rust and Ivory Mesh',
    'Blue Poles Variant',
    'Sable Thread on Ochre',
    'Gauze of Titanium White',
    'Signals in Asphalt',
    'Vortex of Ash and Lead'
  ]
}
