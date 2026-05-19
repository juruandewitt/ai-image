import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'ocean-marine'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Golden Beach Tide', 'golden beach tide rolling over wet sand, warm sunset reflections, peaceful luxury coastal mood'],
  ['Deep Blue Octopus', 'octopus moving through deep blue ocean, elegant tentacles, soft light beams, mysterious marine atmosphere'],
  ['Tropical Reef Arch', 'natural coral reef arch underwater, turquoise water, colorful coral, bright sun rays'],
  ['Sunset Sailing Regatta', 'distant sailing regatta at sunset, calm ocean, golden sky, elegant marine composition'],
  ['Underwater Kelp Forest', 'underwater kelp forest, green-gold light, swaying kelp, peaceful ocean depth'],
  ['Glowing Plankton Shore', 'night shoreline glowing with bioluminescent plankton, deep blue water, magical coastal light'],
  ['Dramatic Black Sand Beach', 'dramatic black sand beach, powerful waves, volcanic cliffs, moody cinematic sky'],
  ['Coral Reef Turtle Family', 'sea turtles swimming through coral reef, clear blue water, warm sunlight, peaceful marine life'],
  ['Ocean Cave Waterfall', 'hidden ocean cave with waterfall falling into turquoise sea, glowing rock walls, cinematic light'],
  ['Sapphire Lagoon Cliffs', 'sapphire blue lagoon beneath tall tropical cliffs, clear water, soft sunlight, luxury travel aesthetic'],
].map(([name, description]) => ({
  title: `${name} - Ocean Marine Theme`,
  prompt: `premium ocean and marine digital artwork, ${description}, cinematic lighting, ultra detailed, commercial wall art quality, rich natural color, peaceful luxury aesthetic, no people, no boats with logos, no text, no watermark`,
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

async function generateOpenAiImageBuffer(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size: '1024x1024',
      quality: 'medium',
      n: 1,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI image generation failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  const base64 = data?.data?.[0]?.b64_json

  if (!base64 || typeof base64 !== 'string') {
    throw new Error('No base64 image returned from OpenAI')
  }

  return Buffer.from(base64, 'base64')
}

async function uploadGeneratedImageToBlob(imageBuffer: Buffer, title: string) {
  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    imageBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    }
  )

  if (!blob.url) throw new Error('Blob upload failed')
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const tags = [
    THEME_TAG,
    'theme',
    'ocean',
    'marine',
    'sea',
    'underwater',
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
      provider: 'openai-gpt-image-1',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const imageBuffer = await generateOpenAiImageBuffer(item.prompt)
      const blobUrl = await uploadGeneratedImageToBlob(imageBuffer, item.title)
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
    message: 'Ocean Marine batch 4 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
