export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'
import HorizontalScrollRow from '@/components/horizontal-scroll-row'

const PREVIEW_VERSION = 'protected-home-v1'

const preview = (
  id: string,
  width: number
) =>
  `/api/artwork/preview/${id}?w=${width}&v=${PREVIEW_VERSION}`

const FALLBACK_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900">
      <rect width="100%" height="100%" fill="#050816"/>
      <text
        x="50%"
        y="48%"
        fill="#d6bc7b"
        font-family="sans-serif"
        font-size="24"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        AI Image
      </text>
      <text
        x="50%"
        y="56%"
        fill="#94a3b8"
        font-family="sans-serif"
        font-size="15"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        Premium digital artwork
      </text>
    </svg>`
  )

/*
 * THE MASTERS
 *
 * IMPORTANT:
 * Every homepage image now goes through the protected
 * /api/artwork/preview route.
 */
const MASTERS = [
  {
    label: 'Leonardo da Vinci',
    href: '/explore/styles/leonardo-da-vinci',
    image: preview(
      'cmngh924c0000gfum690drnoh',
      700
    ),
    work: 'Mona Lisa',
  },

  {
    label: 'Michelangelo',
    href: '/explore/styles/michelangelo',
    image: preview(
      'cmo8fdmat00004fp854r2lodn',
      700
    ),
    work: 'The Creation of Adam',
  },

  {
    label: 'Vincent van Gogh',
    href: '/explore/styles/van-gogh',
    image: preview(
      'cmnn9rage0000w3tg10mfkpev',
      700
    ),
    work: 'The Starry Night',
  },

  {
    label: 'Claude Monet',
    href: '/explore/styles/claude-monet',
    image: preview(
      'cmnnla8tb0016rnlqgeqmkslu',
      700
    ),
    work: 'Impression, Sunrise',
  },

  {
    label: 'Rembrandt',
    href: '/explore/styles/rembrandt',
    image: preview(
      'cmnotftfu0000jd2lgw17a20y',
      700
    ),
    work: 'The Night Watch',
  },

  {
    label: 'Caravaggio',
    href: '/explore/styles/caravaggio',
    image: preview(
      'cmnowyzys0000vtrya8t4lj2o',
      700
    ),
    work: 'The Calling of Saint Matthew',
  },

  {
    label: 'Johannes Vermeer',
    href: '/explore/styles/johannes-vermeer',
    image: preview(
      'cmngfwqth000037jqrfa2havj',
      700
    ),
    work: 'Girl with a Pearl Earring',
  },

  {
    label: 'Edvard Munch',
    href: '/explore/styles/edvard-munch',
    image: preview(
      'cmnqg55x60000uijqc07vfxob',
      700
    ),
    work: 'The Scream',
  },

  {
    label: 'Jackson Pollock',
    href: '/explore/styles/jackson-pollock',
    image: preview(
      'cmnp0xr2j0000utfte34mxv4n',
      700
    ),
    work: 'Autumn Rhythm',
  },

  {
    label: 'Salvador Dalí',
    href: '/explore/styles/dali',

    /*
     * Protected preview replaces the previous direct Blob URL.
     */
    image: preview(
      'cmokppri00000vg99j9we8g9v',
      700
    ),

    work: 'The Persistence of Memory',
  },

  {
    label: 'Pablo Picasso',
    href: '/explore/styles/pablo-picasso',

    /*
     * Protected preview replaces the previous direct Blob URL.
     */
    image: preview(
      'cmolyv23t000011ndvoxcxgbw',
      700
    ),

    work: 'Guernica',
  },
]

/*
 * MASTERS REIMAGINED
 *
 * These previously used direct Blob URLs.
 * Every one now goes through the protected preview API.
 */
const MASTERS_REIMAGINED = [
  {
    title: 'The Scream',
    master: 'In Michelangelo Style',
    href:
      '/explore/masters-reimagined?style=MICHELANGELO',

    image: preview(
      'cmnbfkgtb000m76b7fxhnwvcf',
      700
    ),

    text:
      'Munch’s emotional masterpiece reinterpreted with Michelangelo’s monumental sculptural power.',
  },

  {
    title: 'Mona Lisa',
    master: 'In Van Gogh Style',
    href:
      '/explore/masters-reimagined?style=VAN_GOGH',

    image: preview(
      'cmnnbf5dw000u7arey9doysq6',
      700
    ),

    text:
      'Leonardo’s mysterious portrait transformed through expressive colour and swirling movement.',
  },

  {
    title: 'Starry Night',
    master: 'In Monet Style',
    href:
      '/explore/masters-reimagined?style=MONET',

    image: preview(
      'cmn7yhcwc000516ddv03zxjgc',
      700
    ),

    text:
      'Van Gogh’s celebrated night sky interpreted through atmospheric impressionist light.',
  },

  {
    title: 'Girl with a Pearl Earring',
    master: 'In Caravaggio Style',
    href:
      '/explore/masters-reimagined?style=CARAVAGGIO',

    image: preview(
      'cmnox8u470006j89qcsbi57i5',
      700
    ),

    text:
      'Vermeer’s intimate portrait recast with Caravaggio’s dramatic chiaroscuro.',
  },

  {
    title: 'The Night Watch',
    master: 'In Picasso Style',
    href:
      '/explore/masters-reimagined?style=PICASSO',

    image: preview(
      'cmnnmtyr1000331x6h0sync7l',
      700
    ),

    text:
      'Rembrandt’s group portrait reconstructed through bold cubist geometry.',
  },

  {
    title: 'Impression, Sunrise',
    master: 'In Pollock Style',
    href:
      '/explore/masters-reimagined?style=POLLOCK',

    image: preview(
      'cmnp1a7i2001rmgqe22rvk6o9',
      700
    ),

    text:
      'Monet’s harbour scene transformed into an energetic field of colour and motion.',
  },

  {
    title: 'The Last Supper',
    master: 'In Munch Style',
    href:
      '/explore/masters-reimagined?style=MUNCH',

    image: preview(
      'cmnqg2yan0010mvtopbk1hgcz',
      700
    ),

    text:
      'Leonardo’s defining composition interpreted through psychological tension and symbolism.',
  },

  {
    title: 'Persistence of Memory',
    master: 'In Rembrandt Style',
    href:
      '/explore/masters-reimagined?style=REMBRANDT',

    image: preview(
      'cmnotw7l2000o9edqyqvktxia',
      700
    ),

    text:
      'Dalí’s surreal imagery reinterpreted through rich shadows, restrained light and classical drama.',
  },

  {
    title: 'Guernica',
    master: 'In Vermeer Style',
    href:
      '/explore/masters-reimagined?style=VERMEER',

    image: preview(
      'cmngg1i8l001937jqm4ojyyzd',
      700
    ),

    text:
      'Picasso’s monumental work translated into Vermeer’s controlled light and intimate atmosphere.',
  },
]

/*
 * FAVORITE COLLECTIONS
 */
const FAVORITE_COLLECTIONS = [
  {
    label: 'Fantasy Kingdoms',
    slug: 'fantasy-kingdoms',
    image: preview(
      'cmq80fdao0000o5blyggzox1h',
      700
    ),
  },

  {
    label: 'Ancient Civilizations',
    slug: 'ancient-civilizations',
    image: preview(
      'cmq6d1a57000014kn9c02er4x',
      700
    ),
  },

  {
    label: 'Space / Galaxy',
    slug: 'space-galaxy',
    image: preview(
      'cmq5e2xjx0000308bbd8u2uvd',
      700
    ),
  },

  {
    label: 'Cars / Automotive',
    slug: 'cars-automotive',
    image: preview(
      'cmq4wthpl0000165iuvclc0xg',
      700
    ),
  },

  {
    label: 'Seasonal / Holidays',
    slug: 'seasonal-holidays',
    image: preview(
      'cmq3u8dd10000k0dafyvhkg9l',
      700
    ),
  },

  {
    label: 'Spiritual / Zen',
    slug: 'spiritual-zen',
    image: preview(
      'cmq3d8uhm0000u3feir9sucgq',
      700
    ),
  },

  {
    label: 'Food / Culinary',
    slug: 'food-culinary',
    image: preview(
      'cmpfxxocq00005d9waq7ulcng',
      700
    ),
  },

  {
    label: 'Animals / Pets',
    slug: 'animals-pets',
    image: preview(
      'cmpyeyl3300002zoq2hvd1pio',
      700
    ),
  },

  {
    label: 'Gaming / Esports',
    slug: 'gaming-esports',
    image: preview(
      'cmq23ftj50000vj3vyeco8mh4',
      700
    ),
  },

  {
    label: 'Travel / Destinations',
    slug: 'travel-destinations',
    image: preview(
      'cmpku0pdu0000wrli6vj5ttbx',
      700
    ),
  },

  {
    label: 'Luxury Lifestyle',
    slug: 'luxury-lifestyle',
    image: preview(
      'cmpllpx7y0000izhrrv1dl9q3',
      700
    ),
  },

  {
    label: 'Nature / Botanical',
    slug: 'nature-botanical',
    image: preview(
      'cmpd6gbye0000inxmqaksp6cn',
      700
    ),
  },

  {
    label: 'Architecture',
    slug: 'architecture',
    image: preview(
      'cmp2yzmsu00006o55vsz0zogg',
      700
    ),
  },

  {
    label: 'Ocean / Marine',
    slug: 'ocean-marine',
    image: preview(
      'cmpbn3f0h0000ycb12edq3qk2',
      700
    ),
  },

  {
    label: 'Vintage / Retro',
    slug: 'vintage-retro',
    image: preview(
      'cmpx5aw9j0000oxlq33ww14zi',
      700
    ),
  },
]

const BESTSELLERS = [
  {
    title:
      'Golden Dragon Kingdom',

    collection:
      'Fantasy Kingdoms',

    href:
      '/artwork/cmq80fdao0000o5blyggzox1h',

    image: preview(
      'cmq80fdao0000o5blyggzox1h',
      700
    ),
  },

  {
    title:
      'Great Pyramid of Giza',

    collection:
      'Ancient Civilizations',

    href:
      '/artwork/cmq6d1a57000014kn9c02er4x',

    image: preview(
      'cmq6d1a57000014kn9c02er4x',
      700
    ),
  },

  {
    title:
      'Luxury Space Station Observatory',

    collection:
      'Space / Galaxy',

    href:
      '/artwork/cmq5e2xjx0000308bbd8u2uvd',

    image: preview(
      'cmq5e2xjx0000308bbd8u2uvd',
      700
    ),
  },

  {
    title:
      'Luxury Sports Car Showroom',

    collection:
      'Cars / Automotive',

    href:
      '/artwork/cmq4wthpl0000165iuvclc0xg',

    image: preview(
      'cmq4wthpl0000165iuvclc0xg',
      700
    ),
  },

  {
    title:
      'Zen Meditation Temple',

    collection:
      'Spiritual / Zen',

    href:
      '/artwork/cmq3d8uhm0000u3feir9sucgq',

    image: preview(
      'cmq3d8uhm0000u3feir9sucgq',
      700
    ),
  },

  {
    title:
      'Gourmet Pasta Plate',

    collection:
      'Food / Culinary',

    href:
      '/artwork/cmpfxxocq00005d9waq7ulcng',

    image: preview(
      'cmpfxxocq00005d9waq7ulcng',
      700
    ),
  },
]

function SectionHeader({
  title,
  subtitle,
  href,
}: {
  title: string
  subtitle: string
  href?: string
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-3xl font-semibold text-white md:text-4xl">
          {title}
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          {subtitle}
        </p>
      </div>

      {href ? (
        <Link
          href={href}
          className="shrink-0 text-sm font-semibold text-amber-300 hover:underline"
        >
          Explore all →
        </Link>
      ) : null}
    </div>
  )
}

function MasterCard({
  item,
}: {
  item:
    (typeof MASTERS)[number]
}) {
  return (
    <Link
      href={item.href}
      className="group min-w-[230px] max-w-[230px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[280px] md:max-w-[280px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={
          FALLBACK_DATA_URL
        }
        alt={`${item.label} — ${item.work}`}
        className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="p-5">
        <div className="font-semibold text-white">
          {item.label}
        </div>

        <div className="mt-1 line-clamp-1 text-xs text-amber-300">
          {item.work}
        </div>
      </div>
    </Link>
  )
}

function ReimaginedCard({
  item,
}: {
  item:
    (typeof MASTERS_REIMAGINED)[number]
}) {
  return (
    <Link
      href={item.href}
      className="group min-w-[280px] max-w-[280px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[350px] md:max-w-[350px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={
          FALLBACK_DATA_URL
        }
        alt={`${item.title} — ${item.master}`}
        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="space-y-2 p-5">
        <div>
          <div className="text-lg font-semibold text-white">
            {item.title}
          </div>

          <div className="mt-1 text-sm font-medium text-amber-300">
            {item.master}
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-400">
          {item.text}
        </p>
      </div>
    </Link>
  )
}

function CollectionCard({
  item,
}: {
  item:
    (typeof FAVORITE_COLLECTIONS)[number]
}) {
  return (
    <Link
      href={`/explore/themes/${item.slug}`}
      className="group min-w-[230px] max-w-[230px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[280px] md:max-w-[280px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={
          FALLBACK_DATA_URL
        }
        alt={item.label}
        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="p-5">
        <div className="font-semibold text-white">
          {item.label}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          50 artworks
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="space-y-24">

      {/* HERO */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#070914] px-6 py-12 shadow-2xl shadow-black/30 md:px-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.22),transparent_35%)]" />

        <div className="relative grid items-center gap-10 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
              Premium digital art marketplace
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-white md:text-7xl">
              Masterworks, reimagined art and extraordinary collections.
            </h1>

            <p className="max-w-2xl text-lg leading-8 text-slate-300">
              Explore more than 2,000 digital artworks across the world’s great
              Masters and 30 carefully curated themed collections.
            </p>
          </div>

          <Link
            href="/artwork/cmnbfkgtb000m76b7fxhnwvcf"
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40"
          >
            <SafeImg
              src={preview(
                'cmnbfkgtb000m76b7fxhnwvcf',
                700
              )}
              fallbackSrc={
                FALLBACK_DATA_URL
              }
              alt="The Scream in Michelangelo Style"
              className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="border-t border-white/10 p-5">
              <div className="text-lg font-semibold text-white">
                The Scream
              </div>

              <div className="text-sm text-slate-400">
                Reimagined in Michelangelo Style
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center md:grid-cols-4">
        <div>
          <div className="text-3xl font-semibold text-white">
            2000+
          </div>

          <div className="text-sm text-slate-400">
            Launch artworks
          </div>
        </div>

        <div>
          <div className="text-3xl font-semibold text-white">
            30+
          </div>

          <div className="text-sm text-slate-400">
            Curated collections
          </div>
        </div>

        <div>
          <div className="text-3xl font-semibold text-white">
            $9.99
          </div>

          <div className="text-sm text-slate-400">
            Standard artwork price
          </div>
        </div>

        <div>
          <div className="text-3xl font-semibold text-white">
            HD
          </div>

          <div className="text-sm text-slate-400">
            Instant downloads
          </div>
        </div>
      </section>

      {/* THE MASTERS */}
      <section className="space-y-6">
        <SectionHeader
          title="The Masters"
          subtitle="Explore all 11 Master collections in one horizontal gallery."
          href="/explore/masters"
        />

        <HorizontalScrollRow>
          <div className="flex gap-5">
            {MASTERS.map(
              (item) => (
                <MasterCard
                  key={`${item.label}-${item.work}`}
                  item={item}
                />
              )
            )}
          </div>
        </HorizontalScrollRow>
      </section>

      {/* MASTERS REIMAGINED */}
      <section className="space-y-6">
        <SectionHeader
          title="The Masters Reimagined"
          subtitle="Famous works transformed through the visual language of another Master."
          href="/explore/masters-reimagined"
        />

        <HorizontalScrollRow>
          <div className="flex gap-5">
            {MASTERS_REIMAGINED.map(
              (item) => (
                <ReimaginedCard
                  key={`${item.master}-${item.title}`}
                  item={item}
                />
              )
            )}
          </div>
        </HorizontalScrollRow>
      </section>

      {/* FAVORITE COLLECTIONS */}
      <section className="space-y-6">
        <SectionHeader
          title="Favorite Collections"
          subtitle="A preview of the 30 curated themed collections available across AI Image."
          href="/explore/categories"
        />

        <HorizontalScrollRow>
          <div className="flex gap-5">
            {FAVORITE_COLLECTIONS.map(
              (item) => (
                <CollectionCard
                  key={item.slug}
                  item={item}
                />
              )
            )}
          </div>
        </HorizontalScrollRow>
      </section>

      {/* BESTSELLERS */}
      <section className="space-y-6">
        <SectionHeader
          title="Bestsellers"
          subtitle="A launch selection of visually striking artworks from across the marketplace."
          href="/explore"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {BESTSELLERS.map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60"
              >
                <SafeImg
                  src={item.image}
                  fallbackSrc={
                    FALLBACK_DATA_URL
                  }
                  alt={item.title}
                  className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="p-5">
                  <div className="text-xl font-semibold text-white">
                    {item.title}
                  </div>

                  <div className="mt-1 text-sm text-amber-300">
                    {item.collection}
                  </div>
                </div>
              </Link>
            )
          )}
        </div>
      </section>
    </main>
  )
}
