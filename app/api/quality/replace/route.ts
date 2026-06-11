import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'fantasy-kingdoms'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  [
    'Dragonstone Sky Kingdom',
    'majestic fantasy kingdom built upon floating dragonstone islands above the clouds with golden bridges and royal towers',
  ],
  [
    'Moonlit Elven Palace',
    'elegant elven palace illuminated by moonlight deep within an enchanted silver forest',
  ],
  [
    'Kingdom Of Crystal Dragons',
    'vast fantasy kingdom protected by magnificent crystal dragons and glittering crystal castles',
  ],
  [
    'Emerald Crown Capital',
    'luxurious emerald fantasy capital city surrounded by magical forests and shining rivers',
  ],
  [
    'Celestial Griffin Fortress',
    'legendary mountain fortress guarded by celestial griffins beneath radiant heavenly skies',
  ],
  [
    'Arcane Sapphire Kingdom',
    'powerful magical kingdom built from sapphire towers glowing with ancient arcane energy',
  ],
  [
    'Golden Phoenix Empire',
    'magnificent fantasy empire inspired by golden phoenixes with ornate palaces and glowing gardens',
  ],
  [
    'Kingdom Above The Clouds',
    'floating fantasy kingdom suspended high above the clouds with grand castles and endless sky vistas',
  ],
  [
    'Mystic Dragon Throne Hall',
    'legendary royal throne hall decorated with ancient dragon statues and magical treasures',
  ],
  [
    'Realm Of Eternal Magic',
    'ultimate fantasy kingdom overflowing with magical architecture enchanted landscapes and wonder',
  ],
].map(([name, description]) => ({
  title: `${name} - Fantasy Kingdoms Theme`,
  prompt: `premium fantasy kingdoms digital artwork, ${description}, ultra realistic, cinematic lighting, epic fantasy environment, luxury concept art quality, highly detailed architecture, magical atmosphere, masterpiece, fantasy wall art, rich colors, no readable text, no logos, no watermark, no people`,
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
    'fantasy',
    'kingdoms',
    'dragons',
    'magic',
    'castles',
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
    message: 'Fantasy Kingdoms batch 3 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
