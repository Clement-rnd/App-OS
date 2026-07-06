import { useRef, useState } from 'react'

const DRAG_CLOSE_DISTANCE = 100
const DRAG_CLOSE_VELOCITY = 0.5

export function useSheetDrag({ onRequestClose, closeDurationMs }) {
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragClosing, setIsDragClosing] = useState(false)
  const dragInfoRef = useRef(null)

  const onPointerDown = e => {
    if (isDragClosing) return
    dragInfoRef.current = { startY: e.clientY, lastY: e.clientY, lastTime: performance.now(), velocity: 0, delta: 0 }
    setIsDragging(true)
  }

  const onPointerMove = e => {
    const info = dragInfoRef.current
    if (!info) return
    const now = performance.now()
    const dt = now - info.lastTime
    if (dt > 0) info.velocity = (e.clientY - info.lastY) / dt
    info.lastY = e.clientY
    info.lastTime = now
    info.delta = Math.max(0, e.clientY - info.startY)
    setDragY(info.delta)
  }

  const endDrag = () => {
    const info = dragInfoRef.current
    if (!info) return
    dragInfoRef.current = null
    setIsDragging(false)

    if (info.delta > DRAG_CLOSE_DISTANCE || info.velocity > DRAG_CLOSE_VELOCITY) {
      setIsDragClosing(true)
      onRequestClose()
    } else {
      setDragY(0)
    }
  }

  const dragHandlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  }

  const dragStyle = isDragClosing
    ? { transform: 'translateY(100%)', transition: `transform ${closeDurationMs}ms ease-in` }
    : isDragging
      ? { transform: `translateY(${dragY}px)`, transition: 'none' }
      : dragY > 0
        ? { transform: 'translateY(0)' }
        : undefined

  return { dragHandlers, dragStyle, isDragClosing }
}
