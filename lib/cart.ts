export type CartQuality =
  | 'high'
  | 'very_high'
  | 'ultra'

export type CartItem = {
  artworkId: string
  title: string
  artist: string
  style: string
  quality: CartQuality
  qualityLabel: string
  price: number
}

export const QUALITY_CONFIG: Record<
  CartQuality,
  {
    label: string
    shortLabel: string
    price: number
    maxPixels: number
  }
> = {
  high: {
    label: 'High Resolution · up to 1024 px',
    shortLabel: 'High Resolution',
    price: 9.99,
    maxPixels: 1024,
  },

  very_high: {
    label: 'Very High Resolution · up to 2048 px',
    shortLabel: 'Very High Resolution',
    price: 19.99,
    maxPixels: 2048,
  },

  ultra: {
    label: 'Ultra High Resolution · up to 4096 px',
    shortLabel: 'Ultra High Resolution',
    price: 29.99,
    maxPixels: 4096,
  },
}

const STORAGE_KEY =
  'ai-image-cart-v1'

export const CART_UPDATED_EVENT =
  'ai-image-cart-updated'

export function getCart(): CartItem[] {
  if (
    typeof window ===
    'undefined'
  ) {
    return []
  }

  try {
    const raw =
      window.localStorage.getItem(
        STORAGE_KEY
      )

    if (!raw) {
      return []
    }

    const parsed =
      JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed
      : []
  } catch {
    return []
  }
}

export function saveCart(
  items: CartItem[]
) {
  if (
    typeof window ===
    'undefined'
  ) {
    return
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(items)
  )

  window.dispatchEvent(
    new Event(
      CART_UPDATED_EVENT
    )
  )
}

export function addToCart(
  item: CartItem
) {
  const existing =
    getCart()

  const duplicate =
    existing.some(
      (current) =>
        current.artworkId ===
          item.artworkId &&
        current.quality ===
          item.quality
    )

  if (duplicate) {
    return false
  }

  saveCart([
    ...existing,
    item,
  ])

  return true
}

export function removeFromCart(
  artworkId: string,
  quality: CartQuality
) {
  const updated =
    getCart().filter(
      (item) =>
        !(
          item.artworkId ===
            artworkId &&
          item.quality ===
            quality
        )
    )

  saveCart(updated)
}

export function clearCart() {
  saveCart([])
}

export function cartTotal(
  items: CartItem[]
) {
  return items.reduce(
    (total, item) =>
      total + item.price,
    0
  )
}
