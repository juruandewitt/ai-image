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
  ['Concert Stage Lights', 'live concert stage with dramatic lighting, crowd silhouettes, high energy performance'],
  ['Rock Guitar Solo', 'electric guitarist performing solo, stage lights, motion blur, powerful expression'],
  ['Piano Performance Spotlight', 'grand piano performance under spotlight, elegant atmosphere, dark stage'],
  ['DJ Nightclub Set', 'dj performing in nightclub, neon lights, crowd energy, futuristic vibe'],
  ['Orchestra Symphony Scene', 'full orchestra performing in concert hall, cinematic lighting, classical music'],
  ['Jazz Club Session', 'jazz band in intimate club, warm lighting, saxophone focus, moody ambiance'],
  ['Singer Microphone Close Up', 'vocalist singing into microphone, emotional performance, stage lighting'],
  ['Festival Crowd Energy', 'music festival crowd jumping, lights and smoke, energetic atmosphere'],
  ['Violin Solo Performance', 'violinist performing solo on stage, elegant lighting, classical mood'],
  ['Drummer Action Shot', 'drummer mid performance, drum kit motion, dynamic lighting, high energy'],
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
    message: 'Music Performance batch 1 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
