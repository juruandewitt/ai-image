import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.artwork.count()
  if (count > 0) {
    console.log('Seed skipped: artworks already exist')
    return
  }
  await prisma.artwork.createMany({
    data: [
      { title: 'Neon Dunes', price: 4900, thumbnail: 'https://picsum.photos/seed/ai1/1200/900', artist: 'AI Studio', tags: ['surreal','neon'] },
      { title: 'Chrome Garden', price: 5900, thumbnail: 'https://picsum.photos/seed/ai2/1200/900', artist: 'AI Studio', tags: ['abstract'] },
      { title: 'Liminal City', price: 7900, thumbnail: 'https://picsum.photos/seed/ai3/1200/900', artist: 'AI Studio', tags: ['city','scifi'] },
    ]
  })
  console.log('Seed complete')
}

main().finally(() => prisma.$disconnect())
