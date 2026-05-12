import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'architecture'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Art Deco Tower Lobby', 'grand Art Deco tower lobby, polished stone, brass details, warm symmetrical lighting'],
  ['Desert Concrete Chapel', 'minimal concrete chapel in desert, simple geometric form, warm sunset shadows'],
  ['Futuristic Library Atrium', 'futuristic library atrium with sweeping shelves, glass roof, soft daylight'],
  ['Glass Bridge House', 'modern glass house connected by transparent bridge, forest setting, clean reflections'],
  ['Marble Hotel Lobby', 'luxury marble hotel lobby, high ceiling, warm ambient light, elegant interior design'],
  ['Geometric Apartment Facade', 'modern apartment facade with geometric balconies, crisp shadows, urban design'],
  ['Mountain Glass Cabin', 'small glass cabin in mountain landscape, warm interior glow, cinematic dusk'],
  ['Museum Courtyard Shadows', 'modern museum courtyard with stone walls, long shadows, minimal architectural forms'],
  ['Tropical Concrete Villa', 'modern concrete villa in tropical setting, open-air design, lush greenery'],
  ['Golden Opera Hall', 'grand opera hall interior, gold detailing, curved balconies, dramatic warm lighting'],
].map(([name, description]) => ({
  title: `${name} - Architecture Theme`,
  prompt: `premium architectural photography and design artwork, ${description}, refined composition, high-end real estate and interior design aesthetic, cinematic lighting, ultra detailed, commercial wall art quality, no people, no readable text, no logos, no watermark`,
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
    'theme',
    'architecture',
    'interior-design',
    'real-estate',
    'modern',
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
    message: 'Architecture batch 3 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
