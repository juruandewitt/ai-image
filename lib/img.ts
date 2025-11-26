// lib/img.ts
/**
 * Safely resolve a displayable image URL for an artwork.
 * Priority: first asset.originalUrl → thumbnail → null.
 */
export function getPrimaryImage(artwork: {
  thumbnail?: string | null
  assets?: Array<{ originalUrl?: string | null }>
}): string | null {
  return artwork?.assets?.[0]?.originalUrl || artwork?.thumbnail || null
}
