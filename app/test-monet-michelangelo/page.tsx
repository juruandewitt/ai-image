'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  { title: "Morning Light on the River", style: "MONET", prompt: "Claude Monet style, impressionist river sunrise, soft brush strokes, pastel tones" },
  { title: "Garden in Bloom", style: "MONET", prompt: "Monet style garden, colorful flowers, sunlight, impressionism" },
  { title: "Water Lilies at Dawn", style: "MONET", prompt: "Monet water lilies, calm pond, pastel reflections" },
  { title: "Sunset Over Fields", style: "MONET", prompt: "Monet countryside sunset, warm glowing tones" },
  { title: "Bridge Over Quiet Water", style: "MONET", prompt: "Monet bridge over pond, reflections, soft colors" },
  { title: "Misty Morning Garden", style: "MONET", prompt: "Monet foggy garden, muted tones, soft light" },
  { title: "Spring Blossom Path", style: "MONET", prompt: "Monet spring blossoms, light airy brushwork" },
  { title: "Reflections of Sky", style: "MONET", prompt: "Monet water reflection, pastel sky tones" },
  { title: "Summer Meadow Light", style: "MONET", prompt: "Monet meadow, sunlight, impressionist" },
  { title: "Quiet Pond Afternoon", style: "MONET", prompt: "Monet pond, calm atmosphere, reflections" },

  { title: "Mona Lisa in Monet Style", style: "MONET", prompt: "Mona Lisa in Monet impressionist style, soft tones" },
  { title: "The Last Supper in Monet Style", style: "MONET", prompt: "Last Supper Monet style, soft blended colors" },
  { title: "Girl with a Pearl Earring in Monet Style", style: "MONET", prompt: "Girl with Pearl Earring Monet style" },
  { title: "Starry Night in Monet Style", style: "MONET", prompt: "Starry Night Monet style, soft sky" },
  { title: "Birth of Venus in Monet Style", style: "MONET", prompt: "Birth of Venus Monet style, pastel tones" },
  { title: "Persistence of Memory in Monet Style", style: "MONET", prompt: "Persistence of Memory Monet style" },
  { title: "American Gothic in Monet Style", style: "MONET", prompt: "American Gothic Monet style" },
  { title: "The Scream in Monet Style", style: "MONET", prompt: "The Scream Monet style" },
  { title: "Creation of Adam in Monet Style", style: "MONET", prompt: "Creation of Adam Monet style" },
  { title: "Guernica in Monet Style", style: "MONET", prompt: "Guernica Monet style" },

  { title: "Study of the Human Form", style: "MICHELANGELO", prompt: "Michelangelo style anatomy, marble sculpture, dramatic light" },
  { title: "Divine Figure in Light", style: "MICHELANGELO", prompt: "Michelangelo renaissance figure, dramatic lighting" },
  { title: "The Awakening Form", style: "MICHELANGELO", prompt: "Michelangelo sculpture emerging from shadow" },
  { title: "Ceiling Fresco Study", style: "MICHELANGELO", prompt: "Michelangelo fresco, renaissance painting" },
  { title: "Heroic Pose", style: "MICHELANGELO", prompt: "Michelangelo heroic anatomy, strong pose" },
  { title: "Sacred Composition", style: "MICHELANGELO", prompt: "Michelangelo religious scene, renaissance" },
  { title: "Marble Grace", style: "MICHELANGELO", prompt: "Michelangelo marble sculpture, soft light" },
  { title: "The Thinking Figure", style: "MICHELANGELO", prompt: "Michelangelo contemplative pose" },
  { title: "Light and Form", style: "MICHELANGELO", prompt: "Michelangelo anatomy with dramatic lighting" },
  { title: "Classical Balance", style: "MICHELANGELO", prompt: "Michelangelo balanced figure, renaissance" },

  { title: "Mona Lisa in Michelangelo Style", style: "MICHELANGELO", prompt: "Mona Lisa Michelangelo style sculpture" },
  { title: "Starry Night in Michelangelo Style", style: "MICHELANGELO", prompt: "Starry Night Michelangelo fresco" },
  { title: "The Scream in Michelangelo Style", style: "MICHELANGELO", prompt: "The Scream Michelangelo sculpture" },
  { title: "Water Lilies in Michelangelo Style", style: "MICHELANGELO", prompt: "Water lilies Michelangelo style" },
  { title: "Birth of Venus in Michelangelo Style", style: "MICHELANGELO", prompt: "Birth of Venus Michelangelo style" },
  { title: "Guernica in Michelangelo Style", style: "MICHELANGELO", prompt: "Guernica Michelangelo style" },
  { title: "Girl with Pearl Earring in Michelangelo Style", style: "MICHELANGELO", prompt: "Girl with Pearl Earring Michelangelo style" },
  { title: "Persistence of Memory in Michelangelo Style", style: "MICHELANGELO", prompt: "Persistence of Memory Michelangelo style" },
  { title: "American Gothic in Michelangelo Style", style: "MICHELANGELO", prompt: "American Gothic Michelangelo style" },
  { title: "Last Supper in Michelangelo Style", style: "MICHELANGELO", prompt: "Last Supper Michelangelo style" },
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
          This page generates the 40 test artworks one-by-one, which avoids the Vercel timeout.
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
