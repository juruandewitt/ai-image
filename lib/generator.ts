
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import sharp from 'sharp'

// ---- SETTINGS ----
export const VARIANT_SIZES = [1024, 2048] as const
export const VARIANT_FORMATS = ['PNG','JPG','WEBP'] as const
export type ProviderName = 'openai'
export const PROVIDER: ProviderName = 'openai'

export function priceFor(width: number) {
  if (width >= 4096) return 9900
  if (width >= 2048) return 4900
  return 1900
}

export const MASTERWORKS: Record<string, string[]> = {
  VAN_GOGH: ['Starry Night','Sunflowers','Café Terrace at Night','Irises','Wheatfield with Crows','Bedroom in Arles'],
  REMBRANDT: ['The Night Watch','The Storm on the Sea of Galilee','The Jewish Bride'],
  PICASSO: ['Les Demoiselles d’Avignon','Guernica','The Weeping Woman'],
  VERMEER: ['Girl with a Pearl Earring','The Milkmaid','View of Delft'],
  MONET: ['Water Lilies','Impression, Sunrise','Haystacks'],
  MICHELANGELO: ['Creation of Adam','David','Pietà'],
  DALI: ['The Persistence of Memory','Swans Reflecting Elephants'],
  CARAVAGGIO: ['The Calling of Saint Matthew','Judith Beheading Holofernes'],
  DA_VINCI: ['Mona Lisa','The Last Supper','Vitruvian Man'],
  POLLOCK: ['Number 1 (Lavender Mist)','Blue Poles'],
}

export const STYLES = [
  'VAN_GOGH','REMBRANDT','PICASSO','VERMEER','MONET',
  'MICHELANGELO','DALI','CARAVAGGIO','DA_VINCI','POLLOCK'
] as const
export type StyleKey = typeof STYLES[number]

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

// ---- Provider: OpenAI only ----
async function generateImageWithOpenAI(prompt: string): Promise<Buffer> {
  const { OpenAI } = await import('openai')
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const resp = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  })
  const url = resp.data[0].url!
  const res = await fetch(url)
  return Buffer.from(await res.arrayBuffer())
}

async function generateBuffer(prompt: string) {
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

  // Upload original to Vercel Blob
  const original = await put(`art/${Date.now()}-orig.png`, buf, {
    access: 'public', contentType: 'image/png', addRandomSuffix: true,
    token: process.env.BLOB_READ_WRITE_TOKEN
  })

  // Create base artwork row (thumbnail will be updated to first variant)
  const artwork = await prisma.artwork.create({
    data: {
      title: opts.title,
      artist: opts.displayArtist,
      price: 0,
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

  await prisma.variant.createMany({ data: variantsToCreate })
  // Set thumbnail to medium JPG
  const thumb = variantsToCreate.find(v => v.width === VARIANT_SIZES[0] && v.format === 'JPG')!.url
  await prisma.artwork.update({ where: { id: artwork.id }, data: { thumbnail: thumb } })

  return artwork.id
}

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
