import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'health-wellness'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Luxury Massage Room', 'luxury massage room, soft towels, warm candles, natural stone textures, peaceful spa atmosphere'],
  ['Morning Wellness Kitchen', 'morning wellness kitchen, fresh fruit, herbal tea, natural light, calm healthy lifestyle mood'],
  ['Calm Breathing Space', 'calm breathing space, floor cushions, soft curtains, warm sunlight, peaceful mindfulness setting'],
  ['Spa Pool Sanctuary', 'spa pool sanctuary, warm water, soft steam, stone walls, luxury wellness retreat atmosphere'],
  ['Herbal Apothecary Shelf', 'herbal apothecary shelf, glass jars, dried herbs, warm natural light, holistic wellness mood'],
  ['Minimalist Fitness Room', 'minimalist fitness room, yoga mats, soft daylight, clean neutral tones, premium wellness space'],
  ['Wellness Garden Patio', 'wellness garden patio, lounge chairs, plants, natural textures, peaceful outdoor retreat'],
  ['Aromatherapy Candles', 'aromatherapy candles, essential oil bottles, soft glow, spa stones, relaxing self-care scene'],
  ['Healthy Breakfast Tray', 'healthy breakfast tray, fruit, tea, oats, linen bedding, soft morning wellness light'],
  ['Peaceful Bath Ritual', 'peaceful bath ritual, luxury bathtub, candles, flowers, soft steam, calm spa mood'],
].map(([name, description]) => ({
  title: `${name} - Health Wellness Theme`,
  prompt: `premium health and wellness digital artwork, ${description}, ultra realistic, cinematic natural lighting, peaceful luxury lifestyle photography style, commercial wall art quality, rich detail, no readable text, no logos, no watermark, no people`,
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
    'health',
    'wellness',
    'spa',
    'fitness',
    'mindfulness',
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
    message: 'Health Wellness batch 2 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
