import { NextResponse } from 'next/server'

const ITEMS = [
  { title: "Morning Light on the River", style: "MONET", prompt: "Claude Monet style, impressionist river sunrise, soft brush strokes, pastel tones" },
  { title: "Garden in Bloom", style: "MONET", prompt: "Monet style garden, colorful flowers, sunlight, impressionism" },
  { title: "Water Lilies at Dawn", style: "MONET", prompt: "Monet water lilies, calm pond, pastel reflections" },
  { title: "Sunset Over Fields", style: "MONET", prompt: "Monet countryside sunset, warm glowing tones" },
  { title: "Bridge Over Quiet Water", style: "MONET", prompt: "Monet bridge over pond, reflections, soft colors" },
  { title: "Misty Morning Garden", style: "MONET", prompt: "Monet foggy garden, muted tones, soft light" },
  { title: "Spring Blossom Path", style: "MONET", prompt: "Monet spring blossoms, light airy brushwork" },
  { title: "Reflections of Sky", style: "MONET", prompt: "Monet water reflection, pastel sky tones" },
  { title: "Summer Meadow Light", style: "MONET", prompt: "Monet meadow, sunlight, impressionist" },
  { title: "Quiet Pond Afternoon", style: "MONET", prompt: "Monet pond, calm atmosphere, reflections" },

  { title: "Mona Lisa in Monet Style", style: "MONET", prompt: "Mona Lisa in Monet impressionist style, soft tones" },
  { title: "The Last Supper in Monet Style", style: "MONET", prompt: "Last Supper Monet style, soft blended colors" },
  { title: "Girl with a Pearl Earring in Monet Style", style: "MONET", prompt: "Girl with Pearl Earring Monet style" },
  { title: "Starry Night in Monet Style", style: "MONET", prompt: "Starry Night Monet style, soft sky" },
  { title: "Birth of Venus in Monet Style", style: "MONET", prompt: "Birth of Venus Monet style, pastel tones" },
  { title: "Persistence of Memory in Monet Style", style: "MONET", prompt: "Persistence of Memory Monet style" },
  { title: "American Gothic in Monet Style", style: "MONET", prompt: "American Gothic Monet style" },
  { title: "The Scream in Monet Style", style: "MONET", prompt: "The Scream Monet style" },
  { title: "Creation of Adam in Monet Style", style: "MONET", prompt: "Creation of Adam Monet style" },
  { title: "Guernica in Monet Style", style: "MONET", prompt: "Guernica Monet style" },

  { title: "Study of the Human Form", style: "MICHELANGELO", prompt: "Michelangelo style anatomy, marble sculpture, dramatic light" },
  { title: "Divine Figure in Light", style: "MICHELANGELO", prompt: "Michelangelo renaissance figure, dramatic lighting" },
  { title: "The Awakening Form", style: "MICHELANGELO", prompt: "Michelangelo sculpture emerging from shadow" },
  { title: "Ceiling Fresco Study", style: "MICHELANGELO", prompt: "Michelangelo fresco, renaissance painting" },
  { title: "Heroic Pose", style: "MICHELANGELO", prompt: "Michelangelo heroic anatomy, strong pose" },
  { title: "Sacred Composition", style: "MICHELANGELO", prompt: "Michelangelo religious scene, renaissance" },
  { title: "Marble Grace", style: "MICHELANGELO", prompt: "Michelangelo marble sculpture, soft light" },
  { title: "The Thinking Figure", style: "MICHELANGELO", prompt: "Michelangelo contemplative pose" },
  { title: "Light and Form", style: "MICHELANGELO", prompt: "Michelangelo anatomy with dramatic lighting" },
  { title: "Classical Balance", style: "MICHELANGELO", prompt: "Michelangelo balanced figure, renaissance" },

  { title: "Mona Lisa in Michelangelo Style", style: "MICHELANGELO", prompt: "Mona Lisa Michelangelo style sculpture" },
  { title: "Starry Night in Michelangelo Style", style: "MICHELANGELO", prompt: "Starry Night Michelangelo fresco" },
  { title: "The Scream in Michelangelo Style", style: "MICHELANGELO", prompt: "The Scream Michelangelo sculpture" },
  { title: "Water Lilies in Michelangelo Style", style: "MICHELANGELO", prompt: "Water lilies Michelangelo style" },
  { title: "Birth of Venus in Michelangelo Style", style: "MICHELANGELO", prompt: "Birth of Venus Michelangelo style" },
  { title: "Guernica in Michelangelo Style", style: "MICHELANGELO", prompt: "Guernica Michelangelo style" },
  { title: "Girl with Pearl Earring in Michelangelo Style", style: "MICHELANGELO", prompt: "Girl with Pearl Earring Michelangelo style" },
  { title: "Persistence of Memory in Michelangelo Style", style: "MICHELANGELO", prompt: "Persistence of Memory Michelangelo style" },
  { title: "American Gothic in Michelangelo Style", style: "MICHELANGELO", prompt: "American Gothic Michelangelo style" },
  { title: "Last Supper in Michelangelo Style", style: "MICHELANGELO", prompt: "Last Supper Michelangelo style" },
]

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const endpoint = `${origin}/api/generate/master`

  const results: { title: string; success: boolean; status?: number; error?: string }[] = []

  for (const item of ITEMS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
        cache: 'no-store',
      })

      if (!res.ok) {
        let errorText = ''
        try {
          errorText = await res.text()
        } catch {
          errorText = 'Request failed'
        }

        results.push({
          title: item.title,
          success: false,
          status: res.status,
          error: errorText.slice(0, 300),
        })
      } else {
        results.push({
          title: item.title,
          success: true,
          status: res.status,
        })
      }
    } catch (err) {
      results.push({
        title: item.title,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  return NextResponse.json({
    message: 'Test batch complete',
    endpoint,
    results,
  })
}
