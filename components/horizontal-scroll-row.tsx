'use client'

import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

type Props = {
  children: ReactNode
  className?: string
}

export default function HorizontalScrollRow({
  children,
  className = '',
}: Props) {
  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    )

  const [canScrollLeft, setCanScrollLeft] =
    useState(false)

  const [canScrollRight, setCanScrollRight] =
    useState(false)

  const updateScrollState =
    useCallback(() => {
      const element =
        scrollRef.current

      if (!element) {
        return
      }

      const maxScrollLeft =
        element.scrollWidth -
        element.clientWidth

      /*
       * Small tolerance prevents rounding errors from
       * leaving an arrow visible at the extreme ends.
       */
      const tolerance = 4

      setCanScrollLeft(
        element.scrollLeft >
          tolerance
      )

      setCanScrollRight(
        element.scrollLeft <
          maxScrollLeft -
            tolerance
      )
    }, [])

  useEffect(() => {
    const element =
      scrollRef.current

    if (!element) {
      return
    }

    updateScrollState()

    element.addEventListener(
      'scroll',
      updateScrollState,
      {
        passive: true,
      }
    )

    window.addEventListener(
      'resize',
      updateScrollState
    )

    /*
     * Images can change the final width of a row after
     * initial render, so re-check shortly after mount.
     */
    const timer =
      window.setTimeout(
        updateScrollState,
        300
      )

    return () => {
      element.removeEventListener(
        'scroll',
        updateScrollState
      )

      window.removeEventListener(
        'resize',
        updateScrollState
      )

      window.clearTimeout(
        timer
      )
    }
  }, [updateScrollState])

  function scroll(
    direction:
      | 'left'
      | 'right'
  ) {
    const element =
      scrollRef.current

    if (!element) {
      return
    }

    /*
     * Move approximately 80% of the visible carousel
     * width with each click.
     *
     * This reveals new cards while preserving a little
     * visual continuity with the previous view.
     */
    const amount =
      Math.max(
        300,
        element.clientWidth *
          0.8
      )

    element.scrollBy({
      left:
        direction ===
        'right'
          ? amount
          : -amount,

      behavior:
        'smooth',
    })
  }

  return (
    <div className="relative">
      {/*
       * LEFT NAVIGATION ARROW
       */}
      {canScrollLeft ? (
        <button
          type="button"
          onClick={() =>
            scroll('left')
          }
          aria-label="Scroll left"
          className="absolute left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/90 text-2xl text-white shadow-xl shadow-black/40 backdrop-blur transition hover:border-amber-300/70 hover:bg-slate-900 hover:text-amber-300 md:flex"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      ) : null}

      {/*
       * RIGHT NAVIGATION ARROW
       */}
      {canScrollRight ? (
        <button
          type="button"
          onClick={() =>
            scroll('right')
          }
          aria-label="Scroll right"
          className="absolute right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-slate-950/90 text-2xl text-white shadow-xl shadow-black/40 backdrop-blur transition hover:border-amber-300/70 hover:bg-slate-900 hover:text-amber-300 md:flex"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      ) : null}

      {/*
       * EXISTING HORIZONTAL SCROLLER
       *
       * Trackpad, touchscreen and ordinary horizontal
       * scrolling remain fully supported.
       */}
      <div
        ref={scrollRef}
        className={`-mx-4 overflow-x-auto scroll-smooth px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
