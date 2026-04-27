import { NextRequest, NextResponse } from 'next/server'
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
    publicPath: '/featured/da-vinci-mona-lisa.png',
    prompt: 'Manual approved Mona Lisa replacement',
  },
  {
    title: 'The Last Supper in Da Vinci Style',
    prompt:
      'Accurate Renaissance fresco recreation of Leonardo da Vinci’s The Last Supper. Wide horizontal composition, Jesus centered at a long table, twelve apostles arranged in expressive groups of three, strong one-point perspective, rear wall with three windows, coffered ceiling, muted fresco colors, architectural symmetry, no modern elements.',
  },
  {
    title: 'Lady with an Ermine in Da Vinci Style',
    prompt:
      'Accurate Renaissance portrait recreation of Leonardo da Vinci’s Lady with an Ermine. Young noblewoman in three-quarter pose turned to the side, dark plain background, elegant braided hair, refined pale face, both hands holding a small white ermine, muted black and brown garments, soft sfumato, museum oil portrait.',
  },
  {
    title: 'Vitruvian Man in Da Vinci Style',
    prompt:
      'Accurate sepia ink drawing recreation of Leonardo da Vinci’s Vitruvian Man. A proportional male anatomical figure with multiple arm and leg positions, placed inside a circle and square, aged parchment background, handwritten mirror-script notes around the drawing, precise high Renaissance scientific linework.',
  },
  {
    title: 'Salvator Mundi in Da Vinci Style',
    prompt:
      'Accurate Renaissance portrait recreation of Salvator Mundi in Leonardo da Vinci style. Frontal serene figure against dark background, deep blue robe, right hand raised in blessing, left hand holding a transparent crystal orb, delicate curled hair, soft sfumato face, luminous hands, sacred quiet atmosphere.',
  },
  {
    title: 'Virgin of the Rocks in Da Vinci Style',
    prompt:
      'Accurate Renaissance composition inspired by Leonardo da Vinci’s Virgin of the Rocks. Sacred figures arranged in pyramidal composition inside a shadowy rocky grotto, soft blue-gray atmospheric landscape, gentle gestures, flowing drapery, delicate faces, subtle sfumato, mysterious devotional mood.',
  },
  {
    title: 'Annunciation in Da Vinci Style',
    prompt:
      'Accurate early Renaissance scene inspired by Leonardo da Vinci’s Annunciation. Angel kneeling on the left before Mary seated at a lectern on the right, garden foreground, Renaissance building, distant landscape, graceful wings, clear perspective, calm gestures, delicate natural light, muted colors.',
  },
  {
    title: 'Adoration of the Magi in Da Vinci Style',
    prompt:
      'Accurate Renaissance underdrawing-style recreation inspired by Leonardo da Vinci’s Adoration of the Magi. Central mother and child surrounded by many worshippers, dynamic circular crowd, ruins and horses in the background, sepia-brown unfinished underpainting look, energetic sketch lines, Renaissance composition.',
  },
  {
    title: 'Saint John the Baptist in Da Vinci Style',
    prompt:
      'Accurate Renaissance portrait inspired by Leonardo da Vinci’s Saint John the Baptist. Youthful figure emerging from dark background, soft curled hair, enigmatic smile, one hand pointing upward, warm golden-brown light, strong sfumato, mysterious spiritual atmosphere.',
  },
  {
    title: 'The Baptism of Christ in Da Vinci Style',
    prompt:
      'Accurate Renaissance religious scene inspired by The Baptism of Christ with Leonardo da Vinci influence. Riverbank scene, central baptism gesture, kneeling angel with delicate Leonardo-like face, soft landscape background, luminous water, graceful early Renaissance figures, calm sacred atmosphere.',
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

async function fetchPublicImageToBlob(origin: string, item: (typeof ITEMS)[number]) {
  if (!item.publicPath) throw new Error(`Missing publicPath for ${item.title}`)

  const publicUrl = `${origin}${item.publicPath}`
  const imageRes = await fetch(publicUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    throw new Error(`Could not fetch ${item.publicPath}: ${imageRes.status}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const blob = await put(
    `artworks/${safeFilePart(STYLE)}/${safeFilePart(item.title)}-approved.png`,
    arrayBuffer,
    { access: 'public', addRandomSuffix: true, contentType }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${item.title}`)
  return blob.url
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
  if (!imageUrl || typeof imageUrl !== 'string') throw new Error('No image URL returned')

  return imageUrl
}

async function uploadGeneratedImageToBlob(openAiUrl: string, title: string) {
  const imageRes = await fetch(openAiUrl, { cache: 'no-store' })

  if (!imageRes.ok) {
    throw new Error(`Failed to download generated image: ${imageRes.status}`)
  }

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const blob = await put(
    `artworks/${safeFilePart(STYLE)}/${safeFilePart(title)}-quality-v2.png`,
    arrayBuffer,
    { access: 'public', addRandomSuffix: true, contentType }
  )

  if (!blob.url) throw new Error(`Blob upload failed for ${title}`)
  return blob.url
}

async function upsertArtwork(item: (typeof ITEMS)[number], blobUrl: string) {
  const existing = await prisma.artwork.findFirst({
    where: { title: item.title, style: STYLE as any },
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
      provider: item.publicPath ? 'manual-approved-blob' : DEFAULT_ASSET_PROVIDER,
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const results = []

  for (const item of ITEMS) {
    try {
      const blobUrl = item.publicPath
        ? await fetchPublicImageToBlob(origin, item)
        : await uploadGeneratedImageToBlob(
            await generateOpenAiImageUrl(item.prompt),
            item.title
          )

      const artworkId = await upsertArtwork(item, blobUrl)

      results.push({
        title: item.title,
        success: true,
        artworkId,
        restoredFromApprovedFile: Boolean(item.publicPath),
        blobUrl,
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
    message: 'Da Vinci top 10 quality replacement retry complete',
    style: STYLE,
    count: ITEMS.length,
    results,
  })
}
