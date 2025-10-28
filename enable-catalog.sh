#!/usr/bin/env bash
set -euo pipefail

# ----- Prisma schema (Postgres-safe: NO @@fulltext) -----
mkdir -p prisma
cat > prisma/schema.prisma <<'PRISMA'
generator client {
  provider = "prisma-client-js"
}
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Category {
  ABSTRACT
  LANDSCAPE
  PORTRAIT
  SURREAL
  SCI_FI
  MINIMAL
}
enum Status {
  DRAFT
  PUBLISHED
}

model Artwork {
  id         String    @id @default(cuid())
  title      String
  price      Int       // cents
  thumbnail  String
  artist     String
  tags       String[]
  category   Category  @default(ABSTRACT)
  status     Status    @default(PUBLISHED)
  featured   Boolean   @default(false)
  createdAt  DateTime  @default(now())

  @@index([category])
  @@index([status])
  @@index([createdAt])
  @@index([title, artist])
}

model Order {
  id        String   @id @default(cuid())
  artworkId String
  amount    Int
  email     String?
  createdAt DateTime @default(now())
}
PRISMA

# ----- Seed data (diverse, dark-friendly thumbs via picsum) -----
cat > prisma/seed.ts <<'TS'
import { PrismaClient, Category } from '@prisma/client'
const prisma = new PrismaClient()
const items = [
  { title: 'Neon Dunes',   price: 4900, thumbnail: 'https://picsum.photos/seed/ai1/1200/900', artist: 'AI Studio', tags: ['surreal','neon'], category: Category.SURREAL,  featured: true },
  { title: 'Chrome Garden',price: 5900, thumbnail: 'https://picsum.photos/seed/ai2/1200/900', artist: 'AI Studio', tags: ['abstract','metal'], category: Category.ABSTRACT },
  { title: 'Liminal City', price: 7900, thumbnail: 'https://picsum.photos/seed/ai3/1200/900', artist: 'AI Studio', tags: ['city','scifi'],   category: Category.SCI_FI,  featured: true },
  { title: 'Solar Fields', price: 5600, thumbnail: 'https://picsum.photos/seed/ai4/1200/900', artist: 'Nova',      tags: ['landscape','glow'], category: Category.LANDSCAPE },
  { title: 'Echo Portrait',price: 5200, thumbnail: 'https://picsum.photos/seed/ai5/1200/900', artist: 'Muse',      tags: ['portrait','minimal'], category: Category.PORTRAIT },
  { title: 'Glass Waves',  price: 6100, thumbnail: 'https://picsum.photos/seed/ai6/1200/900', artist: 'Vector',    tags: ['minimal','abstract'], category: Category.MINIMAL },
]
async function main() {
  const count = await prisma.artwork.count()
  if (count === 0) {
    await prisma.artwork.createMany({ data: items })
    console.log('Seed complete: inserted', items.length)
  } else {
    console.log('Seed skipped: artworks already exist')
  }
}
main().finally(() => prisma.$disconnect())
TS

# ----- Prisma helper import (uses your existing lib/prisma) -----
mkdir -p lib
# catalog helpers: filters/search/sort/pagination
cat > lib/catalog.ts <<'TS'
import { prisma } from '@/lib/prisma'
import { Category, Prisma } from '@prisma/client'

export type ExploreParams = {
  q?: string
  category?: string | string[]
  tag?: string | string[]
  sort?: 'new'|'price_asc'|'price_desc'|'featured'
  page?: number
  perPage?: number
}

const PER_PAGE_DEFAULT = 9
const normalizeArray = (val?: string|string[]) =>
  !val ? [] : Array.isArray(val) ? val : [val]

export function buildWhere(params: ExploreParams): Prisma.ArtworkWhereInput {
  const categories = normalizeArray(params.category)
    .map(c => c.toUpperCase().replace('-', '_'))
    .filter(c => Object.keys(Category).includes(c)) as Category[]
  const tags = normalizeArray(params.tag)

  const where: Prisma.ArtworkWhereInput = { status: 'PUBLISHED', AND: [] }

  if (params.q) {
    const q = params.q.trim()
    ;(where.AND as Prisma.ArtworkWhereInput[]).push({
      OR: [
        { title:  { contains: q, mode: 'insensitive' } },
        { artist: { contains: q, mode: 'insensitive' } },
        { tags:   { has: q.toLowerCase() } },
      ]
    })
  }
  if (categories.length) (where.AND as any).push({ category: { in: categories } })
  if (tags.length) for (const t of tags) (where.AND as any).push({ tags: { has: t.toLowerCase() } })
  return where
}

export function buildOrderBy(sort?: ExploreParams['sort']): Prisma.ArtworkOrderByWithRelationInput {
  switch (sort) {
    case 'price_asc':  return { price: 'asc' }
    case 'price_desc': return { price: 'desc' }
    case 'featured':   return { featured: 'desc' }
    default:           return { createdAt: 'desc' } // newest
  }
}

export async function searchArtworks(params: ExploreParams) {
  const page = Math.max(1, Number(params.page || 1))
  const perPage = Math.min(24, Math.max(3, Number(params.perPage || PER_PAGE_DEFAULT)))
  const skip = (page - 1) * perPage
  const where = buildWhere(params)
  const orderBy = buildOrderBy(params.sort)

  const [items, total] = await Promise.all([
    prisma.artwork.findMany({ where, orderBy, skip, take: perPage }),
    prisma.artwork.count({ where }),
  ])
  const totalPages = Math.ceil(total / perPage) || 1
  return { items, total, page, perPage, totalPages }
}
TS

# ----- UI components -----
mkdir -p components

# ArtworkCard used by Explore grid
cat > components/ArtworkCard.tsx <<'TSX'
import Image from 'next/image'
import Link from 'next/link'

function money(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default function ArtworkCard({ a }: { a: any }) {
  return (
    <Link href={`/artwork/${a.id}`} className="group block rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition">
      <div className="relative aspect-[4/3]">
        <Image src={a.thumbnail} alt={a.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
          <div className="text-white">
            <div className="text-base font-semibold drop-shadow">{a.title}</div>
            <div className="text-xs text-indigo-200">by {a.artist}</div>
          </div>
          <div className="text-sm font-semibold text-amber-300 drop-shadow">{money(a.price)}</div>
        </div>
      </div>
    </Link>
  )
}
TSX

# Filter bar (categories, search, sort)
cat > components/FilterBar.tsx <<'TSX'
'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

const CATEGORIES = [
  { key: 'ABSTRACT',  label: 'Abstract' },
  { key: 'LANDSCAPE', label: 'Landscape' },
  { key: 'PORTRAIT',  label: 'Portrait' },
  { key: 'SURREAL',   label: 'Surreal' },
  { key: 'SCI_FI',    label: 'Sci-Fi' },
  { key: 'MINIMAL',   label: 'Minimal' },
]
const SORTS = [
  { key: 'new',        label: 'Newest' },
  { key: 'featured',   label: 'Featured' },
  { key: 'price_asc',  label: 'Price ↑' },
  { key: 'price_desc', label: 'Price ↓' },
]

export default function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()

  const [q, setQ] = useState(sp.get('q') || '')
  const activeSort = sp.get('sort') || 'new'
  const activeCats = sp.getAll('category')

  const apply = useCallback((patch: Record<string,string|string[]|null>) => {
    const params = new URLSearchParams(sp.toString())
    for (const [k,v] of Object.entries(patch)) {
      params.delete(k)
      if (v == null) continue
      if (Array.isArray(v)) v.forEach(val => params.append(k, val))
      else if (v !== '') params.set(k, v)
    }
    params.set('page','1')
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, sp])

  const toggleCat = (key: string) => {
    const next = new Set(activeCats)
    next.has(key) ? next.delete(key) : next.add(key)
    apply({ category: Array.from(next) })
  }
  const setSort = (key: string) => apply({ sort: key })
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); apply({ q }) }
  const isActive = (key: string) => activeCats.includes(key)

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 backdrop-blur px-4 py-3 text-sm text-neutral-200">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row md:items-center gap-3">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search title, artist or tag…" className="flex-1 rounded-md border border-white/10 bg-black/30 px-3 py-2 outline-none" />
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.key} type="button" onClick={()=>toggleCat(c.key)} className={`px-3 py-1.5 rounded-full border ${isActive(c.key) ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-black/30 border-white/10 text-neutral-200'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 md:ml-auto">
          <label className="opacity-80">Sort</label>
          <select value={activeSort} onChange={e=>setSort(e.target.value)} className="rounded-md border border-white/10 bg-black/30 px-2 py-1.5">
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <button className="px-4 py-2 rounded-md bg-indigo-600 text-white md:ml-2">Apply</button>
      </form>
    </div>
  )
}
TSX

# Pagination controls
cat > components/Pagination.tsx <<'TSX'
'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const sp = useSearchParams()
  const goto = (p: number) => {
    const params = new URLSearchParams(sp.toString())
    params.set('page', String(p))
    router.push(`${pathname}?${params.toString()}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button disabled={page<=1} onClick={()=>goto(page-1)} className="px-3 py-1.5 rounded-md border border-white/10 disabled:opacity-40">← Prev</button>
      <span className="text-sm opacity-80">Page {page} / {totalPages}</span>
      <button disabled={page>=totalPages} onClick={()=>goto(page+1)} className="px-3 py-1.5 rounded-md border border-white/10 disabled:opacity-40">Next →</button>
    </div>
  )
}
TSX

# ----- Pages -----
# /explore page (grid with filters + pagination)
mkdir -p app/explore
cat > app/explore/page.tsx <<'TSX'
import ArtworkCard from '@/components/ArtworkCard'
import FilterBar from '@/components/FilterBar'
import Pagination from '@/components/Pagination'
import { searchArtworks } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export default async function ExplorePage({ searchParams }: { searchParams: any }) {
  const { items, total, page, totalPages } = await searchArtworks({
    q: searchParams.q,
    category: searchParams.category,
    tag: searchParams.tag,
    sort: searchParams.sort,
    page: Number(searchParams.page || 1),
    perPage: Number(searchParams.perPage || 9),
  })

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Explore</h1>
      <FilterBar />
      <p className="text-sm opacity-70">{total} result{total===1?'':'s'}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(a => (<ArtworkCard key={a.id} a={a as any} />))}
      </div>

      <Pagination page={page} totalPages={totalPages} />
    </section>
  )
}
TSX

# /artwork/[id] detail page (with related)
mkdir -p app/artwork/[id]
cat > app/artwork/[id]/page.tsx <<'TSX'
import Image from 'next/image'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function money(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const a = await prisma.artwork.findUnique({ where: { id: params.id } })
  if (!a) return <p className="text-sm text-neutral-400">Not found.</p>

  const related = await prisma.artwork.findMany({
    where: { category: a.category, id: { not: a.id }, status: 'PUBLISHED' },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  return (
    <div className="space-y-10">
      <article className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-white/10">
          <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-white">{a.title}</h1>
          <p className="text-neutral-300">by {a.artist}</p>
          <form action="/api/checkout" method="POST" className="space-y-3">
            <input type="hidden" name="artworkId" value={a.id} />
            <input type="hidden" name="title" value={a.title} />
            <input type="hidden" name="amount" value={a.price} />
            <button className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white">
              Buy now ({money(a.price)})
            </button>
          </form>
        </div>
      </article>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Related</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {related.map(r => (
              <Link key={r.id} href={`/artwork/${r.id}`} className="block rounded-lg overflow-hidden border border-white/10 hover:border-white/20">
                <div className="relative aspect-[4/3]">
                  <Image src={r.thumbnail} alt={r.title} fill className="object-cover" />
                </div>
                <div className="p-3 text-white text-sm">{r.title}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
TSX

# /dashboard (minimal create form; no auth yet)
mkdir -p app/dashboard
cat > app/dashboard/page.tsx <<'TSX'
'use client'
import { useState } from 'react'

export default function DashboardPage() {
  const [pending, setPending] = useState(false)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    const res = await fetch('/api/artworks', { method: 'POST', body: new FormData(e.currentTarget) })
    setPending(false)
    if (res.ok) alert('Saved!')
    else alert('Error saving')
  }
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Dashboard — Add Artwork</h1>
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 p-4 rounded-xl border border-white/10">
        <input name="title" placeholder="Title" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" required />
        <input name="artist" placeholder="Artist" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" required />
        <input name="price" type="number" placeholder="Price (cents)" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" required />
        <input name="thumbnail" placeholder="Image URL" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" required />
        <input name="tags" placeholder="tags (comma separated)" className="rounded-md border border-white/10 bg-black/30 px-3 py-2" />
        <select name="category" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
          <option value="ABSTRACT">Abstract</option>
          <option value="LANDSCAPE">Landscape</option>
          <option value="PORTRAIT">Portrait</option>
          <option value="SURREAL">Surreal</option>
          <option value="SCI_FI">Sci-Fi</option>
          <option value="MINIMAL">Minimal</option>
        </select>
        <button disabled={pending} className="mt-2 md:mt-0 px-4 py-2 rounded-md bg-indigo-600 text-white">{pending?'Saving…':'Save'}</button>
      </form>
      <p className="text-sm opacity-70">Note: basic dashboard without auth (we’ll add auth later).</p>
    </section>
  )
}
TSX

# ----- Minimal API routes -----
# Create artwork (basic)
mkdir -p app/api/artworks
cat > app/api/artworks/route.ts <<'TS'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const form = await req.formData()
  const title = String(form.get('title') || '')
  const artist = String(form.get('artist') || '')
  const price = Number(form.get('price') || 0)
  const thumbnail = String(form.get('thumbnail') || '')
  const tagsRaw = String(form.get('tags') || '')
  const category = String(form.get('category') || 'ABSTRACT') as any

  if (!title || !artist || !price || !thumbnail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const tags = tagsRaw ? tagsRaw.split(',').map(t=>t.trim().toLowerCase()).filter(Boolean) : []
  await prisma.artwork.create({ data: { title, artist, price, thumbnail, tags, category, status: 'PUBLISHED' } })
  return NextResponse.json({ ok: true })
}
TS

# Stub checkout route so the detail page form doesn't 500
mkdir -p app/api/checkout
cat > app/api/checkout/route.ts <<'TS'
import { NextResponse } from 'next/server'
export async function POST() {
  // Placeholder: wire to Stripe later
  return NextResponse.json({ ok: true, message: 'Checkout stubbed in dev.' })
}
TS

# ----- package.json: ensure prisma scripts exist -----
node <<'JS'
const fs = require('fs');
const p = 'package.json';
const j = JSON.parse(fs.readFileSync(p,'utf8'));
j.scripts = j.scripts || {};
j.scripts['db:push'] = 'prisma db push';
j.scripts['db:seed'] = 'tsx prisma/seed.ts';
j.scripts.postinstall = 'prisma generate';
fs.writeFileSync(p, JSON.stringify(j,null,2));
console.log('package.json scripts set/updated');
JS

echo "✔ Feature pack written."
