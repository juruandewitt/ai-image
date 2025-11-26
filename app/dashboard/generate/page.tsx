// app/dashboard/generate/page.tsx
'use client'

import { useState } from 'react'

const KNOWN_STYLES = [
  'van-gogh','da-vinci','picasso','monet','vermeer',
  'rembrandt','dali','michelangelo','caravaggio','pollock'
]

export default function GenerateDashboard() {
  const [style, setStyle] = useState('van-gogh')
  const [titles, setTitles] = useState(
`Starry Harbor Over Canal
Sunflowers in Night Café
Wheatfield with Neon Crows
Nocturne over Windmill Village`
  )
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)

  async function runSequential() {
    if (running) return
    setRunning(true)
    setLog([])

    const list = titles
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)

    for (const t of list) {
      setLog(prev => [...prev, `→ Generating: "${t}"...`])
      try {
        const res = await fetch('/api/generate/one', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ style, title: t })
        })
        const json = await res.json()
        if (json.ok) {
          setLog(prev => [...prev, `✔ Added: ${t} (id: ${json.id})`])
        } else {
          setLog(prev => [...prev, `✖ Failed: ${t} — ${json.error}`])
        }
      } catch (e: any) {
        setLog(prev => [...prev, `✖ Error: ${String(e?.message || e)}`])
      }
      // tiny pause to play nice with limits
      await new Promise(r => setTimeout(r, 400))
    }

    setLog(prev => [...prev, 'Done. Refresh Home to see New Drops.'])
    setRunning(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Batch Generate (sequential)</h1>
      <div className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Style</span>
          <select
            className="bg-slate-900 border border-slate-700 rounded px-3 py-2"
            value={style}
            onChange={e => setStyle(e.target.value)}
          >
            {KNOWN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-300">Titles (one per line)</span>
          <textarea
            className="h-48 bg-slate-900 border border-slate-700 rounded px-3 py-2"
            value={titles}
            onChange={e => setTitles(e.target.value)}
          />
        </label>

        <button
          onClick={runSequential}
          disabled={running}
          className="self-start rounded px-4 py-2 bg-amber-500 text-slate-950 font-semibold disabled:opacity-50"
        >
          {running ? 'Generating…' : 'Generate'}
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded p-3 text-sm whitespace-pre-wrap">
          {log.length ? log.join('\n') : 'Logs will appear here…'}
        </div>
      </div>
    </div>
  )
}
