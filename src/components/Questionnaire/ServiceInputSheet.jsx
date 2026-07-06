import { useState } from 'react'
import iconClose from '../../assets/home/icon-detail-close.svg'
import iconSendDisabled from '../../assets/questionnaire/icon-send-disabled.svg'
import './ServiceInputSheet.css'

const MAX_LENGTH = 80
const PLACEHOLDER = 'Exemple : Annonce exclusive : appartement de 2 chambres à Bordeaux'
const CLOSE_ANIMATION_MS = 220

export function ServiceInputSheet({ initialValue, onClose, onSubmit }) {
  const [value, setValue] = useState(initialValue || '')
  const [isClosing, setIsClosing] = useState(false)
  const isValid = value.trim().length > 0

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const handleClose = () => closeWithAnimation(onClose)
  const handleSubmit = () => closeWithAnimation(() => onSubmit?.(value.trim()))

  return (
    <div className={`service-sheet-overlay${isClosing ? ' service-sheet-overlay--closing' : ''}`}>
      <div className="service-sheet-backdrop" onClick={handleClose} />
      <div className="service-sheet" role="dialog" aria-label="Quel service avez-vous récemment fourni ?">
        <div className="service-sheet__appbar">
          <p className="service-sheet__title">Quel service avez-vous récemment fourni ?</p>
          <button type="button" className="service-sheet__close" onClick={handleClose} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="service-sheet__content">
          <div className="service-sheet__field">
            <textarea
              className="service-sheet__textarea"
              placeholder={PLACEHOLDER}
              value={value}
              maxLength={MAX_LENGTH}
              onChange={e => setValue(e.target.value)}
              autoFocus
            />
            <span className="service-sheet__counter">
              {value.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className="service-sheet__footer">
          <button
            type="button"
            className={`service-sheet__submit-btn${isValid ? ' service-sheet__submit-btn--enabled' : ''}`}
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Valider
            <img src={iconSendDisabled} alt="" />
          </button>
          <div className="service-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
