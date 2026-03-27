'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // MONET — original works
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

  // MONET — safer reinterpretations
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

  // MICHELANGELO — original works
  { title: "Study of the Human Form", style: "MICHELANGELO", prompt: "Michelangelo inspired renaissance anatomy study, marble sculpture appearance, dramatic lighting, idealized human form" },
  { title: "Divine Figure in Light", style: "MICHELANGELO", prompt: "Michelangelo inspired renaissance figure illuminated by divine light, strong anatomy, dramatic shadows" },
  { title: "The Awakening Form", style: "MICHELANGELO", prompt: "Michelangelo inspired marble figure emerging from shadow, powerful anatomy, sculptural realism" },
  { title: "Ceiling Fresco Study", style: "MICHELANGELO", prompt: "Michelangelo inspired ceiling fresco scene, renaissance painting, dynamic figures, noble composition" },
  { title: "Heroic Pose", style: "MICHELANGELO", prompt: "Michelangelo inspired heroic figure with strong anatomy, dramatic pose, marble sculpture feeling" },
  { title: "Sacred Composition", style: "MICHELANGELO", prompt: "Michelangelo inspired sacred renaissance composition, powerful human forms, dramatic light" },
  { title: "Marble Grace", style: "MICHELANGELO", prompt: "Michelangelo inspired marble sculpture of an elegant figure, soft light, classical balance" },
  { title: "The Thinking Figure", style: "MICHELANGELO", prompt: "Michelangelo inspired contemplative figure, renaissance anatomy, marble texture, dramatic mood" },
  { title: "Light and Form", style: "MICHELANGELO", prompt: "Michelangelo inspired study of anatomy under dramatic light, sculptural realism, renaissance style" },
  { title: "Classical Balance", style: "MICHELANGELO", prompt: "Michelangelo inspired balanced renaissance figure, marble finish, ideal proportions" },

  // MICHELANGELO — safer reinterpretations
  { title: "Soft Smile in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance sculptural portrait of a softly smiling woman, inspired by a classic museum portrait, marble texture, noble lighting" },
  { title: "Dreamlike Night Sky in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance fresco inspired by a dramatic star-filled night sky, celestial motion, rich painted ceiling style" },
  { title: "Echo of Emotion in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance dramatic figure expressing intense emotion, sculptural anatomy, stormy sky, marble realism" },
  { title: "Water Garden in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance interpretation of a tranquil water garden with lilies, classical composition, sculptural forms" },
  { title: "Mythic Shore in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance mythological figure rising near the sea, ideal anatomy, noble composition, marble-inspired beauty" },
  { title: "Abstract Conflict in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance-inspired dramatic composition expressing conflict and sorrow through powerful human figures" },
  { title: "Pearl Portrait in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance sculptural portrait of a young woman with a pearl earring, marble realism, subtle light" },
  { title: "Melting Time in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance surreal scene exploring the passage of time through sculptural forms and dramatic composition" },
  { title: "Rural Portrait in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance portrait of two rural figures before a farmhouse, ideal anatomy, classical composition" },
  { title: "Shared Meal in Michelangelo Style", style: "MICHELANGELO", prompt: "Renaissance fresco of a historic shared meal scene, dramatic composition, noble figures, sacred atmosphere" },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestMonetMichelangeloPage() {
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
        <h1 className="text-3xl font-semibold">Generate Monet + Michelangelo Test Set</h1>
        <p className="text-slate-400 text-sm">
          Safer prompt set for launch testing.
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
          {runningAll ? 'Generating...' : 'Generate All 40'}
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
