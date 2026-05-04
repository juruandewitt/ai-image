export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="50%" y="50%" fill="#94a3b8" font-family="sans-serif" font-size="20"
        text-anchor="middle" dominant-baseline="middle">Artwork Preview</text>
    </svg>`
  )

const FEATURED_ARTWORKS = [
  {
    title: 'Mona Lisa',
    master: 'Da Vinci',
    href: '/explore/styles/leonardo-da-vinci',
    image: '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=700&v=home-v2',
  },
  {
    title: 'Starry Night',
    master: 'Van Gogh',
    href: '/explore/styles/van-gogh',
    image: '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=700&v=home-v2',
  },
  {
    title: 'Impression
