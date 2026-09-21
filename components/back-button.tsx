'use client'

import { useRouter } from 'next/navigation'

type BackButtonProps = {
  fallbackHref?: string
  label?: string
  className?: string
}

type NavigationEntryLike = {
  index?: number
  url?: string | null
}

type NavigationApiLike = {
  currentEntry?: NavigationEntryLike | null
  entries?: () => NavigationEntryLike[]
}

export default function BackButton({
  fallbackHref = '/',
  label = 'Back',
  className = 'text-sm font-semibold text-amber-300 hover:underline',
}: BackButtonProps) {
  const router = useRouter()

  function goToFallback() {
    router.push(fallbackHref)
  }

  function handleBack() {
    if (
      typeof window === 'undefined'
    ) {
      return
    }

    /*
     * First preference:
     *
     * If the URL explicitly contains a `from` parameter,
     * use that.
     *
     * This is especially useful for Search results, where
     * we deliberately preserve the originating search URL.
     */
    const currentUrl =
      new URL(
        window.location.href
      )

    const from =
      currentUrl.searchParams.get(
        'from'
      )

    if (from) {
      /*
       * Only permit an internal relative destination.
       *
       * This prevents an externally supplied `from`
       * parameter from redirecting users away from AI Image.
       */
      if (
        from.startsWith('/') &&
        !from.startsWith('//')
      ) {
        router.push(from)
        return
      }
    }

    /*
     * Modern browsers such as Chrome expose the Navigation API.
     *
     * Unlike window.history.length, this lets us inspect the
     * URL of the previous accessible history entry.
     *
     * We only use browser Back when that previous entry belongs
     * to the SAME AI Image origin.
     */
    const navigationApi =
      (
        window as Window & {
          navigation?: NavigationApiLike
        }
      ).navigation

    if (
      navigationApi?.currentEntry &&
      typeof navigationApi.entries ===
        'function'
    ) {
      const entries =
        navigationApi.entries()

      const currentIndex =
        navigationApi.currentEntry
          .index

      if (
        typeof currentIndex ===
          'number' &&
        currentIndex > 0
      ) {
        const previousEntry =
          entries[
            currentIndex - 1
          ]

        if (
          previousEntry?.url
        ) {
          try {
            const previousUrl =
              new URL(
                previousEntry.url
              )

            if (
              previousUrl.origin ===
              window.location.origin
            ) {
              router.back()
              return
            }

            /*
             * Previous history entry exists,
             * but it belongs to Google or another site.
             */
            goToFallback()
            return
          } catch {
            goToFallback()
            return
          }
        }
      }

      /*
       * There is no accessible previous AI Image entry.
       *
       * Example:
       * customer pasted an artwork URL into a fresh tab.
       */
      goToFallback()
      return
    }

    /*
     * Fallback for browsers without the Navigation API.
     *
     * document.referrer is useful for normal full-page
     * navigation. Only go back if it clearly points to
     * the same AI Image origin.
     */
    if (
      document.referrer
    ) {
      try {
        const referrer =
          new URL(
            document.referrer
          )

        if (
          referrer.origin ===
            window.location.origin &&
          window.history.length >
            1
        ) {
          router.back()
          return
        }
      } catch {
        /*
         * Invalid/unusable referrer.
         * Fall through safely.
         */
      }
    }

    /*
     * SAFE FINAL FALLBACK
     *
     * Never send a customer back to Google,
     * another external site, or an empty browser page.
     */
    goToFallback()
  }

  return (
    <button
      type="button"
      onClick={
        handleBack
      }
      className={
        className
      }
    >
      ← {label}
    </button>
  )
}
