import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'PICASSO'
const ARTIST = 'Pablo Picasso'

const ITEMS = [
  {
    title: 'Cubist Woman with Mirror in Picasso Style',
    prompt:
      'premium cubist-inspired portrait, fractured geometric female figure beside an angular mirror, multiple viewpoints, strong planes of color, expressive asymmetry, painterly texture, gallery-quality modernist composition, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Blue Period Guitarist Inspired in Picasso Style',
    prompt:
      'melancholic blue-period-inspired modernist painting, seated guitarist figure built from elongated angular forms, deep blue and muted teal palette, emotional atmosphere, simplified geometry, painterly texture, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Three Musicians Inspired Cubist Scene in Picasso Style',
    prompt:
      'cubist-inspired scene of three abstract musicians, fragmented instruments, angular overlapping shapes, warm ochre, black, cream, and deep red palette, rhythmic geometry, high-end modernist painting, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Harlequin Studio Composition in Picasso Style',
    prompt:
      'cubist-inspired studio scene with harlequin motifs, diamond patterns, abstract seated figure, fractured table and instrument forms, sophisticated muted colors, painterly modernist texture, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Cubist Still Life with Guitar in Picasso Style',
    prompt:
      'premium cubist still life, fragmented guitar, bottle, fruit bowl, newspaper-like abstract planes without readable text, layered beige, charcoal, ochre, and muted blue tones, collage-inspired geometry, museum-quality painting, no text',
  },
  {
    title: 'Fragmented Portrait in Rose and Blue in Picasso Style',
    prompt:
      'cubist-inspired portrait with fractured face, one eye in profile and one frontal, rose and blue palette, angular planes, expressive modernist distortion, elegant gallery composition, painterly texture, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Cubist Bull and Moon Composition in Picasso Style',
    prompt:
      'cubist-inspired symbolic composition with abstract bull form beneath a pale moon, fractured black, cream, ochre, and blue planes, bold modernist geometry, dramatic but refined, painterly texture, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Abstract Studio with Mandolin in Picasso Style',
    prompt:
      'cubist-inspired interior studio, abstract figure with mandolin, angular table, window, and patterned wall, overlapping viewpoints, muted ochre, olive, cream, black, and blue palette, high-end modernist painting, no text',
  },
  {
    title: 'Cubist Mother and Child Composition in Picasso Style',
    prompt:
      'cubist-inspired mother and child composition, tender figures simplified into soft angular planes, muted rose, blue, cream, and warm gray palette, emotional modernist painting, painterly texture, no text, no direct copy of any existing artwork',
  },
  {
    title: 'Monumental Cubist Interior in Picasso Style',
    prompt:
      'large-scale cubist-inspired interior, fragmented architectural planes, abstract figures, dynamic angular composition, muted modernist palette with black, ochre, cream, blue, and terracotta, museum-quality painting, no text, no direct copy of any existing artwork',
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
    `artworks/picasso/${safeFilePart(title)}-quality-generated.png`,
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
    message: 'Picasso inspired top 10 replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
