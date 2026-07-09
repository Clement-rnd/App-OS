import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './ConfirmArchiveModal.css'

export function ConfirmArchiveModal({ onConfirm, onCancel }) {
  useLockBodyScroll()
  return (
    <div className="confirm-archive-modal-overlay">
      <div className="confirm-archive-modal-backdrop" onClick={onCancel} />
      <div className="confirm-archive-modal" role="dialog" aria-label="Confirmer l'archivage">
        <div className="confirm-archive-modal__header">
          <p className="confirm-archive-modal__title">Êtes-vous sûr de vouloir archiver cet envoi&nbsp;?</p>
        </div>

        <div className="confirm-archive-modal__actions">
          <button type="button" className="confirm-archive-modal__confirm-btn" onClick={onConfirm}>
            Oui
          </button>
          <button type="button" className="confirm-archive-modal__cancel-btn" onClick={onCancel}>
            Non
          </button>
        </div>
      </div>
    </div>
  )
}
