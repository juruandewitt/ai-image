// app/explore/styles/[style]/page.tsx

import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { styleSlugToKey, styleKeyToLabel } from "@/lib/styles";

type PageProps = {
  params: { style: string };
};

export default async function StyleExplorePage({ params }: PageProps) {
  // URL param will be something like "dali", "monet", "da-vinci", etc.
  const rawSlug = decodeURIComponent(params.style);

  // Map slug -> internal style key (e.g. "dali")
  const styleKey = styleSlugToKey(rawSlug);

  // If the slug is unknown, show a proper 404 rather than crashing.
  if (!styleKey) {
    return notFound();
  }

  const label = styleKeyToLabel(styleKey) ?? styleKey;

  // Fetch artworks for this style.
  // Adjust these fields if your Prisma schema differs.
  const artworks = await db.artwork.findMany({
    where: {
      styleKey,
      // Uncomment if you have a published flag:
      // published: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      artist: true,
      assets: true, // we’ll pick a thumbnail from here
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {label}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Masterworks and AI-generated pieces inspired by {label}.
        </p>
      </header>

      {artworks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No artworks have been created in this style yet.
        </p>
      ) : (
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => {
              const thumbnail =
                artwork.assets?.find((a: any) => a.kind === "THUMBNAIL") ??
                artwork.assets?.[0];

              const imageUrl =
                thumbnail?.url ?? "/images/placeholder-artwork.png";

              return (
                <article
                  key={artwork.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                    {/* Plain <img> with fallback so it never shows a broken icon */}
                    <img
                      src={imageUrl}
                      alt={artwork.title}
                      className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                      onError={(event) => {
                        const target = event.currentTarget;
                        target.src = "/images/placeholder-artwork.png";
                      }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                    <h2 className="truncate text-sm font-medium">
                      {artwork.title}
                    </h2>
                    {artwork.artist ? (
                      <p className="text-xs text-muted-foreground">
                        by{" "}
                        {artwork.artist.displayName ??
                          artwork.artist.name ??
                          "Unknown artist"}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
