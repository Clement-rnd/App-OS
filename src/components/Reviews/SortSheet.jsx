import { useState } from 'react'
import iconSheetClose from '../../assets/reviews/icon-sheet-close.svg'
import iconCompanyCheck from '../../assets/reviews/icon-company-check.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './SortSheet.css'

const CLOSE_ANIMATION_MS = 380

export const SORT_OPTIONS = [
  { id: 'plus-recent', label: 'Plus récent', description: 'Du plus récent au plus ancien' },
  { id: 'plus-ancien', label: 'Plus ancien', description: 'Du plus ancien au plus récent' },
  { id: 'alphabetique', label: 'Ordre alphabétique', description: "A → Z par nom d'auteur" },
]

export function SortSheet({ selectedId, onClose, onSelect }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const handleSelect = option => {
    closeWithAnimation(() => onSelect(option))
  }

  return (
    <div className={`sort-sheet-overlay${isClosing ? ' sort-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="sort-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`sort-sheet${isClosing && !isDragClosing ? ' sort-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Trier par"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="sort-sheet__handle-row" {...dragHandlers}>
          <span className="sort-sheet__handle" />
        </div>

        <div className="sort-sheet__appbar">
          <p className="sort-sheet__title">Trier par</p>
          <button
            type="button"
            className="sort-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconSheetClose} alt="" />
          </button>
        </div>

        <div className="sort-sheet__list">
          {SORT_OPTIONS.map(option => {
            const isSelected = option.id === selectedId
            return (
              <button
                key={option.id}
                type="button"
                className={`sort-sheet__item${isSelected ? ' sort-sheet__item--selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span className="sort-sheet__text">
                  <span className="sort-sheet__label">{option.label}</span>
                  <span className="sort-sheet__description">{option.description}</span>
                </span>
                {isSelected && <img src={iconCompanyCheck} alt="" className="sort-sheet__check" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
