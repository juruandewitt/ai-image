```ts
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
    'Dragonspire Royal City',
    'legendary royal city built around an enormous dragonspire tower with magical energy flowing through the kingdom',
  ],
  [
    'Silver Moon Elven Kingdom',
    'beautiful elven kingdom illuminated by silver moonlight with elegant towers and enchanted forests',
  ],
  [
    'Golden Griffin Citadel',
    'majestic griffin citadel overlooking vast fantasy lands with noble architecture and magical skies',
  ],
  [
    'Floating Crystal Kingdom',
    'spectacular floating kingdom made of crystal islands suspended among glowing clouds',
  ],
  [
    'Arcane Wizard Capital',
    'grand capital city of powerful wizards featuring magical academies and enchanted towers',
  ],
  [
    'Emerald Dragon Valley',
    'lush fantasy valley protected by emerald dragons with magnificent castles and rivers',
  ],
  [
    'Sunfire Palace Realm',
    'radiant fantasy palace kingdom glowing with golden sunlight and magical prosperity',
  ],
  [
    'Celestial Sky Fortress',
    'massive fortress floating high above the clouds with celestial architecture and magical defenses',
  ],
  [
    'Kingdom Of Enchanted Rivers',
    'prosperous fantasy kingdom connected by magical rivers and magnificent bridges',
  ],
  [
    'Crystal Dragon Throne',
    'epic royal throne city built from crystal and guarded by ancient dragons',
  ],
].map(([name, description]) => ({
  title: `${name} - Fantasy Kingdoms Theme`,
  prompt: `premium fantasy kingdoms digital artwork, ${description}, ultra realistic, cinematic fantasy lighting, epic world building, luxury fantasy architecture, magical atmosphere, highly detailed, masterpiece quality, fantasy wall art, no readable text, no logos, no watermark, no people`,
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

  if (!base64) {
    throw new Error('No image returned from OpenAI')
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

  return blob.url
}

async function upsertArtwork(
  item: (typeof ITEMS)[number],
  imageUrl: string
) {
  const tags = [
    THEME_TAG,
    'fantasy',
    'kingdoms',
    'magic',
    'castles',
    'dragons',
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
          thumbnail: imageUrl,
          tags,
        },
        select: {
          id: true,
        },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          artist: ARTIST,
          style: STYLE as any,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
          price: 9.99,
          tags,
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

      const imageUrl = await uploadGeneratedImageToBlob(
        imageBuffer,
        item.title
      )

      const artworkId = await upsertArtwork(
        item,
        imageUrl
      )

      results.push({
        title: item.title,
        success: true,
        artworkId,
        imageUrl,
      })
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Fantasy Kingdoms batch 2 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
```
