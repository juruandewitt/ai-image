import { prisma } from '@/lib/prisma'
export async function listArtworks() { return prisma.artwork.findMany({ orderBy: { createdAt: 'desc' } }) }
export async function getArtwork(id: string) { return prisma.artwork.findUnique({ where: { id } }) }
