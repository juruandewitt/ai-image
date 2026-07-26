export const dynamic = 'force-dynamic'

import Link from 'next/link'
import SafeImg from '@/components/safe-img'

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
 * The first 11 cards are the main Master collections.
 * The final three cards are the former "Masters Reimagined" collections,
 * now included at the end of this carousel.
 */
const MASTERS = [
  {
    label: 'Leonardo da Vinci',
    href: '/explore/styles/leonardo-da-vinci',
    image:
      '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=700&v=home-masters-v2',
    work: 'Mona Lisa',
  },
  {
    label: 'Michelangelo',
    href: '/explore/styles/michelangelo',
    image:
      '/api/artwork/preview/cmo8fdmat00004fp854r2lodn?w=700&v=home-masters-v2',
    work: 'The Creation of Adam',
  },
  {
    label: 'Vincent van Gogh',
    href: '/explore/styles/van-gogh',
    image:
      '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=700&v=home-masters-v2',
    work: 'The Starry Night',
  },
  {
    label: 'Claude Monet',
    href: '/explore/styles/claude-monet',
    image:
      '/api/artwork/preview/cmnnla8tb0016rnlqgeqmkslu?w=700&v=home-masters-v2',
    work: 'Impression, Sunrise',
  },
  {
    label: 'Rembrandt',
    href: '/explore/styles/rembrandt',
    image:
      '/api/artwork/preview/cmnotftfu0000jd2lgw17a20y?w=700&v=home-masters-v2',
    work: 'The Night Watch',
  },
  {
    label: 'Caravaggio',
    href: '/explore/styles/caravaggio',
    image:
      '/api/artwork/preview/cmnowyzys0000vtrya8t4lj2o?w=700&v=home-masters-v2',
    work: 'The Calling of Saint Matthew',
  },
  {
    label: 'Johannes Vermeer',
    href: '/explore/styles/johannes-vermeer',
    image:
      '/api/artwork/preview/cmngfwqth000037jqrfa2havj?w=700&v=home-masters-v2',
    work: 'Girl with a Pearl Earring',
  },
  {
    label: 'Edvard Munch',
    href: '/explore/styles/edvard-munch',
    image:
      '/api/artwork/preview/cmnqg55x60000uijqc07vfxob?w=700&v=home-masters-v2',
    work: 'The Scream',
  },
  {
    label: 'Jackson Pollock',
    href: '/explore/styles/jackson-pollock',
    image:
      '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=700&v=home-masters-v2',
    work: 'Autumn Rhythm',
  },
  {
    label: 'Salvador Dalí',
    href: '/explore/styles/dali',
    image:
      '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=700&v=home-masters-v2',
    work: 'Surrealist Collection',
  },
  {
    label: 'Pablo Picasso',
    href: '/explore/styles/pablo-picasso',
    image:
      '/api/artwork/preview/cmolyv23t000011ndvoxcxgbw?w=700&v=home-masters-v2',
    work: 'Cubist Collection',
  },

  /*
   * Former Masters Reimagined cards.
   * These now appear at the end of The Masters.
   */
  {
    label: 'Dalí Reimagined',
    href: '/explore/styles/dali',
    image:
      '/api/artwork/preview/cmokppri00000vg99j9we8g9v?w=700&v=home-masters-v2',
    work: 'Original surreal AI collection',
  },
  {
    label: 'Picasso Reimagined',
    href: '/explore/styles/pablo-picasso',
    image:
      '/api/artwork/preview/cmolyv23t000011ndvoxcxgbw?w=700&v=home-masters-v2',
    work: 'Original cubist AI collection',
  },
  {
    label: 'Pollock Reimagined',
    href: '/explore/styles/jackson-pollock',
    image:
      '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=700&v=home-masters-v2',
    work: 'Original abstract AI collection',
  },
]

/*
 * MASTERS REIMAGINED
 *
 * These are the initial visual concepts.
 * Each image is defined independently here so it can be replaced easily
 * when you choose the final artwork for the card.
 */
const MASTERS_REIMAGINED = [
  {
    title: 'The Scream',
    master: 'Reimagined by Michelangelo',
    href: '/explore/styles/michelangelo',
    image:
      '/api/artwork/preview/cmnqg55x60000uijqc07vfxob?w=900&v=reimagined-v2',
    text: 'Munch’s iconic emotional composition envisioned with Michelangelo’s monumental sculptural power.',
  },
  {
    title: 'Mona Lisa',
    master: 'Reimagined by Van Gogh',
    href: '/explore/styles/van-gogh',
    image:
      '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=900&v=reimagined-v2',
    text: 'Leonardo’s mysterious portrait transformed through expressive movement, colour and luminous brushwork.',
  },
  {
    title: 'The Starry Night',
    master: 'Reimagined by Monet',
    href: '/explore/styles/claude-monet',
    image:
      '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=900&v=reimagined-v2',
    text: 'Van Gogh’s celebrated night sky interpreted through atmospheric light and impressionist colour.',
  },
  {
    title: 'Girl with a Pearl Earring',
    master: 'Reimagined by Caravaggio',
    href: '/explore/styles/caravaggio',
    image:
      '/api/artwork/preview/cmngfwqth000037jqrfa2havj?w=900&v=reimagined-v2',
    text: 'Vermeer’s intimate portrait recast with dramatic darkness and theatrical chiaroscuro.',
  },
  {
    title: 'The Creation of Adam',
    master: 'Reimagined by Dalí',
    href: '/explore/styles/dali',
    image:
      '/api/artwork/preview/cmo8fdmat00004fp854r2lodn?w=900&v=reimagined-v2',
    text: 'Michelangelo’s defining Renaissance image reconstructed as an expansive surreal dreamscape.',
  },
  {
    title: 'The Night Watch',
    master: 'Reimagined by Picasso',
    href: '/explore/styles/pablo-picasso',
    image:
      '/api/artwork/preview/cmnotftfu0000jd2lgw17a20y?w=900&v=reimagined-v2',
    text: 'Rembrandt’s dramatic group portrait reorganised through bold geometry and cubist structure.',
  },
  {
    title: 'Impression, Sunrise',
    master: 'Reimagined by Pollock',
    href: '/explore/styles/jackson-pollock',
    image:
      '/api/artwork/preview/cmnnla8tb0016rnlqgeqmkslu?w=900&v=reimagined-v2',
    text: 'Monet’s atmospheric harbour scene transformed into an energetic field of colour and motion.',
  },
  {
    title: 'The Last Supper',
    master: 'Reimagined by Munch',
    href: '/explore/styles/edvard-munch',
    image:
      '/api/artwork/preview/cmngh9cth0003gfumhtsyipq0?w=900&v=reimagined-v2',
    text: 'Leonardo’s famous composition interpreted through psychological tension and expressive symbolism.',
  },
]

/*
 * FAVORITE COLLECTIONS
 *
 * This remains a homepage preview rather than all 30 collections.
 * The Explore all link opens /explore/categories, which contains all 30.
 */
const FAVORITE_COLLECTIONS = [
  {
    label: 'Fantasy Kingdoms',
    slug: 'fantasy-kingdoms',
    image:
      '/api/artwork/preview/cmq80fdao0000o5blyggzox1h?w=800&v=home-favorites-v2',
  },
  {
    label: 'Ancient Civilizations',
    slug: 'ancient-civilizations',
    image:
      '/api/artwork/preview/cmq6d1a57000014kn9c02er4x?w=800&v=home-favorites-v2',
  },
  {
    label: 'Space / Galaxy',
    slug: 'space-galaxy',
    image:
      '/api/artwork/preview/cmq5e2xjx0000308bbd8u2uvd?w=800&v=home-favorites-v2',
  },
  {
    label: 'Cars / Automotive',
    slug: 'cars-automotive',
    image:
      '/api/artwork/preview/cmq4wthpl0000165iuvclc0xg?w=800&v=home-favorites-v2',
  },
  {
    label: 'Seasonal / Holidays',
    slug: 'seasonal-holidays',
    image:
      '/api/artwork/preview/cmq3u8dd10000k0dafyvhkg9l?w=800&v=home-favorites-v2',
  },
  {
    label: 'Spiritual / Zen',
    slug: 'spiritual-zen',
    image:
      '/api/artwork/preview/cmq3d8uhm0000u3feir9sucgq?w=800&v=home-favorites-v2',
  },
  {
    label: 'Food / Culinary',
    slug: 'food-culinary',
    image:
      '/api/artwork/preview/cmpfxxocq00005d9waq7ulcng?w=800&v=home-favorites-v2',
  },
  {
    label: 'Animals / Pets',
    slug: 'animals-pets',
    image:
      '/api/artwork/preview/cmpyeyl3300002zoq2hvd1pio?w=800&v=home-favorites-v2',
  },
  {
    label: 'Gaming / Esports',
    slug: 'gaming-esports',
    image:
      '/api/artwork/preview/cmq23ftj50000vj3vyeco8mh4?w=800&v=home-favorites-v2',
  },
  {
    label: 'Travel / Destinations',
    slug: 'travel-destinations',
    image:
      '/api/artwork/preview/cmpku0pdu0000wrli6vj5ttbx?w=800&v=home-favorites-v2',
  },
  {
    label: 'Luxury Lifestyle',
    slug: 'luxury-lifestyle',
    image:
      '/api/artwork/preview/cmpllpx7y0000izhrrv1dl9q3?w=800&v=home-favorites-v2',
  },
  {
    label: 'Nature / Botanical',
    slug: 'nature-botanical',
    image:
      '/api/artwork/preview/cmpd6gbye0000inxmqaksp6cn?w=800&v=home-favorites-v2',
  },
  {
    label: 'Architecture',
    slug: 'architecture',
    image:
      '/api/artwork/preview/cmp2yzmsu00006o55vsz0zogg?w=800&v=home-favorites-v2',
  },
  {
    label: 'Ocean / Marine',
    slug: 'ocean-marine',
    image:
      '/api/artwork/preview/cmpbn3f0h0000ycb12edq3qk2?w=800&v=home-favorites-v2',
  },
  {
    label: 'Vintage / Retro',
    slug: 'vintage-retro',
    image:
      '/api/artwork/preview/cmpx5aw9j0000oxlq33ww14zi?w=800&v=home-favorites-v2',
  },
]

const BESTSELLERS = [
  {
    title: 'Golden Dragon Kingdom',
    collection: 'Fantasy Kingdoms',
    href: '/artwork/cmq80fdao0000o5blyggzox1h',
    image:
      '/api/artwork/preview/cmq80fdao0000o5blyggzox1h?w=900&v=bestsellers-v2',
  },
  {
    title: 'Great Pyramid of Giza',
    collection: 'Ancient Civilizations',
    href: '/artwork/cmq6d1a57000014kn9c02er4x',
    image:
      '/api/artwork/preview/cmq6d1a57000014kn9c02er4x?w=900&v=bestsellers-v2',
  },
  {
    title: 'Luxury Space Station Observatory',
    collection: 'Space / Galaxy',
    href: '/artwork/cmq5e2xjx0000308bbd8u2uvd',
    image:
      '/api/artwork/preview/cmq5e2xjx0000308bbd8u2uvd?w=900&v=bestsellers-v2',
  },
  {
    title: 'Luxury Sports Car Showroom',
    collection: 'Cars / Automotive',
    href: '/artwork/cmq4wthpl0000165iuvclc0xg',
    image:
      '/api/artwork/preview/cmq4wthpl0000165iuvclc0xg?w=900&v=bestsellers-v2',
  },
  {
    title: 'Zen Meditation Temple',
    collection: 'Spiritual / Zen',
    href: '/artwork/cmq3d8uhm0000u3feir9sucgq',
    image:
      '/api/artwork/preview/cmq3d8uhm0000u3feir9sucgq?w=900&v=bestsellers-v2',
  },
  {
    title: 'Gourmet Pasta Plate',
    collection: 'Food / Culinary',
    href: '/artwork/cmpfxxocq00005d9waq7ulcng',
    image:
      '/api/artwork/preview/cmpfxxocq00005d9waq7ulcng?w=900&v=bestsellers-v2',
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

function MasterCard({ item }: { item: (typeof MASTERS)[number] }) {
  return (
    <Link
      href={item.href}
      className="group min-w-[230px] max-w-[230px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[280px] md:max-w-[280px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={FALLBACK_DATA_URL}
        alt={`${item.label} — ${item.work}`}
        className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="p-5">
        <div className="font-semibold text-white">{item.label}</div>
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
  item: (typeof MASTERS_REIMAGINED)[number]
}) {
  return (
    <Link
      href={item.href}
      className="group min-w-[280px] max-w-[280px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[350px] md:max-w-[350px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={FALLBACK_DATA_URL}
        alt={`${item.title} — ${item.master}`}
        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="space-y-2 p-5">
        <div>
          <div className="text-lg font-semibold text-white">{item.title}</div>
          <div className="mt-1 text-sm font-medium text-amber-300">
            {item.master}
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-400">{item.text}</p>
      </div>
    </Link>
  )
}

function CollectionCard({
  item,
}: {
  item: (typeof FAVORITE_COLLECTIONS)[number]
}) {
  return (
    <Link
      href={`/explore/themes/${item.slug}`}
      className="group min-w-[230px] max-w-[230px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60 md:min-w-[280px] md:max-w-[280px]"
    >
      <SafeImg
        src={item.image}
        fallbackSrc={FALLBACK_DATA_URL}
        alt={item.label}
        className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
      />

      <div className="p-5">
        <div className="font-semibold text-white">{item.label}</div>
        <div className="mt-1 text-xs text-slate-400">50 artworks</div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main className="space-y-24">
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

            <div className="flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="rounded-2xl bg-amber-300 px-7 py-4 font-semibold text-black transition hover:bg-amber-200"
              >
                Explore Artworks
              </Link>

              <Link
                href="/explore/masters"
                className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 font-semibold text-white transition hover:border-amber-300/60"
              >
                Explore Masters
              </Link>
            </div>
          </div>

          <Link
            href="/artwork/cmnqg55x60000uijqc07vfxob"
            className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40"
          >
            <SafeImg
              src="/api/artwork/preview/cmnqg55x60000uijqc07vfxob?w=1100&v=hero-v2"
              fallbackSrc={FALLBACK_DATA_URL}
              alt="The Scream"
              className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
            />

            <div className="border-t border-white/10 p-5">
              <div className="text-lg font-semibold text-white">
                The Scream
              </div>
              <div className="text-sm text-slate-400">
                Edvard Munch · Featured Masterwork
              </div>
            </div>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-center md:grid-cols-4">
        <div>
          <div className="text-3xl font-semibold text-white">2000+</div>
          <div className="text-sm text-slate-400">Launch artworks</div>
        </div>

        <div>
          <div className="text-3xl font-semibold text-white">30+</div>
          <div className="text-sm text-slate-400">Curated collections</div>
        </div>

        <div>
          <div className="text-3xl font-semibold text-white">$9.99</div>
          <div className="text-sm text-slate-400">
            Standard artwork price
          </div>
        </div>

        <div>
          <div className="text-3xl font-semibold text-white">HD</div>
          <div className="text-sm text-slate-400">Instant downloads</div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="The Masters"
          subtitle="Explore the Master collections and the three original reimagined collections, now presented together in one horizontal gallery."
          href="/explore/masters"
        />

        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {MASTERS.map((item) => (
              <MasterCard key={`${item.label}-${item.work}`} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="The Masters Reimagined"
          subtitle="Famous works envisioned through the visual language of another Master. These initial selections can be refined as we review each library."
        />

        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {MASTERS_REIMAGINED.map((item) => (
              <ReimaginedCard
                key={`${item.master}-${item.title}`}
                item={item}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="Favorite Collections"
          subtitle="A preview of the 30 curated themed collections available across AI Image."
          href="/explore/categories"
        />

        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {FAVORITE_COLLECTIONS.map((item) => (
              <CollectionCard key={item.slug} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="Bestsellers"
          subtitle="A launch selection of visually striking artworks from across the marketplace."
          href="/explore"
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {BESTSELLERS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-1 hover:border-amber-300/60"
            >
              <SafeImg
                src={item.image}
                fallbackSrc={FALLBACK_DATA_URL}
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
          ))}
        </div>
      </section>
    </main>
  )
}
