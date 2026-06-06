import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'kids-nursery'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Pastel Balloon Nursery', 'pastel balloon themed nursery, soft colors, cozy crib, cheerful child-friendly interior'],
  ['Woodland Fox Room', 'woodland fox themed nursery, forest decor, warm wood accents, cozy reading corner'],
  ['Cloud Reading Nook', 'cloud themed reading nook for children, soft cushions, gentle daylight, dreamy atmosphere'],
  ['Rainbow Play Corner', 'rainbow play corner, pastel toys, bright cheerful nursery design, soft textures'],
  ['Baby Elephant Nursery', 'baby elephant nursery decor, neutral palette, cute wall art, peaceful room atmosphere'],
  ['Starry Night Kids Room', 'starry night themed kids room, glowing decor, soft blue tones, magical bedtime mood'],
  ['Bunny Nursery Scene', 'bunny themed nursery, cozy blankets, pastel colors, charming baby room design'],
  ['Adventure Explorer Room', 'kids explorer themed room, maps, soft adventure decor, warm family atmosphere'],
  ['Hot Air Balloon Nursery', 'hot air balloon nursery decor, soft clouds, gentle pastel palette, whimsical child room'],
  ['Scandinavian Toy Corner', 'Scandinavian toy corner, wooden toys, minimalist nursery styling, soft natural light'],
].map(([name, description]) => ({
  title: `${name} - Kids Nursery Theme`,
  prompt: `premium kids and nursery digital artwork, ${description}, ultra realistic, cinematic soft lighting, luxury nursery interior photography, commercial wall art quality, rich detail, child-friendly, no readable text, no logos, no watermark, no people`,
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
    'kids',
    'nursery',
    'children',
    'baby-room',
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
    message: 'Kids Nursery batch 2 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
