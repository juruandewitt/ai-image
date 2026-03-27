'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // 1-50 ORIGINAL MONET WORKS
  { title: "Morning Light on the River", style: "MONET", prompt: "Claude Monet inspired impressionist river sunrise, soft brush strokes, pastel tones, light reflections on water, peaceful landscape" },
  { title: "Garden in Bloom", style: "MONET", prompt: "Monet inspired impressionist flower garden, colorful blossoms, sunlight through trees, soft natural brushwork" },
  { title: "Water Lilies at Dawn", style: "MONET", prompt: "Monet inspired pond with water lilies at dawn, pastel reflections, calm water, impressionist atmosphere" },
  { title: "Sunset Over Fields", style: "MONET", prompt: "Monet inspired countryside at sunset, warm glowing tones, soft horizon, impressionist landscape" },
  { title: "Bridge Over Quiet Water", style: "MONET", prompt: "Monet inspired bridge over a peaceful pond, reflections, soft colors, impressionist garden scene" },
  { title: "Misty Morning Garden", style: "MONET", prompt: "Monet inspired misty garden, muted tones, soft morning light, dreamy impressionist scene" },
  { title: "Spring Blossom Path", style: "MONET", prompt: "Monet inspired spring blossom path, airy light, delicate petals, impressionist brushwork" },
  { title: "Reflections of Sky", style: "MONET", prompt: "Monet inspired water reflections of a pastel sky, calm surface, impressionist atmosphere" },
  { title: "Summer Meadow Light", style: "MONET", prompt: "Monet inspired summer meadow in sunlight, warm tones, soft impressionist texture" },
  { title: "Quiet Pond Afternoon", style: "MONET", prompt: "Monet inspired quiet afternoon by a pond, reflections, peaceful natural light, impressionist style" },

  { title: "Lavender Air at Dusk", style: "MONET", prompt: "Monet inspired lavender field at dusk, impressionist brushwork, soft purple and gold light" },
  { title: "Boats on the Bright Harbor", style: "MONET", prompt: "Monet inspired harbor with small boats, bright water reflections, impressionist seaside mood" },
  { title: "Rain Over the Garden Gate", style: "MONET", prompt: "Monet inspired rainy garden entrance, wet stone path, soft diffuse light, impressionist style" },
  { title: "Poppies in Late Summer", style: "MONET", prompt: "Monet inspired field of poppies, warm breeze, impressionist flowers, soft sky" },
  { title: "Blue Morning Canal", style: "MONET", prompt: "Monet inspired canal scene in blue morning light, impressionist reflections, soft architecture" },
  { title: "Clouds Above the Meadow", style: "MONET", prompt: "Monet inspired meadow under layered clouds, impressionist light, wide natural view" },
  { title: "White Roses by the Window", style: "MONET", prompt: "Monet inspired still life of white roses near a bright window, gentle impressionist brushwork" },
  { title: "Autumn Light on the Pond", style: "MONET", prompt: "Monet inspired autumn pond, amber leaves, soft reflections, impressionist palette" },
  { title: "Quiet Boats at Sunrise", style: "MONET", prompt: "Monet inspired sunrise with quiet wooden boats, glowing sky, impressionist harbor scene" },
  { title: "Iris Garden Morning", style: "MONET", prompt: "Monet inspired iris garden in morning light, lush color, soft impressionist brushwork" },

  { title: "Snow Light by the Riverbank", style: "MONET", prompt: "Monet inspired snowy riverbank, pale winter light, impressionist texture and reflections" },
  { title: "Golden Reeds and Water", style: "MONET", prompt: "Monet inspired marsh reeds in golden light, calm water, impressionist natural scene" },
  { title: "Blossoms Beside the Stream", style: "MONET", prompt: "Monet inspired blossoms by a shallow stream, fresh spring color, soft atmospheric brushwork" },
  { title: "Evening Glow in the Orchard", style: "MONET", prompt: "Monet inspired orchard at evening, warm low sunlight, impressionist foliage" },
  { title: "Still Water Under Pink Clouds", style: "MONET", prompt: "Monet inspired still water beneath pink sunset clouds, pastel reflections, tranquil mood" },
  { title: "Garden Bench in Summer Shade", style: "MONET", prompt: "Monet inspired garden bench under trees, soft shade, dappled light, impressionist scene" },
  { title: "Coastal Breeze at Noon", style: "MONET", prompt: "Monet inspired coast at noon, bright breeze, sea light, impressionist strokes" },
  { title: "Lilac Path After Rain", style: "MONET", prompt: "Monet inspired lilac path after rain, damp reflections, floral atmosphere, impressionist texture" },
  { title: "Bright Canal Afternoon", style: "MONET", prompt: "Monet inspired bright canal in afternoon sun, impressionist architecture and water reflections" },
  { title: "Willows Over the Water", style: "MONET", prompt: "Monet inspired willow trees hanging over water, soft greens, reflective pond, impressionism" },

  { title: "Wildflowers at the Edge of Spring", style: "MONET", prompt: "Monet inspired spring wildflowers in soft sunlight, impressionist field scene" },
  { title: "Haystacks Under Warm Sky", style: "MONET", prompt: "Monet inspired haystacks beneath a warm glowing sky, impressionist rural scene" },
  { title: "Rose Garden Breeze", style: "MONET", prompt: "Monet inspired rose garden with gentle breeze, layered petals, soft brushwork" },
  { title: "Light Across the Lily Pond", style: "MONET", prompt: "Monet inspired light dancing across a lily pond, impressionist reflections and color" },
  { title: "Soft Harbor Haze", style: "MONET", prompt: "Monet inspired harbor in gentle haze, pastel colors, impressionist boats and water" },
  { title: "Spring Rain Over Blossoms", style: "MONET", prompt: "Monet inspired spring rain on blossoms, muted natural light, impressionist garden scene" },
  { title: "Golden Bridge at Sunset", style: "MONET", prompt: "Monet inspired bridge at sunset, warm gold and lavender, impressionist reflections" },
  { title: "Field of Blue Irises", style: "MONET", prompt: "Monet inspired field of blue irises, impressionist floral landscape, soft sky" },
  { title: "Quiet Reflections at Noon", style: "MONET", prompt: "Monet inspired still water at noon, calm reflections, gentle impressionist mood" },
  { title: "The Pond in Early Spring", style: "MONET", prompt: "Monet inspired pond in early spring, fresh greens, pale blossoms, impressionist atmosphere" },

  { title: "Clouded Harbor Morning", style: "MONET", prompt: "Monet inspired harbor under soft cloud cover, muted light, impressionist marine scene" },
  { title: "Pastel Shoreline", style: "MONET", prompt: "Monet inspired pastel shoreline, calm sea, airy color, impressionist coast" },
  { title: "The Garden After Rain", style: "MONET", prompt: "Monet inspired garden after rainfall, wet leaves, reflective stones, impressionist texture" },
  { title: "Orange Light Through Trees", style: "MONET", prompt: "Monet inspired orange evening light through trees, glowing leaves, impressionist brushwork" },
  { title: "Lilies in Silver Morning", style: "MONET", prompt: "Monet inspired lilies under silver morning light, pond reflections, soft impressionist style" },
  { title: "Golden Meadow Wind", style: "MONET", prompt: "Monet inspired meadow with warm wind, glowing grass, impressionist movement" },
  { title: "Water Garden in Bloom", style: "MONET", prompt: "Monet inspired blooming water garden, layered petals, calm reflections, impressionist color" },
  { title: "Quiet Village by the Canal", style: "MONET", prompt: "Monet inspired village beside a canal, pastel buildings, shimmering water, impressionist mood" },
  { title: "The Blue Bridge", style: "MONET", prompt: "Monet inspired blue-toned bridge over water, impressionist reflections, calm atmosphere" },
  { title: "Soft Evening Over the Reeds", style: "MONET", prompt: "Monet inspired evening over reeds and water, muted pastel sky, impressionist natural calm" },

  // 51-100 REINTERPRETATIONS IN MONET STYLE
  { title: "Soft Smile in Monet Style", style: "MONET", prompt: "Impressionist portrait of a softly smiling woman, inspired by a classic museum portrait, pastel tones, gentle brush strokes" },
  { title: "Shared Meal in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a historic shared meal scene, warm light, soft colors, balanced group composition" },
  { title: "Pearl Portrait in Monet Style", style: "MONET", prompt: "Impressionist portrait of a young woman wearing a pearl earring, soft tones, subtle light, elegant brushwork" },
  { title: "Dreamlike Night Sky in Monet Style", style: "MONET", prompt: "Impressionist night sky with glowing stars and soft swirling clouds, gentle blue tones, dreamlike atmosphere" },
  { title: "Mythic Shore in Monet Style", style: "MONET", prompt: "Impressionist mythological figure emerging near the sea, pastel palette, soft flowing forms, classical beauty" },
  { title: "Melting Time in Monet Style", style: "MONET", prompt: "Impressionist surreal landscape with softened clocks and dreamlike forms, pastel light, atmospheric scene" },
  { title: "Rural Portrait in Monet Style", style: "MONET", prompt: "Impressionist portrait of two rural figures before a farmhouse, warm light, soft brushwork, gentle countryside mood" },
  { title: "Echo of Emotion in Monet Style", style: "MONET", prompt: "Impressionist emotional figure on a bridge under dramatic sky, expressive colors, softened forms" },
  { title: "Heavenly Touch in Monet Style", style: "MONET", prompt: "Impressionist interpretation of two hands nearly touching in a divine sky scene, soft light, airy clouds" },
  { title: "Abstract Conflict in Monet Style", style: "MONET", prompt: "Impressionist abstract scene inspired by themes of conflict and sorrow, flowing colors, softened broken forms" },

  { title: "Marble Figure in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a monumental marble figure, pastel tones, softened sculptural presence, museum atmosphere" },
  { title: "Girl by the Window in Monet Style", style: "MONET", prompt: "Impressionist interior portrait of a girl by a bright window, gentle color, soft brush strokes" },
  { title: "Sunflower Table in Monet Style", style: "MONET", prompt: "Impressionist still life of sunflowers on a table, luminous yellow tones, relaxed brushwork" },
  { title: "Whirling Dancers in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of graceful dancers in motion, airy brushwork, warm stage light" },
  { title: "Great Wave in Monet Style", style: "MONET", prompt: "Impressionist seascape featuring a dramatic wave, pastel foam, soft atmospheric light" },
  { title: "Blue Horse in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a blue horse in an open field, softened contours, lyrical color" },
  { title: "Golden Kiss in Monet Style", style: "MONET", prompt: "Impressionist romantic embrace with shimmering warm tones, floral softness, dreamlike light" },
  { title: "Cafe Night in Monet Style", style: "MONET", prompt: "Impressionist evening cafe scene, glowing lamps, warm reflections, gentle brush strokes" },
  { title: "Stormy Sea in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a stormy sea, expressive but softened waves, moody pastel sky" },
  { title: "Autumn Portrait in Monet Style", style: "MONET", prompt: "Impressionist portrait with autumn light and soft leaves, subtle expression, painterly atmosphere" },

  { title: "Harvest Workers in Monet Style", style: "MONET", prompt: "Impressionist field scene with distant harvest workers, warm gold light, rural calm" },
  { title: "Blue Room in Monet Style", style: "MONET", prompt: "Impressionist interior painted in cool blue light, soft furniture forms, elegant mood" },
  { title: "Moonlit Bridge in Monet Style", style: "MONET", prompt: "Impressionist moonlit bridge over quiet water, silver reflections, soft blue palette" },
  { title: "Royal Garden in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a grand palace garden, floral pathways, atmospheric sunlight" },
  { title: "Cathedral Light in Monet Style", style: "MONET", prompt: "Impressionist cathedral facade in changing light, soft color shifts, luminous surface" },
  { title: "The Musician in Monet Style", style: "MONET", prompt: "Impressionist portrait of a musician in warm indoor light, painterly detail, soft expression" },
  { title: "Mother and Child in Monet Style", style: "MONET", prompt: "Impressionist mother and child scene, gentle natural light, soft brushwork, calm tenderness" },
  { title: "Garden Tea in Monet Style", style: "MONET", prompt: "Impressionist outdoor tea setting in a flower garden, dappled sunlight, elegant pastel mood" },
  { title: "Window of Flowers in Monet Style", style: "MONET", prompt: "Impressionist floral window arrangement, soft sunbeams, delicate petals, painterly calm" },
  { title: "Mountain View in Monet Style", style: "MONET", prompt: "Impressionist landscape of distant mountains, gentle haze, reflective light, pastel palette" },

  { title: "Pear Orchard in Monet Style", style: "MONET", prompt: "Impressionist orchard scene with soft blossoms and fruit, spring sunlight, airy natural texture" },
  { title: "The Thinker in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a thoughtful seated figure, softened sculptural presence, atmospheric color" },
  { title: "City Rain in Monet Style", style: "MONET", prompt: "Impressionist city street in rain, umbrellas, reflective pavement, glowing soft light" },
  { title: "Quiet Chapel in Monet Style", style: "MONET", prompt: "Impressionist chapel exterior in warm late light, muted stone tones, soft painterly atmosphere" },
  { title: "Garden Statues in Monet Style", style: "MONET", prompt: "Impressionist garden with classical statues, floral surroundings, filtered sunlight" },
  { title: "Ballet Morning in Monet Style", style: "MONET", prompt: "Impressionist rehearsal room with dancers in gentle morning light, airy brushwork" },
  { title: "Seated Muse in Monet Style", style: "MONET", prompt: "Impressionist portrait of a seated muse, pastel background, elegant quiet mood" },
  { title: "Marina Evening in Monet Style", style: "MONET", prompt: "Impressionist marina at evening, reflections of sails, glowing sky, soft brushwork" },
  { title: "Open Window in Monet Style", style: "MONET", prompt: "Impressionist open window overlooking a bright garden, breezy curtains, soft colors" },
  { title: "Festival Lights in Monet Style", style: "MONET", prompt: "Impressionist festival lights in a twilight square, warm reflections, joyful pastel atmosphere" },

  { title: "Classical Garden in Monet Style", style: "MONET", prompt: "Impressionist reinterpretation of a classical formal garden, statues, hedges, warm atmospheric light" },
  { title: "Quiet Harbor by Night in Monet Style", style: "MONET", prompt: "Impressionist harbor at night, calm boats, lantern reflections, soft moody blues" },
  { title: "The Reader in Monet Style", style: "MONET", prompt: "Impressionist portrait of a person reading near a window, soft daylight, relaxed brushwork" },
  { title: "Golden Wheat in Monet Style", style: "MONET", prompt: "Impressionist wheat field in gold afternoon light, gentle wind, painterly texture" },
  { title: "Rose Balcony in Monet Style", style: "MONET", prompt: "Impressionist balcony overflowing with roses, elegant architecture, sunlit floral mood" },
  { title: "Soft Procession in Monet Style", style: "MONET", prompt: "Impressionist ceremonial procession in a town square, softened crowd forms, warm ambient light" },
  { title: "Seaside Portrait in Monet Style", style: "MONET", prompt: "Impressionist portrait near the sea, wind through clothing, bright soft sky" },
  { title: "Evening Theater in Monet Style", style: "MONET", prompt: "Impressionist theater interior with warm light and audience glow, soft painterly detail" },
  { title: "Quiet Library in Monet Style", style: "MONET", prompt: "Impressionist library interior with filtered window light, rich calm atmosphere" },
  { title: "Ancient Ruins in Monet Style", style: "MONET", prompt: "Impressionist ruins in warm evening sunlight, softened stone forms, atmospheric sky" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestMonetFullPage() {
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
        <h1 className="text-3xl font-semibold">Generate Full Monet Set</h1>
        <p className="text-slate-400 text-sm">
          100 Monet artworks: 50 originals + 50 reinterpretations.
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
