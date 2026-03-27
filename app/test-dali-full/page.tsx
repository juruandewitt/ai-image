'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // 1–50 ORIGINAL DALI WORKS
  // =========================
  { title: "Melting Horizon at Dawn", style: "DALI", prompt: "Salvador Dali inspired surreal landscape at dawn, melting horizon, dreamlike desert, elongated shadows, precise painterly detail" },
  { title: "Clock Garden in Silence", style: "DALI", prompt: "Dali inspired surreal garden with soft melting clocks, eerie stillness, warm desert light, hyper-detailed dream imagery" },
  { title: "The Floating Window", style: "DALI", prompt: "Dali inspired floating window in a barren landscape, surreal atmosphere, impossible geometry, crisp dreamlike realism" },
  { title: "Elephants in the Golden Desert", style: "DALI", prompt: "Dali inspired long-legged elephants crossing a golden desert, surreal symbolism, dramatic sky, detailed dream painting" },
  { title: "The Soft Stone Arch", style: "DALI", prompt: "Dali inspired surreal stone arch bending like fabric in an empty plain, strange lighting, precise detail" },
  { title: "Face in the Clouds", style: "DALI", prompt: "Dali inspired hidden human face formed by clouds over a surreal coastline, dreamlike illusion, crisp painterly realism" },
  { title: "The Sleeping Shore", style: "DALI", prompt: "Dali inspired surreal shore with sleeping forms merging into rocks and sand, calm sea, uncanny stillness" },
  { title: "Burning Giraffe at Twilight", style: "DALI", prompt: "Dali inspired surreal giraffe at twilight with dreamlike symbolism, long shadows, strange atmosphere, painterly detail" },
  { title: "The Endless Stair", style: "DALI", prompt: "Dali inspired impossible staircase vanishing into a dream desert, surreal architecture, precise shadows, bizarre calm" },
  { title: "Mirror of the Moon", style: "DALI", prompt: "Dali inspired surreal moon reflected in a floating mirror above a barren landscape, magical realism, crisp detail" },

  { title: "The Silent Hourglass", style: "DALI", prompt: "Dali inspired giant hourglass standing in an empty desert, surreal stillness, symbolic time imagery, hyper-detailed painting" },
  { title: "The Weightless Table", style: "DALI", prompt: "Dali inspired table floating above a dreamlike floor, impossible gravity, long shadows, precise surrealism" },
  { title: "The Window in the Sand", style: "DALI", prompt: "Dali inspired elegant window frame buried in desert sand, surreal isolation, luminous sky, detailed brushwork" },
  { title: "The Long Afternoon Dream", style: "DALI", prompt: "Dali inspired long afternoon dream scene, melting objects, soft light, uncanny desert space, crisp surreal detail" },
  { title: "The Glass Desert", style: "DALI", prompt: "Dali inspired transparent glass forms rising from a desert, impossible reflections, dreamlike symbolic composition" },
  { title: "The Bent Tower", style: "DALI", prompt: "Dali inspired surreal leaning tower melting at the edges, dramatic light, silent dream landscape" },
  { title: "Sea of Velvet Sand", style: "DALI", prompt: "Dali inspired surreal sea meeting velvet-like sand, strange texture, symbolic calm, painterly precision" },
  { title: "The Hidden Profile", style: "DALI", prompt: "Dali inspired landscape that secretly forms a hidden profile, illusionistic surrealism, fine detail, luminous sky" },
  { title: "The Blue Shell Dream", style: "DALI", prompt: "Dali inspired surreal giant shell in a dream landscape, symbolic sea elements, impossible scale, crisp realism" },
  { title: "The Candle in the Desert", style: "DALI", prompt: "Dali inspired single candle burning in a vast desert, symbolic silence, absurd calm, precise painterly detail" },

  { title: "The Soft Monument", style: "DALI", prompt: "Dali inspired monument sagging like wax in the sunlight, surreal dream logic, hyper-detailed style" },
  { title: "Feathers Over the Plain", style: "DALI", prompt: "Dali inspired giant floating feathers above an empty plain, soft shadows, strange elegance, surreal realism" },
  { title: "The Impossible Balcony", style: "DALI", prompt: "Dali inspired balcony hanging over nothing, dreamlike architecture, long shadows, bizarre stillness" },
  { title: "The Empty Opera", style: "DALI", prompt: "Dali inspired surreal opera hall in a desert, silent stage, impossible perspective, symbolic atmosphere" },
  { title: "The Hollow Statue", style: "DALI", prompt: "Dali inspired hollow classical statue standing in a surreal landscape, dramatic light, precise detail" },
  { title: "The Cracked Sun", style: "DALI", prompt: "Dali inspired surreal sun with cracked surface hanging above a dream plain, painterly realism" },
  { title: "The Feathered Clock", style: "DALI", prompt: "Dali inspired clock covered in feathers, symbolic dream object, warm light, hyper-detailed surreal style" },
  { title: "The Endless Reflection", style: "DALI", prompt: "Dali inspired mirror reflecting impossible endless landscapes, symbolic depth, surreal illusion" },
  { title: "The Sleeping Horse", style: "DALI", prompt: "Dali inspired horse asleep in a strange desert under a dream sky, symbolic surreal quiet, detailed painting" },
  { title: "The Folded Sky", style: "DALI", prompt: "Dali inspired sky appearing folded like fabric above a barren plain, impossible physics, crisp surreal detail" },

  { title: "The Silver Door", style: "DALI", prompt: "Dali inspired isolated silver door standing in open desert, surreal symbolism, luminous atmosphere" },
  { title: "The Moonlit Hand", style: "DALI", prompt: "Dali inspired giant hand under moonlight in a surreal landscape, symbolic and eerie, painterly realism" },
  { title: "The Floating Violin", style: "DALI", prompt: "Dali inspired violin floating in dream space above sand dunes, absurd elegance, precise shadow work" },
  { title: "The Dissolving Garden", style: "DALI", prompt: "Dali inspired garden dissolving into liquid forms, surreal bloom shapes, refined dream imagery" },
  { title: "The Long Table of Time", style: "DALI", prompt: "Dali inspired impossibly long table stretching across desert with symbolic objects, surreal detail" },
  { title: "The Pale Oracle", style: "DALI", prompt: "Dali inspired mysterious pale figure in a dream landscape, symbolic surreal mood, crisp detail" },
  { title: "The Burning Horizon", style: "DALI", prompt: "Dali inspired horizon burning softly in a surreal twilight landscape, symbolic stillness, detailed painterly realism" },
  { title: "The Cloud Staircase", style: "DALI", prompt: "Dali inspired staircase rising into strange cloud formations, dream architecture, illusionistic surrealism" },
  { title: "The Wax Cathedral", style: "DALI", prompt: "Dali inspired cathedral made of melting wax, dreamlike sacred architecture, precise surreal detail" },
  { title: "The Quiet Skeleton Tree", style: "DALI", prompt: "Dali inspired skeletal tree in a silent surreal desert, symbolic loneliness, strange calm, painterly accuracy" },

  { title: "The Velvet Moon Plain", style: "DALI", prompt: "Dali inspired moonlit desert with velvet textures and impossible stillness, refined surreal painting" },
  { title: "The Suspended Rose", style: "DALI", prompt: "Dali inspired giant suspended rose over a barren landscape, symbolic beauty, precise dream realism" },
  { title: "The Bent Piano", style: "DALI", prompt: "Dali inspired piano warped into surreal form, silent dream room, detailed painterly finish" },
  { title: "The Forgotten Harbor", style: "DALI", prompt: "Dali inspired abandoned surreal harbor, impossible ships, symbolic sea elements, calm eerie atmosphere" },
  { title: "The Marble Sleepwalker", style: "DALI", prompt: "Dali inspired marble sleepwalker crossing a dream landscape, symbolic and precise surreal realism" },
  { title: "The Door of Sand", style: "DALI", prompt: "Dali inspired door formed from sand and shadow, impossible material, desert surrealism" },
  { title: "The Candle Sea", style: "DALI", prompt: "Dali inspired sea made of candlelight and reflections, symbolic surreal composition, luminous detail" },
  { title: "The Hidden Desert Face", style: "DALI", prompt: "Dali inspired desert rock formation secretly revealing a human face, illusionistic surreal painting" },
  { title: "The Clock on the Shore", style: "DALI", prompt: "Dali inspired soft clock resting on a quiet shore, dreamlike light, symbolic stillness" },
  { title: "The Surreal Noon", style: "DALI", prompt: "Dali inspired midday dream landscape, impossible objects, crystalline light, precise painterly surrealism" },

  // =========================
  // 51–100 REINTERPRETATIONS
  // =========================
  { title: "Soft Smile in Dali Style", style: "DALI", prompt: "Dali inspired surreal reinterpretation of a softly smiling woman, dreamlike face distortions, elegant symbolic atmosphere" },
  { title: "Historic Dinner in Dali Style", style: "DALI", prompt: "Dali inspired surreal reinterpretation of a historic dinner, elongated figures, impossible table perspective, dreamlike stillness" },
  { title: "Pearl Portrait in Dali Style", style: "DALI", prompt: "Dali inspired surreal portrait of a young woman with a pearl earring, illusionistic detail, dream symbolism" },
  { title: "Dream Night Sky in Dali Style", style: "DALI", prompt: "Dali inspired surreal celestial sky with impossible stars and dreamlike moon forms, painterly precision" },
  { title: "Mythic Shore in Dali Style", style: "DALI", prompt: "Dali inspired surreal mythic shore scene, symbolic sea forms, strange stillness, elegant dream realism" },
  { title: "Melting Time in Dali Style", style: "DALI", prompt: "Dali inspired dream composition about melting time, surreal clocks, barren landscape, symbolic calm" },
  { title: "Rural Couple in Dali Style", style: "DALI", prompt: "Dali inspired surreal rural couple portrait with elongated shadows, symbolic farmland, precise dreamlike detail" },
  { title: "Emotional Figure in Dali Style", style: "DALI", prompt: "Dali inspired surreal emotional figure beneath a strange sky, symbolic distortion, elegant uncanny realism" },
  { title: "Heavenly Light in Dali Style", style: "DALI", prompt: "Dali inspired surreal heavenly light scene with symbolic hands and dream clouds, refined painterly detail" },
  { title: "Abstract Conflict in Dali Style", style: "DALI", prompt: "Dali inspired surreal abstract composition about conflict and sorrow, fragmented symbolic objects, eerie stillness" },

  { title: "Sunflower Table in Dali Style", style: "DALI", prompt: "Dali inspired surreal still life of sunflowers on a table, distorted petals, dreamlike shadows, precise detail" },
  { title: "Blue Horse in Dali Style", style: "DALI", prompt: "Dali inspired surreal blue horse in a strange landscape, elongated shadow, symbolic dream imagery" },
  { title: "The Thinker in Dali Style", style: "DALI", prompt: "Dali inspired surreal seated thinker, strange anatomy illusion, dreamlike landscape, crisp detail" },
  { title: "Great Wave in Dali Style", style: "DALI", prompt: "Dali inspired surreal giant wave, impossible curling form, symbolic sea dream, refined painterly realism" },
  { title: "Golden Embrace in Dali Style", style: "DALI", prompt: "Dali inspired surreal golden embrace, elongated figures, symbolic intimacy, dream atmosphere" },
  { title: "City Rain in Dali Style", style: "DALI", prompt: "Dali inspired surreal city in rain, liquid streets, impossible reflections, uncanny calm" },
  { title: "Cathedral Light in Dali Style", style: "DALI", prompt: "Dali inspired surreal cathedral lit by dreamlike light, melting sacred architecture, symbolic atmosphere" },
  { title: "Dancers in Dali Style", style: "DALI", prompt: "Dali inspired surreal dancers in motion, elongated limbs, stage illusion, painterly dream realism" },
  { title: "Open Window in Dali Style", style: "DALI", prompt: "Dali inspired surreal interior with open window onto impossible landscape, elegant symbolic stillness" },
  { title: "Cafe Night in Dali Style", style: "DALI", prompt: "Dali inspired surreal night cafe, warped furniture, dream perspective, glowing eerie atmosphere" },

  { title: "Mother and Child in Dali Style", style: "DALI", prompt: "Dali inspired surreal mother and child scene, symbolic tenderness, dreamlike forms, precise painterly detail" },
  { title: "Garden Statues in Dali Style", style: "DALI", prompt: "Dali inspired surreal garden with statues, melting stone, strange shadows, elegant dream composition" },
  { title: "Quiet Harbor in Dali Style", style: "DALI", prompt: "Dali inspired surreal harbor at dawn, impossible ships, symbolic stillness, crisp dreamlike realism" },
  { title: "The Musician in Dali Style", style: "DALI", prompt: "Dali inspired surreal musician portrait, floating instrument, symbolic composition, refined strange detail" },
  { title: "Ancient Ruins in Dali Style", style: "DALI", prompt: "Dali inspired surreal ancient ruins, impossible arches, dream desert, symbolic atmosphere" },
  { title: "Festival Lights in Dali Style", style: "DALI", prompt: "Dali inspired surreal evening festival with floating lights, uncanny celebration, dreamlike painterly detail" },
  { title: "Rose Balcony in Dali Style", style: "DALI", prompt: "Dali inspired surreal balcony with giant rose and impossible architecture, symbolic dream scene" },
  { title: "The Reader in Dali Style", style: "DALI", prompt: "Dali inspired surreal reader near a window, elongated book, symbolic stillness, elegant painterly realism" },
  { title: "Moonlit Bridge in Dali Style", style: "DALI", prompt: "Dali inspired surreal moonlit bridge over silent water, impossible reflections, dreamlike precision" },
  { title: "Mountain View in Dali Style", style: "DALI", prompt: "Dali inspired surreal mountain landscape, stretched shadows, symbolic forms, crisp dream realism" },

  { title: "Seaside Portrait in Dali Style", style: "DALI", prompt: "Dali inspired surreal portrait by the sea, symbolic waves, elongated forms, precise painterly detail" },
  { title: "The Blue Room in Dali Style", style: "DALI", prompt: "Dali inspired surreal blue interior, warped furniture, symbolic silence, dreamlike perspective" },
  { title: "Harvest Workers in Dali Style", style: "DALI", prompt: "Dali inspired surreal harvest scene, dreamlike field workers, elongated shadows, symbolic countryside" },
  { title: "Royal Garden in Dali Style", style: "DALI", prompt: "Dali inspired surreal royal garden, impossible hedges, symbolic fountains, elegant bizarre atmosphere" },
  { title: "Stormy Sea in Dali Style", style: "DALI", prompt: "Dali inspired surreal storm sea with symbolic wave forms, dramatic sky, precise eerie stillness" },
  { title: "Autumn Portrait in Dali Style", style: "DALI", prompt: "Dali inspired surreal autumn portrait, leaves turning into symbols, dreamlike face, refined detail" },
  { title: "The Marble Garden in Dali Style", style: "DALI", prompt: "Dali inspired surreal garden of marble forms, symbolic pathways, melting statues, painterly precision" },
  { title: "Wheat Field in Dali Style", style: "DALI", prompt: "Dali inspired surreal wheat field, dream horizon, symbolic calm, warm golden detail" },
  { title: "Soft Procession in Dali Style", style: "DALI", prompt: "Dali inspired surreal ceremonial procession, elongated forms, symbolic space, elegant dream realism" },
  { title: "Window of Flowers in Dali Style", style: "DALI", prompt: "Dali inspired surreal flower window scene, impossible petals, symbolic light, refined painterly detail" },

  { title: "Palace Courtyard in Dali Style", style: "DALI", prompt: "Dali inspired surreal palace courtyard, impossible arcades, symbolic shadows, precise dream imagery" },
  { title: "The Poet in Dali Style", style: "DALI", prompt: "Dali inspired surreal poet portrait, floating pages, symbolic stillness, dreamlike realism" },
  { title: "Theater Evening in Dali Style", style: "DALI", prompt: "Dali inspired surreal theater at evening, impossible stage proportions, elegant eerie light" },
  { title: "Canal View in Dali Style", style: "DALI", prompt: "Dali inspired surreal canal scene, dream reflections, elongated architecture, painterly precision" },
  { title: "Garden Tea in Dali Style", style: "DALI", prompt: "Dali inspired surreal tea garden scene, floating cups, symbolic flowers, refined bizarre calm" },
  { title: "Quiet Library in Dali Style", style: "DALI", prompt: "Dali inspired surreal library interior, elongated shelves, symbolic books, dreamlike stillness" },
  { title: "The Standing Muse in Dali Style", style: "DALI", prompt: "Dali inspired surreal standing muse, elegant distortion, symbolic atmosphere, crisp painterly detail" },
  { title: "Harbor Lanterns in Dali Style", style: "DALI", prompt: "Dali inspired surreal harbor at night with lanterns, symbolic reflections, impossible calm" },
  { title: "Classical Orchard in Dali Style", style: "DALI", prompt: "Dali inspired surreal orchard, dream fruit, symbolic trees, warm elegant atmosphere" },
  { title: "Ancient Balcony in Dali Style", style: "DALI", prompt: "Dali inspired surreal balcony above an old city, symbolic emptiness, impossible perspective, refined dream realism" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestDaliFullPage() {
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
        <h1 className="text-3xl font-semibold">Generate Full Dalí Set</h1>
        <p className="text-slate-400 text-sm">
          100 Dalí artworks: 50 originals + 50 reinterpretations.
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
