import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'seasonal-holidays'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Cozy Winter Fireplace', 'cozy winter fireplace with blankets, candles, warm lights and peaceful seasonal comfort'],
  ['Luxury Christmas Staircase', 'luxury christmas staircase with garlands, ornaments, warm lights and elegant holiday decor'],
  ['Spring Easter Table', 'spring easter table setting with flowers, pastel decorations and fresh seasonal elegance'],
  ['Halloween Candle Display', 'halloween candle display with pumpkins, autumn leaves and atmospheric seasonal lighting'],
  ['New Year Champagne Scene', 'new year champagne celebration scene with sparkling lights and luxury festive styling'],
  ['Autumn Forest Path', 'beautiful autumn forest path with golden leaves, soft light and peaceful seasonal atmosphere'],
  ['Valentines Luxury Suite', 'valentines luxury suite with roses, candles and romantic seasonal interior styling'],
  ['Snowy Winter Lake', 'snowy winter lake surrounded by pine trees, soft morning light and calm seasonal beauty'],
  ['Holiday Wreath Doorway', 'elegant holiday doorway with festive wreath, warm lights and luxury seasonal charm'],
  ['Spring Picnic Celebration', 'spring picnic celebration with flowers, soft blankets and joyful seasonal colors'],
].map(([name, description]) => ({
  title: `${name} - Seasonal Holidays Theme`,
  prompt: `premium seasonal holiday digital artwork, ${description}, ultra realistic, cinematic lighting, luxury festive aesthetic, commercial wall art quality, rich detail, vibrant seasonal colors, holiday celebration, no readable text, no logos, no watermark, no people`,
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
    'seasonal',
    'holidays',
    'festive',
    'celebration',
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
    message: 'Seasonal Holidays batch 3 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
