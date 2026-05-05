import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'space-universe'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'

const ITEMS = [
  'Nebula Dreamscape',
  'Galaxy Core',
  'Deep Space Horizon',
  'Cosmic Storm',
  'Planetary Rings',
].map((name) => ({
  title: `${name} - Space Universe Theme`,
  prompt: `premium cinematic space artwork, ${name}, ultra detailed, deep cosmic atmosphere, dramatic lighting, vibrant nebula colors, high-end digital art, commercial poster quality, no text, no watermark`,
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

async function generateOpenAiImageUrl(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
      n: 1,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`OpenAI image generation failed (${response.status}): ${text}`)
  }

  const data = await response.json()
  const imageUrl = data?.data?.[0]?.url
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('No image URL returned from OpenAI')
  }

  return imageUrl
}

async function uploadGeneratedImageToBlob(openAiUrl: string, title: string) {
  const imageResponse = await fetch(openAiUrl, { cache: 'no-store' })
  if (!imageResponse.ok) {
    throw new Error(`Failed to download generated image: ${imageResponse.status}`)
  }

  const contentType = imageResponse.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageResponse.arrayBuffer()

  const blob = await put(
    `artworks/themes/${THEME}/${safeFilePart(title)}.png`,
    arrayBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${title}`)
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], imageUrl: string) {
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
          status: 'PUBLISHED' as any,
          tags: [THEME_TAG, 'space', 'universe', 'galaxy', 'sci-fi', 'wallpaper'],
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: 'ABSTRACT' as any,
          artist: ARTIST,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
          tags: [THEME_TAG, 'space', 'universe', 'galaxy', 'sci-fi', 'wallpaper'],
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'theme-ai-generated-blob',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const openAiUrl = await generateOpenAiImageUrl(item.prompt)
      const imageUrl = await uploadGeneratedImageToBlob(openAiUrl, item.title)
      const artworkId = await upsertArtwork(item, imageUrl)

      results.push({ title: item.title, success: true, artworkId, imageUrl })
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Space & Universe theme batch 1 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
