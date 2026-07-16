import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconFlagFrance from '../../assets/questionnaire/icon-flag-france.svg'
import iconDropdownChevron from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import iconSave from '../../assets/questionnaire/icon-save.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './EditRecipientSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

function splitName(fullName) {
  const [firstName, ...rest] = fullName.trim().split(' ')
  return { firstName: firstName || '', lastName: rest.join(' ') }
}

export function EditRecipientSheet({ recipient, onClose, onSave }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)
  const initialName = splitName(recipient.name)
  const [firstName, setFirstName] = useState(initialName.firstName)
  const [lastName, setLastName] = useState(initialName.lastName)
  const [email, setEmail] = useState(recipient.email || '')
  const [phone, setPhone] = useState(recipient.phone)

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
    const name = [firstName, lastName].filter(Boolean).join(' ').trim() || recipient.name
    closeWithAnimation(() => onSave({ ...recipient, name, email, phone }))
  }

  return (
    <div className={`edit-recipient-sheet-overlay${isClosing ? ' edit-recipient-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="edit-recipient-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`edit-recipient-sheet${isClosing && !isDragClosing ? ' edit-recipient-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Modifier le destinataire"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="edit-recipient-sheet__handle-row" {...dragHandlers}>
          <span className="edit-recipient-sheet__handle" />
        </div>

        <div className="edit-recipient-sheet__appbar">
          <p className="edit-recipient-sheet__title">Modifier le destinataire</p>
          <button
            type="button"
            className="edit-recipient-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="edit-recipient-sheet__content">
          <div
            className="edit-recipient-sheet__summary"
            style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}
          >
            <span className="edit-recipient-sheet__avatar">{recipient.name[0]}</span>
            <span className="edit-recipient-sheet__summary-text">
              <span className="edit-recipient-sheet__summary-name">{recipient.name}</span>
              <span className="edit-recipient-sheet__summary-phone">{recipient.phone}</span>
            </span>
          </div>

          <div className="edit-recipient-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
            <label className="edit-recipient-sheet__label">Prénom*</label>
            <input
              type="text"
              className="edit-recipient-sheet__input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className="edit-recipient-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
            <label className="edit-recipient-sheet__label">Nom de famille*</label>
            <input
              type="text"
              className="edit-recipient-sheet__input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className="edit-recipient-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 150}ms` }}>
            <label className="edit-recipient-sheet__label">Email *</label>
            <input
              type="email"
              className="edit-recipient-sheet__input"
              placeholder="Entrez une adresse email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="edit-recipient-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 200}ms` }}>
            <label className="edit-recipient-sheet__label">Numéro de téléphone*</label>
            <div className="edit-recipient-sheet__phone-input">
              <span className="edit-recipient-sheet__phone-country">
                <img src={iconFlagFrance} alt="" />
                <img src={iconDropdownChevron} alt="" className="edit-recipient-sheet__phone-caret" />
              </span>
              <input
                type="tel"
                className="edit-recipient-sheet__input edit-recipient-sheet__input--phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="edit-recipient-sheet__footer">
          <p className="edit-recipient-sheet__hint">* Informations Requises</p>
          <button type="button" className="edit-recipient-sheet__save-btn" onClick={handleSave}>
            Enregistrer
            <img src={iconSave} alt="" />
          </button>
          <div className="edit-recipient-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
