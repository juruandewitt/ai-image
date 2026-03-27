'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL DA VINCI WORKS
  // =========================
  { title: "Portrait in Soft Sfumato", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait in soft sfumato, calm expression, subtle realism, warm renaissance tones, refined background" },
  { title: "Study of a Noble Woman", style: "DA_VINCI", prompt: "Da Vinci inspired portrait of a noble woman, balanced composition, delicate hands, soft sfumato, refined renaissance realism" },
  { title: "The Scholar at the Table", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired scholar seated at a table, careful anatomy, subtle sfumato lighting, renaissance realism" },
  { title: "Young Man in Quiet Light", style: "DA_VINCI", prompt: "Da Vinci inspired portrait of a young man in quiet light, serene expression, soft modeling, renaissance balance" },
  { title: "Lady with Folded Hands", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait of lady with folded hands, elegant pose, sfumato shading, muted earth tones" },
  { title: "The Inventor’s Desk", style: "DA_VINCI", prompt: "Da Vinci inspired interior with inventor's desk, sketches and instruments, warm light, renaissance detail, subtle sfumato" },
  { title: "Portrait with Blue Robe", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with blue robe, calm gaze, soft sfumato transitions, balanced composition" },
  { title: "The Quiet Study Room", style: "DA_VINCI", prompt: "Da Vinci inspired quiet renaissance study room, books and instruments, atmospheric depth, refined realism" },
  { title: "Woman with Delicate Veil", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait of a woman with a delicate veil, subtle smile, soft sfumato, graceful hands" },
  { title: "The Golden Chamber", style: "DA_VINCI", prompt: "Da Vinci inspired interior chamber with warm golden light, balanced geometry, subtle renaissance atmosphere" },

  { title: "The Reflective Gentleman", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired reflective gentleman portrait, poised expression, soft sfumato shadows, refined realism" },
  { title: "A Study in Brown and Gold", style: "DA_VINCI", prompt: "Da Vinci inspired portrait in brown and gold tones, ideal proportions, subtle anatomical realism, soft background" },
  { title: "The Anatomist’s Notes", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired scene with anatomical notes and instruments, renaissance study, warm light, precise detail" },
  { title: "Portrait of Quiet Intelligence", style: "DA_VINCI", prompt: "Da Vinci inspired calm portrait conveying intelligence, subtle smile, sfumato edges, classical harmony" },
  { title: "The Music Table", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired still life with lute and papers on a table, balanced composition, warm renaissance realism" },
  { title: "Woman Turning Toward Light", style: "DA_VINCI", prompt: "Da Vinci inspired woman turning gently toward light, soft sfumato, elegant drapery, serene mood" },
  { title: "The Painter’s Interior", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired painter's interior with canvas and drawings, atmospheric perspective, subtle renaissance realism" },
  { title: "Portrait with Amber Background", style: "DA_VINCI", prompt: "Da Vinci inspired portrait against amber background, refined facial modeling, quiet expression, sfumato" },
  { title: "The Reading Nobleman", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired nobleman reading, soft light, idealized hands, renaissance detail" },
  { title: "The Silent Instrument", style: "DA_VINCI", prompt: "Da Vinci inspired still life with a silent instrument and papers, warm brown palette, refined realism" },

  { title: "Portrait with Green Shawl", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with green shawl, soft sfumato, dignified posture, subtle expression" },
  { title: "Window Over the Hills", style: "DA_VINCI", prompt: "Da Vinci inspired window opening onto distant hills, atmospheric perspective, warm renaissance interior" },
  { title: "The Measured Table", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired carefully arranged table scene, geometric balance, quiet realism, muted tones" },
  { title: "Portrait of a Young Lady", style: "DA_VINCI", prompt: "Da Vinci inspired portrait of a young lady, delicate hands, poised posture, luminous skin, sfumato softness" },
  { title: "The Manuscript Room", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired manuscript room with papers, shelves and soft warm light, renaissance atmosphere" },
  { title: "The Quiet Inventor", style: "DA_VINCI", prompt: "Da Vinci inspired inventor portrait, thoughtful gaze, instruments nearby, soft shading, renaissance realism" },
  { title: "The Gentle Half-Smile", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with gentle half-smile, balanced composition, sfumato, warm realism" },
  { title: "Still Life with Compass and Scroll", style: "DA_VINCI", prompt: "Da Vinci inspired still life with compass and scroll, precise placement, warm light, renaissance detail" },
  { title: "The Velvet Sleeve", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait featuring velvet sleeve, subtle luxury, soft sfumato modeling" },
  { title: "The Distant Valley", style: "DA_VINCI", prompt: "Da Vinci inspired distant valley landscape viewed behind a portrait, atmospheric perspective, serene realism" },

  { title: "Portrait with Pearl Pins", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with pearl pins in the hair, soft light, refined anatomy, sfumato" },
  { title: "The Scholar’s Shelf", style: "DA_VINCI", prompt: "Da Vinci inspired scholar's shelf with manuscripts and instruments, balanced interior, warm renaissance light" },
  { title: "The Calm Listener", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait of a calm listener, serene expression, soft background, ideal proportions" },
  { title: "Still Life with Folded Cloth", style: "DA_VINCI", prompt: "Da Vinci inspired still life with folded cloth and small objects, subtle shadows, refined detail" },
  { title: "Portrait in Deep Olive", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait in deep olive tones, sfumato transitions, poised realism" },
  { title: "The Architect’s Table", style: "DA_VINCI", prompt: "Da Vinci inspired architect's table with plans and compass, careful geometry, warm renaissance realism" },
  { title: "Woman with Red Ribbon", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait of a woman with red ribbon, graceful posture, soft sfumato, muted palette" },
  { title: "The Measured Window Light", style: "DA_VINCI", prompt: "Da Vinci inspired room lit by measured window light, subtle atmosphere, elegant interior realism" },
  { title: "Portrait with Brown Veil", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with brown veil, calm gaze, refined drapery, soft shadows" },
  { title: "The Instrument Maker", style: "DA_VINCI", prompt: "Da Vinci inspired instrument maker in workshop, renaissance tools, warm light, precise realism" },

  { title: "Still Life with Ink and Feather", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired still life with ink bottle and feather, balanced arrangement, quiet renaissance realism" },
  { title: "Portrait of Delicate Strength", style: "DA_VINCI", prompt: "Da Vinci inspired portrait showing delicate strength, composed hands, subtle sfumato, warm tones" },
  { title: "The Quiet Hallway", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired quiet interior hallway, atmospheric depth, balanced light, renaissance mood" },
  { title: "The Botanist’s Study", style: "DA_VINCI", prompt: "Da Vinci inspired botanist's study with sketches and leaves, warm light, precise observational detail" },
  { title: "Portrait with Soft Amber Eyes", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with soft amber eyes, muted background, sfumato realism" },
  { title: "The Table of Inventions", style: "DA_VINCI", prompt: "Da Vinci inspired table of inventions with sketches and models, balanced design, renaissance atmosphere" },
  { title: "The Quiet Companion", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait with calm companion presence, elegant posture, soft background haze" },
  { title: "Window Light on a Scroll", style: "DA_VINCI", prompt: "Da Vinci inspired light falling on a scroll near a window, subtle shadows, refined realism" },
  { title: "Portrait in Earth Tones", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait in earth tones, ideal proportions, soft sfumato, tranquil expression" },
  { title: "The Last Study of the Day", style: "DA_VINCI", prompt: "Da Vinci inspired late-day study room, warm fading light, papers and tools, calm renaissance mood" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired reinterpretation of a softly smiling woman, soft sfumato, poised hands, serene renaissance realism" },
  { title: "Historic Dinner in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired reinterpretation of a historic dinner scene, balanced perspective, subtle gestures, warm renaissance composition" },
  { title: "Pearl Portrait in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait of a young woman with pearl jewelry, calm gaze, sfumato shading, refined realism" },
  { title: "Dream Night Sky in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired atmospheric night sky beyond a renaissance landscape, subtle glow, measured realism" },
  { title: "Mythic Shore in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired mythic shore scene, balanced anatomy, atmospheric distance, serene renaissance composition" },
  { title: "Melting Time in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired symbolic scene about time, subtle surreal suggestion, calm realism, balanced design" },
  { title: "Rural Couple in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait of a rural couple, composed hands, soft sfumato, atmospheric landscape beyond" },
  { title: "Emotional Figure in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired emotional figure rendered with restraint, ideal anatomy, soft shadows, renaissance harmony" },
  { title: "Heavenly Light in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired heavenly light entering a balanced scene, subtle glow, soft sfumato realism" },
  { title: "Abstract Conflict in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired symbolic composition about conflict, ordered forms, measured gestures, atmospheric realism" },

  { title: "Sunflower Table in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired still life of sunflowers on a table, warm light, balanced composition, subtle sfumato" },
  { title: "Blue Horse in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired equine study with cool-toned coat, ideal anatomy, atmospheric landscape background" },
  { title: "The Thinker in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired thoughtful seated figure, calm expression, idealized hands, subtle sfumato" },
  { title: "Great Wave in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired sea wave study with scientific observation, balanced force, atmospheric realism" },
  { title: "Golden Embrace in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired embrace scene, graceful anatomy, warm sfumato light, poised renaissance composition" },
  { title: "City Rain in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired rainy city view, refined perspective, subtle light, atmospheric realism" },
  { title: "Cathedral Light in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired cathedral interior with measured light, elegant geometry, soft sfumato realism" },
  { title: "Dancers in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired graceful dancers, balanced anatomy, flowing drapery, renaissance poise" },
  { title: "Open Window in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired open window scene with distant valley and measured interior light" },
  { title: "Cafe Night in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired night interior gathering, warm light, calm perspective, subtle renaissance realism" },

  { title: "Mother and Child in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired mother and child composition, soft sfumato, tender hands, serene realism" },
  { title: "Garden Statues in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired garden statuary with atmospheric perspective and balanced renaissance composition" },
  { title: "Quiet Harbor in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired harbor scene, calm water, measured perspective, atmospheric realism" },
  { title: "The Musician in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired musician portrait, soft sfumato, careful anatomy, warm renaissance tones" },
  { title: "Ancient Ruins in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired ancient ruins with atmospheric distance and balanced geometric composition" },
  { title: "Festival Lights in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired evening gathering with warm lights, measured perspective, calm renaissance realism" },
  { title: "Rose Balcony in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired balcony with roses, delicate botanical detail, soft atmospheric background" },
  { title: "The Reader in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired reading figure, poised hands, subtle sfumato, warm reflective interior" },
  { title: "Moonlit Bridge in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired bridge under moonlight, soft silver light, measured perspective, quiet realism" },
  { title: "Mountain View in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired mountain landscape with atmospheric perspective, calm foreground, renaissance observation" },

  { title: "Seaside Portrait in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired portrait by the sea, composed expression, atmospheric distance, sfumato realism" },
  { title: "The Blue Room in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired blue-toned interior, balanced geometry, soft window light, refined realism" },
  { title: "Harvest Workers in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired harvest scene with observed anatomy, atmospheric landscape, calm renaissance realism" },
  { title: "Royal Garden in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired formal garden with measured perspective, soft light, refined botanical detail" },
  { title: "Stormy Sea in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired storm sea study, observed wave movement, atmospheric darkness, balanced composition" },
  { title: "Autumn Portrait in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired autumn portrait, warm earth palette, subtle sfumato, poised expression" },
  { title: "The Marble Garden in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired marble garden scene, balanced forms, atmospheric realism, soft light" },
  { title: "Wheat Field in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired wheat field under calm sky, subtle distance, observational realism, balanced composition" },
  { title: "Soft Procession in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired ceremonial procession, measured gestures, ideal anatomy, atmospheric perspective" },
  { title: "Window of Flowers in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired flowers at a window, botanical detail, soft sfumato light, refined realism" },

  { title: "Palace Courtyard in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired palace courtyard, clear perspective, warm light, calm renaissance realism" },
  { title: "The Poet in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired poet portrait, thoughtful expression, soft sfumato, balanced interior background" },
  { title: "Theater Evening in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired theater interior, warm evening light, measured perspective, quiet grandeur" },
  { title: "Canal View in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired canal scene with atmospheric distance and refined perspective, soft realism" },
  { title: "Garden Tea in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired tea gathering in a garden, poised figures, botanical detail, soft daylight" },
  { title: "Quiet Library in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired library interior, books and measured light, calm composition, sfumato realism" },
  { title: "The Standing Muse in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired standing muse, ideal anatomy, poised drapery, soft atmospheric light" },
  { title: "Harbor Lanterns in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired harbor with lantern glow, calm water, balanced composition, subtle night realism" },
  { title: "Classical Orchard in Da Vinci Style", style: "DA_VINCI", prompt: "Leonardo da Vinci inspired orchard scene, botanical precision, atmospheric depth, warm realism" },
  { title: "Ancient Balcony in Da Vinci Style", style: "DA_VINCI", prompt: "Da Vinci inspired balcony overlooking an old city, measured architecture, soft perspective haze, renaissance realism" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestDaVinciFullPage() {
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
        <h1 className="text-3xl font-semibold">Generate Full Da Vinci Set</h1>
        <p className="text-slate-400 text-sm">
          100 Da Vinci artworks: 50 originals + 50 reinterpretations.
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
