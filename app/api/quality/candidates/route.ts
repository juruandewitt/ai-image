import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const STYLE = 'DA_VINCI'

const ITEMS = [
  {
    title: 'Vitruvian Man in Da Vinci Style',
    prompt:
      'Accurate Leonardo da Vinci Vitruvian Man style image: sepia ink anatomical drawing on aged parchment, male figure with multiple arm and leg positions inside a circle and square, handwritten Renaissance notes around the figure, scientific notebook style, highly faithful to the famous composition.',
  },
  {
    title: 'Salvator Mundi in Da Vinci Style',
    prompt:
      'Accurate Leonardo da Vinci Salvator Mundi style portrait: serene frontal figure in deep blue robe, dark background, right hand raised in blessing, left hand holding transparent crystal orb, soft sfumato face, delicate curls, Renaissance oil painting, highly faithful to the known composition.',
  },
  {
    title: 'Virgin of the Rocks in Da Vinci Style',
    prompt:
      'Accurate Leonardo da Vinci Virgin of the Rocks style painting: sacred figures arranged in pyramidal composition inside a shadowy rocky grotto, blue-gray atmosphere, soft sfumato, flowing drapery, delicate faces, mysterious Renaissance mood, highly faithful to the known composition.',
  },
  {
    title: 'Annunciation in Da Vinci Style',
    prompt:
      'Accurate Leonardo da Vinci Annunciation style painting: angel kneeling on the left before Mary seated at a lectern on the right, garden foreground, Renaissance building, distant landscape, graceful wings, clear perspective, soft natural light, highly faithful to the known composition.',
  },
  {
    title: 'Adoration of the Magi in Da Vinci Style',
    prompt:
      'Accurate Leonardo da Vinci Adoration of the Magi style image: central mother and child surrounded by many worshippers, dynamic crowd, ruins and horses in the background, unfinished sepia-brown underpainting look, Renaissance sketch energy, highly faithful to the known composition.',
  },
  {
    title: 'Saint John the Baptist in Da Vinci Style',
    prompt:
      'Accurate Leonardo da Vinci Saint John the Baptist style portrait: youthful figure emerging from dark background, soft curled hair, mysterious smile, one hand pointing upward, warm golden-brown sfumato lighting, highly faithful to the known composition.',
  },
  {
    title: 'The Baptism of Christ in Da Vinci Style',
    prompt:
      'Accurate Renaissance Baptism of Christ scene with Leonardo da Vinci influence: riverbank baptism, central sacred figures, kneeling angel with delicate Leonardo-like face, soft landscape background, luminous water, calm sacred atmosphere, highly faithful to the known composition.',
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
    throw new Error(`OpenAI image generation failed: ${text}`)
  }

  const data = await res.json()
  const imageUrl = data?.data?.[0]?.url
  if (!imageUrl) throw new Error('No image URL returned')

  return imageUrl as string
}

async function uploadCandidate(openAiUrl: string, title: string) {
  const imageRes = await fetch(openAiUrl, { cache: 'no-store' })
  if (!imageRes.ok) throw new Error(`Failed to fetch generated image for ${title}`)

  const contentType = imageRes.headers.get('content-type') || 'image/png'
  const arrayBuffer = await imageRes.arrayBuffer()

  const blob = await put(
    `quality-candidates/${safeFilePart(STYLE)}/${safeFilePart(title)}.png`,
    arrayBuffer,
    {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    }
  )

  return blob.url
}

export async function GET() {
  const results = []

  for (const item of ITEMS) {
    try {
      const openAiUrl = await generateImage(item.prompt)
      const candidateUrl = await uploadCandidate(openAiUrl, item.title)

      results.push({
        title: item.title,
        style: STYLE,
        candidateUrl,
        success: true,
      })
    } catch (error) {
      results.push({
        title: item.title,
        style: STYLE,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Da Vinci candidates generated',
    style: STYLE,
    count: results.length,
    results,
  })
}
