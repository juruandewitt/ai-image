'use client'

import { useState } from 'react'

type ResultData = {
  ok?: boolean
  reused?: boolean
  artwork?: {
    id: string
    title: string
    style: string
    artist: string
    thumbnail: string | null
    price: number | null
    assets?: { id: string; originalUrl: string | null }[]
  }
  error?: string
}

export default function TestSingleArtworkPage() {
  const [style, setStyle] = useState('MONET')
  const [prompt, setPrompt] = useState(
    'soft impressionist garden painting in Monet style, flowers, morning light, calm atmosphere'
  )
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState<ResultData | null>(null)

  async function generateOne() {
    setStatus('running')
    setResult(null)

    const uniqueTitle = `Diagnostic ${style} ${new Date()
      .toISOString()
      .replace(/[:.]/g, '-')}`

    try {
      const url = new URL('/api/generate/master', window.location.origin)
      url.searchParams.set('title', uniqueTitle)
      url.searchParams.set('style', style)
      url.searchParams.set('prompt', prompt)

      const res = await fetch(url.toString(), { method: 'GET' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setResult(data)
        return
      }

      setStatus('success')
      setResult(data)
    } catch (err) {
      setStatus('error')
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const thumb = result?.artwork?.thumbnail || ''
  const asset = result?.artwork?.assets?.[0]?.originalUrl || ''

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Single Artwork Diagnostic</h1>

      <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          >
            <option value="MONET">MONET</option>
            <option value="VAN_GOGH">VAN_GOGH</option>
            <option value="PICASSO">PICASSO</option>
            <option value="DALI">DALI</option>
            <option value="REMBRANDT">REMBRANDT</option>
            <option value="VERMEER">VERMEER</option>
            <option value="CARAVAGGIO">CARAVAGGIO</option>
            <option value="POLLOCK">POLLOCK</option>
            <option value="DA_VINCI">DA_VINCI</option>
            <option value="MICHELANGELO">MICHELANGELO</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
          />
        </div>

        <button
          type="button"
          onClick={generateOne}
          disabled={status === 'running'}
          className="rounded-lg bg-amber-500 px-4 py-2 text-black font-medium disabled:opacity-60"
        >
          {status === 'running' ? 'Generating...' : 'Generate Unique Test Artwork'}
        </button>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
        <div className="text-sm text-slate-300">Status: {status}</div>

        {result ? (
          <>
            <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
              {JSON.stringify(result, null, 2)}
            </pre>

            {thumb ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Thumbnail URL preview</div>
                <img
                  src={thumb}
                  alt="thumbnail preview"
                  className="max-w-sm rounded-lg border border-slate-700"
                />
              </div>
            ) : null}

            {asset ? (
              <div className="space-y-2">
                <div className="text-sm text-slate-300">Asset URL preview</div>
                <img
                  src={asset}
                  alt="asset preview"
                  className="max-w-sm rounded-lg border border-slate-700"
                />
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  )
}
