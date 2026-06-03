import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'vintage-retro'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'POLLOCK'

const ITEMS = [
  ['Retro Neon Sign Alley', 'retro neon sign alley at night, glowing signage, wet pavement reflections, nostalgic urban mood'],
  ['Vintage Travel Posters Wall', 'wall of vintage travel posters, warm tones, nostalgic design aesthetic, curated gallery style'],
  ['Classic Bicycle Street Scene', 'classic bicycle parked on cobblestone street, warm sunset light, nostalgic European vibe'],
  ['Retro Office Workspace', 'retro office workspace, typewriter, papers, warm desk lamp, vintage productivity atmosphere'],
  ['Vintage Perfume Vanity', 'vintage perfume bottles on vanity table, mirror reflections, soft lighting, elegant nostalgic mood'],
  ['Old Cinema Projection Room', 'old cinema projection room, film reels, warm projector light beams, nostalgic film atmosphere'],
  ['Retro Gas Pump Close Up', 'retro gas pump close-up, chrome details, faded colors, nostalgic roadside aesthetic'],
  ['Vintage Train Luggage Cart', 'vintage train luggage cart with leather bags, station lighting, nostalgic travel scene'],
  ['Classic Café Window Scene', 'classic café window scene, warm interior lights, street reflections, nostalgic European charm'],
  ['Retro Fashion Boutique', 'retro fashion boutique interior, mannequins, vintage clothing textures, warm nostalgic lighting'],
].map(([name, description]) => ({
  title: `${name} - Vintage Retro Theme`,
  prompt: `premium vintage and retro digital artwork, ${description}, ultra realistic, cinematic lighting, nostalgic aesthetic, professional photography style, commercial wall art quality, rich detail, no readable text, no logos, no watermark, no people`,
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
    'vintage',
    'retro',
    'nostalgia',
    'classic',
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
    message: 'Vintage Retro batch 4 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
