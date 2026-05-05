import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'space-universe'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Crimson Supernova Remnant', 'crimson red, hot pink, black, glowing white'],
  ['Golden Spiral Galaxy', 'gold, amber, deep indigo, soft white stars'],
  ['Frozen Neptune Orbit', 'icy cyan, navy blue, silver, pale lavender'],
  ['Purple Nebula Canyon', 'purple, violet, magenta, black, starlight white'],
  ['Emerald Alien Atmosphere', 'emerald green, jade, black, pale yellow'],
  ['White Dwarf Silence', 'white, pearl gray, soft blue, deep black'],
  ['Orange Dust Planet', 'burnt orange, rust, bronze, dark brown'],
  ['Blue Star Cluster', 'electric blue, cobalt, white, midnight navy'],
  ['Pink Cosmic Bloom', 'rose pink, coral, violet, black'],
  ['Dark Matter Veil', 'black, charcoal, silver, faint blue glow'],
].map(([name, palette]) => ({
  title: `${name} - Space Universe Theme`,
  prompt: `premium cinematic space artwork, ${name}, distinct color palette of ${palette}, ultra detailed, deep cosmic atmosphere, dramatic lighting, high-end digital art, commercial poster quality, varied composition, no text, no watermark`,
}))

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
}

async function generateOpenAiImageUrl(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
      n: 1,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI image generation failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  const imageUrl = data?.data?.[0]?.url
  if (!imageUrl || typeof imageUrl !== 'string') throw new Error('No image URL returned')

  return imageUrl
}

async function uploadGeneratedImageToBlob(openAiUrl: string, title: string) {
  const imageResponse = await fetch(openAiUrl, { cache: 'no-store' })
  if (!imageResponse.ok) throw new Error(`Failed to download generated image: ${imageResponse.status}`)

  const contentType = imageResponse.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageResponse.arrayBuffer()

  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    arrayBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${title}`)
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const tags = [
    THEME_TAG,
    'theme',
    'space',
    'universe',
    'galaxy',
    'sci-fi',
    'wallpaper',
  ]

  const existing = await prisma.artwork.findFirst({
    where: { title: item.title },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: ARTIST,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
          tags,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
          tags,
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'theme-ai-generated-blob',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const openAiUrl = await generateOpenAiImageUrl(item.prompt)
      const imageUrl = await uploadGeneratedImageToBlob(openAiUrl, item.title)
      const artworkId = await upsertArtwork(item, imageUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl,
      })
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Space & Universe theme batch 4 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
