// app/explore/styles/[style]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { styleSlugToKey, styleKeyToLabel } from "@/lib/styles";

export const dynamic = "force-dynamic";

type PageProps = {
  params: { style: string };
};

// Simple SVG fallback so you never see the broken-image icon
const FALLBACK_DATA_URL =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800">
  <rect width="100%" height="100%" fill="#111827" />
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    fill="#9CA3AF" font-size="16" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif">
    No image
  </text>
</svg>`);

// RIGHT NOW your lib/styles.ts uses keys like "dali", "pollock", etc.
// Your Prisma enum uses "DALI", "POLLOCK", etc.
// This map connects the two.
const STYLE_KEY_TO_PRISMA: Record<string, string> = {
  "dali": "DALI",
  "pollock": "POLLOCK",
  "vermeer": "VERMEER",
  "monet": "MONET",
  "picasso": "PICASSO",
  "da-vinci": "DA_VINCI",
  "rembrandt": "REMBRANDT",
  "caravaggio": "CARAVAGGIO",
  "michelangelo": "MICHELANGELO",
  // You also have "neo-noir", "dreamscape", "cyberpunk" in lib/styles.ts,
  // but those are not part of the Prisma enum yet, so we intentionally
  // do NOT map them here. They will 404 if used.
};

type ArtworkRow = {
  id: string;
  title: string;
  thumbnail: string | null;
  artist: string;
  assets: { originalUrl: string }[];
};

function pickImgSrc(a: ArtworkRow): string {
  return a.thumbnail || a.assets?.[0]?.originalUrl || FALLBACK_DATA_URL;
}

export default async function StyleExplorePage({ params }: PageProps) {
  // URL param will be something like "dali", "monet", "da-vinci", etc.
  const rawSlug = decodeURIComponent(params.style);

  // Map slug -> style key from lib/styles.ts (e.g. "dali")
  const styleKey = styleSlugToKey(rawSlug);

  if (!styleKey) {
    // Unknown slug: clean 404
    return notFound();
  }

  const prismaStyle = STYLE_KEY_TO_PRISMA[styleKey];

  if (!prismaStyle) {
    // Known in lib/styles.ts but not in Prisma enum -> also 404
    return notFound();
  }

  const label = styleKeyToLabel(styleKey) ?? styleKey;

  // Fetch artworks for this style.
  // Matches your schema.prisma: Artwork.style is enum Style. :contentReference[oaicite:3]{index=3}
  const artworks = (await prisma.artwork.findMany({
    where: {
      style: prismaStyle as any,
      NOT: { tags: { has: "smoketest" } },
      status: "PUBLISHED",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      artist: true,
      assets: {
        take: 1,
        orderBy: { createdAt: "asc" },
        select: { originalUrl: true },
      },
    },
  })) as ArtworkRow[];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {label}
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Masterworks and AI-generated pieces inspired by {label}.
        </p>
        <p className="text-xs text-muted-foreground">
          <Link href="/explore" className="underline underline-offset-4">
            ← Back to all masters
          </Link>
        </p>
      </header>

      {artworks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No artworks have been created in this style yet.
        </p>
      ) : (
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {artworks.map((artwork) => (
              <article
                key={artwork.id}
                className="group flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
              >
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
                  <img
                    src={pickImgSrc(artwork)}
                    alt={artwork.title}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    onError={(event) => {
                      const target = event.currentTarget;
                      target.src = FALLBACK_DATA_URL;
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1 px-4 py-3">
                  <h2 className="truncate text-sm font-medium">
                    {artwork.title}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {artwork.artist || "Unknown artist"}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
