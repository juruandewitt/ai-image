#!/usr/bin/env bash
set -euo pipefail

# 1) Prisma: add Asset & Variant (formats/resolutions/pricing), link to Artwork
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
enum Style {
  VAN_GOGH
  REMBRANDT
  PICASSO
  VERMEER
  MONET
  MICHELANGELO
  DALI
  CARAVAGGIO
  DA_VINCI
  POLLOCK
}
enum ImageFormat {
  PNG
  JPG
  WEBP
}

model Artwork {
  id         String    @id @default(cuid())
  title      String
  price      Int       // base price (cents) - kept for compatibility, not used at checkout when variants exist
  thumbnail  String
  artist     String
  tags       String[]
  category   Category  @default(ABSTRACT)
  status     Status    @default(PUBLISHED)
  featured   Boolean   @default(false)
  createdAt  DateTime  @default(now())
  style      Style     @default(VAN_GOGH)

  assets     Asset[]

  @@index([category])
  @@index([status])
  @@index([createdAt])
  @@index([title, artist])
  @@index([style])
}

model Asset {
  id         String    @id @default(cuid())
  artworkId  String
  artwork    Artwork   @relation(fields: [artworkId], references: [id], onDelete: Cascade)
  provider   String    // "openai" | "stability" | "manual"
  prompt     String
  seed       String?
  originalUrl String
  createdAt  DateTime  @default(now())

  variants   Variant[]
}

model Variant {
  id         String      @id @default(cuid())
  assetId    String
  asset      Asset       @relation(fields: [assetId], references: [id], onDelete: Cascade)
  format     ImageFormat
  width      Int
  height     Int
  url        String
  priceCents Int

  @@index([assetId])
}

model Order {
  id        String   @id @default(cuid())
  artworkId String
  amount    Int
  email     String?
  createdAt DateTime @default(now())
}
PRISMA

# 2) Generator library: prompts, providers, pricing, variants
mkdir -p lib
cat > lib/generator.ts <<'TS'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import sharp from 'sharp'

// ---- SETTINGS ----
export const VARIANT_SIZES = [1024, 2048] as const // add 4096 if you like
export const VARIANT_FORMATS = ['PNG','JPG','WEBP'] as const
export type ProviderName = 'openai' | 'stability'
export const PROVIDER: ProviderName = (process.env.IMAGE_PROVIDER as ProviderName) || 'openai'

// simple pricing ladder: cents by size
export function priceFor(width: number) {
  if (width >= 4096) return 9900
  if (width >= 2048) return 4900
  return 1900 // 1024
}

// Famous works per master (seed list)
export const MASTERWORKS: Record<string, string[]> = {
  VAN_GOGH: [
    'Starry Night', 'Sunflowers', 'Café Terrace at Night', 'Irises',
    'Wheatfield with Crows', 'Bedroom in Arles',
  ],
  REMBRANDT: ['The Night Watch', 'The Storm on the Sea of Galilee', 'The Jewish Bride'],
  PICASSO: ['Les Demoiselles d’Avignon', 'Guernica', 'The Weeping Woman'],
  VERMEER: ['Girl with a Pearl Earring', 'The Milkmaid', 'View of Delft'],
  MONET: ['Water Lilies', 'Impression, Sunrise', 'Haystacks'],
  MICHELANGELO: ['Creation of Adam', 'David', 'Pietà'],
  DALI: ['The Persistence of Memory', 'Swans Reflecting Elephants'],
  CARAVAGGIO: ['The Calling of Saint Matthew', 'Judith Beheading Holofernes'],
  DA_VINCI: ['Mona Lisa', 'The Last Supper', 'Vitruvian Man'],
  POLLOCK: ['Number 1 (Lavender Mist)', 'Blue Poles'],
}

// All style keys (must match Prisma enum)
export const STYLES = [
  'VAN_GOGH','REMBRANDT','PICASSO','VERMEER','MONET',
  'MICHELANGELO','DALI','CARAVAGGIO','DA_VINCI','POLLOCK'
] as const
export type StyleKey = typeof STYLES[number]

// Random scene seeds for “filler” images
export const RANDOM_SCENES = [
  'surreal neon city at dusk',
  'misty forest clearing with glowing mushrooms',
  'stormy seascape with distant lighthouse',
  'dreamlike portrait with flowing fabric',
  'cosmic garden under aurora skies',
  'minimal architectural study with soft light',
  'retro-futuristic boulevard with chrome',
  'desert dunes with mirrored monoliths',
]

// ---- Provider calls (stubbed to two options) ----
async function generateImageWithOpenAI(prompt: string): Promise<Buffer> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  // Using new Images API -> returns URL or b64; we fetch into Buffer for processing
  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  })
  const url = resp.data[0].url!
  const res = await fetch(url)
  return Buffer.from(await res.arrayBuffer())
}

async function generateImageWithStability(prompt: string): Promise<Buffer> {
  const { Client } = await import('@stabilityai/sdk')
  const client = new Client({ apiKey: process.env.STABILITY_API_KEY! })
  const result = await client.images.generate({
    model: 'sd3',
    prompt,
    size: { width: 1024, height: 1024 },
    output: 'bytes',
  })
  return Buffer.from(result.images[0].buffer)
}

async function generateBuffer(prompt: string) {
  if (PROVIDER === 'stability') return generateImageWithStability(prompt)
  return generateImageWithOpenAI(prompt)
}

// Upload original + build variants (sizes x formats), save DB records
export async function createArtworkWithVariants(opts: {
  title: string
  displayArtist: string
  style: StyleKey
  tags?: string[]
  prompt: string
  provider: ProviderName
}) {
  const buf = await generateBuffer(opts.prompt)

  // Upload original
  const original = await put(`art/${Date.now()}-orig.png`, buf, {
    access: 'public', contentType: 'image/png', addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN
  })

  // Create base artwork row (thumbnail will be updated to first variant)
  const artwork = await prisma.artwork.create({
    data: {
      title: opts.title,
      artist: opts.displayArtist,
      price: 0, // variants define price
      category: 'PORTRAIT',
      status: 'PUBLISHED',
      featured: false,
      style: opts.style,
      tags: (opts.tags || []).map(t=>t.toLowerCase()),
      thumbnail: original.url,
    }
  })

  const asset = await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      provider: opts.provider,
      prompt: opts.prompt,
      originalUrl: original.url,
    }
  })

  // Build variants
  const variantsToCreate: any[] = []
  for (const size of VARIANT_SIZES) {
    const resized = await sharp(buf).resize({ width: size, height: size, fit: 'cover' }).toBuffer()
    for (const fmt of VARIANT_FORMATS) {
      const out = fmt === 'PNG' ? await sharp(resized).png().toBuffer()
        : fmt === 'JPG' ? await sharp(resized).jpeg({ quality: 92 }).toBuffer()
        : await sharp(resized).webp({ quality: 92 }).toBuffer()
      const blob = await put(`art/${artwork.id}-${size}.${fmt.toLowerCase()}`, out, {
        access: 'public', contentType: `image/${fmt.toLowerCase()}`, addRandomSuffix: false,
        token: process.env.BLOB_READ_WRITE_TOKEN
      })
      variantsToCreate.push({
        assetId: asset.id,
        format: fmt as any,
        width: size,
        height: size,
        url: blob.url,
        priceCents: priceFor(size),
      })
    }
  }

  const created = await prisma.variant.createMany({ data: variantsToCreate })
  // Set thumbnail to medium JPG
  const thumb = variantsToCreate.find(v => v.width === VARIANT_SIZES[0] && v.format === 'JPG')!.url
  await prisma.artwork.update({ where: { id: artwork.id }, data: { thumbnail: thumb } })

  return artwork.id
}

// Build prompts: “best-known work A by Master X rendered in the style of Master Y”
export function crossStylePrompts() {
  const pairs: Array<{title: string, style: StyleKey, prompt: string}> = []
  for (const src of STYLES) {
    const works = MASTERWORKS[src] || []
    for (const work of works) {
      for (const dst of STYLES) {
        if (dst === src) continue
        const p = `Reimagine the famous artwork "${work}" by ${src.replace(/_/g,' ')} in the stylistic signature of ${dst.replace(/_/g,' ')}, high detail, museum-grade, painterly texture, balanced composition.`
        pairs.push({ title: `${work} — in the style of ${dst.replace(/_/g,' ')}`, style: dst, prompt: p })
      }
    }
  }
  return pairs
}

// Random prompts per style to reach target count
export function randomStylePrompts(targetPerStyle = 50) {
  const out: Array<{title: string, style: StyleKey, prompt: string}> = []
  for (const style of STYLES) {
    let count = 0
    while (count < targetPerStyle) {
      const scene = RANDOM_SCENES[Math.floor(Math.random()*RANDOM_SCENES.length)]
      const p = `A new original scene: ${scene}, rendered in the style of ${style.replace(/_/g,' ')}. High fidelity, gallery-quality.`
      out.push({ title: `${scene} — ${style.replace(/_/g,' ')}`, style, prompt: p })
      count++
    }
  }
  return out
}
TS

# 3) API route to trigger batch generation (admin)
mkdir -p app/api/generate
cat > app/api/generate/route.ts <<'TS'
import { NextResponse } from 'next/server'
import { createArtworkWithVariants, crossStylePrompts, randomStylePrompts, PROVIDER } from '@/lib/generator'

export const runtime = 'nodejs' // need Node for sharp & blob

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const mode = body.mode || 'cross' // 'cross' | 'random'
    const limit = Number(body.limit || 20) // safety
    const provider = PROVIDER

    const batch = mode === 'cross' ? crossStylePrompts() : randomStylePrompts(50)
    const selected = batch.slice(0, limit)

    const results: any[] = []
    for (const item of selected) {
      const id = await createArtworkWithVariants({
        title: item.title,
        displayArtist: 'AI Studio',
        style: item.style,
        prompt: item.prompt,
        provider,
      })
      results.push({ id, title: item.title })
    }

    return NextResponse.json({ ok: true, created: results.length, items: results })
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ ok: false, error: e?.message || 'generation failed' }, { status: 500 })
  }
}
TS

# 4) Admin page to click-and-generate batches
mkdir -p app/dashboard/generate
cat > app/dashboard/generate/page.tsx <<'TSX'
'use client'
import { useState } from 'react'

export default function GeneratePage() {
  const [pending, setPending] = useState(false)
  const [log, setLog] = useState<string>('')

  const run = async (mode: 'cross'|'random') => {
    setPending(true); setLog('')
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, limit: 20 }) // try 20 first; you can increase later
    })
    const j = await res.json()
    setPending(false)
    setLog(JSON.stringify(j, null, 2))
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Generate AI Artworks</h1>
      <p className="text-sm text-neutral-300">
        Choose a generation mode. <b>Cross-style</b> reimagines famous works in other masters' styles.
        <b> Random</b> fills each master with new scenes. Each run creates variants (formats & sizes) and saves them.
      </p>
      <div className="flex gap-3">
        <button disabled={pending} onClick={()=>run('cross')} className="px-4 py-2 rounded-md bg-indigo-600 text-white">{pending?'Working…':'Run Cross-Style (x20)'}</button>
        <button disabled={pending} onClick={()=>run('random')} className="px-4 py-2 rounded-md bg-amber-600 text-white">{pending?'Working…':'Run Random (x20)'}</button>
      </div>
      <pre className="text-xs text-neutral-300 bg-black/30 border border-white/10 rounded p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap">{log || '—'}</pre>
      <p className="text-xs text-neutral-500">Tip: run multiple times until each style reaches ~50 items.</p>
    </section>
  )
}
TSX

# 5) Artwork detail: variant picker (format + resolution → price)
cat > app/artwork/[id]/page.tsx <<'TSX'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { notFound } from 'next/navigation'

function money(cents: number) { return `$${(cents/100).toFixed(2)}` }

export default async function ArtworkDetail({ params }: { params: { id: string } }) {
  const a = await prisma.artwork.findUnique({
    where: { id: params.id },
    include: { assets: { include: { variants: true } } }
  })
  if (!a) return notFound()

  const variants = a.assets.flatMap(x => x.variants).sort((x,y) => x.width - y.width || x.format.localeCompare(y.format))
  const first = variants[0]

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-white/10">
          <Image src={a.thumbnail} alt={a.title} fill className="object-cover" />
        </div>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{a.title}</h1>
            <p className="text-neutral-300">by {a.artist}</p>
          </div>

          {/* Variant selector */}
          <form action="/api/checkout" method="POST" className="space-y-3">
            <input type="hidden" name="artworkId" value={a.id} />
            <label className="block text-sm opacity-80">Choose format</label>
            <select name="format" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
              {[...new Set(variants.map(v=>v.format))].map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
            </select>
            <label className="block text-sm opacity-80">Choose resolution</label>
            <select name="resolution" className="rounded-md border border-white/10 bg-black/30 px-3 py-2">
              {[...new Set(variants.map(v=>v.width))].map(w => <option key={w} value={w}>{w} × {w}</option>)}
            </select>

            {/* For now we compute on server side in /api/checkout using selected format/resolution */}
            <button className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white">
              Buy now
            </button>
          </form>

          {first && <p className="text-sm text-neutral-400">From {money(first.priceCents)} · Higher resolutions cost more</p>}
        </div>
      </div>
    </div>
  )
}
TSX

# 6) Checkout route: compute price from chosen variant (stub)
mkdir -p app/api/checkout
cat > app/api/checkout/route.ts <<'TS'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const form = await req.formData()
  const artworkId = String(form.get('artworkId') || '')
  const format = String(form.get('format') || '')
  const resolution = Number(form.get('resolution') || 0)

  const variant = await prisma.variant.findFirst({
    where: { asset: { artworkId }, format: format as any, width: resolution }
  })
  if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })

  // TODO: integrate Stripe here; for now we respond with the calculated price
  return NextResponse.json({ ok: true, amount: variant.priceCents, url: variant.url })
}
TS

echo "✔ Generation pipeline files written."
