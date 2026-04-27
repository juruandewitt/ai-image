import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DA_VINCI'
const ARTIST = 'Leonardo da Vinci'

const ITEMS = [
  {
    title: 'Mona Lisa in Da Vinci Style',
    publicPath: '/featured/da-vinci-mona-lisa.png',
    prompt: 'Manual approved Mona Lisa replacement',
  },
  {
    title: 'The Last Supper in Da Vinci Style',
    publicPath: '/featured/da-vinci-last-supper.png',
    prompt: 'Manual approved Last Supper replacement',
  },
  {
    title: 'Lady with an Ermine in Da Vinci Style',
    prompt:
      'Highly accurate Renaissance oil portrait inspired by Leonardo da Vinci Lady with an Ermine. Young noblewoman in three-quarter profile facing right, holding a small white ermine, dark plain background, refined pale face, soft sfumato shading, delicate hands, muted elegant clothing, museum-level realism.',
  },
  {
    title: 'Vitruvian Man in Da Vinci Style',
    prompt:
      'Highly accurate Leonardo da Vinci Vitruvian Man drawing. Sepia ink anatomical male figure with multiple arm and leg positions inside circle and square, parchment background, handwritten notes, precise Renaissance proportions, scientific drawing style.',
  },
  {
    title: 'Salvator Mundi in Da Vinci Style',
    prompt:
      'Highly accurate Renaissance portrait inspired by Salvator Mundi. Frontal Christ figure, dark background, blue robe, right hand raised in blessing, left hand holding transparent crystal orb, soft sfumato face, delicate lighting, museum quality.',
  },
  {
    title: 'Virgin of the Rocks in Da Vinci Style',
    prompt:
      'Highly accurate Renaissance composition inspired by Leonardo da Vinci Virgin of the Rocks. Figures arranged in pyramid composition inside rocky cave, soft atmospheric background, flowing drapery, sfumato lighting, sacred calm mood.',
  },
  {
    title: 'Annunciation in Da Vinci Style',
    prompt:
      'Highly accurate early Renaissance Annunciation scene inspired by Leonardo da Vinci. Angel kneeling left, Mary seated right, garden foreground, Renaissance architecture, distant landscape, soft natural lighting, balanced composition.',
  },
  {
    title: 'Adoration of the Magi in Da Vinci Style',
    prompt:
      'Highly accurate unfinished Renaissance underpainting inspired by Leonardo da Vinci Adoration of the Magi. Central mother and child, dynamic crowd composition, sepia tones, sketch-like detail, energetic composition.',
  },
  {
    title: 'Saint John the Baptist in Da Vinci Style',
    prompt:
      'Highly accurate Leonardo da Vinci Saint John the Baptist portrait. Youth emerging from dark background, soft curls, mysterious smile, pointing upward, sfumato lighting, warm tones.',
  },
  {
    title: 'The Baptism of Christ in Da Vinci Style',
    prompt:
      'Highly accurate Renaissance religious scene inspired by Leonardo da Vinci Baptism of Christ. Figures near river, calm composition, soft landscape, gentle light, early Renaissance realism.',
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

async function uploadFromPublic(origin: string, path: string, title: string) {
  const url = `${origin}${path}`
  const res = await fetch(url)

  if (!res.ok) throw new Error(`Failed to fetch ${path}`)

  const buffer = await res.arrayBuffer()

  const blob = await put(
    `artworks/da-vinci/${safeFilePart(title)}.png`,
    buffer,
    { access: 'public', addRandomSuffix: true }
  )

  return blob.url
}

async function generateImage(prompt: string, title: string) {
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

  if (!res.ok) throw new Error('Image generation failed')

  const data = await res.json()
  const imageUrl = data.data[0].url

  const img = await fetch(imageUrl)
  const buffer = await img.arrayBuffer()

  const blob = await put(
    `artworks/da-vinci/${safeFilePart(title)}.png`,
    buffer,
    { access: 'public', addRandomSuffix: true }
  )

  return blob.url
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin

  const results = []

  for (const item of ITEMS) {
    try {
      let imageUrl

      if (item.publicPath) {
        imageUrl = await uploadFromPublic(origin, item.publicPath, item.title)
      } else {
        imageUrl = await generateImage(item.prompt, item.title)
      }

      const existing = await prisma.artwork.findFirst({
        where: { title: item.title, style: STYLE as any },
      })

      if (existing) {
        await prisma.artwork.update({
          where: { id: existing.id },
          data: {
            thumbnail: imageUrl,
            status: 'PUBLISHED',
          },
        })
      } else {
        await prisma.artwork.create({
          data: {
            title: item.title,
            style: STYLE as any,
            artist: ARTIST,
            thumbnail: imageUrl,
            status: 'PUBLISHED',
            price: 9.99,
          },
        })
      }

      results.push({ title: item.title, success: true })
    } catch (err: any) {
      results.push({ title: item.title, success: false, error: err.message })
    }
  }

  return NextResponse.json({
    message: 'Da Vinci batch updated',
    results,
  })
}
