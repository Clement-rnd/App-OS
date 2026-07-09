import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSave from '../../assets/questionnaire/icon-save.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { LanguageField } from '../Profile/LanguageField'
import './AddContactSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

export function AddContactSheet({ initialValue, onClose, onSave }) {
  useLockBodyScroll()
  const [isClosing, setIsClosing] = useState(false)
  const [firstName, setFirstName] = useState(initialValue?.firstName || '')
  const [lastName, setLastName] = useState(initialValue?.lastName || '')
  const [language, setLanguage] = useState('fr')
  const [phone, setPhone] = useState(initialValue?.phone || '')
  const [email, setEmail] = useState(initialValue?.email || '')

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const isValid = firstName.trim() && lastName.trim() && phone.trim() && email.trim()

  const handleSave = () => {
    if (!isValid) return
    const name = [firstName, lastName].filter(Boolean).join(' ').trim()
    closeWithAnimation(() =>
      onSave({
        id: `custom-${Date.now()}`,
        name,
        language,
        phone: phone.trim(),
        email: email.trim(),
      })
    )
  }

  return (
    <div className={`add-contact-sheet-overlay${isClosing ? ' add-contact-sheet-overlay--closing' : ''}`}>
      <div className="add-contact-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`add-contact-sheet${isClosing && !isDragClosing ? ' add-contact-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Ajouter un contact"
        style={dragStyle}
      >
        <div className="add-contact-sheet__handle-row" {...dragHandlers}>
          <span className="add-contact-sheet__handle" />
        </div>

        <div className="add-contact-sheet__appbar">
          <p className="add-contact-sheet__title">Ajouter un contact</p>
          <button
            type="button"
            className="add-contact-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="add-contact-sheet__content">
          <div className="add-contact-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
            <label className="add-contact-sheet__label">Prénom*</label>
            <input
              type="text"
              className="add-contact-sheet__input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className="add-contact-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
            <label className="add-contact-sheet__label">Nom*</label>
            <input
              type="text"
              className="add-contact-sheet__input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className="add-contact-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
            <LanguageField value={language} onChange={setLanguage} />
          </div>

          <div className="add-contact-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 150}ms` }}>
            <label className="add-contact-sheet__label">Téléphone*</label>
            <input
              type="tel"
              className="add-contact-sheet__input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="add-contact-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 200}ms` }}>
            <label className="add-contact-sheet__label">Mail*</label>
            <input
              type="email"
              className="add-contact-sheet__input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="add-contact-sheet__footer">
          <p className="add-contact-sheet__hint">* Informations Requises</p>
          <button
            type="button"
            className="add-contact-sheet__save-btn"
            onClick={handleSave}
            disabled={!isValid}
          >
            Enregistrer
            <img src={iconSave} alt="" />
          </button>
          <div className="add-contact-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
