'use client'

import { useRouter } from 'next/navigation'

type BackButtonProps = {
  fallbackHref?: string
  label?: string
  className?: string
}

export default function BackButton({
  fallbackHref = '/',
  label = 'Back',
  className = 'text-sm font-semibold text-amber-300 hover:underline',
}: BackButtonProps) {
  const router = useRouter()

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={className}
    >
      ← {label}
    </button>
  )
}
