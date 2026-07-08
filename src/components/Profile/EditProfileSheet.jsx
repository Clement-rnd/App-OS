import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSave from '../../assets/questionnaire/icon-save.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { LanguageField } from './LanguageField'
import './EditProfileSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

export function EditProfileSheet({ user, onClose, onSave }) {
  useLockBodyScroll()
  const [isClosing, setIsClosing] = useState(false)
  const [firstName, setFirstName] = useState(user.firstName)
  const [lastName, setLastName] = useState(user.lastName)
  const [language, setLanguage] = useState(user.language)
  const [phone, setPhone] = useState(user.phone)
  const [email, setEmail] = useState(user.email)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const handleSave = () => {
    closeWithAnimation(() =>
      onSave({
        ...user,
        firstName: firstName.trim() || user.firstName,
        lastName: lastName.trim() || user.lastName,
        language,
        phone,
        email: email.trim() || user.email,
      })
    )
  }

  return (
    <div className={`edit-profile-sheet-overlay${isClosing ? ' edit-profile-sheet-overlay--closing' : ''}`}>
      <div className="edit-profile-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`edit-profile-sheet${isClosing && !isDragClosing ? ' edit-profile-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Éditer mon profil"
        style={dragStyle}
      >
        <div className="edit-profile-sheet__handle-row" {...dragHandlers}>
          <span className="edit-profile-sheet__handle" />
        </div>

        <div className="edit-profile-sheet__appbar">
          <p className="edit-profile-sheet__title">Éditer mon profil</p>
          <button
            type="button"
            className="edit-profile-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="edit-profile-sheet__content">
          <div className="edit-profile-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
            <label className="edit-profile-sheet__label">Prénom*</label>
            <input
              type="text"
              className="edit-profile-sheet__input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className="edit-profile-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
            <label className="edit-profile-sheet__label">Nom*</label>
            <input
              type="text"
              className="edit-profile-sheet__input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className="edit-profile-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
            <LanguageField value={language} onChange={setLanguage} />
          </div>

          <div className="edit-profile-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 150}ms` }}>
            <label className="edit-profile-sheet__label">Téléphone*</label>
            <input
              type="tel"
              className="edit-profile-sheet__input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="edit-profile-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 200}ms` }}>
            <label className="edit-profile-sheet__label">Mail*</label>
            <input
              type="email"
              className="edit-profile-sheet__input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="edit-profile-sheet__footer">
          <p className="edit-profile-sheet__hint">* Informations Requises</p>
          <button type="button" className="edit-profile-sheet__save-btn" onClick={handleSave}>
            Enregistrer
            <img src={iconSave} alt="" />
          </button>
          <div className="edit-profile-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
