import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'luxury-lifestyle'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Luxury Cigar Lounge', 'luxury cigar lounge, leather chairs, dark wood, warm amber light, premium private club atmosphere'],
  ['Gold Jewelry Display', 'gold jewelry display on black velvet, dramatic highlights, premium luxury product photography'],
  ['Private Cinema Room', 'private luxury cinema room, plush seating, soft wall lighting, elegant entertainment space'],
  ['Luxury Watch Collection', 'luxury watch collection displayed in glass case, polished metal, refined lighting'],
  ['Coastal Villa Breakfast', 'coastal villa breakfast table, ocean view, fresh fruit, white linen, soft morning light'],
  ['Penthouse Wardrobe', 'penthouse wardrobe with designer clothing, warm lighting, marble and wood finishes, premium mood'],
  ['Spa Stone Massage Room', 'spa stone massage room, candles, towels, natural stone, soft peaceful luxury light'],
  ['Champagne On Yacht', 'champagne glasses on yacht table, ocean sunset, elegant deck details, premium lifestyle scene'],
  ['Designer Shoe Display', 'designer shoe display, polished floor, soft spotlight, elegant fashion retail mood'],
  ['Luxury Fireplace Lounge', 'luxury fireplace lounge, velvet seating, marble fireplace, warm sophisticated evening atmosphere'],
].map(([name, description]) => ({
  title: `${name} - Luxury Lifestyle Theme`,
  prompt: `premium luxury lifestyle digital artwork, ${description}, ultra realistic, cinematic lighting, high-end editorial photography style, commercial wall art quality, rich detail, no readable text, no logos, no watermark, no people`,
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
    'luxury',
    'lifestyle',
    'premium',
    'editorial',
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
    message: 'Luxury Lifestyle batch 3 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
