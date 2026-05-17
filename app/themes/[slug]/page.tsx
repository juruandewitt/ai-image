import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getThemeCollection } from '@/lib/themes'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: {
    slug: string
  }
}

export default async function ThemePage({ params }: PageProps) {
  const theme = getThemeCollection(params.slug)

  if (!theme) {
    notFound()
  }

  const artworks = await prisma.artwork.findMany({
    where: {
      status: 'PUBLISHED' as any,
      tags: {
        has: theme.tag,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 100,
  })

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← Back to home
          </Link>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight">
            {theme.title}
          </h1>

          <p className="mt-3 max-w-2xl text-white/60">
            {theme.description}
          </p>

          <p className="mt-3 text-sm text-white/40">
            {artworks.length} artworks available
          </p>
        </div>

        {artworks.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-lg text-white/70">
              No artworks found for this theme yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {artworks.map((artwork) => (
              <Link
                key={artwork.id}
                href={`/artworks/${artwork.id}`}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition hover:border-white/30"
              >
                <div className="aspect-square overflow-hidden bg-white/10">
                  {artwork.thumbnail ? (
                    <img
                      src={artwork.thumbnail}
                      alt={artwork.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center text-sm text-white/40">
                      Coming Soon Artwork Placeholder
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="line-clamp-2 text-sm font-medium text-white">
                    {artwork.title}
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    ${artwork.price?.toFixed(2) ?? '9.99'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
