import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'fantasy'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Dragon Over Mountain Kingdom', 'massive dragon flying above a medieval mountain kingdom, glowing sky'],
  ['Enchanted Forest Portal', 'mystical forest with glowing portal, ancient trees, magical light'],
  ['Floating Castle in the Sky', 'giant castle floating among clouds, waterfalls falling into sky, golden light'],
  ['Dark Sorcerer Tower', 'ominous tower on cliff, lightning sky, glowing windows, cinematic darkness'],
  ['Crystal Cavern Realm', 'underground cavern filled with glowing crystals, reflections, magical atmosphere'],
  ['Ancient Ruins Awakening', 'forgotten ruins covered in vines, glowing runes, sunlight beams'],
  ['Golden Kingdom at Sunrise', 'epic fantasy city with towers and walls, warm sunrise glow'],
  ['Mystic Waterfall Temple', 'hidden temple behind waterfall, mist, glowing magical energy'],
  ['Dragon Egg Chamber', 'ancient chamber with glowing dragon eggs, firelight, stone textures'],
  ['Moonlit Elven City', 'elegant elven city under moonlight, white stone architecture, glowing trees'],
].map(([name, description]) => ({
  title: `${name} - Fantasy Theme`,
  prompt: `epic fantasy artwork, ${description}, cinematic lighting, ultra detailed, magical atmosphere, high-end poster composition, 8k detail, rich colors, no people, no text, no watermark`,
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
  if (!imageUrl) throw new Error('No image URL returned')

  return imageUrl
}

async function uploadGeneratedImageToBlob(openAiUrl: string, title: string) {
  const imageResponse = await fetch(openAiUrl, { cache: 'no-store' })
  if (!imageResponse.ok) throw new Error(`Failed to download image: ${imageResponse.status}`)

  const contentType = imageResponse.headers.get('content-type') || 'image/png'
  const buffer = await imageResponse.arrayBuffer()

  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    buffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error('Blob upload failed')
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const tags = [
    THEME_TAG,
    'fantasy',
    'magic',
    'dragons',
    'epic',
    'wall-art',
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
          tags,
          status: 'PUBLISHED' as any,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: imageUrl,
          tags,
          status: 'PUBLISHED' as any,
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'theme-ai-generated',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const aiUrl = await generateOpenAiImageUrl(item.prompt)
      const blobUrl = await uploadGeneratedImageToBlob(aiUrl, item.title)
      const artworkId = await upsertArtwork(item, blobUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl: blobUrl,
      })
    } catch (err) {
      results.push({
        title: item.title,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Fantasy batch 1 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
