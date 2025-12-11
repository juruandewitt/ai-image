// app/explore/styles/[style]/page.tsx
export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { styleSlugToKey, styleKeyToLabel } from '@/lib/styles'
import { notFound } from 'next/navigation'
import Link from 'next/link'

// NOTE: Using <img> avoids domain config issues that sometimes break <Image>
function Card({ a }: { a: {
  id: string
  title: string
  assets: { originalUrl: string | null }[]
} }) {
  const url = a.assets?.[0]?.originalUrl ?? ''
  return (
    <Link
      href={`/artwork/${a.id}`}
      className="group block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 transition"
    >
      <div className="aspect-[4/5] w-full bg-slate-950">
        {url ? (
          <img
            src={url}
            alt={a.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-slate-500 text-sm">
            (no image yet)
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-slate-100 text-sm font-medium line-clamp-1">{a.title}</div>
      </div>
    </Link>
  )
}

export default async function StylePage({
  params,
}: { params: { style: string } }) {
  const key = styleSlugToKey(params.style)
  if (!key) return notFound()

  // Pull recent published artworks for this style,
  // and exclude smoketests (the ones without real assets).
  const rows = await prisma.artwork.findMany({
    where: {
      style: key as any,
      status: 'PUBLISHED',
      NOT: { tags: { has: 'smoketest' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 120,
    select: {
      id: true,
      title: true,
      assets: {
        take: 1,
        orderBy: { createdAt: 'asc' },
        select: { originalUrl: true },
      },
    },
  })

  const label = styleKeyToLabel(key)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">{label}</h1>
        <p className="text-slate-400 text-sm mt-1">
          Recently generated works inspired by {label}.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="text-slate-400">No artworks yet for this style.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((a) => <Card key={a.id} a={a} />)}
        </div>
      )}
    </div>
  )
}
