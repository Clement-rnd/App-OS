import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './ColorPickerPopover.css'

const PRESET_COLORS = [
  '#2c95ff',
  '#1cb68d',
  '#041b44',
  '#f7b600',
  '#fc6530',
  '#4527a0',
  '#00d492',
  '#8ea1b2',
  '#ed6c02',
  '#d32f2f',
]

const VIEWPORT_MARGIN = 8

export function ColorPickerPopover({ color, onChange, onClose }) {
  const popoverRef = useRef(null)
  const [leftPx, setLeftPx] = useState(null)

  useLayoutEffect(() => {
    const el = popoverRef.current
    const anchor = el?.parentElement
    if (!el || !anchor) return

    const anchorRect = anchor.getBoundingClientRect()
    const popoverWidth = el.offsetWidth
    const viewportWidth = document.documentElement.clientWidth

    const anchorCenter = anchorRect.left + anchorRect.width / 2
    let desiredLeft = anchorCenter - popoverWidth / 2
    desiredLeft = Math.max(VIEWPORT_MARGIN, Math.min(desiredLeft, viewportWidth - popoverWidth - VIEWPORT_MARGIN))

    setLeftPx(desiredLeft - anchorRect.left)
  }, [])

  useEffect(() => {
    const handlePointerDown = event => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  const style =
    leftPx === null ? { left: '50%', transform: 'translateX(-50%)' } : { left: `${leftPx}px`, transform: 'none' }

  return (
    <div
      className="color-picker-popover"
      ref={popoverRef}
      role="dialog"
      aria-label="Choisir une couleur"
      style={style}
    >
      <div className="color-picker-popover__preview" style={{ backgroundColor: color }} />

      <div className="color-picker-popover__presets">
        {PRESET_COLORS.map(preset => (
          <button
            key={preset}
            type="button"
            className={`color-picker-popover__preset${
              preset.toLowerCase() === color.toLowerCase() ? ' color-picker-popover__preset--selected' : ''
            }`}
            style={{ backgroundColor: preset }}
            onClick={() => onChange(preset)}
            aria-label={preset}
          />
        ))}
      </div>

      <div className="color-picker-popover__hex-row">
        <span className="color-picker-popover__hex-prefix">#</span>
        <input
          type="text"
          className="color-picker-popover__hex-input"
          value={color.replace('#', '')}
          onChange={e => onChange(`#${e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)}`)}
          spellCheck={false}
          maxLength={6}
        />
      </div>
    </div>
  )
}
