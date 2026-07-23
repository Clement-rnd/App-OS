import { useState } from 'react'
import iconSheetClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconCompanyCheck from '../../assets/reviews/icon-company-check.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './CategorySelectSheet.css'

const CLOSE_ANIMATION_MS = 380

export const CATEGORIES = [
  { code: 'vendeur', label: 'Vendeur' },
  { code: 'locataire', label: 'Locataire' },
  { code: 'acheteur', label: 'Acheteur' },
  { code: 'proprio-hors-gestion', label: 'Proprio hors gestions' },
]

export function CategorySelectSheet({ selectedCode, onClose, onSelect }) {
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

  const handleSelect = category => {
    closeWithAnimation(() => onSelect(category))
  }

  return (
    <div
      className={`category-sheet-overlay${isClosing ? ' category-sheet-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="category-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`category-sheet${isClosing && !isDragClosing ? ' category-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Sélectionner une catégorie"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="category-sheet__handle-row" {...dragHandlers}>
          <span className="category-sheet__handle" />
        </div>

        <div className="category-sheet__appbar">
          <p className="category-sheet__title">Sélectionner une catégorie</p>
          <button
            type="button"
            className="category-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconSheetClose} alt="" />
          </button>
        </div>

        <div className="category-sheet__list">
          {CATEGORIES.map(category => {
            const isSelected = category.code === selectedCode
            return (
              <button
                key={category.code}
                type="button"
                className={`category-sheet__item${isSelected ? ' category-sheet__item--selected' : ''}`}
                onClick={() => handleSelect(category)}
              >
                <span className="category-sheet__label">{category.label}</span>
                {isSelected && <img src={iconCompanyCheck} alt="" className="category-sheet__check" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
