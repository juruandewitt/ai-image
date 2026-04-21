import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'MICHELANGELO'
const ARTIST = 'Michelangelo'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const ARTWORK_TITLE = 'The Creation of Adam in Michelangelo Style'
const SAFE_GENERATION_PROMPT =
  'Renaissance fresco ceiling scene with two monumental reaching hands, dramatic Michelangelo-inspired composition, monumental anatomy implied through drapery, divine atmosphere, chapel ceiling painting, powerful sculptural forms, high renaissance masterpiece'

function safeFilePart(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function isStableBlobSrc(value?: string | null) {
  if (!value) return false
  return value.toLowerCase().includes('.public.blob.vercel-storage.com/')
}

async function generateOpenAiImageUrl(prompt: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY')

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

async function uploadImageToBlob(openAiUrl: string, title: string) {
  const imageRes = await fetch(openAiUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    const text = await imageRes.text().catch(() => '')
    throw new Error(`Failed to download generated image (${imageRes.status}): ${text}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const path = `artworks/${safeFilePart(STYLE)}/${safeFilePart(title)}.png`

  const blob = await put(path, arrayBuffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  })

  if (!blob?.url) throw new Error('Failed to upload generated image to Vercel Blob')
  return blob.url
}

async function createAssetIfMissing(artworkId: string, stableImageUrl: string, prompt: string) {
  const existingStableAsset = await prisma.asset.findFirst({
    where: { artworkId, originalUrl: stableImageUrl },
    select: { id: true },
  })

  if (existingStableAsset) return

  await prisma.asset.create({
    data: {
      artworkId,
      originalUrl: stableImageUrl,
      provider: DEFAULT_ASSET_PROVIDER,
      prompt,
    },
  })
}

async function run() {
  const existing = await prisma.artwork.findFirst({
    where: { title: ARTWORK_TITLE, style: STYLE as any },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      assets: {
        orderBy: { createdAt: 'desc' },
        select: { originalUrl: true },
      },
    },
  })

  const existingStableAsset =
    existing?.assets.find((a) => isStableBlobSrc(a.originalUrl))?.originalUrl || null
  const existingStableThumb = isStableBlobSrc(existing?.thumbnail) ? existing?.thumbnail : null
  const existingStable = existingStableAsset || existingStableThumb || null

  if (existing && existingStable) {
    if (!existingStableThumb) {
      await prisma.artwork.update({
        where: { id: existing.id },
        data: { thumbnail: existingStable, artist: ARTIST },
      })
    }

    await createAssetIfMissing(existing.id, existingStable, SAFE_GENERATION_PROMPT)

    return {
      title: ARTWORK_TITLE,
      success: true,
      reused: true,
      artworkId: existing.id,
    }
  }

  const openAiUrl = await generateOpenAiImageUrl(SAFE_GENERATION_PROMPT)
  const stableImageUrl = await uploadImageToBlob(openAiUrl, ARTWORK_TITLE)

  if (existing) {
    await prisma.artwork.update({
      where: { id: existing.id },
      data: {
        thumbnail: stableImageUrl,
        artist: ARTIST,
        status: 'PUBLISHED' as any,
      },
    })

    await createAssetIfMissing(existing.id, stableImageUrl, SAFE_GENERATION_PROMPT)

    return {
      title: ARTWORK_TITLE,
      success: true,
      regenerated: true,
      artworkId: existing.id,
    }
  }

  const artwork = await prisma.artwork.create({
    data: {
      title: ARTWORK_TITLE,
      style: STYLE as any,
      artist: ARTIST,
      thumbnail: stableImageUrl,
      status: 'PUBLISHED' as any,
      tags: [],
      price: 9.99,
    },
    select: { id: true },
  })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: stableImageUrl,
      provider: DEFAULT_ASSET_PROVIDER,
      prompt: SAFE_GENERATION_PROMPT,
    },
  })

  return {
    title: ARTWORK_TITLE,
    success: true,
    created: true,
    artworkId: artwork.id,
  }
}

export async function GET() {
  try {
    const result = await run()

    return NextResponse.json({
      message: 'Michelangelo Creation of Adam generated',
      style: STYLE,
      result,
    })
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Michelangelo Creation of Adam failed',
        style: STYLE,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
