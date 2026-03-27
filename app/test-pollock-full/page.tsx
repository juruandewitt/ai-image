'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL POLLOCK WORKS
  // =========================
  { title: "Black and White Rhythm", style: "POLLOCK", prompt: "Jackson Pollock inspired abstract expressionist drip painting, black and white paint splatter, layered energy, chaotic rhythm, dynamic movement" },
  { title: "Red Pulse on Raw Canvas", style: "POLLOCK", prompt: "Pollock inspired drip painting with red, black and cream splatters, energetic abstract expressionism, raw canvas texture" },
  { title: "Blue Field of Motion", style: "POLLOCK", prompt: "Jackson Pollock inspired abstract blue drip composition, energetic paint trails, layered splashes, expressive movement" },
  { title: "Golden Scatter", style: "POLLOCK", prompt: "Pollock inspired abstract expressionist painting with gold, black and white drips, dense splatter texture, kinetic composition" },
  { title: "Fractured Energy", style: "POLLOCK", prompt: "Pollock inspired chaotic drip painting, black, red and gray paint splashes, layered abstract expressionist motion" },
  { title: "White Noise on Black", style: "POLLOCK", prompt: "Jackson Pollock inspired abstract painting with white splatters over black field, energetic lines, raw expressive texture" },
  { title: "Autumn Drip Study", style: "POLLOCK", prompt: "Pollock inspired autumn-colored drip painting with ochre, rust, black and cream, spontaneous abstract expressionism" },
  { title: "The Tangled Current", style: "POLLOCK", prompt: "Pollock inspired tangled network of paint drips, high energy composition, expressive abstract motion, layered splatter" },
  { title: "Silver Thread Explosion", style: "POLLOCK", prompt: "Pollock inspired drip painting with silver, black and white lines, explosive abstract rhythm, dynamic texture" },
  { title: "Dense Field No. 1", style: "POLLOCK", prompt: "Pollock inspired dense abstract expressionist field of layered paint drips, multicolored splatter, intense visual energy" },

  { title: "Crimson Drip Study", style: "POLLOCK", prompt: "Jackson Pollock inspired abstract red and black drip painting, layered paint splashes, aggressive movement, raw texture" },
  { title: "Ocean Wire", style: "POLLOCK", prompt: "Pollock inspired blue, teal and white abstract drip painting, oceanic mood, energetic expressionist web of paint" },
  { title: "Ochre Storm", style: "POLLOCK", prompt: "Pollock inspired ochre and black splatter painting, storm-like movement, dense abstract expressionist energy" },
  { title: "The Electric Surface", style: "POLLOCK", prompt: "Pollock inspired vivid abstract surface with yellow, white and black drips, kinetic tension, layered action painting" },
  { title: "Night Splatter", style: "POLLOCK", prompt: "Jackson Pollock inspired dark abstract expressionist painting with black, blue and gray splashes, moody but energetic" },
  { title: "Signal in Red and White", style: "POLLOCK", prompt: "Pollock inspired red and white action painting, fractured drips, urgent movement, abstract rhythm" },
  { title: "Copper Thread Study", style: "POLLOCK", prompt: "Pollock inspired abstract drip painting with copper, brown, cream and black lines, expressive layered texture" },
  { title: "Midnight Lattice", style: "POLLOCK", prompt: "Pollock inspired abstract midnight composition, crisscrossing paint trails, black and white expressive motion" },
  { title: "Yellow Burst", style: "POLLOCK", prompt: "Pollock inspired yellow burst drip painting, black splatter, dynamic abstract expressionism, dense texture" },
  { title: "The Open Tangle", style: "POLLOCK", prompt: "Pollock inspired open, airy action painting with looping drips, layered color, raw gestural energy" },

  { title: "Field of Sparks", style: "POLLOCK", prompt: "Jackson Pollock inspired abstract field of sparks, white, gold and black splatter, high-energy action painting" },
  { title: "Earth and Wire", style: "POLLOCK", prompt: "Pollock inspired earthy abstract composition with umber, cream and black drips, raw canvas, expressive movement" },
  { title: "White Drip Construction", style: "POLLOCK", prompt: "Pollock inspired white drip structure over muted field, abstract expressionist layering, energetic lines" },
  { title: "Gray Motion Study", style: "POLLOCK", prompt: "Pollock inspired gray and black drip painting, restless movement, layered splatter, restrained palette" },
  { title: "Amber Scatter Field", style: "POLLOCK", prompt: "Pollock inspired amber and cream paint scatter, spontaneous abstract expressionism, gestural rhythm" },
  { title: "Looping Velocity", style: "POLLOCK", prompt: "Jackson Pollock inspired looping paint velocity, black white and red drips, action painting intensity" },
  { title: "Fragmented Surface", style: "POLLOCK", prompt: "Pollock inspired fragmented abstract surface, multicolor splashes, layered drips, expressive visual noise" },
  { title: "The White Flame", style: "POLLOCK", prompt: "Pollock inspired white paint flame-like drips across dark field, dramatic abstract energy" },
  { title: "Storm Web No. 2", style: "POLLOCK", prompt: "Pollock inspired stormy web of dripped paint, black, blue and white layers, dynamic chaos" },
  { title: "Rust and Bone", style: "POLLOCK", prompt: "Pollock inspired rust, cream and black action painting, rough organic texture, expressive layering" },

  { title: "Scatter Rhythm No. 5", style: "POLLOCK", prompt: "Pollock inspired abstract scatter rhythm, layered splatter marks, dynamic motion, energetic field" },
  { title: "Cracked Velocity", style: "POLLOCK", prompt: "Pollock inspired cracked velocity composition, black red and cream drips, expressive tension" },
  { title: "Open Field Drips", style: "POLLOCK", prompt: "Jackson Pollock inspired open field of drips, airy spacing, gestural marks, abstract movement" },
  { title: "The Dense Network", style: "POLLOCK", prompt: "Pollock inspired dense network of paint lines, tangled energy, layered splatter texture" },
  { title: "Blue and Copper Collision", style: "POLLOCK", prompt: "Pollock inspired collision of blue and copper drips, abstract expressionist energy, layered paint action" },
  { title: "Spiral Scatter", style: "POLLOCK", prompt: "Pollock inspired spiral-like scatter of dripped paint, black white and ochre, dynamic action painting" },
  { title: "The Long Drip", style: "POLLOCK", prompt: "Pollock inspired elongated paint drips over textured field, expressive rhythm, abstract motion" },
  { title: "Charcoal Rain", style: "POLLOCK", prompt: "Pollock inspired charcoal and white drip painting, rainy texture, layered expressionist marks" },
  { title: "Broken Gold Field", style: "POLLOCK", prompt: "Pollock inspired broken gold and black splatter field, kinetic abstract expressionism" },
  { title: "Tension in White", style: "POLLOCK", prompt: "Pollock inspired white-on-dark action painting, tense web of lines, abstract energy" },

  { title: "Rapid Gesture Study", style: "POLLOCK", prompt: "Pollock inspired rapid gesture painting, multicolor drips, spontaneous rhythm, abstract expressionism" },
  { title: "The Wild Surface", style: "POLLOCK", prompt: "Pollock inspired wild paint surface, layered splashes and trails, raw motion, chaotic beauty" },
  { title: "The Splintered Field", style: "POLLOCK", prompt: "Pollock inspired splintered abstract field with black white and ochre drips, expressive texture" },
  { title: "Motion Grid", style: "POLLOCK", prompt: "Pollock inspired motion grid of dripped paint, tangled abstract energy, layered gesture" },
  { title: "Burnt Umber Scatter", style: "POLLOCK", prompt: "Pollock inspired burnt umber and cream abstract drip painting, organic splatter, raw canvas texture" },
  { title: "White Arc Rhythm", style: "POLLOCK", prompt: "Pollock inspired white arc-like drips across dark field, energetic abstract composition" },
  { title: "The Dense Burst", style: "POLLOCK", prompt: "Pollock inspired dense burst of layered paint lines, black red yellow and white splatter, action painting" },
  { title: "Canvas Static", style: "POLLOCK", prompt: "Pollock inspired static-like abstract field, paint drips and flicks, energetic chaos, expressive surface" },
  { title: "The Flicker Pattern", style: "POLLOCK", prompt: "Pollock inspired flickering pattern of paint splatters, dynamic texture, layered abstract expressionism" },
  { title: "Endless Drip Field", style: "POLLOCK", prompt: "Pollock inspired endless field of dripped paint, dense motion, layered splatter, abstract vitality" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract reinterpretation of a softly smiling portrait, energetic splatter, fragmented gestural emotion" },
  { title: "Historic Dinner in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract reinterpretation of a historic dinner scene, chaotic layered drips, expressive group energy" },
  { title: "Pearl Portrait in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract portrait suggested through dynamic drips and splatters, pearl-like highlights, expressive motion" },
  { title: "Dream Night Sky in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract night sky with splattered stars, blue black and white energy, gestural expressionism" },
  { title: "Mythic Shore in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract coastal scene, energetic paint movement, layered splatter suggesting waves and mythic presence" },
  { title: "Melting Time in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract time composition, chaotic drips and stretched forms, expressive gestural surface" },
  { title: "Rural Couple in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract reinterpretation of a rural couple, gestural lines, layered movement, emotional splatter" },
  { title: "Emotional Figure in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired expressive abstract figure, intense black red and white drips, emotional action painting" },
  { title: "Heavenly Light in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract heavenly light through energetic white and gold splatters, layered gestural field" },
  { title: "Abstract Conflict in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract conflict scene, violent gestural marks, black red white layered splatter, high intensity" },

  { title: "Sunflower Table in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract reinterpretation of sunflowers through yellow and black drips, energetic action painting" },
  { title: "Blue Horse in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract blue horse suggested by gestural splatter and flowing lines, expressive field" },
  { title: "The Thinker in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract contemplative figure, layered dark drips and white highlights, intense gestural energy" },
  { title: "Great Wave in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract great wave through blue white and black splashes, kinetic paint motion" },
  { title: "Golden Embrace in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract embrace suggested by gold white and black drips, emotional energetic movement" },
  { title: "City Rain in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract rainy city through layered gray white and black drips, urban gestural rhythm" },
  { title: "Cathedral Light in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract sacred light through energetic white and gold splatter, monumental gestural field" },
  { title: "Dancers in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract dancers expressed as energetic paint arcs and splatters, rhythmic action painting" },
  { title: "Open Window in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract open window scene with gestural movement and spatial drips, expressive surface" },
  { title: "Cafe Night in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract cafe night through dark layered drips and warm glowing splashes, energetic composition" },

  { title: "Mother and Child in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract mother and child relationship suggested through interconnected gestural lines and splatter" },
  { title: "Garden Statues in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract garden scene with stone-like grays and green drips, layered motion" },
  { title: "Quiet Harbor in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract harbor scene through blue gray splashes and rope-like dripped lines" },
  { title: "The Musician in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract musician expressed through rhythmic drips and dynamic layered motion" },
  { title: "Ancient Ruins in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract ruins through fractured earthy splatters and dense expressive lines" },
  { title: "Festival Lights in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract festival lights in splattered yellows reds and whites, energetic celebratory motion" },
  { title: "Rose Balcony in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract floral balcony with pink red and green gestural splashes, layered energy" },
  { title: "The Reader in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract reading scene through concentrated dark drips and focused white highlights" },
  { title: "Moonlit Bridge in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract moonlit bridge with silver white splatters over dark blue field, energetic linework" },
  { title: "Mountain View in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract mountain landscape through layered blue gray and white gestural marks" },

  { title: "Seaside Portrait in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract seaside portrait through blue white and flesh-toned splatter, expressive energy" },
  { title: "The Blue Room in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract blue room with layered drips, atmospheric but energetic surface" },
  { title: "Harvest Workers in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract harvest scene through gold brown black and cream splatter, dynamic rhythm" },
  { title: "Royal Garden in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract formal garden through layered green gold and black drips, energetic field" },
  { title: "Stormy Sea in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract storm sea with violent blue black white splashes, intense gestural motion" },
  { title: "Autumn Portrait in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract autumn portrait with rust orange black and cream drips, expressive energy" },
  { title: "The Marble Garden in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract stone garden through gray white and green splatters, layered movement" },
  { title: "Wheat Field in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract wheat field through gold ochre and black drips, dynamic open field energy" },
  { title: "Soft Procession in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract ceremonial procession through rhythmic splatter, layered figure-like gestures" },
  { title: "Window of Flowers in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract window of flowers through vivid red pink yellow and green gestural splashes" },

  { title: "Palace Courtyard in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract palace courtyard through geometric drips and layered warm stone-colored splatter" },
  { title: "The Poet in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract poet portrait through concentrated linework and expressive paint rhythm" },
  { title: "Theater Evening in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract theater evening with red black gold and white layered gestural marks" },
  { title: "Canal View in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract canal through reflective blue gray white splatter and flowing drips" },
  { title: "Garden Tea in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract tea scene in a garden through playful pink green white gestural splashes" },
  { title: "Quiet Library in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract library through dark layered drips and structured but energetic line fields" },
  { title: "The Standing Muse in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract standing muse through layered vertical drips and expressive paint energy" },
  { title: "Harbor Lanterns in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract harbor lanterns with glowing gold splatter over dark blue black field" },
  { title: "Classical Orchard in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract orchard through green gold rust and white drips, layered organic motion" },
  { title: "Ancient Balcony in Pollock Style", style: "POLLOCK", prompt: "Pollock inspired abstract balcony scene through warm stone colored splashes and dark linear structure" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestPollockFullPage() {
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
        <h1 className="text-3xl font-semibold">Generate Full Pollock Set</h1>
        <p className="text-slate-400 text-sm">
          100 Pollock artworks: 50 originals + 50 reinterpretations.
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
