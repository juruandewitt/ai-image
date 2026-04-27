import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DA_VINCI'
const ARTIST = 'Leonardo da Vinci'
const DEFAULT_ASSET_PROVIDER = 'quality-replacement-blob'

const ITEMS = [
  {
    title: 'Mona Lisa in Da Vinci Style',
    prompt:
      'Faithful Renaissance oil portrait inspired by Leonardo da Vinci’s Mona Lisa: seated enigmatic woman, three-quarter pose, folded hands, dark veil, subtle smile, atmospheric hazy landscape with winding paths and water behind her, warm muted browns and greens, delicate sfumato shading, soft realistic face, museum-quality Renaissance painting.',
  },
  {
    title: 'The Last Supper in Da Vinci Style',
    prompt:
      'Faithful Renaissance fresco-style composition inspired by Leonardo da Vinci’s The Last Supper: long horizontal dining table, central calm figure, twelve expressive figures arranged in groups, architectural perspective, coffered ceiling, rear windows with pale landscape, balanced symmetry, muted Renaissance palette, dramatic but restrained gestures, fresco texture.',
  },
  {
    title: 'Lady with an Ermine in Da Vinci Style',
    prompt:
      'Faithful Renaissance portrait inspired by Leonardo da Vinci’s Lady with an Ermine: young noblewoman turned three-quarter view, dark simple background, elegant braided hair, refined face, delicate hands holding a small white ermine-like animal, muted black and brown clothing, soft sfumato modeling, intimate Renaissance oil portrait.',
  },
  {
    title: 'Vitruvian Man in Da Vinci Style',
    prompt:
      'Faithful Renaissance anatomical study inspired by Leonardo da Vinci’s Vitruvian Man: sepia ink drawing on aged parchment, idealized male figure with multiple arm and leg positions inside circle and square, precise proportional study, handwritten notes around figure, delicate linework, scientific notebook aesthetic, high Renaissance draftsmanship.',
  },
  {
    title: 'Salvator Mundi in Da Vinci Style',
    prompt:
      'Faithful Renaissance devotional portrait inspired by Leonardo da Vinci’s Salvator Mundi: serene frontal figure in deep blue robe, one hand raised in blessing, other hand holding a transparent crystal orb, dark background, calm expression, delicate curls, soft sfumato, luminous face and hands, sacred Renaissance oil painting.',
  },
  {
    title: 'Virgin of the Rocks in Da Vinci Style',
    prompt:
      'Faithful Renaissance scene inspired by Leonardo da Vinci’s Virgin of the Rocks: sacred group of figures gathered in a mysterious rocky grotto, soft atmospheric blue-gray landscape, gentle hand gestures, pyramidal composition, delicate faces, flowing drapery, subtle sfumato, quiet spiritual mood, Renaissance oil painting.',
  },
  {
    title: 'Annunciation in Da Vinci Style',
    prompt:
      'Faithful early Renaissance scene inspired by Leonardo da Vinci’s Annunciation: angel kneeling before a seated young woman at a lectern, garden setting, architectural building, distant landscape, graceful gestures, delicate wings, soft natural light, clear perspective, refined Renaissance details, muted pastel colors.',
  },
  {
    title: 'Adoration of the Magi in Da Vinci Style',
    prompt:
      'Faithful Renaissance study inspired by Leonardo da Vinci’s Adoration of the Magi: central mother and child surrounded by worshippers, many expressive figures, unfinished sepia-brown underpainting feeling, dynamic circular composition, distant ruins and horses, dramatic gestures, Renaissance sketch-like energy with sfumato depth.',
  },
  {
    title: 'Saint John the Baptist in Da Vinci Style',
    prompt:
      'Faithful Renaissance portrait inspired by Leonardo da Vinci’s Saint John the Baptist: youthful figure emerging from dark background, subtle enigmatic smile, softly curled hair, one hand pointing upward, warm golden-brown light, delicate sfumato, spiritual mysterious mood, dark atmospheric Renaissance oil painting.',
  },
  {
    title: 'The Baptism of Christ in Da Vinci Style',
    prompt:
      'Faithful Renaissance religious scene inspired by The Baptism of Christ with Leonardo da Vinci influence: riverbank scene, central baptism gesture, kneeling angel with delicate features, soft landscape background, luminous water, graceful figures, early Renaissance composition, refined faces, gentle atmospheric light.',
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

  const blob = await put(
    `artworks/${safeFilePart(STYLE)}/${safeFilePart(title)}-quality.png`,
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

async function replaceArtwork(item: (typeof ITEMS)[number]) {
  const openAiUrl = await generateOpenAiImageUrl(item.prompt)
  const blobUrl = await uploadImageToBlob(openAiUrl, item.title)

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
          thumbnail: blobUrl,
          status: 'PUBLISHED' as any,
        },
        select: { id: true },
      })
    : await prisma.artwork.create({
        data: {
          title: item.title,
          style: STYLE as any,
          artist: ARTIST,
          thumbnail: blobUrl,
          status: 'PUBLISHED' as any,
          tags: [],
          price: 9.99,
        },
        select: { id: true },
      })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: blobUrl,
      provider: DEFAULT_ASSET_PROVIDER,
      prompt: item.prompt,
    },
  })

  return {
    title: item.title,
    success: true,
    artworkId: artwork.id,
    blobUrl,
  }
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const result = await replaceArtwork(item)
      results.push(result)
    } catch (error) {
      results.push({
        title: item.title,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Da Vinci top 10 quality replacement complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
