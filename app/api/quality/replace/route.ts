import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DALI'
const ARTIST = 'Salvador Dalí'

const ITEMS = [
  {
    title: 'Persistence of Memory Inspired',
    prompt:
      'surreal dreamlike landscape inspired by Salvador Dali, melting clock forms draped over objects, vast empty desert, hyper realistic lighting, long shadows, highly detailed, no text',
  },
  {
    title: 'Surreal Melting Landscape',
    prompt:
      'melting organic shapes in a barren surreal landscape, dali style dream logic, soft distorted forms, hyper realistic rendering, cinematic lighting',
  },
  {
    title: 'Dreamlike Desert Clocks',
    prompt:
      'surreal desert scene with melting clocks and distorted time objects, ultra detailed, hyper realistic, dali inspired, dramatic shadows',
  },
  {
    title: 'Floating Objects Composition',
    prompt:
      'objects floating in impossible space, surreal composition, hyper realism, dali style dream imagery, strong contrast lighting',
  },
  {
    title: 'Impossible Architecture Scene',
    prompt:
      'surreal architecture defying physics, stretched and distorted buildings, dali style, highly detailed, dramatic perspective',
  },
  {
    title: 'Surreal Reflections Study',
    prompt:
      'mirror-like reflections in surreal environment, dream logic, hyper realistic textures, dali inspired composition',
  },
  {
    title: 'Distorted Reality Composition',
    prompt:
      'warped and stretched reality, surreal figures and objects, dali style, highly detailed, cinematic lighting',
  },
  {
    title: 'Time Collapse Landscape',
    prompt:
      'time distortion visualized as melting structures and flowing forms, surreal landscape, dali inspired, hyper realistic',
  },
  {
    title: 'Hyperreal Dream Sequence',
    prompt:
      'ultra realistic dreamlike scene with impossible elements, surrealism, dali inspired, crisp detail, dramatic lighting',
  },
  {
    title: 'Symbolic Surreal Study',
    prompt:
      'symbolic surreal imagery with abstract meaning, dali inspired composition, highly detailed, clean background, no text',
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

async function generateImage(prompt: string) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      size: '1024x1024',
    }),
  })

  const data = await res.json()
  return data.data[0].url
}

async function upload(url: string, title: string) {
  const img = await fetch(url)
  const buffer = await img.arrayBuffer()

  const blob = await put(
    `artworks/dali/${safeFilePart(title)}`,
    buffer,
    { access: 'public' }
  )

  return blob.url
}

async function upsert(item: any, imageUrl: string) {
  const artwork = await prisma.artwork.create({
    data: {
      title: item.title,
      style: STYLE as any,
      artist: ARTIST,
      thumbnail: imageUrl,
      status: 'PUBLISHED' as any,
      price: 9.99,
    },
  })

  await prisma.asset.create({
    data: {
      artworkId: artwork.id,
      originalUrl: imageUrl,
      provider: 'ai-generated',
      prompt: item.prompt,
    },
  })

  return artwork.id
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const aiUrl = await generateImage(item.prompt)
      const blobUrl = await upload(aiUrl, item.title)
      const id = await upsert(item, blobUrl)

      results.push({ title: item.title, success: true, artworkId: id })
    } catch (e) {
      results.push({ title: item.title, success: false })
    }
  }

  return NextResponse.json({
    message: 'Dali set created',
    results,
  })
}
