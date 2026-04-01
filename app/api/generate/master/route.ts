import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const STYLE = 'VERMEER'
const ARTIST = 'Johannes Vermeer'
const DEFAULT_ASSET_PROVIDER = 'vercel-blob'

const TITLES = [
  'Officer and Laughing Girl in Vermeer Style',
  'Girl Interrupted at Her Music in Vermeer Style',
  'The Lacemaker in Vermeer Style',
  'Mistress and Maid in Vermeer Style',
  'A Lady Writing in Vermeer Style',
  'A Lady Standing at a Virginal in Vermeer Style',
  'A Lady Seated at a Virginal in Vermeer Style',
  'The Little Street in Vermeer Style',
  'The Glass of Wine in Vermeer Style',
  'The Love Letter in Vermeer Style',
  'Woman with a Pearl Necklace in Vermeer Style',
  'Girl with a Red Hat in Vermeer Style',
  'Young Woman Seated at a Virginal in Vermeer Style',
  'Woman Writing a Letter with Her Maid in Vermeer Style',
  'Interior with Woman and Window in Vermeer Style',
  'Morning Light in Delft Interior in Vermeer Style',
  'Quiet Window Study in Vermeer Style',
  'Reading by Soft Light in Vermeer Style',
  'Stillness in Blue Room in Vermeer Style',
  'Domestic Silence Scene in Vermeer Style',
]

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

  if (!blob?.url) {
    throw new Error('Failed to upload generated image to Vercel Blob')
  }

  return blob.url
}

async function createAssetIfMissing(artworkId: string, stableImageUrl: string, prompt: string) {
  const existingStableAsset = await prisma.asset.findFirst({
    where: {
      artworkId,
      originalUrl: stableImageUrl,
    },
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

async function processOneTitle(title: string) {
  const prompt = title

  const existing = await prisma.artwork.findFirst({
    where: {
      title,
      style: STYLE as any,
    },
    select: {
      id: true,
      title: true,
      thumbnail: true,
      assets: {
        orderBy: { createdAt: 'desc' },
        select: {
          originalUrl: true,
        },
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
        data: { thumbnail: existingStable },
      })
    }

    await createAssetIfMissing(existing.id, existingStable, prompt)

    return {
      title,
      success: true,
      reused: true,
    }
  }

  const openAiUrl = await generateOpenAiImageUrl(prompt)
  const stableImageUrl = await uploadImageToBlob(openAiUrl, title)

  if (existing) {
    await prisma.artwork.update({
      where: { id: existing.id },
      data: {
        thumbnail: stableImageUrl,
        artist: ARTIST,
      },
    })

    await createAssetIfMissing(existing.id, stableImageUrl, prompt)

    return {
      title,
      success: true,
      regenerated: true,
    }
  }

  const artwork = await prisma.artwork.create({
    data: {
      title,
      style: STYLE as any,
      artist: ARTIST,
      thumbnail: stableImageUrl,
      status: 'PUBLISHED' as any,
      tags: [],
      price: 9.99,
    },
    select: {
      id: true,
    },
  })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: stableImageUrl,
      provider: DEFAULT_ASSET_PROVIDER,
      prompt,
    },
  })

  return {
    title,
    success: true,
    created: true,
  }
}

export async function GET() {
  const results: Array<{
    title: string
    success: boolean
    reused?: boolean
    regenerated?: boolean
    created?: boolean
    error?: string
  }> = []

  for (const title of TITLES) {
    try {
      const result = await processOneTitle(title)
      results.push(result)
    } catch (error) {
      results.push({
        title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Vermeer batch 2 complete',
    style: STYLE,
    count: TITLES.length,
    results,
  })
}
