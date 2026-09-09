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

const MASTERS = [
  {
    label: 'Leonardo da Vinci',
    href: '/explore/styles/leonardo-da-vinci',
    image:
      '/api/artwork/preview/cmngh924c0000gfum690drnoh?w=700&v=home-masters-v7',
    work: 'Mona Lisa',
  },
  {
    label: 'Michelangelo',
    href: '/explore/styles/michelangelo',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/michelangelo/the-creation-of-adam-in-michelangelo-style-public-domain-source-cEmALjPHvrcsFGnUNu2tMmCJj4gvbj',
    work: 'The Creation of Adam',
  },
  {
    label: 'Vincent van Gogh',
    href: '/explore/styles/van-gogh',
    image:
      '/api/artwork/preview/cmnn9rage0000w3tg10mfkpev?w=700&v=home-masters-v7',
    work: 'The Starry Night',
  },
  {
    label: 'Claude Monet',
    href: '/explore/styles/claude-monet',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/monet/impression-sunrise-in-monet-style-public-domain-source-CaA4dkgwW30TtRkvXoA2GqC5OcuWbd',
    work: 'Impression, Sunrise',
  },
  {
    label: 'Rembrandt',
    href: '/explore/styles/rembrandt',
    image:
      '/api/artwork/preview/cmnotftfu0000jd2lgw17a20y?w=700&v=home-masters-v7',
    work: 'The Night Watch',
  },
  {
    label: 'Caravaggio',
    href: '/explore/styles/caravaggio',
    image:
      '/api/artwork/preview/cmnowyzys0000vtrya8t4lj2o?w=700&v=home-masters-v7',
    work: 'The Calling of Saint Matthew',
  },
  {
    label: 'Johannes Vermeer',
    href: '/explore/styles/johannes-vermeer',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/vermeer/girl-with-a-pearl-earring-in-vermeer-style-public-domain-source-2MjUdSMSxgVLEqaT3NNexE0NzuOSxH',
    work: 'Girl with a Pearl Earring',
  },
  {
    label: 'Edvard Munch',
    href: '/explore/styles/edvard-munch',
    image:
      '/api/artwork/preview/cmnqg55x60000uijqc07vfxob?w=700&v=home-masters-v7',
    work: 'The Scream',
  },
  {
    label: 'Jackson Pollock',
    href: '/explore/styles/jackson-pollock',
    image:
      '/api/artwork/preview/cmnp0xr2j0000utfte34mxv4n?w=700&v=home-masters-v7',
    work: 'Autumn Rhythm',
  },
  {
    label: 'Salvador Dalí',
    href: '/explore/styles/dali',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/dali/persistence-of-memory-inspired-refined-FAH6lEl8284hpyKBhK3absZHhspPd6.png',
    work: 'The Persistence of Memory',
  },
  {
    label: 'Pablo Picasso',
    href: '/explore/styles/pablo-picasso',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/picasso/guernica-in-picasso-style-jYGI4QJ8IGGGpIpCK2elvHxuAMjOSf.png',
    work: 'Guernica',
  },
]

const MASTERS_REIMAGINED = [
  {
    title: 'The Scream',
    master: 'In Michelangelo Style',
    href: '/artwork/cmnbfkgtb000m76b7fxhnwvcf',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/michelangelo/the-scream-in-michelangelo-style-uhrlG2bs3WxMg24vEymrsIUlB8XQtj.png',
    text: 'Munch’s emotional masterpiece reinterpreted with Michelangelo’s monumental sculptural power.',
  },
  {
    title: 'Mona Lisa',
    master: 'In Van Gogh Style',
    href: '/artwork/cmnnbf5dw000u7arey9doysq6',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/van-gogh/mona-lisa-in-van-gogh-style-ZCAnXSHS9H7UPFWdmf5SEtbdf76gVk.png',
    text: 'Leonardo’s mysterious portrait transformed through expressive colour and swirling movement.',
  },
  {
    title: 'Starry Night',
    master: 'In Monet Style',
    href: '/artwork/cmn7yhcwc000516ddv03zxjgc',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/monet/starry-night-in-monet-style-XClaCopIFppIKq49pOoI0w9gzo95bG.png',
    text: 'Van Gogh’s celebrated night sky interpreted through atmospheric impressionist light.',
  },
  {
    title: 'Girl with a Pearl Earring',
    master: 'In Caravaggio Style',
    href: '/artwork/cmnox8u470006j89qcsbi57i5',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/caravaggio/girl-with-a-pearl-earring-in-caravaggio-style-iIUSvkTN9tvpsnf8fp2JhvAReCe1WY.png',
    text: 'Vermeer’s intimate portrait recast with Caravaggio’s dramatic chiaroscuro.',
  },
  {
    title: 'The Night Watch',
    master: 'In Picasso Style',
    href: '/artwork/cmnnmtyr1000331x6h0sync7l',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/picasso/the-night-watch-in-picasso-style-R99D9eVFQJCetMGt3Al3FaLbQD9ITP.png',
    text: 'Rembrandt’s group portrait reconstructed through bold cubist geometry.',
  },
  {
    title: 'Impression, Sunrise',
    master: 'In Pollock Style',
    href: '/artwork/cmnp1a7i2001rmgqe22rvk6o9',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/pollock/impression-sunrise-in-pollock-style-yYBU0MY607MyHQWDW0RKRZUaU0DZXw.png',
    text: 'Monet’s harbour scene transformed into an energetic field of colour and motion.',
  },
  {
    title: 'The Last Supper',
    master: 'In Munch Style',
    href: '/artwork/cmnqg2yan0010mvtopbk1hgcz',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/munch/the-last-supper-in-munch-style-9OzzojXQ2ByWF497ZyThGAlIpVe875.png',
    text: 'Leonardo’s defining composition interpreted through psychological tension and symbolism.',
  },
  {
    title: 'Persistence of Memory',
    master: 'In Rembrandt Style',
    href: '/artwork/cmnotw7l2000o9edqyqvktxia',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/rembrandt/persistence-of-memory-in-rembrandt-style-mbmGzGwU5wvni3vkwrLUmoqWc33x1A.png',
    text: 'Dalí’s surreal imagery reinterpreted through rich shadows, restrained light and classical drama.',
  },
  {
    title: 'Guernica',
    master: 'In Vermeer Style',
    href: '/artwork/cmngg1i8l001937jqm4ojyyzd',
    image:
      'https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/vermeer/guernica-in-vermeer-style-QaOXgAP2l1gGJjUkkKBdJpLP5Exfp6.png',
    text: 'Picasso’s monumental work translated into Vermeer’s controlled light and intimate atmosphere.',
  },
]

const FAVORITE_COLLECTIONS = [
  {
    label: 'Fantasy Kingdoms',
    slug: 'fantasy-kingdoms',
    image:
      '/api/artwork/preview/cmq80fdao0000o5blyggzox1h?w=800&v=home-favorites-v7',
  },
  {
    label: 'Ancient Civilizations',
    slug: 'ancient-civilizations',
    image:
      '/api/artwork/preview/cmq6d1a57000014kn9c02er4x?w=800&v=home-favorites-v7',
  },
  {
    label: 'Space / Galaxy',
    slug: 'space-galaxy',
    image:
      '/api/artwork/preview/cmq5e2xjx0000308bbd8u2uvd?w=800&v=home-favorites-v7',
  },
  {
    label: 'Cars / Automotive',
    slug: 'cars-automotive',
    image:
      '/api/artwork/preview/cmq4wthpl0000165iuvclc0xg?w=800&v=home-favorites-v7',
  },
  {
    label: 'Seasonal / Holidays',
    slug: 'seasonal-holidays',
    image:
      '/api/artwork/preview/cmq3u8dd10000k0dafyvhkg9l?w=800&v=home-favorites-v7',
  },
  {
    label: 'Spiritual / Zen',
    slug: 'spiritual-zen',
    image:
      '/api/artwork/preview/cmq3d8uhm0000u3feir9sucgq?w=800&v=home-favorites-v7',
  },
  {
    label: 'Food / Culinary',
    slug: 'food-culinary',
    image:
      '/api/artwork/preview/cmpfxxocq00005d9waq7ulcng?w=800&v=home-favorites-v7',
  },
  {
    label: 'Animals / Pets',
    slug: 'animals-pets',
    image:
      '/api/artwork/preview/cmpyeyl3300002zoq2hvd1pio?w=800&v=home-favorites-v7',
  },
  {
    label: 'Gaming / Esports',
    slug: 'gaming-esports',
    image:
      '/api/artwork/preview/cmq23ftj50000vj3vyeco8mh4?w=800&v=home-favorites-v7',
  },
  {
    label: 'Travel / Destinations',
    slug: 'travel-destinations',
    image:
      '/api/artwork/preview/cmpku0pdu0000wrli6vj5ttbx?w=800&v=home-favorites-v7',
  },
  {
    label: 'Luxury Lifestyle',
    slug: 'luxury-lifestyle',
    image:
      '/api/artwork/preview/cmpllpx7y0000izhrrv1dl9q3?w=800&v=home-favorites-v7',
  },
  {
    label: 'Nature / Botanical',
    slug: 'nature-botanical',
    image:
      '/api/artwork/preview/cmpd6gbye0000inxmqaksp6cn?w=800&v=home-favorites-v7',
  },
  {
    label: 'Architecture',
    slug: 'architecture',
    image:
      '/api/artwork/preview/cmp2yzmsu00006o55vsz0zogg?w=800&v=home-favorites-v7',
  },
  {
    label: 'Ocean / Marine',
    slug: 'ocean-marine',
    image:
      '/api/artwork/preview/cmpbn3f0h0000ycb12edq3qk2?w=800&v=home-favorites-v7',
  },
  {
    label: 'Vintage / Retro',
    slug: 'vintage-retro',
    image:
      '/api/artwork/preview/cmpx5aw9j0000oxlq33ww14zi?w=800&v=home-favorites-v7',
  },
]

const BESTSELLERS = [
  {
    title: 'Golden Dragon Kingdom',
    collection: 'Fantasy Kingdoms',
    href: '/artwork/cmq80fdao0000o5blyggzox1h',
    image:
      '/api/artwork/preview/cmq80fdao0000o5blyggzox1h?w=900&v=bestsellers-v7',
  },
  {
    title: 'Great Pyramid of Giza',
    collection: 'Ancient Civilizations',
    href: '/artwork/cmq6d1a57000014kn9c02er4x',
    image:
      '/api/artwork/preview/cmq6d1a57000014kn9c02er4x?w=900&v=bestsellers-v7',
  },
  {
    title: 'Luxury Space Station Observatory',
    collection: 'Space / Galaxy',
    href: '/artwork/cmq5e2xjx0000308bbd8u2uvd',
    image:
      '/api/artwork/preview/cmq5e2xjx0000308bbd8u2uvd?w=900&v=bestsellers-v7',
  },
  {
    title: 'Luxury Sports Car Showroom',
    collection: 'Cars / Automotive',
    href: '/artwork/cmq4wthpl0000165iuvclc0xg',
    image:
      '/api/artwork/preview/cmq4wthpl0000165iuvclc0xg?w=900&v=bestsellers-v7',
  },
  {
    title: 'Zen Meditation Temple',
    collection: 'Spiritual / Zen',
    href: '/artwork/cmq3d8uhm0000u3feir9sucgq',
    image:
      '/api/artwork/preview/cmq3d8uhm0000u3feir9sucgq?w=900&v=bestsellers-v7',
  },
  {
    title: 'Gourmet Pasta Plate',
    collection: 'Food / Culinary',
    href: '/artwork/cmpfxxocq00005d9waq7ulcng',
    image:
      '/api/artwork/preview/cmpfxxocq00005d9waq7ulcng?w=900&v=bestsellers-v7',
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
  item: (typeof MASTERS)[number]
}) {
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
              src="https://qdqgkmgfjhffc4cy.public.blob.vercel-storage.com/artworks/michelangelo/the-scream-in-michelangelo-style-uhrlG2bs3WxMg24vEymrsIUlB8XQtj.png"
              fallbackSrc={FALLBACK_DATA_URL}
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

      <section className="space-y-6">
        <SectionHeader
          title="The Masters"
          subtitle="Explore all 11 Master collections in one horizontal gallery."
          href="/explore/masters"
        />

        <div className="-mx-4 overflow-x-auto px-4 pb-3">
          <div className="flex gap-5">
            {MASTERS.map((item) => (
              <MasterCard
                key={`${item.label}-${item.work}`}
                item={item}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          title="The Masters Reimagined"
          subtitle="Famous works transformed through the visual language of another Master."
          href="/explore/masters-reimagined"
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
              <CollectionCard
                key={item.slug}
                item={item}
              />
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
