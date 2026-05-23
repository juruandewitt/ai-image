import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'music-performance'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Opera Singer Spotlight', 'opera singer performing under dramatic spotlight, grand stage, emotional expression'],
  ['Electric Bass Performance', 'bass guitarist performing on stage, deep lighting, concert atmosphere'],
  ['Cello Solo Stage', 'cellist performing solo on stage, elegant lighting, classical music mood'],
  ['Neon Synthwave Concert', 'futuristic synthwave concert, neon lights, electronic music stage'],
  ['Acoustic Guitar Session', 'acoustic guitarist performing intimate session, warm lighting, soft mood'],
  ['Gospel Choir Hall', 'large gospel choir singing in grand hall, powerful voices, spiritual atmosphere'],
  ['Saxophone Blue Light', 'saxophonist performing under blue lighting, jazz mood, smoky ambiance'],
  ['Concert Smoke Lasers', 'concert stage with lasers and smoke effects, crowd silhouettes, high energy'],
  ['Flamenco Dance Performance', 'flamenco dancer performing with guitarist, dramatic lighting, Spanish stage'],
  ['Grand Theater Orchestra', 'full orchestra in grand theater, cinematic lighting, luxury performance'],
].map(([name, description]) => ({
  title: `${name} - Music Performance Theme`,
  prompt: `premium music performance artwork, ${description}, ultra realistic, cinematic lighting, high detail, professional stage photography style, no text, no watermark`,
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

  if (!base64) throw new Error('No image returned')
  return Buffer.from(base64, 'base64')
}

async function uploadGeneratedImageToBlob(buffer: Buffer, title: string) {
  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    buffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
    }
  )

  if (!blob.url) throw new Error('Upload failed')
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
  const tags = [THEME_TAG, 'theme', 'music', 'performance', 'concert', 'wall-art']

  const existing = await prisma.artwork.findFirst({
    where: { title: item.title },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
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
      provider: 'openai',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const buffer = await generateOpenAiImageBuffer(item.prompt)
      const url = await uploadGeneratedImageToBlob(buffer, item.title)
      const id = await upsertArtwork(item, url)

      results.push({
        title: item.title,
        success: true,
        artworkId: id,
        imageUrl: url,
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
    message: 'Music Performance batch 2 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
