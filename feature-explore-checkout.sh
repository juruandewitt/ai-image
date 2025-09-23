#!/bin/bash
set -euo pipefail

# Ensure folders exist (no parentheses in paths)
mkdir -p \
  app/explore \
  app/artwork/[id] \
  app/checkout/success \
  app/api/artworks \
  app/api/checkout \
  components \
  lib \
  prisma

# Ensure Tailwind scans app/ and components/
if [ -f tailwind.config.ts ]; then
  node -e "const fs=require('fs');let s=fs.readFileSync('tailwind.config.ts','utf8');if(!s.includes('./app/**/*.{ts,tsx}')){s=s.replace(/content:\s*\[[^\]]*\]/,\`content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}']\`);}fs.writeFileSync('tailwind.config.ts',s);"
fi

# Configure Next.js (remote images + skip eslint in CI to avoid version conflicts)
cat > next.config.mjs <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
  eslint: { ignoreDuringBuilds: true },
}
export default nextConfig
EOF

# Prisma schema (Artwork + Order)
cat > prisma/schema.prisma <<'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Artwork {
  id        String   @id @default(cuid())
  title     String
  price     Int      // cents
  thumbnail String
  artist    String
  tags      String[]
  createdAt DateTime @default(now())
}

model Order {
  id        String   @id @default(cuid())
  artworkId String
  amount    Int
  email     String?
  createdAt DateTime @default(now())
}
EOF

# Seed data (idempotent)
cat > prisma/seed.ts <<'EOF'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const count = await prisma.artwork.count()
  if (count > 0) {
    console.log('Seed skipped: artworks already exist')
    return
  }
  await prisma.artwork.createMany({
    data: [
      { title: 'Neon Dunes', price: 4900, thumbnail: 'https://picsum.photos/seed/ai1/1200/900', artist: 'AI Studio', tags: ['surreal','neon'] },
      { title: 'Chrome Garden', price: 5900, thumbnail: 'https://picsum.photos/seed/ai2/1200/900', artist: 'AI Studio', tags: ['abstract'] },
      { title: 'Liminal City', price: 7900, thumbnail: 'https://picsum.photos/seed/ai3/1200/900', artist: 'AI Studio', tags: ['city','scifi'] },
    ]
  })
  console.log('Seed complete')
}

main().finally(() => prisma.$disconnect())
EOF

# Shared Prisma client (avoid recreating in dev)
cat > lib/prisma.ts <<'EOF'
import { PrismaClient } from '@prisma/client'
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ['error','warn'] })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
EOF

# DB helpers
cat > lib/db.ts <<'EOF'
import { prisma } from '@/lib/prisma'
export async function listArtworks() { return prisma.artwork.findMany({ orderBy: { createdAt: 'desc' } }) }
export async function getArtwork(id: string) { return prisma.artwork.findUnique({ where: { id } }) }
EOF

# Env helper
cat > lib/env.ts <<'EOF'
export const env = {
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
}
EOF

# Explore page
cat > app/explore/page.tsx <<'EOF'
import ArtworkCard from '@/components/ArtworkCard'
import { listArtworks } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function ExplorePage() {
  const items = await listArtworks()
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Explore</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((a) => (<ArtworkCard key={a.id} a={a as any} />))}
      </div>
    </section>
  )
}
EOF

# Artwork detail page
cat > app/artwork/[id]/page.tsx <<'EOF'
import Image from 'next/image'
import { getArtwork } from '@/lib/db'

function formatPrice(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const a = await getArtwork(params.id)
  if (!a) return <p className="text-sm text-neutral-500">Not found.</p>
  return (
    <article className="grid md:grid-cols-2 gap-8">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
        <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{a.title}</h1>
        <p className="text-neutral-500">by {a.artist}</p>
        <form action="/api/checkout" method="POST" className="space-y-3">
          <input type="hidden" name="artworkId" value={a.id} />
          <input type="hidden" name="title" value={a.title} />
          <input type="hidden" name="amount" value={a.price} />
          <button className="inline-flex items-center px-4 py-2 rounded-md bg-black text-white">
            Buy now ({formatPrice(a.price)})
          </button>
        </form>
      </div>
    </article>
  )
}
EOF

# Checkout success page
cat > app/checkout/success/page.tsx <<'EOF'
import Link from 'next/link'
export default function SuccessPage() {
  return (
    <section className="text-center py-20 space-y-4">
      <h1 className="text-3xl font-bold">🎉 Purchase Successful</h1>
      <p className="text-neutral-600">Thank you for your purchase.</p>
      <Link className="underline" href="/explore">Continue browsing</Link>
    </section>
  )
}
EOF

# Artworks API (GET list, POST create)
cat > app/api/artworks/route.ts <<'EOF'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.artwork.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  const form = await req.formData()
  const title = String(form.get('title') || '')
  const price = Number(form.get('price') || 0)
  const thumbnail = String(form.get('thumbnail') || '')
  const artist = String(form.get('artist') || '')
  const tags = String(form.get('tags') || '').split(',').map(t=>t.trim()).filter(Boolean)

  if (!title || !price || !thumbnail || !artist) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const created = await prisma.artwork.create({ data: { title, price, thumbnail, artist, tags } })
  return NextResponse.redirect(new URL(`/artwork/${created.id}`, req.url), { status: 303 })
}
EOF

# Checkout API (Stripe-aware)
cat > app/api/checkout/route.ts <<'EOF'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'

export async function POST(req: Request) {
  const form = await req.formData()
  const artworkId = String(form.get('artworkId') || '')
  const title = String(form.get('title') || 'Artwork')
  const amount = Number(form.get('amount') || 0)
  if (!artworkId || !amount) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  await prisma.order.create({ data: { artworkId, amount } })

  if (env.STRIPE_SECRET_KEY) {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' as any })
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ quantity: 1, price_data: { currency: 'usd', unit_amount: amount, product_data: { name: title } } }],
      success_url: `${env.SITE_URL}/checkout/success`,
      cancel_url: `${env.SITE_URL}/explore`,
    })
    return NextResponse.redirect(session.url!, { status: 303 })
  }

  return NextResponse.redirect(new URL('/checkout/success', env.SITE_URL), { status: 303 })
}
EOF

# Gallery card component
cat > components/ArtworkCard.tsx <<'EOF'
import Link from 'next/link'
import Image from 'next/image'
import type { Artwork } from '@prisma/client'

function formatPrice(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default function ArtworkCard({ a }: { a: Artwork }) {
  return (
    <Link href={`/artwork/${a.id}`} className="block border rounded-lg overflow-hidden hover:shadow">
      <div className="relative aspect-[4/3]"><Image src={a.thumbnail} alt={a.title} fill className="object-cover" /></div>
      <div className="flex items-center justify-between p-3">
        <div>
          <h3 className="font-semibold">{a.title}</h3>
          <p className="text-sm text-neutral-500">{a.artist}</p>
        </div>
        <div className="font-semibold">{formatPrice(a.price)}</div>
      </div>
    </Link>
  )
}
EOF

# Ensure Vercel runs postinstall; ensure Prisma scripts present
printf "enable-pre-post-scripts=true\n" > .npmrc
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json'));p.scripts=p.scripts||{};p.scripts.postinstall='prisma generate';p.scripts['db:push']='prisma db push';p.scripts['db:seed']='tsx prisma/seed.ts';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"

# Exclude seed from TS build checks (avoids type issues during next build)
if [ -f tsconfig.json ]; then
  node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('tsconfig.json'));j.exclude=Array.from(new Set([...(j.exclude||[]),'prisma/seed.ts']));fs.writeFileSync('tsconfig.json',JSON.stringify(j,null,2));"
fi

echo "✔ Explore grid, artwork detail, and checkout files created/updated."