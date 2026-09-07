'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type AuditResult = {
  id: string
  title: string
  artist: string | null
  style: string | null
  thumbnail: string | null

  shouldReview: boolean

  severity:
    | 'none'
    | 'low'
    | 'medium'
    | 'high'

  issueType:
    | 'none'
    | 'gibberish_text'
    | 'irrelevant_text'
    | 'inappropriate_wording'
    | 'fake_signage'
    | 'fake_signature'
    | 'watermark_like_text'
    | 'context_mismatch'
    | 'legitimate_text'
    | 'image_unavailable'
    | 'other'

  detectedText: string
  reason: string
  confidence: number
}

type StoredAudit = {
  nextOffset: number
  totalPublished: number
  complete: boolean
  results: AuditResult[]
}

const STORAGE_KEY =
  'ai-image-text-audit-v1'

const BATCH_SIZE = 10

const EMPTY_STATE: StoredAudit = {
  nextOffset: 0,
  totalPublished: 0,
  complete: false,
  results: [],
}

function mergeResults(
  previous: AuditResult[],
  incoming: AuditResult[]
) {
  const map = new Map<string, AuditResult>()

  for (const item of previous) {
    map.set(item.id, item)
  }

  for (const item of incoming) {
    map.set(item.id, item)
  }

  return Array.from(map.values())
}

function severityRank(
  value: AuditResult['severity']
) {
  if (value === 'high') return 4
  if (value === 'medium') return 3
  if (value === 'low') return 2
  return 1
}

export default function ArtworkAuditPage() {
  const [audit, setAudit] =
    useState<StoredAudit>(EMPTY_STATE)

  const [running, setRunning] =
    useState(false)

  const [error, setError] =
    useState('')

  const [showAll, setShowAll] =
    useState(false)

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        )

      if (!saved) return

      const parsed =
        JSON.parse(saved)

      if (
        parsed &&
        Array.isArray(parsed.results)
      ) {
        setAudit(parsed)
      }
    } catch {
      // Ignore corrupted local cache.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(audit)
      )
    } catch {
      // LocalStorage failure should not stop scanning.
    }
  }, [audit])

  const suspects = useMemo(() => {
    return audit.results
      .filter(
        (item) => item.shouldReview
      )
      .sort((a, b) => {
        const severityDifference =
          severityRank(b.severity) -
          severityRank(a.severity)

        if (severityDifference !== 0) {
          return severityDifference
        }

        return (
          b.confidence -
          a.confidence
        )
      })
  }, [audit.results])

  const displayedResults =
    showAll
      ? audit.results
      : suspects

  const percent =
    audit.totalPublished > 0
      ? Math.min(
          100,
          Math.round(
            (audit.nextOffset /
              audit.totalPublished) *
              100
          )
        )
      : 0

  async function scanOneBatch() {
    if (running || audit.complete) {
      return
    }

    setRunning(true)
    setError('')

    try {
      const response = await fetch(
        '/api/quality/text-audit',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            offset: audit.nextOffset,
            limit: BATCH_SIZE,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(
          data?.error ||
            'Artwork audit failed.'
        )
      }

      const newResults =
        mergeResults(
          audit.results,
          data.results ?? []
        )

      setAudit({
        nextOffset:
          data.nextOffset ??
          data.totalPublished ??
          audit.nextOffset,

        totalPublished:
          data.totalPublished ?? 0,

        complete:
          Boolean(data.complete),

        results: newResults,
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unknown audit error'
      )
    } finally {
      setRunning(false)
    }
  }

  async function runContinuousAudit() {
    if (running || audit.complete) {
      return
    }

    setRunning(true)
    setError('')

    let currentOffset =
      audit.nextOffset

    let currentResults =
      audit.results

    let totalPublished =
      audit.totalPublished

    let complete =
      audit.complete

    try {
      while (!complete) {
        const response = await fetch(
          '/api/quality/text-audit',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              offset:
                currentOffset,

              limit:
                BATCH_SIZE,
            }),
          }
        )

        const data =
          await response.json()

        if (
          !response.ok ||
          !data.ok
        ) {
          throw new Error(
            data?.error ||
              'Artwork audit failed.'
          )
        }

        currentResults =
          mergeResults(
            currentResults,
            data.results ?? []
          )

        totalPublished =
          data.totalPublished ?? 0

        complete =
          Boolean(data.complete)

        currentOffset =
          data.nextOffset ??
          totalPublished

        const updated: StoredAudit = {
          nextOffset:
            currentOffset,

          totalPublished,

          complete,

          results:
            currentResults,
        }

        setAudit(updated)

        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(updated)
          )
        } catch {
          // Continue if browser storage fails.
        }

        /*
         * Small pause reduces the chance of
         * hammering the API repeatedly.
         */
        await new Promise(
          (resolve) =>
            setTimeout(resolve, 750)
        )
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unknown audit error'
      )
    } finally {
      setRunning(false)
    }
  }

  function resetAudit() {
    const confirmed =
      window.confirm(
        'Reset the entire local audit and start again from artwork 1?'
      )

    if (!confirmed) return

    window.localStorage.removeItem(
      STORAGE_KEY
    )

    setAudit(EMPTY_STATE)
    setError('')
  }

  function exportSuspects() {
    const exportData = {
      generatedAt:
        new Date().toISOString(),

      totalPublished:
        audit.totalPublished,

      totalAudited:
        audit.results.length,

      totalSuspects:
        suspects.length,

      suspects,
    }

    const blob = new Blob(
      [
        JSON.stringify(
          exportData,
          null,
          2
        ),
      ],
      {
        type: 'application/json',
      }
    )

    const url =
      URL.createObjectURL(blob)

    const anchor =
      document.createElement('a')

    anchor.href = url

    anchor.download =
      'ai-image-suspect-artworks.json'

    document.body.appendChild(anchor)

    anchor.click()

    anchor.remove()

    URL.revokeObjectURL(url)
  }

  return (
    <main className="space-y-10 pb-20">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 md:p-12">
        <Link
          href="/"
          className="text-sm font-semibold text-amber-300 hover:underline"
        >
          ← Back to home
        </Link>

        <h1 className="mt-6 text-4xl font-semibold text-white md:text-6xl">
          Artwork Text Audit
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
          Visual pre-launch review of all published AI Image
          artworks for unwanted, nonsensical, inappropriate or
          contextually incorrect text.
        </p>

        <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-200">
          This page is read-only. It does not delete, unpublish or
          alter any artwork.
        </div>
      </section>

      <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="text-3xl font-semibold text-white">
              {audit.results.length}
            </div>

            <div className="text-sm text-slate-400">
              Audited
            </div>
          </div>

          <div>
            <div className="text-3xl font-semibold text-white">
              {audit.totalPublished || '—'}
            </div>

            <div className="text-sm text-slate-400">
              Published
            </div>
          </div>

          <div>
            <div className="text-3xl font-semibold text-amber-300">
              {suspects.length}
            </div>

            <div className="text-sm text-slate-400">
              Suspects
            </div>
          </div>

          <div>
            <div className="text-3xl font-semibold text-white">
              {percent}%
            </div>

            <div className="text-sm text-slate-400">
              Complete
            </div>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-amber-300 transition-all"
            style={{
              width: `${percent}%`,
            }}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={scanOneBatch}
            disabled={
              running ||
              audit.complete
            }
            className="rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running
              ? 'Scanning…'
              : 'Scan next 10'}
          </button>

          <button
            type="button"
            onClick={runContinuousAudit}
            disabled={
              running ||
              audit.complete
            }
            className="rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {running
              ? 'Audit running…'
              : audit.complete
                ? 'Audit complete'
                : 'Run complete audit'}
          </button>

          <button
            type="button"
            onClick={() =>
              setShowAll(
                (value) => !value
              )
            }
            className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-amber-300/60"
          >
            {showAll
              ? 'Show suspects only'
              : 'Show all audited'}
          </button>

          <button
            type="button"
            onClick={exportSuspects}
            disabled={
              suspects.length === 0
            }
            className="rounded-xl border border-amber-300/40 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-300/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Export suspect list
          </button>

          <button
            type="button"
            onClick={resetAudit}
            className="rounded-xl border border-red-400/30 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10"
          >
            Reset audit
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-white">
            {showAll
              ? 'Audited Artworks'
              : 'Suspect Artworks'}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {showAll
              ? `${displayedResults.length} audited artworks shown.`
              : `${suspects.length} artworks currently require review.`}
          </p>
        </div>

        {displayedResults.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <div className="text-lg font-semibold text-white">
              No results yet
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Start the visual audit above. Suspect artwork will
              appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {displayedResults.map(
              (item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  {item.thumbnail ? (
                    <img
                      src={
                        item.thumbnail
                      }
                      alt={item.title}
                      className="aspect-[4/3] w-full bg-black object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-black text-sm text-slate-500">
                      Image unavailable
                    </div>
                  )}

                  <div className="space-y-4 p-5">
                    <div>
                      <Link
                        href={`/artwork/${item.id}`}
                        className="font-semibold text-white hover:text-amber-300"
                      >
                        {item.title}
                      </Link>

                      <div className="mt-1 text-xs text-slate-500">
                        {item.artist ??
                          'Unknown artist'}

                        {item.style
                          ? ` · ${item.style}`
                          : ''}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.severity ===
                          'high'
                            ? 'bg-red-400/15 text-red-300'
                            : item.severity ===
                                'medium'
                              ? 'bg-orange-400/15 text-orange-300'
                              : item.severity ===
                                  'low'
                                ? 'bg-amber-300/15 text-amber-200'
                                : 'bg-emerald-400/15 text-emerald-300'
                        }`}
                      >
                        {item.severity}
                      </span>

                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-300">
                        {item.issueType}
                      </span>

                      <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
                        {Math.round(
                          item.confidence *
                            100
                        )}
                        % confidence
                      </span>
                    </div>

                    {item.detectedText ? (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Detected text
                        </div>

                        <div className="mt-1 text-sm text-amber-200">
                          {item.detectedText}
                        </div>
                      </div>
                    ) : null}

                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reason
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-300">
                        {item.reason}
                      </p>
                    </div>

                    <div className="break-all text-xs text-slate-600">
                      {item.id}
                    </div>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </main>
  )
}
