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
    'Obsidian Dragon Citadel',
    'massive obsidian fortress kingdom guarded by ancient dragons, volcanic mountains, royal towers and glowing lava rivers',
  ],
  [
    'Kingdom Of Silver Stars',
    'magnificent fantasy kingdom beneath a sky filled with silver stars, elegant palaces and celestial gardens',
  ],
  [
    'Crystal Phoenix Sanctuary',
    'legendary kingdom built around giant crystal phoenix monuments, radiant architecture and magical landscapes',
  ],
  [
    'Floating Isles Empire',
    'vast fantasy empire spread across floating islands connected by magical bridges above the clouds',
  ],
  [
    'Emerald Throne Kingdom',
    'royal fantasy kingdom featuring emerald castles, enchanted forests and majestic ceremonial avenues',
  ],
  [
    'Dragon Riders Capital',
    'epic capital city where dragon riders protect towering castles and magnificent fantasy architecture',
  ],
  [
    'Celestial Moon Kingdom',
    'beautiful moonlit kingdom with glowing towers, celestial magic and shimmering crystal waterways',
  ],
  [
    'Golden Griffin Realm',
    'prosperous fantasy realm protected by golden griffins, royal fortresses and luxurious palaces',
  ],
  [
    'Arcane Crystal Fortress',
    'ancient magical fortress kingdom powered by giant crystals and surrounded by enchanted mountains',
  ],
  [
    'Realm Of Eternal Dragons',
    'ultimate fantasy kingdom filled with dragon castles, magical wonders, royal cities and epic landscapes',
  ],
].map(([name, description]) => ({
  title: `${name} - Fantasy Kingdoms Theme`,
  prompt: `premium fantasy kingdoms digital artwork, ${description}, ultra realistic, cinematic lighting, luxury fantasy concept art, epic kingdom environment, masterpiece quality, highly detailed architecture, magical atmosphere, fantasy wall art, rich colors, no readable text, no logos, no watermark, no people`,
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

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const response = await fetch(
    'https://api.openai.com/v1/images/generations',
    {
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
    }
  )

  if (!response.ok) {
    const text = await response.text()
    throw new Error(
      `OpenAI image generation failed (${response.status}): ${text}`
    )
  }

  const data = await response.json()
  const base64 = data?.data?.[0]?.b64_json

  if (!base64 || typeof base64 !== 'string') {
    throw new Error('No base64 image returned from OpenAI')
  }

  return Buffer.from(base64, 'base64')
}

async function uploadGeneratedImageToBlob(
  imageBuffer: Buffer,
  title: string
) {
  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    imageBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    }
  )

  if (!blob.url) {
    throw new Error('Blob upload failed')
  }

  return blob.url
}

async function upsertArtwork(
  item: (typeof ITEMS)[number],
  imageUrl: string
) {
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
    where: {
      title: item.title,
    },
    select: {
      id: true,
    },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: {
          id: existing.id,
        },
        data: {
          artist: ARTIST,
          thumbnail: imageUrl,
          tags,
          status: 'PUBLISHED' as any,
        },
        select: {
          id: true,
        },
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
        select: {
          id: true,
        },
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

      const blobUrl = await uploadGeneratedImageToBlob(
        imageBuffer,
        item.title
      )

      const artworkId = await upsertArtwork(
        item,
        blobUrl
      )

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
        error:
          err instanceof Error
            ? err.message
            : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Fantasy Kingdoms batch 4 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
