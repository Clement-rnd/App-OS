import { useRef, useState } from 'react'

const ACTIONS_WIDTH = 144
const OPEN_THRESHOLD = ACTIONS_WIDTH / 2

export function useSwipeActions() {
  const [translateX, setTranslateX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragInfoRef = useRef(null)

  const onPointerDown = e => {
    dragInfoRef.current = { startX: e.clientX, startTranslate: translateX, lastTranslate: translateX }
    setIsDragging(true)
  }

  const onPointerMove = e => {
    const info = dragInfoRef.current
    if (!info) return
    const delta = e.clientX - info.startX
    const next = Math.min(0, Math.max(-ACTIONS_WIDTH, info.startTranslate + delta))
    info.lastTranslate = next
    setTranslateX(next)
  }

  const endDrag = () => {
    const info = dragInfoRef.current
    if (!info) return
    dragInfoRef.current = null
    setIsDragging(false)
    const shouldOpen = info.lastTranslate <= -OPEN_THRESHOLD
    setTranslateX(shouldOpen ? -ACTIONS_WIDTH : 0)
  }

  const toggle = () => {
    setTranslateX(current => (current === 0 ? -ACTIONS_WIDTH : 0))
  }

  const close = () => setTranslateX(0)

  return {
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    translateX,
    isDragging,
    toggle,
    close,
  }
}
