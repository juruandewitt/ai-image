'use client'

import { useEffect } from 'react'

export default function ImageProtection() {
  useEffect(() => {
    function isImageTarget(
      target: EventTarget | null
    ) {
      if (!(target instanceof Element)) {
        return false
      }

      return Boolean(
        target.closest('img')
      )
    }

    function handleContextMenu(
      event: MouseEvent
    ) {
      if (
        isImageTarget(
          event.target
        )
      ) {
        event.preventDefault()
      }
    }

    function handleDragStart(
      event: DragEvent
    ) {
      if (
        isImageTarget(
          event.target
        )
      ) {
        event.preventDefault()
      }
    }

    document.addEventListener(
      'contextmenu',
      handleContextMenu
    )

    document.addEventListener(
      'dragstart',
      handleDragStart
    )

    return () => {
      document.removeEventListener(
        'contextmenu',
        handleContextMenu
      )

      document.removeEventListener(
        'dragstart',
        handleDragStart
      )
    }
  }, [])

  return null
}
