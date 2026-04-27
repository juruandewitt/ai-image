'use client'

import { useState } from 'react'

type Candidate = {
  title: string
  style: string
  candidateUrl?: string
  success: boolean
  error?: string
}

export default function QualityReviewPage() {
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [message, setMessage] = useState('')

  async function generateCandidates() {
    setLoading(true)
    setMessage('Generating candidates...')
    setCandidates([])

    try {
      const res = await fetch('/api/quality/candidates', { cache: 'no-store' })
      const data = await res.json()
      setCandidates(data.results || [])
      setMessage(data.message || 'Candidates generated')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to generate candidates')
    } finally {
      setLoading(false)
    }
  }

  async function approveCandidate(candidate: Candidate) {
    if (!candidate.candidateUrl) return

    setApproving(candidate.title)

    try {
      const res = await fetch('/api/quality/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate),
      })

      const data = await res.json()

      if (!data.success) {
        setMessage(data.error || `Failed to approve ${candidate.title}`)
        return
      }

      setMessage(`Approved: ${candidate.title}`)
      setCandidates((current) =>
        current.filter((item) => item.title !== candidate.title)
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Approval failed')
    } finally {
      setApproving(null)
    }
  }

  function rejectCandidate(candidate: Candidate) {
    setCandidates((current) => current.filter((item) => item.title !== candidate.title))
    setMessage(`Rejected: ${candidate.title}`)
  }

  return (
    <main className="space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Quality Review</h1>
        <p className="text-sm text-slate-400">
          Generate candidates first. Only approved images will replace live artworks.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={generateCandidates}
          disabled={loading}
          className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Da Vinci Candidates'}
        </button>
      </div>

      {message && <div className="text-sm text-slate-300">{message}</div>}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {candidates.map((candidate) => (
          <div
            key={candidate.title}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
          >
            {candidate.success && candidate.candidateUrl ? (
              <img
                src={candidate.candidateUrl}
                alt={candidate.title}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-slate-950 p-4 text-center text-sm text-red-300">
                {candidate.error || 'Generation failed'}
              </div>
            )}

            <div className="space-y-3 p-4">
              <div>
                <div className="text-sm font-semibold text-slate-100">
                  {candidate.title}
                </div>
                <div className="text-xs text-slate-400">{candidate.style}</div>
              </div>

              {candidate.success && candidate.candidateUrl && (
                <div className="flex gap-2">
                  <button
                    onClick={() => approveCandidate(candidate)}
                    disabled={approving === candidate.title}
                    className="flex-1 rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    {approving === candidate.title ? 'Approving...' : 'Approve'}
                  </button>

                  <button
                    onClick={() => rejectCandidate(candidate)}
                    className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
