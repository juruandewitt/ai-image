import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const THEME = 'spiritual-zen'
const THEME_TAG = `theme:${THEME}`
const ARTIST = 'AI Image'
const STYLE = 'MINIMALIST'

const ITEMS = [
  ['Zen Meditation Temple', 'peaceful zen meditation temple with natural wood architecture, tranquil atmosphere and soft morning light'],
  ['Buddha Garden Sanctuary', 'serene buddha garden sanctuary with stone paths, bamboo and calming spiritual energy'],
  ['Mountain Meditation Retreat', 'spiritual mountain meditation retreat surrounded by misty peaks and peaceful nature'],
  ['Zen Rock Garden', 'minimalist zen rock garden with carefully arranged stones, raked sand patterns and harmony'],
  ['Sacred Lotus Pond', 'sacred lotus pond with blooming flowers, reflective water and spiritual tranquility'],
  ['Forest Zen Path', 'peaceful forest zen walking path through ancient trees with calming atmosphere'],
  ['Spiritual Tea Ceremony', 'traditional spiritual tea ceremony setting with elegant simplicity and mindfulness'],
  ['Zen Waterfall Sanctuary', 'tranquil waterfall sanctuary surrounded by moss covered stones and meditation spaces'],
  ['Temple Courtyard Dawn', 'ancient temple courtyard at dawn with golden sunlight and peaceful spiritual ambiance'],
  ['Mindfulness Meditation Space', 'luxury mindfulness meditation space with natural materials and calming zen aesthetics'],
].map(([name, description]) => ({
  title: `${name} - Spiritual Zen Theme`,
  prompt: `premium spiritual zen artwork, ${description}, ultra realistic, peaceful atmosphere, luxury wellness aesthetic, calming colors, mindfulness, meditation, spiritual harmony, wall art quality, highly detailed, no text, no logos, no watermark, no people`,
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

  if (!base64) {
    throw new Error('No image returned')
  }

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
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          artist: ARTIST,
          style: STYLE as any,
          thumbnail: imageUrl,
          status: 'PUBLISHED' as any,
          price: 9.99,
          tags: [
            THEME_TAG,
            'spiritual',
            'zen',
            'meditation',
            'wellness',
            'mindfulness',
            'wall-art',
          ],
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
      const imageUrl = await uploadGeneratedImageToBlob(imageBuffer, item.title)
      const artworkId = await upsertArtwork(item, imageUrl)

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
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Spiritual Zen batch 1 complete',
    theme: THEME,
    count: ITEMS.length,
    results,
  })
}
