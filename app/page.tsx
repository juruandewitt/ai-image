export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const PREVIEW_VERSION = 'v2'

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

const MASTER_ROWS = [
  { key: 'VAN_GOGH', label: 'Van Gogh', slug: 'van-gogh' },
  { key: 'DALI', label: 'Dalí', slug: 'dali' },
  { key: 'POLLOCK', label: 'Jackson Pollock', slug: 'jackson-pollock' },
  { key: 'VERMEER', label: 'Johannes Vermeer', slug: 'johannes-vermeer' },
  { key: 'MONET', label: 'Claude Monet', slug: 'claude-monet' },
  { key: 'PICASSO', label: 'Pablo Picasso', slug: 'pablo-picasso' },
  { key: 'REMBRANDT', label: 'Rembrandt', slug: 'rembrandt' },
  { key: 'CARAVAGGIO', label: 'Caravaggio', slug: 'caravaggio' },
  { key: 'DA_VINCI', label: 'Leonardo da Vinci', slug: 'leonardo-da-vinci' },
  { key: 'MICHELANGELO', label: 'Michelangelo', slug: 'michelangelo' },
]

const STYLE_LABELS: Record<string, string> = {
  VAN_GOGH: 'Van Gogh',
  DALI: 'Dalí',
  POLLOCK: 'Jackson Pollock',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  PICASSO: 'Pablo Picasso',
  REMBRANDT: 'Rembrandt',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  MICHELANGELO: 'Michelangelo',
}

function styleLabel(style: string | null) {
  if (!style) return 'AI Image'
  return STYLE_LABELS[String(style)] || String(style)
}

export default async function HomePage() {
  const newDrops = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED',
      NOT: [
        { tags: { has: 'smoketest' } },
        { title: { contains: 'smoketest', mode: 'insensitive' } },
        { title: { contains: 'diagnostic', mode: 'insensitive' } },
        { title: { contains: 'test artwork', mode: 'insensitive' } },
        { title: { contains: 'db smoketest', mode: 'insensitive' } },
      ],
      OR: [
        {
          thumbnail: {
            contains: '.public.blob.vercel-storage.com',
            mode: 'insensitive',
          },
        },
        {
          assets: {
            some: {
              originalUrl: {
                contains: '.public.blob.vercel-storage.com',
                mode: 'insensitive',
              },
            },
          },
        },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      title: true,
      style: true,
    },
  })

  const masters = await Promise.all(
    MASTER_ROWS.map(async (master) => {
      const artwork = await prisma.artwork.findFirst({
        where: {
          style: master.key as any,
          status: 'PUBLISHED',
          NOT: [
            { tags: { has: 'smoketest' } },
            { title: { contains: 'smoketest', mode: 'insensitive' } },
            { title: { contains: 'diagnostic', mode: 'insensitive' } },
            { title: { contains: 'test artwork', mode: 'insensitive' } },
            { title: { contains: 'db smoketest', mode: 'insensitive' } },
          ],
          OR: [
            {
              thumbnail: {
                contains: '.public.blob.vercel-storage.com',
                mode: 'insensitive',
              },
            },
            {
              assets: {
                some: {
                  originalUrl: {
                    contains: '.public.blob.vercel-storage.com',
                    mode: 'insensitive',
                  },
                },
              },
            },
          ],
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
        },
      })

      return {
        ...master,
        artwork,
      }
    })
  )

  return (
    <main className="space-y-12">
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">New Drops</h2>
          <Link href="/explore" className="text-sm text-amber-400 hover:underline">
            Explore all →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {newDrops.length > 0 ? (
            newDrops.map((art) => (
              <Link
                key={art.id}
                href={`/artwork/${art.id}`}
                className="min-w-[240px] max-w-[240px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-amber-400/60 transition-colors"
              >
                <SafeImg
                  src={`/api/artwork/preview/${art.id}?w=520&v=${PREVIEW_VERSION}`}
                  fallbackSrc={FALLBACK_DATA_URL}
                  alt={art.title}
                  className="aspect-square w-full object-cover"
                />
                <div className="p-3">
                  <div className="text-sm text-slate-100 line-clamp-1">{art.title}</div>
                  <div className="text-xs text-slate-400 line-clamp-1">
                    {styleLabel(String(art.style))}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-sm text-slate-400">No new drops available yet.</div>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl font-semibold">Masters</h2>
          <Link href="/explore" className="text-sm text-amber-400 hover:underline">
            Browse masters →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {masters.map((master) => (
            <Link
              key={master.key}
              href={`/explore/styles/${master.slug}`}
              className="min-w-[240px] max-w-[240px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 hover:border-amber-400/60 transition-colors"
            >
              <SafeImg
                src={
                  master.artwork
                    ? `/api/artwork/preview/${master.artwork.id}?w=520&v=${PREVIEW_VERSION}`
                    : FALLBACK_DATA_URL
                }
                fallbackSrc={FALLBACK_DATA_URL}
                alt={master.label}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <div className="text-sm text-slate-100">{master.label}</div>
                <div className="text-xs text-slate-400">Explore this master</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
