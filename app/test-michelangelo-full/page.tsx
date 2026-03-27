'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // 1-50 ORIGINAL MICHELANGELO WORKS
  { title: "Study of the Human Form", style: "MICHELANGELO", prompt: "Michelangelo inspired renaissance anatomy study, marble sculpture appearance, dramatic lighting, idealized human form" },
  { title: "Divine Figure in Light", style: "MICHELANGELO", prompt: "Michelangelo inspired renaissance figure illuminated by divine light, strong anatomy, dramatic shadows" },
  { title: "The Awakening Form", style: "MICHELANGELO", prompt: "Michelangelo inspired marble figure emerging from shadow, powerful anatomy, sculptural realism" },
  { title: "Ceiling Fresco Study", style: "MICHELANGELO", prompt: "Michelangelo inspired ceiling fresco scene, renaissance painting, dynamic figures, noble composition" },
  { title: "Heroic Pose", style: "MICHELANGELO", prompt: "Michelangelo inspired heroic figure with strong anatomy, dramatic pose, marble sculpture feeling" },
  { title: "Sacred Composition", style: "MICHELANGELO", prompt: "Michelangelo inspired sacred renaissance composition, powerful human forms, dramatic light" },
  { title: "Marble Grace", style: "MICHELANGELO", prompt: "Michelangelo inspired marble sculpture of an elegant figure, soft light, classical balance" },
  { title: "Light and Form", style: "MICHELANGELO", prompt: "Michelangelo inspired study of anatomy under dramatic light, sculptural realism, renaissance style" },
  { title: "Classical Balance", style: "MICHELANGELO", prompt: "Michelangelo inspired balanced renaissance figure, marble finish, ideal proportions" },
  { title: "Reflective Figure", style: "MICHELANGELO", prompt: "Michelangelo inspired renaissance figure in a reflective pose, marble sculpture aesthetic, dramatic light, classical composition" },

  { title: "Noble Figure at Dawn", style: "MICHELANGELO", prompt: "Michelangelo inspired noble renaissance figure at dawn, marble texture, dramatic sky, sculptural realism" },
  { title: "Fresco of the Morning Sky", style: "MICHELANGELO", prompt: "Michelangelo inspired fresco of a bright morning sky with noble figures and grand composition" },
  { title: "Marble Study in Gold Light", style: "MICHELANGELO", prompt: "Michelangelo inspired marble figure lit by golden light, strong form, classical stillness" },
  { title: "Sacred Chamber Scene", style: "MICHELANGELO", prompt: "Michelangelo inspired sacred interior with grand figures, renaissance arrangement, dramatic illumination" },
  { title: "Hero Before the Storm", style: "MICHELANGELO", prompt: "Michelangelo inspired heroic figure beneath storm clouds, marble realism, powerful pose" },
  { title: "The Quiet Saint", style: "MICHELANGELO", prompt: "Michelangelo inspired quiet saintly figure, renaissance reverence, soft dramatic light" },
  { title: "Vaulted Ceiling Vision", style: "MICHELANGELO", prompt: "Michelangelo inspired vaulted ceiling with noble figures and celestial movement, renaissance fresco style" },
  { title: "Classical Drapery Study", style: "MICHELANGELO", prompt: "Michelangelo inspired classical drapery and figure study, marble-like folds, sculptural detail" },
  { title: "Marble Figure in Shadow", style: "MICHELANGELO", prompt: "Michelangelo inspired solitary marble figure in shadow, dramatic contrast, quiet power" },
  { title: "The Standing Prophet", style: "MICHELANGELO", prompt: "Michelangelo inspired standing prophetic figure, monumental anatomy, renaissance dignity" },

  { title: "The Triumphant Form", style: "MICHELANGELO", prompt: "Michelangelo inspired triumphant figure, monumental anatomy, classical grace, dramatic light" },
  { title: "Chapel Wall Study", style: "MICHELANGELO", prompt: "Michelangelo inspired chapel wall fresco with layered renaissance figures, rich composition" },
  { title: "Marble Calm", style: "MICHELANGELO", prompt: "Michelangelo inspired serene marble figure, balanced composition, soft cool light" },
  { title: "The Elevated Gaze", style: "MICHELANGELO", prompt: "Michelangelo inspired figure looking upward, noble expression, sculptural tension" },
  { title: "Grand Figure by Torchlight", style: "MICHELANGELO", prompt: "Michelangelo inspired grand renaissance figure in torchlight, strong shadows, marble feel" },
  { title: "Study in Sacred Red", style: "MICHELANGELO", prompt: "Michelangelo inspired sacred composition with rich red drapery, dramatic fresco atmosphere" },
  { title: "The Marble Guardian", style: "MICHELANGELO", prompt: "Michelangelo inspired guardian figure in marble, commanding stance, renaissance realism" },
  { title: "The Quiet Fresco", style: "MICHELANGELO", prompt: "Michelangelo inspired quiet fresco panel with gentle motion and balanced figures" },
  { title: "Column and Figure", style: "MICHELANGELO", prompt: "Michelangelo inspired marble figure beside a classical column, dramatic light and proportion" },
  { title: "The Resting Hero", style: "MICHELANGELO", prompt: "Michelangelo inspired heroic figure at rest, sculptural realism, noble anatomy" },

  { title: "Skyward Assembly", style: "MICHELANGELO", prompt: "Michelangelo inspired assembly of figures rising toward the sky, renaissance ceiling grandeur" },
  { title: "The Marble Witness", style: "MICHELANGELO", prompt: "Michelangelo inspired marble witness figure, solemn expression, dramatic side light" },
  { title: "Grand Arch Composition", style: "MICHELANGELO", prompt: "Michelangelo inspired composition beneath a grand arch, fresco painting, strong figures" },
  { title: "Figure by the Niche", style: "MICHELANGELO", prompt: "Michelangelo inspired figure standing in a classical niche, marble texture, dramatic illumination" },
  { title: "The Silent Apostle", style: "MICHELANGELO", prompt: "Michelangelo inspired apostolic figure in quiet dignity, sacred atmosphere, renaissance style" },
  { title: "Vault of Light", style: "MICHELANGELO", prompt: "Michelangelo inspired vault of light with fresco figures and celestial glow" },
  { title: "The Marble Visionary", style: "MICHELANGELO", prompt: "Michelangelo inspired visionary marble figure, intense gaze, balanced classical composition" },
  { title: "Heroic Seated Form", style: "MICHELANGELO", prompt: "Michelangelo inspired seated heroic figure, sculptural weight, dramatic renaissance light" },
  { title: "Fresco of Noble Motion", style: "MICHELANGELO", prompt: "Michelangelo inspired fresco panel with noble movement, layered bodies, painted ceiling aesthetic" },
  { title: "The Stone Dreamer", style: "MICHELANGELO", prompt: "Michelangelo inspired contemplative marble dreamer, quiet power, strong anatomy" },

  { title: "Monument in the Chapel", style: "MICHELANGELO", prompt: "Michelangelo inspired monument-like figure in a chapel interior, marble realism, sacred mood" },
  { title: "The Luminous Saint", style: "MICHELANGELO", prompt: "Michelangelo inspired saintly figure in luminous light, renaissance dignity, sculptural form" },
  { title: "The Marble Youth", style: "MICHELANGELO", prompt: "Michelangelo inspired youthful marble figure, ideal proportions, classical grace" },
  { title: "Ceiling of Heroes", style: "MICHELANGELO", prompt: "Michelangelo inspired ceiling fresco of heroic figures, renaissance grandeur, dynamic composition" },
  { title: "The Sacred Archway", style: "MICHELANGELO", prompt: "Michelangelo inspired sacred archway scene, monumental figures, dramatic light" },
  { title: "Marble in Blue Shadow", style: "MICHELANGELO", prompt: "Michelangelo inspired marble figure in cool blue shadow, powerful anatomy, still atmosphere" },
  { title: "The Classical Shore", style: "MICHELANGELO", prompt: "Renaissance inspired classical seaside composition, noble drapery, marble-like forms, dramatic sky, monumental composition" },
  { title: "The Watchful Figure", style: "MICHELANGELO", prompt: "Michelangelo inspired watchful renaissance figure, stern calm presence, sculptural light" },
  { title: "The Balanced Fresco", style: "MICHELANGELO", prompt: "Michelangelo inspired balanced fresco with grand human figures and soft celestial color" },
  { title: "The Marble Pilgrim", style: "MICHELANGELO", prompt: "Michelangelo inspired pilgrim-like marble figure, noble travel posture, renaissance feeling" },

  // 51-100 REINTERPRETATIONS IN MICHELANGELO STYLE
  { title: "Soft Smile in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance sculptural portrait of a softly smiling woman, inspired by a classic museum portrait, marble texture, noble lighting" },
  { title: "Dreamlike Night Sky in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance fresco inspired by a dramatic star-filled night sky, celestial motion, rich painted ceiling style" },
  { title: "Echo of Emotion in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance dramatic figure expressing intense emotion, sculptural anatomy, stormy sky, marble realism" },
  { title: "Water Garden in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance interpretation of a tranquil water garden with lilies, classical composition, sculptural forms" },
  { title: "Mythic Shore in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance inspired classical seaside composition, noble drapery, marble-like forms, dramatic sky, monumental composition" },
  { title: "Abstract Conflict in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance-inspired dramatic composition expressing conflict and sorrow through powerful human figures" },
  { title: "Pearl Portrait in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance sculptural portrait of a young woman with a pearl earring, marble realism, subtle light" },
  { title: "Melting Time in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance surreal scene exploring the passage of time through sculptural forms and dramatic composition" },
  { title: "Rural Portrait in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance portrait of two rural figures before a farmhouse, ideal anatomy, classical composition" },
  { title: "Shared Meal in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance fresco of a historic shared meal scene, dramatic composition, noble figures, sacred atmosphere" },

  { title: "Sunflower Table in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance reinterpretation of a sunflower still life, sculptural arrangement, warm chapel light" },
  { title: "Blue Horse in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance monumental horse in a blue-toned landscape, ideal form, dramatic composition" },
  { title: "The Thinker in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance sculptural interpretation of a thoughtful seated figure, marble realism, solemn light" },
  { title: "Great Wave in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance dramatic seascape with monumental wave forms, classical structure, charged sky" },
  { title: "Golden Embrace in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance-inspired embrace with noble drapery, sculptural figures, warm luminous atmosphere" },
  { title: "City Rain in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance city scene under rain, strong architecture, dramatic perspective, noble mood" },
  { title: "Cathedral Light in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance interpretation of cathedral light falling across monumental stone forms and figures" },
  { title: "Dancers in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance fresco of graceful dancers, idealized motion, noble anatomy, soft architectural setting" },
  { title: "Open Window in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance interior with an open window, marble-like forms, calm light, noble stillness" },
  { title: "Cafe Night in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance reinterpretation of a nighttime gathering under warm lamps, stone architecture, dramatic mood" },

  { title: "Mother and Child in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance mother and child composition, sculptural tenderness, sacred warmth, marble-like grace" },
  { title: "Garden Statues in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance garden with monumental statues and classical order, warm light, grand atmosphere" },
  { title: "Quiet Harbor in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance harbor scene with noble architecture and calm water, monumental composition" },
  { title: "The Musician in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance portrait of a musician, strong anatomy, noble expression, dramatic interior light" },
  { title: "Ancient Ruins in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance view of ancient ruins with heroic figures, dramatic sky, monumental balance" },
  { title: "Festival Lights in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance square illuminated for celebration, architectural grandeur, strong composition, noble mood" },
  { title: "Rose Balcony in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance balcony overflowing with roses, marble forms, classical harmony, soft evening light" },
  { title: "The Reader in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance figure reading in focused stillness, sculptural realism, dramatic shadow and light" },
  { title: "Moonlit Bridge in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance bridge under moonlight, monumental stone, serene water, atmospheric night sky" },
  { title: "Mountain View in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance mountain panorama with heroic foreground forms, dramatic clouds, grand composition" },

  { title: "Seaside Portrait in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance portrait near the sea, noble drapery, marble-like presence, dramatic horizon" },
  { title: "The Blue Room in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance interior in cool blue tones, monumental stillness, sculptural furniture and figure" },
  { title: "Harvest Workers in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance field scene with noble workers, idealized forms, warm harvest light" },
  { title: "Royal Garden in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance formal garden with statues, symmetry, classical architecture, dramatic depth" },
  { title: "Stormy Sea in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance seascape under storm light, monumental waves, heroic structure and tension" },
  { title: "Autumn Portrait in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance portrait in autumn tones, sculptural features, dignified expression, rich warm light" },
  { title: "The Marble Garden in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance garden filled with marble forms, noble stillness, golden light, classical balance" },
  { title: "Wheat Field in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance wheat field with monumental horizon and heroic atmosphere, dramatic sky" },
  { title: "Soft Procession in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance ceremonial procession, grand architecture, noble figures, sacred mood" },
  { title: "Window of Flowers in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance floral window scene, stone textures, refined light, sculptural arrangement" },

  { title: "Palace Courtyard in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance palace courtyard with monumental forms, balanced architecture, noble atmosphere" },
  { title: "The Poet in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance portrait of a poet, intense contemplative gaze, marble-like dignity" },
  { title: "Theater Evening in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance reinterpretation of a grand evening theater, noble audience, architectural depth" },
  { title: "Canal View in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance canal view with classical facades, calm water, dramatic perspective" },
  { title: "Garden Tea in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance garden gathering with noble posture, marble-like elegance, soft afternoon light" },
  { title: "Quiet Library in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance library interior with sculptural figures, towering shelves, focused dramatic light" },
  { title: "The Standing Muse in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance standing muse, idealized anatomy, calm solemn expression, marble realism" },
  { title: "Harbor Lanterns in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance harbor lit by lanterns, monumental architecture, reflective water, noble night mood" },
  { title: "Classical Orchard in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance orchard scene with idealized forms, soft fruit trees, balanced classical arrangement" },
  { title: "Ancient Balcony in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance balcony overlooking an old city, sculptural stonework, dramatic light and sky" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestMichelangeloFullPage() {
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
        <h1 className="text-3xl font-semibold">Generate Full Michelangelo Set</h1>
        <p className="text-slate-400 text-sm">
          100 Michelangelo artworks: 50 originals + 50 reinterpretations.
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
