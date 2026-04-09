export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const PREVIEW_VERSION = 'v8'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="46%" fill="#cbd5e1" font-family="sans-serif" font-size="24"
        text-anchor="middle" dominant-baseline="middle">Coming Soon</text>
      <text x="50%" y="54%" fill="#94a3b8" font-family="sans-serif" font-size="15"
        text-anchor="middle" dominant-baseline="middle">Artwork placeholder</text>
    </svg>`
  )

const STYLE_BY_SLUG: Record<string, { key: string; label: string }> = {
  'van-gogh': { key: 'VAN_GOGH', label: 'Van Gogh' },
  dali: { key: 'DALI', label: 'Dalí' },
  'jackson-pollock': { key: 'POLLOCK', label: 'Jackson Pollock' },
  'johannes-vermeer': { key: 'VERMEER', label: 'Johannes Vermeer' },
  'claude-monet': { key: 'MONET', label: 'Claude Monet' },
  'pablo-picasso': { key: 'PICASSO', label: 'Pablo Picasso' },
  rembrandt: { key: 'REMBRANDT', label: 'Rembrandt' },
  caravaggio: { key: 'CARAVAGGIO', label: 'Caravaggio' },
  'leonardo-da-vinci': { key: 'DA_VINCI', label: 'Leonardo da Vinci' },
  michelangelo: { key: 'MICHELANGELO', label: 'Michelangelo' },
  'edvard-munch': { key: 'MUNCH', label: 'Edvard Munch' },
}

const blobBackedWhere = {
  OR: [
    {
      thumbnail: {
        contains: '.public.blob.vercel-storage.com',
        mode: 'insensitive' as const,
      },
    },
    {
      assets: {
        some: {
          originalUrl: {
            contains: '.public.blob.vercel-storage.com',
            mode: 'insensitive' as const,
          },
        },
      },
    },
  ],
}

const cleanWhere = {
  NOT: [
    { tags: { has: 'smoketest' } },
    { title: { contains: 'smoketest', mode: 'insensitive' as const } },
    { title: { contains: 'diagnostic', mode: 'insensitive' as const } },
    { title: { contains: 'test artwork', mode: 'insensitive' as const } },
    { title: { contains: 'db smoketest', mode: 'insensitive' as const } },
  ],
}

export default async function ExploreStylePage({
  params,
}: {
  params: { style: string }
}) {
  const styleInfo = STYLE_BY_SLUG[params.style]
  if (!styleInfo) notFound()

  const artworks = await prisma.artwork.findMany({
    where: {
      style: styleInfo.key as any,
      status: 'PUBLISHED',
      ...blobBackedWhere,
      ...cleanWhere,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    select: {
      id: true,
      title: true,
    },
  })

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <Link href="/explore" className="text-sm text-amber-400 hover:underline">
          ← Back to Explore
        </Link>
        <h1 className="text-3xl font-semibold">{styleInfo.label}</h1>
        <p className="text-sm text-slate-400">
          {artworks.length} published works currently available
        </p>
      </div>

      {artworks.length === 0 ? (
        <div className="text-sm text-slate-400">No published works available yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {artworks.map((art) => (
            <Link
              key={art.id}
              href={`/artwork/${art.id}`}
              className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-amber-400/60 transition-colors"
            >
              <SafeImg
                src={`/api/artwork/preview/${art.id}?w=520&v=${PREVIEW_VERSION}`}
                fallbackSrc={FALLBACK_DATA_URL}
                alt={art.title}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <div className="text-sm text-slate-100 line-clamp-2">{art.title}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
