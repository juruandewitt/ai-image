'use client'

import { useState } from 'react'

const EMAIL = 'aiimagesupport@gmail.com'

export default function CopyEmail() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)

      setCopied(true)

      window.setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={copyEmail}
        aria-label="Copy AI Image support email address"
        className="break-all text-left text-2xl font-semibold text-amber-300 transition hover:text-amber-200 md:text-3xl"
      >
        {EMAIL}
      </button>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <rect
            width="14"
            height="14"
            x="8"
            y="8"
            rx="2"
            ry="2"
          />

          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </svg>

        <span>
          {copied
            ? 'Copied to clipboard!'
            : 'Click the email address to copy it'}
        </span>
      </div>
    </div>
  )
}
