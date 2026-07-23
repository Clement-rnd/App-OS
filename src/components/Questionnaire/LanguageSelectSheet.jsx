import { useState } from 'react'
import iconSheetClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconCompanyCheck from '../../assets/reviews/icon-company-check.svg'
import iconFlagFrance from '../../assets/questionnaire/icon-flag-france.svg'
import iconFlagCanada from '../../assets/questionnaire/icon-flag-canada.svg'
import iconFlagNetherlands from '../../assets/questionnaire/icon-flag-netherlands.svg'
import iconFlagItaly from '../../assets/questionnaire/icon-flag-italy.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './LanguageSelectSheet.css'

const CLOSE_ANIMATION_MS = 380

export const LANGUAGES = [
  { code: 'fr-FR', label: 'Français (France)', flag: iconFlagFrance },
  { code: 'en-CA', label: 'Anglais (Canada)', flag: iconFlagCanada },
  { code: 'nl-NL', label: 'Néerlandais (Pays-Bas)', flag: iconFlagNetherlands },
  { code: 'it-IT', label: 'Italien (Italie)', flag: iconFlagItaly },
]

export function LanguageSelectSheet({ selectedCode, onClose, onSelect }) {
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

  const handleSelect = lang => {
    closeWithAnimation(() => onSelect(lang))
  }

  return (
    <div
      className={`language-sheet-overlay${isClosing ? ' language-sheet-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="language-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`language-sheet${isClosing && !isDragClosing ? ' language-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Sélectionner une langue"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="language-sheet__handle-row" {...dragHandlers}>
          <span className="language-sheet__handle" />
        </div>

        <div className="language-sheet__appbar">
          <p className="language-sheet__title">Sélectionner une langue</p>
          <button
            type="button"
            className="language-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconSheetClose} alt="" />
          </button>
        </div>

        <div className="language-sheet__list">
          {LANGUAGES.map(lang => {
            const isSelected = lang.code === selectedCode
            return (
              <button
                key={lang.code}
                type="button"
                className={`language-sheet__item${isSelected ? ' language-sheet__item--selected' : ''}`}
                onClick={() => handleSelect(lang)}
              >
                <img src={lang.flag} alt="" className="language-sheet__flag" />
                <span className="language-sheet__label">{lang.label}</span>
                {isSelected && <img src={iconCompanyCheck} alt="" className="language-sheet__check" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
