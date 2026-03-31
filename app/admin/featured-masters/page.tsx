export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import SafeImg from '@/components/safe-img'

const PREVIEW_VERSION = 'v6'

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

const STYLE_ORDER = Object.keys(STYLE_LABELS)

export default async function FeaturedMastersAdminPage() {
  const sections = await Promise.all(
    STYLE_ORDER.map(async (style) => {
      const items = await prisma.artwork.findMany({
        where: {
          style: style as any,
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
        take: 24,
        select: {
          id: true,
          title: true,
        },
      })

      return {
        style,
        label: STYLE_LABELS[style],
        items,
      }
    })
  )

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Featured Masters Selector</h1>
        <p className="text-slate-400 text-sm">
          Pick one exact artwork ID per Master for the homepage.
        </p>
      </div>

      {sections.map((section) => (
        <section key={section.style} className="space-y-4">
          <h2 className="text-2xl font-semibold">{section.label}</h2>

          {section.items.length === 0 ? (
            <p className="text-slate-400 text-sm">No artworks found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50"
                >
                  <SafeImg
                    src={`/api/artwork/preview/${item.id}?w=520&v=${PREVIEW_VERSION}`}
                    alt={item.title}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-3 space-y-2">
                    <div className="text-sm text-slate-100 line-clamp-2">
                      {item.title}
                    </div>
                    <div className="text-[11px] break-all text-amber-300">
                      {item.id}
                    </div>
                    <div className="flex justify-between items-center">
                      <Link
                        href={`/artwork/${item.id}`}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Open artwork
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </main>
  )
}
