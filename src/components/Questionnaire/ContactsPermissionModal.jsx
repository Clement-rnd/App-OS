import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './ContactsPermissionModal.css'

export function ContactsPermissionModal({ onAllow, onDeny }) {
  useLockBodyScroll()
  return (
    <div className="contacts-permission-modal-overlay">
      <div className="contacts-permission-modal-backdrop" onClick={onDeny} />
      <div
        className="contacts-permission-modal"
        role="dialog"
        aria-label="Autoriser cette application à accéder à vos contacts ?"
      >
        <div className="contacts-permission-modal__header">
          <p className="contacts-permission-modal__title">
            Autoriser cette application à accéder à vos contacts&nbsp;?
          </p>
        </div>

        <div className="contacts-permission-modal__actions">
          <button type="button" className="contacts-permission-modal__allow-btn" onClick={onAllow}>
            Autoriser
          </button>
          <button type="button" className="contacts-permission-modal__deny-btn" onClick={onDeny}>
            Ne pas autoriser
          </button>
        </div>
      </div>
    </div>
  )
}
