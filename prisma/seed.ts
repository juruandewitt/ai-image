import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.artwork.createMany({
    data: [
      { title: 'Neon Dunes', price: 4900, thumbnail: 'https://picsum.photos/seed/ai1/800/600', artist: 'AI Studio', tags: ['surreal','neon'] },
      { title: 'Chrome Garden', price: 5900, thumbnail: 'https://picsum.photos/seed/ai2/800/600', artist: 'AI Studio', tags: ['abstract'] },
      { title: 'Liminal City', price: 7900, thumbnail: 'https://picsum.photos/seed/ai3/800/600', artist: 'AI Studio', tags: ['city','scifi'] },
    ]
  })
  console.log('Seed complete')
}

main().finally(() => prisma.$disconnect())
