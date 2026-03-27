import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE_LABELS: Record<string, string> = {
  VAN_GOGH: 'Van Gogh',
  DALI: 'Dalí',
  POLLOCK: 'Jackson Pollock',
  VERMEER: 'Johannes Vermeer',
  MONET: 'Claude Monet',
  PICASSO: 'Pablo Picasso',
  REMBRANDT: 'Rembrandt',
  CARAVAGGIO: 'Caravaggio',
  DA_VINCI: 'Leonardo da Vinci',
  MICHELANGELO: 'Michelangelo',
}

const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

type Input = {
  title: string
  style: string
  prompt: string
}

function normalizeInput(input: Partial<Input>): Input {
  return {
    title: String(input.title || '').trim(),
    style: String(input.style || '').trim().toUpperCase(),
    prompt: String(input.prompt || '').trim(),
  }
}

function isUsableSrc(value?: string | null) {
  if (!value) return false
  const src = value.trim()
  if (!src) return false

  const lower = src.toLowerCase()
  if (lower.includes('placeholder')) return false
  if (lower.includes('no-image')) return false
  if (lower.includes('no%20image')) return false
  if (lower.startsWith('data:image/svg+xml')) return false

  return true
}

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

async function generateOpenAiImageUrl(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const res = await fetch('https://api.openai.com/v1/images/generations', {
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

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAI image generation failed (${res.status}): ${text}`)
  }

  const data = await res.json()
  const imageUrl = data?.data?.[0]?.url

  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('No image URL returned from OpenAI')
  }

  return imageUrl
}

async function uploadImageToBlob(openAiUrl: string, style: string, title: string) {
  const imageRes = await fetch(openAiUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    const text = await imageRes.text().catch(() => '')
    throw new Error(`Failed to download generated image (${imageRes.status}): ${text}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const path = `artworks/${safeFilePart(style)}/${safeFilePart(title)}.png`

  const blob = await put(path, arrayBuffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  })

  if (!blob?.url) {
    throw new Error('Failed to upload generated image to Vercel Blob')
  }

  return blob.url
}

async function ensureArtworkHasImageData(
  artworkId: string,
  stableImageUrl: string,
  prompt: string
) {
  const existingArtwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    select: {
      id: true,
      thumbnail: true,
      assets: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          originalUrl: true,
        },
      },
    },
  })

  if (!existingArtwork) return

  const needsThumbnail = !isUsableSrc(existingArtwork.thumbnail)
  const hasUsableAsset = existingArtwork.assets.some((a) => isUsableSrc(a.originalUrl))
  const needsAsset = !hasUsableAsset

  if (needsThumbnail) {
    await prisma.artwork.update({
      where: { id: artworkId },
      data: {
        thumbnail: stableImageUrl,
      },
    })
  }

  if (needsAsset) {
    await prisma.asset.create({
      data: {
        artworkId,
        originalUrl: stableImageUrl,
        provider: DEFAULT_ASSET_PROVIDER,
        prompt,
      },
    })
  }
}

async function handleGenerate(input: Input) {
  const { title, style, prompt } = input

  if (!title) {
    return NextResponse.json({ ok: false, error: 'Missing title' }, { status: 400 })
  }

  if (!style) {
    return NextResponse.json({ ok: false, error: 'Missing style' }, { status: 400 })
  }

  if (!prompt) {
    return NextResponse.json({ ok: false, error: 'Missing prompt' }, { status: 400 })
  }

  if (!STYLE_LABELS[style]) {
    return NextResponse.json(
      { ok: false, error: `Unsupported style: ${style}` },
      { status: 400 }
    )
  }

  const existing = await prisma.artwork.findFirst({
    where: {
      title,
      style: style as any,
    },
    select: {
      id: true,
      title: true,
      style: true,
      artist: true,
      thumbnail: true,
      price: true,
      assets: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          originalUrl: true,
        },
      },
    },
  })

  if (existing) {
    const usableExistingSrc =
      (isUsableSrc(existing.thumbnail) && existing.thumbnail) ||
      existing.assets.find((a) => isUsableSrc(a.originalUrl))?.originalUrl ||
      null

    if (usableExistingSrc) {
      await ensureArtworkHasImageData(existing.id, usableExistingSrc, prompt)
    }

    const refreshed = await prisma.artwork.findUnique({
      where: { id: existing.id },
      select: {
        id: true,
        title: true,
        style: true,
        artist: true,
        thumbnail: true,
        price: true,
        assets: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            originalUrl: true,
          },
        },
      },
    })

    return NextResponse.json({
      ok: true,
      reused: true,
      artwork: refreshed,
    })
  }

  // 1) Generate temporary OpenAI URL
  const openAiUrl = await generateOpenAiImageUrl(prompt)

  // 2) Copy image into stable Vercel Blob storage
  const stableImageUrl = await uploadImageToBlob(openAiUrl, style, title)

  // 3) Create artwork using stable URL
  const artwork = await prisma.artwork.create({
    data: {
      title,
      style: style as any,
      artist: STYLE_LABELS[style],
      thumbnail: stableImageUrl,
      status: 'PUBLISHED' as any,
      tags: [],
      price: 9.99,
    },
    select: {
      id: true,
      title: true,
      style: true,
      artist: true,
      thumbnail: true,
      price: true,
    },
  })

  // 4) Create linked asset record using stable URL
  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: stableImageUrl,
      provider: DEFAULT_ASSET_PROVIDER,
      prompt,
    },
  })

  const artworkWithAssets = await prisma.artwork.findUnique({
    where: { id: artwork.id },
    select: {
      id: true,
      title: true,
      style: true,
      artist: true,
      thumbnail: true,
      price: true,
      assets: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          originalUrl: true,
        },
      },
    },
  })

  return NextResponse.json({
    ok: true,
    artwork: artworkWithAssets,
  })
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)

    const input = normalizeInput({
      title: url.searchParams.get('title') || '',
      style: url.searchParams.get('style') || '',
      prompt: url.searchParams.get('prompt') || '',
    })

    return await handleGenerate(input)
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = normalizeInput(body || {})
    return await handleGenerate(input)
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
