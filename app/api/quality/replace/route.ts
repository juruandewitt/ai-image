import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'animals-pets'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Shiba Inu Portrait', 'Shiba Inu portrait, warm studio light, curled tail, expressive face, premium pet photography mood'],
  ['Elegant Grey Cat', 'elegant grey cat sitting on soft fabric, green eyes, dramatic lighting, refined feline portrait'],
  ['Golden Puppy Close Up', 'golden puppy close-up, soft fur, bright eyes, warm cozy background, charming pet portrait'],
  ['Luxury Cat Window Seat', 'luxury cat window seat, fluffy cat resting, soft curtains, calm home interior atmosphere'],
  ['Dalmatian Studio Pose', 'Dalmatian studio pose, spotted coat detail, clean neutral background, elegant dog portrait'],
  ['Tiny Kitten Blanket', 'tiny kitten wrapped in soft blanket, warm daylight, cozy peaceful pet photography'],
  ['German Shepherd Hero Portrait', 'German shepherd hero portrait, strong posture, dramatic outdoor light, loyal expression'],
  ['White Cat Floral Scene', 'white cat among soft flowers, delicate light, elegant romantic pet portrait mood'],
  ['Pug Cozy Sofa', 'pug resting on cozy sofa, soft cushions, warm home lighting, charming animal portrait'],
  ['Australian Shepherd Sunset', 'Australian shepherd in field at sunset, colorful coat, golden light, joyful pet atmosphere'],
].map(([name, description]) => ({
  title: `${name} - Animals Pets Theme`,
  prompt: `premium animals and pets digital artwork, ${description}, ultra realistic, cinematic lighting, professional pet photography style, commercial wall art quality, rich detail, no readable text, no logos, no watermark, no people`,
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
    'animals',
    'pets',
    'dogs',
    'cats',
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
    message: 'Animals Pets batch 3 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
