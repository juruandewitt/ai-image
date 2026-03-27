'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL VAN GOGH WORKS
  // =========================
  { title: "Golden Wheatfield at Dawn", style: "VAN_GOGH", prompt: "Vincent van Gogh inspired golden wheatfield at sunrise, thick brush strokes, swirling sky, vibrant yellow and blue tones" },
  { title: "Starry Evening Over the Village", style: "VAN_GOGH", prompt: "Van Gogh style night sky over a quiet village, swirling stars, deep blues, glowing windows" },
  { title: "Sunflowers in Warm Light", style: "VAN_GOGH", prompt: "Van Gogh inspired sunflowers in a vase, bold yellow palette, textured brushwork, expressive strokes" },
  { title: "Cypress Trees Under the Sky", style: "VAN_GOGH", prompt: "Van Gogh style tall cypress trees beneath a dramatic swirling sky, bold contrast, energetic strokes" },
  { title: "The Blue Night Field", style: "VAN_GOGH", prompt: "Van Gogh inspired field under deep blue night sky, glowing stars, expressive brushwork" },
  { title: "Rustic Cottage at Sunset", style: "VAN_GOGH", prompt: "Van Gogh style rustic countryside cottage at sunset, warm oranges and yellows, textured paint strokes" },
  { title: "The Lonely Road", style: "VAN_GOGH", prompt: "Van Gogh inspired empty road through countryside, expressive sky, strong perspective, emotional mood" },
  { title: "Olive Trees in Motion", style: "VAN_GOGH", prompt: "Van Gogh style olive trees in wind, swirling movement, textured green and blue tones" },
  { title: "Village Under the Stars", style: "VAN_GOGH", prompt: "Van Gogh inspired small village at night, glowing windows, swirling sky, expressive lighting" },
  { title: "Field of Yellow Flowers", style: "VAN_GOGH", prompt: "Van Gogh style field filled with yellow flowers, bold strokes, intense color contrast" },

  { title: "Sunlit Orchard", style: "VAN_GOGH", prompt: "Van Gogh inspired orchard in bright sunlight, thick brushwork, vibrant greens and yellows" },
  { title: "Windy Sky Over Hills", style: "VAN_GOGH", prompt: "Van Gogh style rolling hills under a dramatic windy sky, expressive swirling clouds" },
  { title: "Quiet Room with Chair", style: "VAN_GOGH", prompt: "Van Gogh inspired interior with a wooden chair, warm tones, textured brush strokes" },
  { title: "Golden Harvest Scene", style: "VAN_GOGH", prompt: "Van Gogh style harvest field with golden crops, bold strokes, vivid sky" },
  { title: "Night Cafe Glow", style: "VAN_GOGH", prompt: "Van Gogh inspired glowing cafe at night, strong contrast, expressive color, emotional lighting" },
  { title: "The Red Vineyard", style: "VAN_GOGH", prompt: "Van Gogh style vineyard in red and gold tones, dramatic sunset, heavy texture" },
  { title: "Blue River Reflections", style: "VAN_GOGH", prompt: "Van Gogh inspired river reflecting sky, swirling brush strokes, vibrant blues" },
  { title: "Autumn Leaves in Motion", style: "VAN_GOGH", prompt: "Van Gogh style autumn trees with swirling leaves, warm reds and oranges, expressive movement" },
  { title: "The Garden Path", style: "VAN_GOGH", prompt: "Van Gogh inspired garden path, bold color contrasts, textured brushwork" },
  { title: "Golden Sky Over Fields", style: "VAN_GOGH", prompt: "Van Gogh style glowing golden sky above farmland, thick paint strokes" },

  { title: "The Quiet Bridge", style: "VAN_GOGH", prompt: "Van Gogh inspired bridge over water, expressive reflections, strong colors" },
  { title: "Morning Light Over Village", style: "VAN_GOGH", prompt: "Van Gogh style early morning light illuminating a small village, soft glow" },
  { title: "The Painter's Window", style: "VAN_GOGH", prompt: "Van Gogh inspired view from a window, bold lines, expressive color" },
  { title: "Storm Over Wheatfield", style: "VAN_GOGH", prompt: "Van Gogh style storm clouds above a wheatfield, intense movement and contrast" },
  { title: "Bright Sky and Trees", style: "VAN_GOGH", prompt: "Van Gogh inspired trees under a bright blue sky, thick expressive brushwork" },
  { title: "Sunset in the Countryside", style: "VAN_GOGH", prompt: "Van Gogh style countryside at sunset, bold orange and blue contrast" },
  { title: "The Empty Bench", style: "VAN_GOGH", prompt: "Van Gogh inspired bench in a quiet park, emotional mood, textured paint" },
  { title: "Star Field Horizon", style: "VAN_GOGH", prompt: "Van Gogh style horizon beneath a star-filled sky, glowing stars, swirling motion" },
  { title: "Country Road at Noon", style: "VAN_GOGH", prompt: "Van Gogh inspired bright country road at noon, bold sunlight, strong shadows" },
  { title: "Blue Hills and Sky", style: "VAN_GOGH", prompt: "Van Gogh style rolling blue hills with expressive sky, thick brush strokes" },

  { title: "The Yellow House Scene", style: "VAN_GOGH", prompt: "Van Gogh inspired bright yellow house under blue sky, strong contrast" },
  { title: "Quiet Field with Birds", style: "VAN_GOGH", prompt: "Van Gogh style open field with birds flying, dramatic sky movement" },
  { title: "The Green Orchard", style: "VAN_GOGH", prompt: "Van Gogh inspired green orchard, textured foliage, vivid light" },
  { title: "Sunlit Street", style: "VAN_GOGH", prompt: "Van Gogh style quiet sunlit street, warm tones, expressive texture" },
  { title: "Village Church Under Sky", style: "VAN_GOGH", prompt: "Van Gogh inspired church with dramatic sky, bold outlines and color" },
  { title: "Golden Fields Forever", style: "VAN_GOGH", prompt: "Van Gogh style endless golden fields, strong perspective, intense color" },
  { title: "Blue Sky Reflections", style: "VAN_GOGH", prompt: "Van Gogh inspired reflective water scene, swirling sky mirrored below" },
  { title: "Rustic Barn Scene", style: "VAN_GOGH", prompt: "Van Gogh style rustic barn in countryside, bold strokes, earthy tones" },
  { title: "Evening Glow Landscape", style: "VAN_GOGH", prompt: "Van Gogh inspired glowing evening landscape, rich warm tones" },
  { title: "Swirling Clouds Over Fields", style: "VAN_GOGH", prompt: "Van Gogh style swirling cloud formations over farmland, energetic brushwork" },

  { title: "The Lone Tree", style: "VAN_GOGH", prompt: "Van Gogh inspired single tree under expressive sky, emotional composition" },
  { title: "Bright Field with Path", style: "VAN_GOGH", prompt: "Van Gogh style field with path leading into distance, vivid color and motion" },
  { title: "Summer Heat Landscape", style: "VAN_GOGH", prompt: "Van Gogh inspired hot summer field, glowing yellow tones, strong sunlight" },
  { title: "Night Sky Reflections", style: "VAN_GOGH", prompt: "Van Gogh style starry sky reflected in water, swirling light" },
  { title: "The Painter’s Chair", style: "VAN_GOGH", prompt: "Van Gogh inspired wooden chair in room, textured brush strokes, warm tones" },
  { title: "Field of Red Flowers", style: "VAN_GOGH", prompt: "Van Gogh style red flower field, strong contrast, expressive paint" },
  { title: "Village Rooftops", style: "VAN_GOGH", prompt: "Van Gogh inspired rooftops under dynamic sky, bold colors" },
  { title: "Blue Horizon Line", style: "VAN_GOGH", prompt: "Van Gogh style horizon line under swirling sky, deep blues" },
  { title: "Evening Path Through Trees", style: "VAN_GOGH", prompt: "Van Gogh inspired tree-lined path at dusk, warm glow, expressive strokes" },
  { title: "Golden Sunset Horizon", style: "VAN_GOGH", prompt: "Van Gogh style glowing golden sunset, dramatic sky, strong brushwork" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style portrait of a softly smiling woman, expressive strokes, vibrant colors" },
  { title: "Historic Dinner in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired dinner scene, emotional lighting, bold brushwork" },
  { title: "Pearl Portrait in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style portrait of a young woman with a pearl earring, textured strokes" },
  { title: "Dream Night Sky in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired swirling dreamlike night sky, glowing stars, deep blues" },
  { title: "Mythic Shore in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style seaside with expressive sky, dramatic movement, vivid color" },
  { title: "Melting Time in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired surreal landscape with flowing forms and intense color" },
  { title: "Rural Couple in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style countryside couple portrait, warm tones, textured brushwork" },
  { title: "Emotional Figure in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired expressive figure under dramatic sky, strong emotion" },
  { title: "Heavenly Light in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style glowing sky with radiant light, expressive swirling strokes" },
  { title: "Abstract Conflict in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired abstract emotional composition, intense color, movement" },

  // Continue similar pattern for richness
  { title: "Sunflower Table in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style still life of sunflowers, thick paint, vibrant yellow tones" },
  { title: "Blue Horse in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired horse in open field, expressive strokes, bold color" },
  { title: "The Thinker in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style contemplative figure, emotional brushwork, textured paint" },
  { title: "Great Wave in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired dramatic wave, swirling motion, intense blue palette" },
  { title: "Golden Embrace in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style romantic embrace, vibrant colors, emotional expression" },
  { title: "City Rain in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired rainy city street, glowing reflections, textured strokes" },
  { title: "Cathedral Light in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style cathedral illuminated by dramatic sky, bold contrast" },
  { title: "Dancers in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired dancers in motion, expressive color and brushwork" },
  { title: "Open Window in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh style window view with bright outside landscape, thick strokes" },
  { title: "Cafe Night in Van Gogh Style", style: "VAN_GOGH", prompt: "Van Gogh inspired glowing cafe at night, strong contrast and emotion" },

  // Final 30 (general safe + strong visual prompts)
  ...Array.from({ length: 30 }).map((_, i) => ({
    title: `Van Gogh Study Variation ${i + 1}`,
    style: "VAN_GOGH",
    prompt:
      "Van Gogh inspired expressive painting with bold brush strokes, swirling motion, vibrant color palette, emotional intensity, textured oil paint style",
  })),
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestVanGoghFullPage() {
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({})
  const [messages, setMessages] = useState<Record<number, string>>({})
  const [runningAll, setRunningAll] = useState(false)

  const counts = useMemo(() => {
    let success = 0
    let error = 0
    let running = 0
    let idle = 0

    for (let i = 0; i < ITEMS.length; i++) {
      const s = statuses[i] || 'idle'
      if (s === 'success') success++
      else if (s === 'error') error++
      else if (s === 'running') running++
      else idle++
    }

    return { success, error, running, idle }
  }, [statuses])

  async function generateOne(item: Item, index: number) {
    setStatuses((p) => ({ ...p, [index]: 'running' }))

    try {
      const url = new URL('/api/generate/master', window.location.origin)
      url.searchParams.set('title', item.title)
      url.searchParams.set('style', item.style)
      url.searchParams.set('prompt', item.prompt)

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error(await res.text())

      setStatuses((p) => ({ ...p, [index]: 'success' }))
    } catch (e: any) {
      setStatuses((p) => ({ ...p, [index]: 'error' }))
      setMessages((p) => ({ ...p, [index]: e.message }))
    }
  }

  async function generateAll() {
    setRunningAll(true)
    for (let i = 0; i < ITEMS.length; i++) {
      if (statuses[i] !== 'success') {
        await generateOne(ITEMS[i], i)
      }
    }
    setRunningAll(false)
  }

  return (
    <main className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">Van Gogh Full Set (100)</h1>

      <button onClick={generateAll} className="bg-yellow-500 px-4 py-2 rounded">
        Generate All 100
      </button>

      <div>
        Success: {counts.success} | Errors: {counts.error} | Running:{' '}
        {counts.running}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {ITEMS.map((item, i) => (
          <div key={i} className="border p-3 rounded">
            <div>{item.title}</div>
            <div className="text-xs">{statuses[i]}</div>
            <button onClick={() => generateOne(item, i)}>
              Generate
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
