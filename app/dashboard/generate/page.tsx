'use client'
import { useState } from 'react'

export default function GeneratePage() {
  const [pending, setPending] = useState(false)
  const [log, setLog] = useState<string>('')

  const run = async (mode: 'cross'|'random') => {
    setPending(true); setLog('')
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, limit: 20 }) // try 20 first; you can increase later
    })
    const j = await res.json()
    setPending(false)
    setLog(JSON.stringify(j, null, 2))
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Generate AI Artworks</h1>
      <p className="text-sm text-neutral-300">
        Choose a generation mode. <b>Cross-style</b> reimagines famous works in other masters' styles.
        <b> Random</b> fills each master with new scenes. Each run creates variants (formats & sizes) and saves them.
      </p>
      <div className="flex gap-3">
        <button disabled={pending} onClick={()=>run('cross')} className="px-4 py-2 rounded-md bg-indigo-600 text-white">{pending?'Working…':'Run Cross-Style (x20)'}</button>
        <button disabled={pending} onClick={()=>run('random')} className="px-4 py-2 rounded-md bg-amber-600 text-white">{pending?'Working…':'Run Random (x20)'}</button>
      </div>
      <pre className="text-xs text-neutral-300 bg-black/30 border border-white/10 rounded p-3 overflow-auto max-h-[60vh] whitespace-pre-wrap">{log || '—'}</pre>
      <p className="text-xs text-neutral-500">Tip: run multiple times until each style reaches ~50 items.</p>
    </section>
  )
}
