'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL VERMEER WORKS
  // =========================
  { title: "Woman by the Window", style: "VERMEER", prompt: "Johannes Vermeer inspired woman standing by a window, soft natural daylight, calm domestic interior, refined realism, luminous painting" },
  { title: "The Quiet Letter", style: "VERMEER", prompt: "Vermeer inspired woman reading a letter in a quiet room, soft side window light, subtle expression, Dutch interior realism" },
  { title: "Pearls in Morning Light", style: "VERMEER", prompt: "Vermeer inspired portrait of a young woman wearing pearls, soft morning light from a window, delicate realism, calm interior" },
  { title: "Map on the Wall", style: "VERMEER", prompt: "Vermeer inspired Dutch interior with map on the wall, woman seated at a table, soft daylight, refined realism" },
  { title: "The Blue Shawl", style: "VERMEER", prompt: "Vermeer inspired portrait of a woman in a blue shawl, luminous skin tones, soft window light, intimate realism" },
  { title: "Milk and Bread", style: "VERMEER", prompt: "Vermeer inspired domestic still life with milk and bread on a table, gentle daylight, rich texture, quiet atmosphere" },
  { title: "Young Woman at the Table", style: "VERMEER", prompt: "Vermeer inspired young woman seated at a table, calm expression, soft side lighting, Dutch golden age realism" },
  { title: "Afternoon in Delft", style: "VERMEER", prompt: "Vermeer inspired interior in afternoon light, quiet room, woman near window, elegant realism" },
  { title: "The Lute Player", style: "VERMEER", prompt: "Vermeer inspired young woman playing lute in a softly lit room, refined realism, tranquil mood" },
  { title: "Stillness by the Curtain", style: "VERMEER", prompt: "Vermeer inspired quiet interior with curtain, table, and softly lit figure, subtle color harmony, realism" },

  { title: "The Golden Room", style: "VERMEER", prompt: "Vermeer inspired warm Dutch room with soft daylight, table and chair, quiet elegance, detailed realism" },
  { title: "Woman Holding a Cup", style: "VERMEER", prompt: "Vermeer inspired woman holding a cup by the window, gentle light, serene domestic atmosphere" },
  { title: "The Delft Table", style: "VERMEER", prompt: "Vermeer inspired table with blue cloth and ceramics, soft daylight, refined stillness" },
  { title: "The Quiet Conversation", style: "VERMEER", prompt: "Vermeer inspired two women in quiet conversation inside a Dutch room, luminous light, calm realism" },
  { title: "Morning in the Studio", style: "VERMEER", prompt: "Vermeer inspired painter's studio in soft morning light, orderly space, warm realism" },
  { title: "The Writing Desk", style: "VERMEER", prompt: "Vermeer inspired woman writing at a small desk, side window light, subtle realism, domestic calm" },
  { title: "A Glass of Wine", style: "VERMEER", prompt: "Vermeer inspired interior with woman and glass of wine, soft light, warm Dutch atmosphere, elegant realism" },
  { title: "The Quiet Music Lesson", style: "VERMEER", prompt: "Vermeer inspired music lesson in a softly lit Dutch room, detailed interior, peaceful realism" },
  { title: "Yellow Dress at Noon", style: "VERMEER", prompt: "Vermeer inspired portrait of woman in yellow dress, window light, luminous fabric, quiet realism" },
  { title: "The Pearl Ribbon", style: "VERMEER", prompt: "Vermeer inspired young woman with pearl ribbon, intimate portrait, soft shadow, luminous skin tones" },

  { title: "The Delft Chair", style: "VERMEER", prompt: "Vermeer inspired interior centered on an ornate chair, quiet daylight, Dutch realism" },
  { title: "The Open Window", style: "VERMEER", prompt: "Vermeer inspired open window illuminating a calm interior, refined detail, tranquil atmosphere" },
  { title: "The Quiet Needlework", style: "VERMEER", prompt: "Vermeer inspired woman engaged in needlework, soft window light, intimate realism" },
  { title: "Tablecloth and Fruit", style: "VERMEER", prompt: "Vermeer inspired still life with fruit on a draped table, gentle daylight, Dutch interior realism" },
  { title: "The Delft Letter", style: "VERMEER", prompt: "Vermeer inspired woman holding a letter in a softly lit room, delicate emotional restraint, realism" },
  { title: "Morning Light on Ceramics", style: "VERMEER", prompt: "Vermeer inspired Delft ceramics lit by a side window, quiet domestic stillness, luminous detail" },
  { title: "Young Woman in Blue and Gold", style: "VERMEER", prompt: "Vermeer inspired portrait in blue and gold clothing, calm gaze, radiant but soft interior light" },
  { title: "The Interior with Map", style: "VERMEER", prompt: "Vermeer inspired domestic room with map, chair and window, balanced composition, gentle realism" },
  { title: "The Piano Corner", style: "VERMEER", prompt: "Vermeer inspired piano corner in a Dutch room, soft afternoon light, refined atmosphere" },
  { title: "Quiet Delft Morning", style: "VERMEER", prompt: "Vermeer inspired early morning in a Dutch room, cool daylight, peaceful stillness, elegant realism" },

  { title: "The Lace Table", style: "VERMEER", prompt: "Vermeer inspired table with lace cloth and small objects, soft side light, refined texture" },
  { title: "Woman with White Collar", style: "VERMEER", prompt: "Vermeer inspired portrait of woman with white collar, gentle realism, calm expression, window light" },
  { title: "The Reading Room", style: "VERMEER", prompt: "Vermeer inspired quiet reading room in Dutch interior, soft daylight, subtle shadows, still atmosphere" },
  { title: "The Delft Mirror", style: "VERMEER", prompt: "Vermeer inspired small mirror in a domestic room, reflected window light, detailed realism" },
  { title: "Woman Turning Toward Light", style: "VERMEER", prompt: "Vermeer inspired woman turning toward daylight from a window, elegant realism, serene interior" },
  { title: "The Quiet Shelf", style: "VERMEER", prompt: "Vermeer inspired shelf with books and ceramics in side light, intimate Dutch interior realism" },
  { title: "The Linen Cloth", style: "VERMEER", prompt: "Vermeer inspired still life with linen cloth, fruit and ceramic bowl, luminous quiet detail" },
  { title: "The Delft Curtain", style: "VERMEER", prompt: "Vermeer inspired interior with curtain drawn back, revealing woman in soft daylight, refined realism" },
  { title: "A Calm Afternoon Table", style: "VERMEER", prompt: "Vermeer inspired simple table in afternoon light, subtle realism, quiet Dutch atmosphere" },
  { title: "Woman in Pearl Light", style: "VERMEER", prompt: "Vermeer inspired portrait of a woman bathed in pearly daylight, soft realism, intimate composition" },

  { title: "The Delft Jug", style: "VERMEER", prompt: "Vermeer inspired still life with Delft jug and folded cloth, side lighting, understated realism" },
  { title: "The Quiet Entryway", style: "VERMEER", prompt: "Vermeer inspired Dutch entryway interior with calm morning light, clean composition, subtle mood" },
  { title: "The Writing Woman in Blue", style: "VERMEER", prompt: "Vermeer inspired woman in blue writing a letter at table, side light, delicate realism" },
  { title: "The Measured Room", style: "VERMEER", prompt: "Vermeer inspired balanced interior room with geometric order, gentle daylight, Dutch realism" },
  { title: "The Delft Music Sheet", style: "VERMEER", prompt: "Vermeer inspired music sheet on a table in soft light, quiet interior, painterly realism" },
  { title: "The Golden Cupboard", style: "VERMEER", prompt: "Vermeer inspired room with cupboard illuminated by window light, warm and refined realism" },
  { title: "Young Woman with Book", style: "VERMEER", prompt: "Vermeer inspired young woman holding a book near a window, calm light, intimate realism" },
  { title: "Stillness in Blue", style: "VERMEER", prompt: "Vermeer inspired blue-toned Dutch room, soft daylight, silent atmosphere, elegant realism" },
  { title: "The Delft Shawl", style: "VERMEER", prompt: "Vermeer inspired portrait with Delft blue shawl, soft luminous light, restrained expression" },
  { title: "The Quiet Noon Room", style: "VERMEER", prompt: "Vermeer inspired quiet room at noon, polished surfaces, side lighting, domestic serenity" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired reinterpretation of a softly smiling woman, Dutch interior, soft side window light, intimate realism" },
  { title: "Historic Dinner in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired reinterpretation of a historic dinner scene, calm Dutch interior, luminous side light, composed realism" },
  { title: "Pearl Portrait in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired portrait of a young woman with pearl jewelry, delicate light, soft shadows, elegant realism" },
  { title: "Dream Night Sky in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired night sky seen through a Dutch window, subtle glow, refined quiet atmosphere, realism" },
  { title: "Mythic Shore in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired coastal scene rendered with calm realism and soft northern light, restrained composition" },
  { title: "Melting Time in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired symbolic time scene in a Dutch room, subtle surreal suggestion, soft daylight realism" },
  { title: "Rural Couple in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired quiet portrait of a rural couple in interior light, restrained emotion, Dutch realism" },
  { title: "Emotional Figure in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired emotional figure in a softly lit room, calm composition, intimate realism" },
  { title: "Heavenly Light in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired interior suffused with heavenly light from a side window, serene realism" },
  { title: "Abstract Conflict in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired symbolic composition about conflict rendered as a quiet Dutch interior with subtle tension" },

  { title: "Sunflower Table in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired still life of sunflowers on a Dutch table, soft daylight, restrained color, fine realism" },
  { title: "Blue Horse in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired calm equine portrait in cool daylight, soft realism, elegant Dutch composition" },
  { title: "The Thinker in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired thoughtful seated figure by a window, luminous side light, quiet realism" },
  { title: "Great Wave in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired coastal wave under calm northern light, realistic water textures, serene composition" },
  { title: "Golden Embrace in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired tender embrace in a softly lit Dutch room, intimate realism, delicate shadows" },
  { title: "City Rain in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired rainy city window view, subtle reflections, calm light, Dutch realism" },
  { title: "Cathedral Light in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired cathedral interior softened into a quiet Dutch light study, refined realism" },
  { title: "Dancers in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired graceful dancers in a luminous room, controlled movement, elegant realism" },
  { title: "Open Window in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired open window scene with delicate curtains and soft daylight, intimate Dutch realism" },
  { title: "Cafe Night in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired night cafe interior with warm candles and soft shadows, quiet realism" },

  { title: "Mother and Child in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired mother and child in a softly lit domestic interior, delicate realism, serene mood" },
  { title: "Garden Statues in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired garden statuary seen from a Dutch window, soft light, measured realism" },
  { title: "Quiet Harbor in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired harbor scene with calm water and diffused daylight, refined realism" },
  { title: "The Musician in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired musician in a Dutch room, side window light, warm detail, elegant realism" },
  { title: "Ancient Ruins in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired distant ancient ruins rendered with soft northern light and restrained realism" },
  { title: "Festival Lights in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired evening gathering illuminated by warm lanterns, calm composition, Dutch realism" },
  { title: "Rose Balcony in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired balcony with roses in clear daylight, delicate architecture, intimate realism" },
  { title: "The Reader in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired quiet reader by a window, concentrated stillness, luminous Dutch realism" },
  { title: "Moonlit Bridge in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired moonlit bridge scene with calm water and subtle silver light, refined realism" },
  { title: "Mountain View in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired distant mountain view framed by a Dutch window, soft atmosphere, realistic quiet light" },

  { title: "Seaside Portrait in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired portrait beside a calm sea, controlled daylight, delicate skin tones, elegant realism" },
  { title: "The Blue Room in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired blue interior room with quiet order, soft side light, detailed Dutch realism" },
  { title: "Harvest Workers in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired harvest scene observed with restrained realism and soft northern light" },
  { title: "Royal Garden in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired formal garden scene with calm composition and luminous daylight realism" },
  { title: "Stormy Sea in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired sea under a muted storm sky, subtle realism, controlled palette, fine detail" },
  { title: "Autumn Portrait in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired autumn portrait in warm window light, rich fabric, delicate realism" },
  { title: "The Marble Garden in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired marble garden scene rendered with quiet light and measured composition" },
  { title: "Wheat Field in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired wheat field in soft morning light, realistic quiet atmosphere, restrained composition" },
  { title: "Soft Procession in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired ceremonial gathering under gentle daylight, composed figures, Dutch realism" },
  { title: "Window of Flowers in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired bouquet of flowers by an open window, luminous side light, subtle realism" },

  { title: "Palace Courtyard in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired courtyard scene with calm daylight and measured architecture, refined realism" },
  { title: "The Poet in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired portrait of a poet seated in a softly lit Dutch room, quiet contemplation, realism" },
  { title: "Theater Evening in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired evening theater interior with warm lantern glow, composed realism, subtle drama" },
  { title: "Canal View in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired canal view in cool daylight, still water, Dutch architectural realism" },
  { title: "Garden Tea in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired tea setting in a calm garden, clear daylight, elegant realism" },
  { title: "Quiet Library in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired library interior with a reader and soft side light, restrained realism" },
  { title: "The Standing Muse in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired standing muse in a Dutch room, luminous side light, poised realism" },
  { title: "Harbor Lanterns in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired harbor at dusk with lantern reflections, calm water, quiet realism" },
  { title: "Classical Orchard in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired orchard scene with soft morning light, measured realism, peaceful atmosphere" },
  { title: "Ancient Balcony in Vermeer Style", style: "VERMEER", prompt: "Vermeer inspired balcony overlooking an old city, soft daylight, refined architecture, intimate realism" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestVermeerFullPage() {
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({})
  const [messages, setMessages] = useState<Record<number, string>>({})
  const [runningAll, setRunningAll] = useState(false)

  const counts = useMemo(() => {
    let idle = 0
    let running = 0
    let success = 0
    let error = 0

    for (let i = 0; i < ITEMS.length; i++) {
      const s = statuses[i] || 'idle'
      if (s === 'idle') idle++
      if (s === 'running') running++
      if (s === 'success') success++
      if (s === 'error') error++
    }

    return { idle, running, success, error }
  }, [statuses])

  async function generateOne(item: Item, index: number) {
    setStatuses((prev) => ({ ...prev, [index]: 'running' }))
    setMessages((prev) => ({ ...prev, [index]: 'Generating...' }))

    try {
      const url = new URL('/api/generate/master', window.location.origin)
      url.searchParams.set('title', item.title)
      url.searchParams.set('style', item.style)
      url.searchParams.set('prompt', item.prompt)

      const res = await fetch(url.toString(), {
        method: 'GET',
      })

      const text = await res.text()

      if (!res.ok) {
        setStatuses((prev) => ({ ...prev, [index]: 'error' }))
        setMessages((prev) => ({
          ...prev,
          [index]: `Error ${res.status}${text ? `: ${text.slice(0, 180)}` : ''}`,
        }))
        return
      }

      setStatuses((prev) => ({ ...prev, [index]: 'success' }))
      setMessages((prev) => ({ ...prev, [index]: 'Done' }))
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [index]: 'error' }))
      setMessages((prev) => ({
        ...prev,
        [index]: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }

  async function generateAll() {
    setRunningAll(true)
    try {
      for (let i = 0; i < ITEMS.length; i++) {
        const current = statuses[i]
        if (current === 'success') continue
        await generateOne(ITEMS[i], i)
      }
    } finally {
      setRunningAll(false)
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Generate Full Vermeer Set</h1>
        <p className="text-slate-400 text-sm">
          100 Vermeer artworks: 50 originals + 50 reinterpretations.
        </p>
        <div className="text-sm text-slate-300">
          Success: {counts.success} • Running: {counts.running} • Errors: {counts.error} • Idle: {counts.idle}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={generateAll}
          disabled={runningAll}
          className="rounded-lg bg-amber-500 px-4 py-2 text-black font-medium disabled:opacity-60"
        >
          {runningAll ? 'Generating...' : 'Generate All 100'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ITEMS.map((item, index) => {
          const status = statuses[index] || 'idle'
          const message = messages[index] || ''

          return (
            <div
              key={`${item.style}-${item.title}`}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3"
            >
              <div>
                <div className="text-sm text-slate-400">{item.style}</div>
                <div className="text-base font-medium text-slate-100">{item.title}</div>
                <div className="text-xs text-slate-500 mt-1">{item.prompt}</div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div
                  className={[
                    'text-xs px-2 py-1 rounded-full border',
                    status === 'idle' && 'border-slate-700 text-slate-400',
                    status === 'running' && 'border-amber-500 text-amber-300',
                    status === 'success' && 'border-emerald-500 text-emerald-300',
                    status === 'error' && 'border-red-500 text-red-300',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {status.toUpperCase()}
                </div>

                <button
                  type="button"
                  disabled={status === 'running' || runningAll}
                  onClick={() => generateOne(item, index)}
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-amber-400 disabled:opacity-60"
                >
                  Generate this one
                </button>
              </div>

              {message ? (
                <div className="text-xs text-slate-400 break-words">{message}</div>
              ) : null}
            </div>
          )
        })}
      </div>
    </main>
  )
}
