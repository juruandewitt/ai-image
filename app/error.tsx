'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // You can hook a logger here if you want
    // console.error(error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm opacity-80">
        Digest: {error?.digest ?? 'n/a'}
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-amber-500 px-4 py-2 text-black hover:bg-amber-400 transition"
      >
        Try again
      </button>
    </div>
  )
}
