import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'wildlife'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Kudu Antelope Majesty', 'kudu antelope with spiral horns, warm African bush background, golden rim light'],
  ['Meerkat Sunset Silhouette', 'meerkat silhouette on desert ridge, orange sunset sky, clean minimal composition'],
  ['African Wild Dog Pack', 'African wild dog pack in dry grassland, painted coat patterns, warm natural light'],
  ['Flamingo Flight Glow', 'flamingos flying over reflective water, coral pink wings, soft sunrise glow'],
  ['Elephant Portrait in Dust', 'close elephant portrait, textured skin, soft dust cloud, warm golden light'],
  ['Lioness Savannah Focus', 'lioness walking through dry savannah grass, focused eyes, cinematic low light'],
  ['Kingfisher Jewel Perch', 'kingfisher bird on branch, electric blue and orange feathers, soft river background'],
  ['Whale Tail at Sunset', 'large whale tail above ocean surface, sunset reflections, dramatic sea spray'],
  ['Zebra Portrait Contrast', 'zebra close portrait, strong black and white stripe pattern, clean dark background'],
  ['Pangolin Forest Floor', 'pangolin walking on forest floor, detailed scales, warm earthy light'],
].map(([name, description]) => ({
  title: `${name} - Wildlife Theme`,
  prompt: `ultra high-end wildlife photography, ${description}, 60 percent photorealistic and 40 percent cinematic, highly detailed fur feathers skin scales and textures, dramatic lighting, professional composition, premium wall art, no text, no watermark`,
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
    'wildlife',
    'animals',
    'nature',
    'wall-art',
    'decor',
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
    message: 'Wildlife final batch complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
