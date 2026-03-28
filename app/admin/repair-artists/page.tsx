'use client'

import { useState } from 'react'

type RepairResult = {
  ok?: boolean
  checked?: number
  updated?: number
  skipped?: number
  samples?: {
    id: string
    title: string
    from: string | null
    to: string
  }[]
  error?: string
}

export default function RepairArtistsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RepairResult | null>(null)

  async function runRepair() {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/repair-artists', {
        method: 'GET',
      })

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-semibold">Repair Artist Names</h1>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
        <p className="text-sm text-slate-300">
          This updates artworks whose artist is generic, such as “AI Image”, and replaces it
          with the correct master name based on style.
        </p>

        <button
          type="button"
          onClick={runRepair}
          disabled={loading}
          className="rounded-lg bg-amber-500 px-4 py-2 text-black font-medium disabled:opacity-60"
        >
          {loading ? 'Repairing...' : 'Run Artist Repair'}
        </button>
      </div>

      {result ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-4">
          <pre className="overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-300">
            {JSON.stringify(result, null, 2)}
          </pre>

          {result.samples?.length ? (
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-slate-100">Sample updates</h2>
              <div className="space-y-2">
                {result.samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="text-sm text-slate-100">{sample.title}</div>
                    <div className="text-xs text-slate-400">
                      {sample.from || 'null'} → {sample.to}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}
