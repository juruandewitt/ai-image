// lib/styles.ts

import type { Style } from "@prisma/client";

export type StyleKey = Style;
export type StyleCategory = "classic" | "contemporary" | "experimental";

export interface StyleDefinition {
  key: StyleKey;      // Prisma enum value, e.g. "DALI"
  slug: string;       // URL-safe slug, e.g. "dali"
  label: string;      // Human label, e.g. "Dalí"
  description?: string;
  category: StyleCategory;
}

/**
 * Central style registry.
 *
 * - `key` MUST match your Prisma enum `Style` values.
 * - `slug` is URL-safe (no spaces, no accents).
 * - `label` is what you show in the UI and can have accents/spaces.
 */
export const ALL_STYLES: StyleDefinition[] = [
  // --- Classic masters (directly mapped to your Prisma enum) ---
  {
    key: "VAN_GOGH",
    slug: "van-gogh",
    label: "Van Gogh",
    description: "Vivid brushwork and expressive color.",
    category: "classic",
  },
  {
    key: "DALI",
    slug: "dali",
    label: "Dalí",
    description: "Surreal dreamscapes and melting realities.",
    category: "classic",
  },
  {
    key: "POLLOCK",
    slug: "pollock",
    label: "Jackson Pollock",
    description: "Energetic, gestural abstraction and drips.",
    category: "classic",
  },
  {
    key: "VERMEER",
    slug: "vermeer",
    label: "Johannes Vermeer",
    description: "Luminous interiors and quiet realism.",
    category: "classic",
  },
  {
    key: "MONET",
    slug: "monet",
    label: "Claude Monet",
    description: "Soft impressionist light and color.",
    category: "classic",
  },
  {
    key: "PICASSO",
    slug: "picasso",
    label: "Pablo Picasso",
    description: "Cubist forms and bold abstraction.",
    category: "classic",
  },
  {
    key: "REMbrandT",
    slug: "rembrandt",
    label: "Rembrandt",
    description: "Dramatic chiaroscuro and portraiture.",
    category: "classic",
  } as StyleDefinition, // force correct type to avoid case typos
  {
    key: "CARAVAGGIO",
    slug: "caravaggio",
    label: "Caravaggio",
    description: "High-contrast realism and baroque drama.",
    category: "classic",
  },
  {
    key: "DA_VINCI",
    slug: "da-vinci",
    label: "Leonardo da Vinci",
    description: "Renaissance mastery and sfumato portraits.",
    category: "classic",
  },
  {
    key: "MICHELANGELO",
    slug: "michelangelo",
    label: "Michelangelo",
    description: "Monumental forms and renaissance sculpture.",
    category: "classic",
  },

  // --- Optional: contemporary / experimental styles (if you want them) ---
  // These are not in the Prisma enum but you can add them to it later if needed.
  // For now, keep this section commented or aligned with schema if you extend it.
];

/**
 * Convenience subset: use anywhere you want to render the Masters list.
 */
export const CLASSIC_MASTER_STYLES: StyleDefinition[] = ALL_STYLES.filter(
  (style) => style.category === "classic",
);

// Internal lookup tables
const stylesBySlug: Record<string, StyleDefinition> = {};
const stylesByKey: Record<StyleKey, StyleDefinition> = {} as Record<
  StyleKey,
  StyleDefinition
>;

for (const style of ALL_STYLES) {
  stylesBySlug[style.slug.toLowerCase()] = style;
  stylesByKey[style.key] = style;
}

/**
 * Normalize weird or legacy slugs before lookup.
 * This is where we fix /explore/styles/dalí → "dali", etc.
 */
function normalizeSlug(rawSlug: string): string {
  const slug = rawSlug.trim().toLowerCase();

  // Special handling for the old Dalí link with an accent.
  if (slug === "dalí" || slug === "dal%C3%AD") {
    return "dali";
  }

  return slug;
}

/**
 * Map a URL slug like "dali" to a StyleKey like "DALI".
 * Returns null if unknown, so callers can safely 404.
 */
export function styleSlugToKey(slug: string): StyleKey | null {
  const normalized = normalizeSlug(slug);
  const def = stylesBySlug[normalized];
  return def ? def.key : null;
}

/**
 * Map a StyleKey to a URL slug, e.g. "DALI" → "dali".
 */
export function styleKeyToSlug(key: StyleKey): string | null {
  const def = stylesByKey[key];
  return def ? def.slug : null;
}

/**
 * Map a StyleKey to a human-readable label, e.g. "DALI" → "Dalí".
 */
export function styleKeyToLabel(key: StyleKey): string | null {
  const def = stylesByKey[key];
  return def ? def.label : null;
}

/**
 * Optional helper for UI: group styles by category.
 */
export function getStylesByCategory(
  category: StyleCategory,
): StyleDefinition[] {
  return ALL_STYLES.filter((style) => style.category === category);
}
