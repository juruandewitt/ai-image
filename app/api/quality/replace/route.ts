import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'POLLOCK'
const ARTIST = 'Jackson Pollock'

const ITEMS = [
  {
    title: 'Autumn Rhythm in Pollock Style',
    prompt:
      'Large abstract expressionist drip painting inspired by Jackson Pollock action painting, dense rhythmic web of black, white, tan, and earthy brown enamel-like paint lines over raw canvas, layered splatters, poured paint trails, physical paint texture, chaotic but balanced all-over composition, no figures, no objects, no text.',
  },
  {
    title: 'Lavender Mist in Pollock Style',
    prompt:
      'Abstract expressionist all-over drip painting inspired by Jackson Pollock, pale lavender, smoky gray, white, black, and muted beige paint splatters, fine tangled skeins of poured paint, atmospheric layered mist effect, real wet paint texture, no figures, no objects, no text.',
  },
  {
    title: 'Blue Poles in Pollock Style',
    prompt:
      'Abstract expressionist drip painting inspired by Jackson Pollock with strong vertical blue pole-like accents, chaotic networks of black, white, orange, yellow, and blue poured paint, energetic layered splatter, raw canvas texture, gallery-grade action painting, no figures, no objects, no text.',
  },
  {
    title: 'Convergence in Pollock Style',
    prompt:
      'High-energy abstract expressionist drip painting inspired by Jackson Pollock, dense multicolored poured paint lines in red, yellow, black, white, blue, and green, explosive all-over composition, layered enamel splatter texture, dynamic motion, no figures, no objects, no text.',
  },
  {
    title: 'Mural in Pollock Style',
    prompt:
      'Large horizontal abstract expressionist painting inspired by Jackson Pollock mural-scale action painting, sweeping rhythmic vertical and diagonal strokes, black and white structure with muted red, yellow, blue, and earthy tones, energetic all-over movement, layered paint texture, no figures, no objects, no text.',
  },
  {
    title: 'Drip Composition in Pollock Style',
    prompt:
      'Pure Jackson Pollock inspired drip composition, thick and thin poured paint lines, black white tan and ochre splatters, dense overlapping network, raw physical enamel paint texture on canvas, balanced chaos, no recognizable objects, no figures, no text.',
  },
  {
    title: 'Action Painting in Pollock Style',
    prompt:
      'Authentic abstract expressionist action painting inspired by Jackson Pollock, aggressive thrown and poured paint, rapid gestures, dense layered splatter, black white red yellow and blue accents, tactile paint buildup, no figures, no objects, no text.',
  },
  {
    title: 'Splatter Field in Pollock Style',
    prompt:
      'All-over abstract splatter field inspired by Jackson Pollock, fine webs of black and white paint over warm beige canvas, scattered red and yellow accents, realistic fluid drips and splashes, high-detail paint texture, no figures, no objects, no text.',
  },
  {
    title: 'Black and White Energy in Pollock Style',
    prompt:
      'Minimal black and white abstract expressionist drip painting inspired by Jackson Pollock, dense energetic web of poured black enamel over white and raw canvas, splatters and looping trails, intense motion and texture, no figures, no objects, no text.',
  },
  {
    title: 'Dynamic Color Field in Pollock Style',
    prompt:
      'Dynamic abstract expressionist color field inspired by Jackson Pollock, layered poured paint lines in black, white, blue, red, yellow, and tan, chaotic all-over balance, realistic splatter physics, wet enamel texture, no figures, no objects, no text.',
  },
]

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
    `artworks/pollock/${safeFilePart(title)}-quality-generated.png`,
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
    where: {
      title: item.title,
      style: STYLE as any,
    },
    select: { id: true },
  })

  const artwork = existing
    ? await prisma.artwork.update({
        where: { id: existing.id },
        data: {
          artist: ARTIST,
          thumbnail: imageUrl,
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
          status: 'PUBLISHED' as any,
          tags: [],
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'ai-quality-generated-blob',
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
    message: 'Pollock generated top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
