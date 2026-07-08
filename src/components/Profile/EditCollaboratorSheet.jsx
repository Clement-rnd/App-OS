import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconSave from '../../assets/questionnaire/icon-save.svg'
import iconTrash from '../../assets/questionnaire/icon-trash.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { LanguageField } from './LanguageField'
import './EditCollaboratorSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

export function EditCollaboratorSheet({ collaborator, isNew = false, onClose, onSave, onDelete }) {
  useLockBodyScroll()
  const [isClosing, setIsClosing] = useState(false)
  const [firstName, setFirstName] = useState(collaborator.firstName)
  const [lastName, setLastName] = useState(collaborator.lastName)
  const [language, setLanguage] = useState(collaborator.language)
  const [phone, setPhone] = useState(collaborator.phone)
  const [email, setEmail] = useState(collaborator.email)

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
        ...collaborator,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        language,
        phone,
        email: email.trim(),
      })
    )
  }

  const handleDelete = () => {
    closeWithAnimation(() => onDelete(collaborator.id))
  }

  const title = isNew ? 'Ajouter un collaborateur' : 'Modifier le collaborateur'

  return (
    <div className={`edit-collaborator-sheet-overlay${isClosing ? ' edit-collaborator-sheet-overlay--closing' : ''}`}>
      <div className="edit-collaborator-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`edit-collaborator-sheet${isClosing && !isDragClosing ? ' edit-collaborator-sheet--closing' : ''}`}
        role="dialog"
        aria-label={title}
        style={dragStyle}
      >
        <div className="edit-collaborator-sheet__handle-row" {...dragHandlers}>
          <span className="edit-collaborator-sheet__handle" />
        </div>

        <div className="edit-collaborator-sheet__appbar">
          <p className="edit-collaborator-sheet__title">{title}</p>
          <button
            type="button"
            className="edit-collaborator-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="edit-collaborator-sheet__content">
          <div className="edit-collaborator-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
            <label className="edit-collaborator-sheet__label">Prénom*</label>
            <input
              type="text"
              className="edit-collaborator-sheet__input"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
            />
          </div>

          <div className="edit-collaborator-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
            <label className="edit-collaborator-sheet__label">Nom*</label>
            <input
              type="text"
              className="edit-collaborator-sheet__input"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
            />
          </div>

          <div className="edit-collaborator-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
            <LanguageField value={language} onChange={setLanguage} />
          </div>

          <div className="edit-collaborator-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 150}ms` }}>
            <label className="edit-collaborator-sheet__label">Téléphone*</label>
            <input
              type="tel"
              className="edit-collaborator-sheet__input"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="edit-collaborator-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 200}ms` }}>
            <label className="edit-collaborator-sheet__label">Mail*</label>
            <input
              type="email"
              className="edit-collaborator-sheet__input"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="edit-collaborator-sheet__footer">
          <p className="edit-collaborator-sheet__hint">* Informations Requises</p>
          <button type="button" className="edit-collaborator-sheet__save-btn" onClick={handleSave}>
            Enregistrer
            <img src={iconSave} alt="" />
          </button>
          {!isNew && (
            <button type="button" className="edit-collaborator-sheet__delete-btn" onClick={handleDelete}>
              <img src={iconTrash} alt="" />
              Supprimer
            </button>
          )}
          <div className="edit-collaborator-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
