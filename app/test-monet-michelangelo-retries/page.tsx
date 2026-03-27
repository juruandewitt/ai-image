'use client'

import { useMemo, useState } from 'react'

type Item = {
  title: string
  style: string
  prompt: string
}

const ITEMS: Item[] = [
  // =========================
  // MONET RETRIES (17)
  // =========================
  {
    title: 'Soft Museum Portrait in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist portrait of a calm museum lady, soft pastel tones, gentle brush strokes, elegant atmosphere, Monet inspired',
  },
  {
    title: 'Historic Banquet in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist scene of a historic banquet, warm candlelight, soft colors, balanced group composition, Monet inspired',
  },
  {
    title: 'Dreaming Woman with Pearl in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist portrait of a young woman with a pearl earring, subtle light, delicate expression, Monet inspired brushwork',
  },
  {
    title: 'Celestial Evening in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist evening sky with luminous stars, soft swirling clouds, blue and gold tones, Monet inspired',
  },
  {
    title: 'Seaside Muse in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist scene of a graceful woman by the sea, pastel palette, flowing forms, tranquil coastal atmosphere, Monet inspired',
  },
  {
    title: 'Dream of Soft Clocks in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist surreal landscape with soft timepieces and dreamlike atmosphere, pastel light, Monet inspired',
  },
  {
    title: 'Countryside Couple in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist portrait of two countryside figures in front of a farmhouse, warm light, soft brushwork, Monet inspired',
  },
  {
    title: 'Figure on the Bridge in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist scene of an expressive figure on a bridge beneath a dramatic sky, softened forms, Monet inspired',
  },
  {
    title: 'Touch of Light in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist scene of two hands almost touching in a glowing sky, airy clouds, soft divine light, Monet inspired',
  },
  {
    title: 'Broken Forms in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist abstract composition inspired by sorrow and conflict, flowing colors, softened shapes, Monet inspired',
  },
  {
    title: 'Moonlit Harbor in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist harbor at night with glowing reflections, calm boats, soft moonlight, Monet inspired atmosphere',
  },
  {
    title: 'Quiet Reader in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist portrait of a person reading by a bright window, gentle daylight, soft painterly mood, Monet inspired',
  },
  {
    title: 'Rose Balcony in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist balcony overflowing with roses, elegant architecture, warm sunlight, Monet inspired brushwork',
  },
  {
    title: 'Evening Performance in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist theater interior with warm stage light, audience glow, soft painterly detail, Monet inspired',
  },
  {
    title: 'Ancient Garden Ruins in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist ancient garden ruins at sunset, softened stone forms, atmospheric sky, Monet inspired',
  },
  {
    title: 'Ceremonial Square in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist town square during a ceremonial gathering, warm ambient light, softened crowd forms, Monet inspired',
  },
  {
    title: 'Classical Orchard in Monet Style',
    style: 'MONET',
    prompt:
      'Impressionist orchard with classical atmosphere, soft blossoms, dappled sunlight, Monet inspired palette',
  },

  // =========================
  // MICHELANGELO RETRIES (7)
  // =========================
  {
    title: 'Classical Shore in Michelangelo Style',
    style: 'MICHELANGELO',
    prompt:
      'Renaissance inspired classical seaside composition, noble drapery, stone-like forms, dramatic sky, monumental balance',
  },
  {
    title: 'Reflective Figure in Michelangelo Style',
    style: 'MICHELANGELO',
    prompt:
      'Renaissance inspired figure in a reflective seated pose, sculptural realism, noble anatomy, dramatic light, Michelangelo inspired',
  },
  {
    title: 'The Marble Muse',
    style: 'MICHELANGELO',
    prompt:
      'Michelangelo inspired marble muse, calm noble expression, balanced composition, soft dramatic illumination',
  },
  {
    title: 'The Noble Seated Form',
    style: 'MICHELANGELO',
    prompt:
      'Michelangelo inspired seated renaissance figure, idealized anatomy, classical dignity, marble texture',
  },
  {
    title: 'The Quiet Monument',
    style: 'MICHELANGELO',
    prompt:
      'Michelangelo inspired monumental standing figure, calm expression, architectural background, sculptural realism',
  },
  {
    title: 'Stone Figure by the Sea',
    style: 'MICHELANGELO',
    prompt:
      'Renaissance stone figure beside the sea, noble drapery, dramatic clouds, classical composition, Michelangelo inspired',
  },
  {
    title: 'The Contemplative Marble Figure',
    style: 'MICHELANGELO',
    prompt:
      'Michelangelo inspired contemplative marble figure, soft side light, classical posture, quiet power',
  },
]

type RowStatus = 'idle' | 'running' | 'success' | 'error'

export default function TestMonetMichelangeloRetriesPage() {
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
        <h1 className="text-3xl font-semibold">Generate Monet + Michelangelo Retry Set</h1>
        <p className="text-slate-400 text-sm">
          24 retry prompts: 17 Monet replacements and 7 Michelangelo replacements.
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
          {runningAll ? 'Generating...' : 'Generate All 24'}
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
