import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'food-culinary'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Luxury Pancake Stack', 'luxury pancake stack with berries, maple syrup, butter, soft morning light, elegant breakfast styling'],
  ['Gourmet Risotto Plate', 'gourmet risotto plate, parmesan, herbs, creamy texture, refined restaurant plating'],
  ['Elegant Fruit Tartlet', 'elegant fruit tartlet, glossy berries, pastry cream, delicate dessert presentation'],
  ['Fine Dining Scallops', 'fine dining scallops, golden sear, delicate sauce, herbs, luxury restaurant plating'],
  ['Rustic Italian Table', 'rustic Italian table, pasta, tomatoes, basil, olive oil, warm countryside dining atmosphere'],
  ['Colorful Poke Bowl', 'colorful poke bowl, fresh fish, rice, avocado, vegetables, clean modern food styling'],
  ['Artisan Chocolate Box', 'artisan chocolate box, assorted luxury chocolates, dark background, premium texture'],
  ['Premium Coffee Beans', 'premium coffee beans close-up, rich brown tones, rustic scoop, warm cafe lighting'],
  ['Grilled Vegetable Platter', 'grilled vegetable platter, colorful vegetables, herbs, olive oil, elegant rustic plating'],
  ['Luxury Macaron Display', 'luxury macaron display, pastel colors, elegant patisserie styling, soft dessert light'],
].map(([name, description]) => ({
  title: `${name} - Food Culinary Theme`,
  prompt: `premium food and culinary photography, ${description}, ultra realistic, editorial restaurant quality, rich texture, appetizing composition, cinematic lighting, commercial wall art quality, no people, no text, no logos, no watermark`,
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
    'food',
    'culinary',
    'restaurant',
    'gourmet',
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
    message: 'Food Culinary batch 4 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
