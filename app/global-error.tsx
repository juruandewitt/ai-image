'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-semibold">App Error</h1>
          <p className="text-sm opacity-80">
            Digest: {error?.digest ?? 'n/a'}
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-amber-500 px-4 py-2 text-black hover:bg-amber-400 transition"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
