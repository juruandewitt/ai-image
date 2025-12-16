// lib/styles.ts

export type StyleKey = string;

export type StyleCategory = "classic" | "contemporary" | "experimental";

export interface StyleDefinition {
  key: StyleKey;
  slug: string;
  label: string;
  description?: string;
  category: StyleCategory;
}

/**
 * Central style registry.
 *
 * - `slug` is URL-safe (no spaces, no accents).
 * - `label` is what you show in the UI and can have accents/spaces.
 */
export const ALL_STYLES: StyleDefinition[] = [
  // --- Classic Masters (the ones you mentioned) ---
  {
    key: "dali",
    slug: "dali",
    label: "Dalí",
    description: "Surreal dreamscapes and melting realities.",
    category: "classic",
  },
  {
    key: "pollock",
    slug: "pollock",
    label: "Pollock",
    description: "Energetic, gestural abstraction and drips.",
    category: "classic",
  },
  {
    key: "vermeer",
    slug: "vermeer",
    label: "Vermeer",
    description: "Luminous interiors and quiet realism.",
    category: "classic",
  },
  {
    key: "monet",
    slug: "monet",
    label: "Monet",
    description: "Soft impressionist light and color.",
    category: "classic",
  },
  {
    key: "picasso",
    slug: "picasso",
    label: "Picasso",
    description: "Cubist forms and bold abstraction.",
    category: "classic",
  },
  {
    key: "da-vinci",
    slug: "da-vinci",
    label: "Da Vinci",
    description: "Renaissance mastery and sfumato portraits.",
    category: "classic",
  },
  {
    key: "rembrandt",
    slug: "rembrandt",
    label: "Rembrandt",
    description: "Dramatic chiaroscuro and portraiture.",
    category: "classic",
  },
  {
    key: "caravaggio",
    slug: "caravaggio",
    label: "Caravaggio",
    description: "High-contrast realism and baroque drama.",
    category: "classic",
  },
  {
    key: "michelangelo",
    slug: "michelangelo",
    label: "Michelangelo",
    description: "Monumental forms and renaissance sculpture.",
    category: "classic",
  },

  // --- Example contemporary / AI styles (optional; adjust to match your project) ---
  {
    key: "neo-noir",
    slug: "neo-noir",
    label: "Neo-Noir",
    description: "High contrast, cinematic shadows and neon.",
    category: "contemporary",
  },
  {
    key: "dreamscape",
    slug: "dreamscape",
    label: "Dreamscape",
    description: "Soft, hazy worlds with surreal logic.",
    category: "contemporary",
  },
  {
    key: "cyberpunk",
    slug: "cyberpunk",
    label: "Cyberpunk",
    description: "Futuristic cityscapes and glowing holograms.",
    category: "contemporary",
  },
];

/**
 * Convenience subsets.
 * Use CLASSIC_MASTER_STYLES anywhere you want to render the “Masters” list.
 */
export const CLASSIC_MASTER_STYLES: StyleDefinition[] = ALL_STYLES.filter(
  (style) => style.category === "classic",
);

// Internal lookup tables
const stylesBySlug: Record<string, StyleDefinition> = {};
const stylesByKey: Record<string, StyleDefinition> = {};

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
 * Map a URL slug like "dali" to a style key like "dali".
 * Returns null if unknown, so callers can safely 404.
 */
export function styleSlugToKey(slug: string): StyleKey | null {
  const normalized = normalizeSlug(slug);
  const def = stylesBySlug[normalized];
  return def ? def.key : null;
}

/**
 * Map a style key to a URL slug, e.g. "dali" → "dali".
 */
export function styleKeyToSlug(key: StyleKey): string | null {
  const def = stylesByKey[key];
  return def ? def.slug : null;
}

/**
 * Map a style key to a human-readable label, e.g. "dali" → "Dalí".
 */
export function styleKeyToLabel(key: StyleKey): string | null {
  const def = stylesByKey[key];
  return def ? def.label : null;
}

/**
 * Optional helper for UI: group styles by category.
 */
export function getStylesByCategory(category: StyleCategory): StyleDefinition[] {
  return ALL_STYLES.filter((style) => style.category === category);
}
