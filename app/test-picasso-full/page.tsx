'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL PICASSO WORKS
  // =========================
  { title: "Cubist Woman with Blue Hat", style: "PICASSO", prompt: "Pablo Picasso inspired cubist portrait of a woman wearing a blue hat, fragmented geometry, bold color blocking, modernist composition" },
  { title: "Guitar and Bottle Study", style: "PICASSO", prompt: "Picasso inspired cubist still life with guitar and bottle, angular planes, muted browns and blues, abstract modernist structure" },
  { title: "Seated Figure in Red", style: "PICASSO", prompt: "Picasso inspired seated figure in red tones, cubist forms, expressive distortion, bold outlines" },
  { title: "Harlequin at Dusk", style: "PICASSO", prompt: "Picasso inspired harlequin figure at dusk, cubist shapes, theatrical mood, geometric abstraction" },
  { title: "The Split Face Portrait", style: "PICASSO", prompt: "Picasso inspired cubist portrait with split facial perspective, strong lines, angular form, expressive modern color" },
  { title: "Still Life with Fruit Bowl", style: "PICASSO", prompt: "Picasso inspired cubist still life with fruit bowl, layered planes, fragmented perspective, earthy palette" },
  { title: "Woman by the Window", style: "PICASSO", prompt: "Picasso inspired abstract woman by a window, cubist geometry, vibrant contrasts, modernist style" },
  { title: "Bull in the Studio", style: "PICASSO", prompt: "Picasso inspired stylized bull in an artist studio, strong black linework, cubist energy" },
  { title: "Blue Room Figure", style: "PICASSO", prompt: "Picasso inspired figure in a blue interior, expressive abstraction, geometric simplification" },
  { title: "Violin and Glass", style: "PICASSO", prompt: "Picasso inspired cubist still life with violin and glass, fractured planes, warm browns and grays" },

  { title: "Woman with Green Eyes", style: "PICASSO", prompt: "Picasso inspired portrait of a woman with green eyes, cubist face, asymmetric features, bold color blocks" },
  { title: "The Painter’s Table", style: "PICASSO", prompt: "Picasso inspired cubist painting table with brushes and objects, fractured perspective, modernist composition" },
  { title: "Two Figures in Conversation", style: "PICASSO", prompt: "Picasso inspired two abstract figures in conversation, cubist geometry, expressive linework" },
  { title: "The Yellow Guitar", style: "PICASSO", prompt: "Picasso inspired cubist still life featuring a yellow guitar, layered planes, bold shape design" },
  { title: "Portrait in Rose Tones", style: "PICASSO", prompt: "Picasso inspired portrait in rose period mood, simplified figure, warm pink and muted red palette" },
  { title: "Studio Lamp and Chair", style: "PICASSO", prompt: "Picasso inspired cubist interior with lamp and chair, angular forms, modern abstraction" },
  { title: "The Masked Musician", style: "PICASSO", prompt: "Picasso inspired abstract musician with mask-like face, cubist structure, theatrical presence" },
  { title: "Woman Resting on a Sofa", style: "PICASSO", prompt: "Picasso inspired abstract resting woman on sofa, geometric forms, bold color contrast" },
  { title: "Still Life in Gray and Ochre", style: "PICASSO", prompt: "Picasso inspired cubist still life in gray and ochre tones, fragmented geometry, quiet mood" },
  { title: "Horse and Moon", style: "PICASSO", prompt: "Picasso inspired stylized horse beneath a moon, abstract symbolism, cubist lines" },

  { title: "The Orange Table", style: "PICASSO", prompt: "Picasso inspired cubist interior with orange table, fractured planes, bold modernist forms" },
  { title: "Portrait with Striped Shirt", style: "PICASSO", prompt: "Picasso inspired portrait with striped shirt, cubist face, asymmetrical composition, vivid blocks" },
  { title: "Still Life with Newspaper", style: "PICASSO", prompt: "Picasso inspired cubist still life with newspaper, bottle and bowl, geometric fragmentation" },
  { title: "Woman Holding Flowers", style: "PICASSO", prompt: "Picasso inspired abstract woman holding flowers, cubist shapes, vivid palette, expressive posture" },
  { title: "Blue Guitarist", style: "PICASSO", prompt: "Picasso inspired blue period guitarist, melancholic mood, simplified anatomy, expressive painting" },
  { title: "The Red Curtain Scene", style: "PICASSO", prompt: "Picasso inspired stage-like scene with red curtain, abstract figure, geometric composition" },
  { title: "Still Life with Candle", style: "PICASSO", prompt: "Picasso inspired cubist still life with candle, bottle, and fruit, muted browns and cream tones" },
  { title: "Woman in a Patterned Dress", style: "PICASSO", prompt: "Picasso inspired abstract woman in patterned dress, distorted proportions, cubist design" },
  { title: "The Studio Window", style: "PICASSO", prompt: "Picasso inspired cubist view through a studio window, fragmented city forms, strong lines" },
  { title: "Bullfighter Fragment", style: "PICASSO", prompt: "Picasso inspired bullfighter scene, abstract heroic form, cubist line and motion" },

  { title: "The Green Violin", style: "PICASSO", prompt: "Picasso inspired cubist still life with green violin, layered planes, strong contour" },
  { title: "Portrait in Gold and Black", style: "PICASSO", prompt: "Picasso inspired portrait using gold and black tones, cubist asymmetry, graphic presence" },
  { title: "The Open Sketchbook", style: "PICASSO", prompt: "Picasso inspired studio still life with open sketchbook, abstract objects, cubist mood" },
  { title: "Woman with Folded Hands", style: "PICASSO", prompt: "Picasso inspired cubist woman with folded hands, angular limbs, flattened color fields" },
  { title: "Still Life with Mandolin", style: "PICASSO", prompt: "Picasso inspired still life with mandolin, cubist fragmentation, warm wood tones" },
  { title: "The Circus Figure", style: "PICASSO", prompt: "Picasso inspired circus performer, rose period influence, stylized melancholic abstraction" },
  { title: "Blue Table Composition", style: "PICASSO", prompt: "Picasso inspired cubist tabletop composition, blue dominant palette, sharp plane divisions" },
  { title: "Woman in Profile and Front", style: "PICASSO", prompt: "Picasso inspired portrait combining profile and frontal view, cubist face, modern abstraction" },
  { title: "The Silent Guitar", style: "PICASSO", prompt: "Picasso inspired guitar still life, quiet cubist composition, layered muted tones" },
  { title: "The Painter’s Corner", style: "PICASSO", prompt: "Picasso inspired corner of an artist studio, abstract furniture, geometric space" },

  { title: "Rose Chair Portrait", style: "PICASSO", prompt: "Picasso inspired seated portrait with rose colored chair, cubist distortion, bold linework" },
  { title: "Still Life with Lemon and Glass", style: "PICASSO", prompt: "Picasso inspired cubist still life with lemon and glass, faceted surfaces, earthy tones" },
  { title: "Woman with Crimson Hair", style: "PICASSO", prompt: "Picasso inspired abstract woman with crimson hair, fractured face, strong contrasts" },
  { title: "Moon Over the Studio", style: "PICASSO", prompt: "Picasso inspired night studio scene under moonlight, abstract objects, cubist design" },
  { title: "The Black Cat Figure", style: "PICASSO", prompt: "Picasso inspired stylized black cat with abstract figure, strong outline, modernist drama" },
  { title: "Still Life with Bowl and Pipe", style: "PICASSO", prompt: "Picasso inspired cubist still life with bowl and pipe, layered angular structure" },
  { title: "Woman with Yellow Collar", style: "PICASSO", prompt: "Picasso inspired portrait of woman with yellow collar, cubist features, expressive palette" },
  { title: "Harlequin with Mandolin", style: "PICASSO", prompt: "Picasso inspired harlequin figure holding mandolin, geometric patterning, theatrical abstraction" },
  { title: "Studio Table in Blue", style: "PICASSO", prompt: "Picasso inspired blue-toned studio table still life, fragmented perspective, modern structure" },
  { title: "Cubist Evening Portrait", style: "PICASSO", prompt: "Picasso inspired evening portrait, angular geometry, asymmetrical face, dramatic color blocking" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Picasso Style", style: "PICASSO", prompt: "Picasso inspired cubist reinterpretation of a softly smiling woman, fragmented portrait, bold abstract forms" },
  { title: "Historic Dinner in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract reinterpretation of a historic dinner scene, fragmented figures, cubist composition" },
  { title: "Pearl Portrait in Picasso Style", style: "PICASSO", prompt: "Picasso inspired cubist portrait of a young woman with a pearl earring, asymmetrical features, bold color blocks" },
  { title: "Dream Night Sky in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract night sky with stars, geometric moons and bold color planes" },
  { title: "Mythic Shore in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract coastal mythic scene, angular figures, strong Mediterranean color" },
  { title: "Melting Time in Picasso Style", style: "PICASSO", prompt: "Picasso inspired surreal cubist scene about time, fragmented clocks, distorted geometry" },
  { title: "Rural Couple in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract rural couple before farmhouse, cubist simplification, earthy tones" },
  { title: "Emotional Figure in Picasso Style", style: "PICASSO", prompt: "Picasso inspired expressive abstract figure beneath dramatic sky, fractured anatomy, bold lines" },
  { title: "Heavenly Light in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract heavenly light scene, geometric hands, radiant planes, cubist interpretation" },
  { title: "Abstract Conflict in Picasso Style", style: "PICASSO", prompt: "Picasso inspired anti-conflict abstract composition, broken forms, black white gray and muted blue palette" },

  { title: "Sunflower Table in Picasso Style", style: "PICASSO", prompt: "Picasso inspired cubist still life of sunflowers on a table, angular petals, fractured vase, bold structure" },
  { title: "Blue Horse in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract horse in blue tones, cubist anatomy, expressive contour" },
  { title: "The Thinker in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract seated thinker, geometric limbs, strong angular composition" },
  { title: "Great Wave in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract great wave, fractured sea planes, dramatic linework, cubist energy" },
  { title: "Golden Embrace in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract embrace in warm gold tones, broken geometry, emotional modernist style" },
  { title: "City Rain in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract rainy city street, fractured umbrellas, layered planes, modern urban cubism" },
  { title: "Cathedral Light in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract cathedral facade in shifting light, cubist architecture, angular shadows" },
  { title: "Dancers in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract dancers in motion, cubist limbs, theatrical rhythm, bold color blocking" },
  { title: "Open Window in Picasso Style", style: "PICASSO", prompt: "Picasso inspired interior with open window, geometric landscape outside, fractured composition" },
  { title: "Cafe Night in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract nighttime cafe, angular tables, strong contrast, cubist mood" },

  { title: "Mother and Child in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract mother and child composition, simplified forms, emotional cubist warmth" },
  { title: "Garden Statues in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract garden with statues, geometric foliage, modernist composition" },
  { title: "Quiet Harbor in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract harbor scene, cubist boats and reflections, layered shapes" },
  { title: "The Musician in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract musician portrait, instrument and body fragmented into cubist planes" },
  { title: "Ancient Ruins in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract ancient ruins, broken arches, geometric stone planes, modernist reinterpretation" },
  { title: "Festival Lights in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract festival square with string lights, fragmented crowd, vivid blocks of color" },
  { title: "Rose Balcony in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract balcony with roses, angular architecture, pink and terracotta color fields" },
  { title: "The Reader in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract reader near window, cubist posture, layered planes, quiet interior mood" },
  { title: "Moonlit Bridge in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract moonlit bridge over water, fragmented reflections, dramatic geometry" },
  { title: "Mountain View in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract mountain landscape, cubist rock faces, bold sky planes" },

  { title: "Seaside Portrait in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract portrait near the sea, angular features, Mediterranean palette" },
  { title: "The Blue Room in Picasso Style", style: "PICASSO", prompt: "Picasso inspired blue-toned interior scene, fragmented furniture and figure, cubist mood" },
  { title: "Harvest Workers in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract harvest workers in a field, simplified limbs, earthy modernist composition" },
  { title: "Royal Garden in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract formal garden, geometric hedges and statues, strong design" },
  { title: "Stormy Sea in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract storm sea, broken wave planes, dynamic black blue gray palette" },
  { title: "Autumn Portrait in Picasso Style", style: "PICASSO", prompt: "Picasso inspired cubist autumn portrait, orange and brown planes, expressive distorted face" },
  { title: "The Marble Garden in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract garden with marble forms, cubist structure, muted stone tones" },
  { title: "Wheat Field in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract wheat field, broken yellow planes, geometric horizon" },
  { title: "Soft Procession in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract ceremonial procession, elongated figures, layered cubist movement" },
  { title: "Window of Flowers in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract flower window scene, angular petals, strong contrasting planes" },

  { title: "Palace Courtyard in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract palace courtyard, geometric arcades, modernist architecture" },
  { title: "The Poet in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract portrait of a poet, split perspective face, muted literary mood" },
  { title: "Theater Evening in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract theater audience, angular stage forms, vivid contrast and rhythm" },
  { title: "Canal View in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract canal scene, fragmented buildings and reflections, cubist cityscape" },
  { title: "Garden Tea in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract outdoor tea scene in a garden, geometric tableware and figures" },
  { title: "Quiet Library in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract library interior, angular shelves, seated reader, muted browns and blues" },
  { title: "The Standing Muse in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract standing muse, cubist anatomy, asymmetric beauty, bold contour" },
  { title: "Harbor Lanterns in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract harbor at night with lanterns, fragmented reflections, modernist mood" },
  { title: "Classical Orchard in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract orchard with fruit trees, cubist foliage, layered geometric depth" },
  { title: "Ancient Balcony in Picasso Style", style: "PICASSO", prompt: "Picasso inspired abstract balcony overlooking an old city, angular architecture, warm stone palette" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestPicassoFullPage() {
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
        <h1 className="text-3xl font-semibold">Generate Full Picasso Set</h1>
        <p className="text-slate-400 text-sm">
          100 Picasso artworks: 50 originals + 50 reinterpretations.
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
