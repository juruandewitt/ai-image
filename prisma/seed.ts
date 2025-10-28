import { PrismaClient, Category } from '@prisma/client'
const prisma = new PrismaClient()

const items = [
  { title: 'Neon Dunes',   price: 4900, thumbnail: 'https://picsum.photos/seed/ai1/1200/900', artist: 'AI Studio', tags: ['surreal','neon'], category: Category.SURREAL, featured: true },
  { title: 'Chrome Garden',price: 5900, thumbnail: 'https://picsum.photos/seed/ai2/1200/900', artist: 'AI Studio', tags: ['abstract','metal'], category: Category.ABSTRACT },
  { title: 'Liminal City', price: 7900, thumbnail: 'https://picsum.photos/seed/ai3/1200/900', artist: 'AI Studio', tags: ['city','scifi'], category: Category.SCI_FI, featured: true },
  { title: 'Solar Fields', price: 5600, thumbnail: 'https://picsum.photos/seed/ai4/1200/900', artist: 'Nova',      tags: ['landscape','glow'], category: Category.LANDSCAPE },
  { title: 'Echo Portrait',price: 5200, thumbnail: 'https://picsum.photos/seed/ai5/1200/900', artist: 'Muse',      tags: ['portrait','minimal'], category: Category.PORTRAIT },
  { title: 'Glass Waves',  price: 6100, thumbnail: 'https://picsum.photos/seed/ai6/1200/900', artist: 'Vector',    tags: ['minimal','abstract'], category: Category.MINIMAL },
]

async function main() {
  const count = await prisma.artwork.count()
  if (count === 0) {
    await prisma.artwork.createMany({ data: items })
    console.log('Seed complete: inserted', items.length)
  } else {
    console.log('Seed skipped: artworks already exist')
  }
}

main().finally(() => prisma.$disconnect())
