// app/api/generate/batch/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { put } from '@vercel/blob'
import sharp from 'sharp'
import { styleSlugToKey, buildStylePrompt } from '@/lib/styles'
import { OpenAI } from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 60 // give the function more time on Vercel

// A small, safe starter set per style (expand later as you wish)
const DEFAULT_TITLES: Record<string, string[]> = {
  'van-gogh': [
    'Starry Harbor Over Canal',
    'Sunflowers in Night Café',
    'Wheatfield with Neon Crows',
    'Nocturne over Windmill Village',
    'Cafe Terrace After Rain',
    'Irises by the Riverside',
  ],
  'da-vinci': [
    'Portrait with Subtle Sfumato',
    'Architect’s Study in Light',
    'Mechanical Bird Sketch',
    'Drapery Study in Motion',
    'Canal City at Twilight',
    'Chiaroscuro Inventor',
  ],
  'picasso': [
    'Cubist Violin and Glass',
    'Blue Harlequin in Alley',
    'Woman with Mandolin',
    'Bull and the City',
    'Guernica Fragment Study',
    'Seated Figure in Cubes',
  ],
  'monet': [
    'Water Garden at Dusk',
    'Rouen Façade in Mist',
    'Poppy Field at Breeze',
    'Harbor Morning Light',
    'Snow at Sunrise',
    'Willows by the Pond',
  ],
  'vermeer': [
    'Girl by the Window Reading',
    'Pearl and Map Room',
    'Letter in Quiet Chamber',
    'Light Across Delft Street',
    'Milkmaid’s Pause',
    'Astronomer at Night',
  ],
  'rembrandt': [
    'Self-Portrait in Warm Glow',
    'Anatomy Study Redux',
    'Captain’s Night Watch',
    'Pilgrims by Candle',
    'Old Man in Thought',
    'Portrait with Golden Rim',
  ],
  'dali': [
    'Melting Clock over Bay',
    'Long Shadows and Giraffe',
    'Desert Drawer Dreams',
    'Elephants on Spindles',
    'Soft Watch Vineyard',
    'Surreal Tower Mirage',
  ],
  'michelangelo': [
    'Marble Study of Hero',
    'Creation Fresco Fragment',
    'Dynamic Figure Sketch',
    'Pieta Reimagined',
    'Architectural Dome Study',
    'Torsion of the Titan',
  ],
  'caravaggio': [
    'Basket of Fruit in Shadow',
    'Calling by Candlelight',
    'Dramatic Supper Scene',
    'Musician in Tenebrism',
    'Saint in the Alley',
    'Vase and Dagger',
  ],
  'pollock': [
    'Drip No. 7',
    'Gesture Field in Black',
    'Rhythm of Lines',
    'Autumn Convergence',
    'Silver Pour Study',
    'Fractured Motion',
  ],
}

// Reusable single-image generator (OpenAI → Blob → Prisma)
async function generateOne(styleSlug: string, title: string) {
  const styleKey = styleSlugToKey(styleSlug)
  const prompt = buildStylePrompt(styleKey as any, title)

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const gen = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
    // some deployments don’t accept response_format; omit it
  })

  const first = gen.data?.[0]
  if (!first) throw new Error('OpenAI returned no image in response data')

  let orig: Buffer
  if ((first as any).b64_json) {
    orig = Buffer.from((first as any).b64_json, 'base64')
  } else if (first.url) {
    const res = await fetch(first.url)
    if (!res.ok) throw new Error(`Failed to fetch image URL (${res.status})`)
    orig = Buffer.from(await res.arrayBuffer())
  } else {
    throw new Error('OpenAI image had neither b64_json nor url')
  }

  // Upload original + two variants
  const stamp = Date.now()
  const baseKey = `art/${stamp}-${Math.random().toString(36).slice(2, 8)}`

  const upOrig = await put(`${baseKey}-orig.png`, orig, {
    access: 'public',
    contentType: 'image/png',
  })

  const s1024 = await sharp(orig).resize(1024).png().toBuffer()
  const up1024 = await put(`${baseKey}-1024.png`, s1024, {
    access: 'public',
    contentType: 'image/png',
  })

  const s2048 = await sharp(orig).resize(2048).webp({ quality: 88 }).toBuffer()
  const up2048 = await put(`${baseKey}-2048.webp`, s2048, {
    access: 'public',
    contentType: 'image/webp',
  })

  // Persist DB rows — match your schema’s required fields
  const created = await prisma.artwork.create({
    data: {
      title,
      artist: `AI Image – ${styleSlug}`,
      style: styleKey as any,
      status: 'PUBLISHED',
      price: 1900,
      thumbnail: up1024.url,
      tags: [],
      assets: {
        create: [
          { provider: 'blob', prompt, originalUrl: upOrig.url },
          { provider: 'blob', prompt, originalUrl: up1024.url },
          { provider: 'blob', prompt, originalUrl: up2048.url },
        ],
      },
    },
    select: { id: true },
  })

  return created.id
}

// GET for easy use from the browser:
// /api/generate/batch?style=van-gogh&n=4
// optional: &titles=Title1,Title2,Title3
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const style = (searchParams.get('style') || 'van-gogh').toLowerCase()
    const n = Math.max(1, Math.min(6, Number(searchParams.get('n') || '4'))) // cap to keep within time limits

    let titles: string[] = []
    const titlesParam = searchParams.get('titles')
    if (titlesParam) {
      titles = titlesParam.split(',').map(t => t.trim()).filter(Boolean).slice(0, n)
    } else {
      const bank = DEFAULT_TITLES[style] || DEFAULT_TITLES['van-gogh']
      titles = bank.slice(0, n)
    }

    const results: { title: string; ok: boolean; id?: string; error?: string }[] = []
    // Run sequentially to avoid timeouts and rate-limit bursts
    for (const title of titles) {
      try {
        const id = await generateOne(style, title)
        results.push({ title, ok: true, id })
      } catch (e: any) {
        results.push({ title, ok: false, error: String(e?.message || e) })
      }
    }

    return NextResponse.json({ ok: true, style, count: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}

// Also allow POST with JSON body: { style, titles: [...] }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const style = (body.style || 'van-gogh').toLowerCase()
    const titlesInput: string[] = Array.isArray(body.titles) ? body.titles : []
    const titles = titlesInput.slice(0, 6)

    const results: { title: string; ok: boolean; id?: string; error?: string }[] = []
    for (const title of titles) {
      try {
        const id = await generateOne(style, title)
        results.push({ title, ok: true, id })
      } catch (e: any) {
        results.push({ title, ok: false, error: String(e?.message || e) })
      }
    }

    return NextResponse.json({ ok: true, style, count: results.length, results })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e) }, { status: 500 })
  }
}
