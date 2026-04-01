import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateImage } from '@/lib/openai'

const STYLE = 'VERMEER'

const TITLES = [
  "Girl with a Pearl Earring in Vermeer Style",
  "The Milkmaid in Vermeer Style",
  "Woman in Blue Reading a Letter in Vermeer Style",
  "View of Delft in Vermeer Style",
  "The Art of Painting in Vermeer Style",
  "Girl Reading a Letter by an Open Window in Vermeer Style",
  "Woman Holding a Balance in Vermeer Style",
  "The Music Lesson in Vermeer Style",
  "Young Woman with a Water Pitcher in Vermeer Style",
  "Woman with a Lute in Vermeer Style",

  "Mona Lisa in Vermeer Style",
  "Starry Night in Vermeer Style",
  "The Last Supper in Vermeer Style",
  "Creation of Adam in Vermeer Style",
  "Persistence of Memory in Vermeer Style",
  "Guernica in Vermeer Style",
  "The Scream in Vermeer Style",
  "Water Lilies in Vermeer Style",
  "The Night Watch in Vermeer Style",
  "American Gothic in Vermeer Style"
]

export async function GET() {
  const results = []

  for (const title of TITLES) {
    try {
      // 1. Generate image
      const imageUrl = await generateImage(title)

      if (!imageUrl) {
        results.push({ title, success: false, error: 'No image URL' })
        continue
      }

      // 2. Create artwork
      const artwork = await prisma.artwork.create({
        data: {
          title,
          style: STYLE as any,
          artist: 'Johannes Vermeer',
          thumbnail: imageUrl,
          price: 9,
          status: 'PUBLISHED',
        },
      })

      // 3. Create asset
      await prisma.asset.create({
        data: {
          artworkId: artwork.id,
          originalUrl: imageUrl,
          provider: 'openai',
          prompt: title,
        },
      })

      results.push({ title, success: true })

    } catch (error: any) {
      results.push({
        title,
        success: false,
        error: error?.message || 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Vermeer batch complete',
    results,
  })
}
