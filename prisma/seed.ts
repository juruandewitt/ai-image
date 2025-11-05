import { PrismaClient, Category, Style } from '@prisma/client'
const prisma = new PrismaClient()

const STYLES: {key: Style, label: string}[] = [
  { key: Style.VAN_GOGH,     label: 'Van Gogh' },
  { key: Style.REMBRANDT,    label: 'Rembrandt' },
  { key: Style.PICASSO,      label: 'Picasso' },
  { key: Style.VERMEER,      label: 'Vermeer' },
  { key: Style.MONET,        label: 'Monet' },
  { key: Style.MICHELANGELO, label: 'Michelangelo' },
  { key: Style.DALI,         label: 'Dalí' },
  { key: Style.CARAVAGGIO,   label: 'Caravaggio' },
  { key: Style.DA_VINCI,     label: 'Da Vinci' },
  { key: Style.POLLOCK,      label: 'Pollock' },
]

function itemFor(style: Style, label: string, i: number) {
  const seed = `${style.toLowerCase()}_${i}`
  const cats: Category[] = [Category.ABSTRACT, Category.LANDSCAPE, Category.PORTRAIT, Category.SURREAL, Category.MINIMAL, Category.SCI_FI]
  const category = cats[i % cats.length]
  return {
    title: `${label} Study #${(i+1).toString().padStart(2,'0')}`,
    price: 5000 + (i % 15) * 100, // $50.00 .. $64.00
    thumbnail: `https://picsum.photos/seed/${seed}/1200/900`,
    artist: 'AI Studio',
    tags: [label.toLowerCase().replace(/\s+/g,'-'), 'classic', 'ai'],
    category,
    status: 'PUBLISHED' as const,
    featured: i < 6, // first few appear in Featured if you use it
    style,
  }
}

async function main() {
  const existing = await prisma.artwork.count()
  if (existing >= 500) {
    console.log('Seed skipped: dataset already populated with', existing, 'artworks')
    return
  }
  let total = 0
  for (const {key, label} of STYLES) {
    const batch = Array.from({length: 50}, (_, i) => itemFor(key, label, i))
    await prisma.artwork.createMany({ data: batch })
    total += batch.length
    console.log(`Inserted ${batch.length} for ${label}`)
  }
  console.log('Seed complete: inserted', total, 'artworks')
}

main().finally(() => prisma.$disconnect())
