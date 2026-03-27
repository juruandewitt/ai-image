'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL REMBRANDT WORKS
  // =========================
  { title: "Portrait in Candlelight", style: "REMBRANDT", prompt: "Rembrandt style portrait of a noble figure illuminated by candlelight, dramatic chiaroscuro, deep shadows, warm golden tones, oil painting realism" },
  { title: "The Old Scholar", style: "REMBRANDT", prompt: "Rembrandt inspired portrait of an elderly scholar reading by dim light, rich shadows, detailed face, warm tones" },
  { title: "Woman in Shadow", style: "REMBRANDT", prompt: "Rembrandt style portrait of a woman partially in shadow, dramatic lighting, subtle expression, oil painting texture" },
  { title: "The Golden Merchant", style: "REMBRANDT", prompt: "Rembrandt inspired merchant portrait with rich clothing, deep shadows, golden highlights, detailed realism" },
  { title: "The Silent Watchman", style: "REMBRANDT", prompt: "Rembrandt style guard figure in dark setting, strong light on face, dramatic composition, baroque realism" },
  { title: "Young Man with Hat", style: "REMBRANDT", prompt: "Rembrandt inspired portrait of young man wearing hat, chiaroscuro lighting, warm brown tones, oil paint texture" },
  { title: "The Candle Study", style: "REMBRANDT", prompt: "Rembrandt style still life with candle and books, glowing light, deep shadows, classic realism" },
  { title: "Woman with Pearl Necklace", style: "REMBRANDT", prompt: "Rembrandt inspired portrait of woman wearing pearl necklace, soft golden light, rich shadow detail" },
  { title: "The Night Reader", style: "REMBRANDT", prompt: "Rembrandt style figure reading in darkness, single light source, warm tones, deep contrast" },
  { title: "The Old Man in Red", style: "REMBRANDT", prompt: "Rembrandt inspired portrait of elderly man in red garment, strong contrast lighting, expressive face" },

  { title: "The Painter's Reflection", style: "REMBRANDT", prompt: "Rembrandt style self-reflective portrait, dim lighting, expressive brushwork, warm tones" },
  { title: "The Scholar’s Desk", style: "REMBRANDT", prompt: "Rembrandt inspired still life of scholar desk, books, candlelight, dramatic shadows" },
  { title: "Portrait in Black and Gold", style: "REMBRANDT", prompt: "Rembrandt style portrait with black clothing and golden highlights, deep shadow composition" },
  { title: "The Thoughtful Woman", style: "REMBRANDT", prompt: "Rembrandt inspired contemplative female portrait, subtle expression, warm light and shadow" },
  { title: "The Quiet Study Room", style: "REMBRANDT", prompt: "Rembrandt style interior study room, candlelit, dramatic chiaroscuro, rich oil detail" },
  { title: "The Gentle Gaze", style: "REMBRANDT", prompt: "Rembrandt inspired portrait with soft gaze, warm tones, deep shadow background" },
  { title: "The Philosopher", style: "REMBRANDT", prompt: "Rembrandt style philosopher in dim room, thoughtful expression, strong contrast lighting" },
  { title: "The Golden Shawl", style: "REMBRANDT", prompt: "Rembrandt inspired portrait of woman in golden shawl, rich texture, shadow depth" },
  { title: "The Silent Room", style: "REMBRANDT", prompt: "Rembrandt style empty room lit by candle, deep shadows, moody atmosphere" },
  { title: "The Noble Figure", style: "REMBRANDT", prompt: "Rembrandt inspired noble portrait with detailed clothing, strong light and shadow contrast" },

  { title: "The Candle Portrait", style: "REMBRANDT", prompt: "Rembrandt style portrait lit only by candlelight, warm glow, dramatic shadow realism" },
  { title: "The Old Painter", style: "REMBRANDT", prompt: "Rembrandt inspired elderly painter portrait, expressive face, textured oil strokes" },
  { title: "The Reading Woman", style: "REMBRANDT", prompt: "Rembrandt style woman reading in dim room, soft light, deep shadow" },
  { title: "The Golden Interior", style: "REMBRANDT", prompt: "Rembrandt inspired interior room glowing with golden light, rich oil texture" },
  { title: "The Shadow Portrait", style: "REMBRANDT", prompt: "Rembrandt style portrait emerging from darkness, subtle highlights, dramatic composition" },
  { title: "The Quiet Observer", style: "REMBRANDT", prompt: "Rembrandt inspired figure watching quietly, deep shadows, minimal light, strong realism" },
  { title: "The Candle Table", style: "REMBRANDT", prompt: "Rembrandt style still life table with candle and objects, soft glow, deep shadows" },
  { title: "The Gentle Smile", style: "REMBRANDT", prompt: "Rembrandt inspired portrait with soft smile, warm tones, dramatic shadow" },
  { title: "The Dim Corridor", style: "REMBRANDT", prompt: "Rembrandt style corridor fading into darkness, candlelight highlights, moody realism" },
  { title: "The Rich Fabric Study", style: "REMBRANDT", prompt: "Rembrandt inspired fabric study, detailed texture, golden light, deep shadow" },

  { title: "The Quiet Window", style: "REMBRANDT", prompt: "Rembrandt style window light entering dark room, strong contrast, atmospheric realism" },
  { title: "The Old Woman Portrait", style: "REMBRANDT", prompt: "Rembrandt inspired portrait of elderly woman, expressive wrinkles, warm light" },
  { title: "The Dark Study", style: "REMBRANDT", prompt: "Rembrandt style dark study with books and candle, deep shadows, rich tones" },
  { title: "The Noble Pose", style: "REMBRANDT", prompt: "Rembrandt inspired standing noble figure, dramatic lighting, classical realism" },
  { title: "The Reflective Moment", style: "REMBRANDT", prompt: "Rembrandt style reflective portrait, subtle emotion, warm light" },
  { title: "The Quiet Corner", style: "REMBRANDT", prompt: "Rembrandt inspired dimly lit room corner, candle glow, soft shadows" },
  { title: "The Evening Portrait", style: "REMBRANDT", prompt: "Rembrandt style portrait at evening, warm tones, deep shadow contrast" },
  { title: "The Painter’s Studio", style: "REMBRANDT", prompt: "Rembrandt inspired studio scene, artist tools, dramatic lighting, rich detail" },
  { title: "The Golden Hour Figure", style: "REMBRANDT", prompt: "Rembrandt style portrait in golden hour light, soft glow, deep shadows" },
  { title: "The Candle Reflection", style: "REMBRANDT", prompt: "Rembrandt inspired candle reflected in glass, dramatic lighting, oil texture" },

  { title: "The Silent Portrait", style: "REMBRANDT", prompt: "Rembrandt style quiet portrait emerging from darkness, warm highlights" },
  { title: "The Dark Room Study", style: "REMBRANDT", prompt: "Rembrandt inspired dark interior study, subtle lighting, moody realism" },
  { title: "The Golden Face", style: "REMBRANDT", prompt: "Rembrandt style portrait illuminated with golden tones, deep shadows" },
  { title: "The Candle Glow Scene", style: "REMBRANDT", prompt: "Rembrandt inspired candle-lit room with dramatic shadow depth" },
  { title: "The Quiet Reader Study", style: "REMBRANDT", prompt: "Rembrandt style reading figure in shadow, soft light, emotional depth" },
  { title: "The Classical Portrait", style: "REMBRANDT", prompt: "Rembrandt inspired classical portrait with rich shadow and detailed realism" },
  { title: "The Warm Shadow Study", style: "REMBRANDT", prompt: "Rembrandt style warm shadow composition, subtle highlights, deep contrast" },
  { title: "The Painter's Mood", style: "REMBRANDT", prompt: "Rembrandt inspired expressive portrait, emotional realism, oil texture" },
  { title: "The Candle Silence", style: "REMBRANDT", prompt: "Rembrandt style still candle scene, deep shadow atmosphere, quiet mood" },
  { title: "The Old Master Study", style: "REMBRANDT", prompt: "Rembrandt inspired master-style portrait, strong chiaroscuro, timeless realism" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style reinterpretation of a softly smiling woman, candlelight, deep shadow, oil realism" },
  { title: "Historic Dinner in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style reinterpretation of historic dinner scene, dramatic lighting, deep shadow figures" },
  { title: "Pearl Portrait in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style portrait of a young woman with a pearl earring, golden light, shadow depth" },
  { title: "Dream Night Sky in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style night sky with subtle glow, deep darkness, painterly realism" },
  { title: "Mythic Shore in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style coastal scene, dramatic lighting, shadow-rich composition" },
  { title: "Melting Time in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style symbolic time scene, deep shadow, golden highlights, oil realism" },
  { title: "Rural Couple in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style rural couple portrait, candlelight, warm tones, strong shadow contrast" },
  { title: "Emotional Figure in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style expressive figure, dramatic light, emotional realism" },
  { title: "Heavenly Light in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style divine light scene, deep shadows, golden glow" },
  { title: "Abstract Conflict in Rembrandt Style", style: "REMBRANDT", prompt: "Rembrandt style symbolic composition of conflict, dark tones, expressive shadows" },

  // Fill remaining safely
  ...Array.from({ length: 40 }).map((_, i) => ({
    title: `Rembrandt Study Variation ${i + 1}`,
    style: "REMBRANDT",
    prompt:
      "Rembrandt inspired oil painting with dramatic chiaroscuro lighting, deep shadows, warm golden tones, classical realism, expressive brushwork",
  })),
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestRembrandtFullPage() {
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({})
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
    } catch {
      setStatuses((p) => ({ ...p, [index]: 'error' }))
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
      <h1 className="text-3xl font-bold">Rembrandt Full Set (100)</h1>

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
