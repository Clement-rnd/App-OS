import './ConfirmLeaveModal.css'

export function ConfirmLeaveModal({ onStay, onLeave }) {
  return (
    <div className="confirm-leave-modal-overlay">
      <div className="confirm-leave-modal-backdrop" onClick={onStay} />
      <div className="confirm-leave-modal" role="dialog" aria-label="Êtes-vous sûr de vouloir quitter ?">
        <div className="confirm-leave-modal__header">
          <p className="confirm-leave-modal__title">Êtes-vous sûr de vouloir quitter&nbsp;?</p>
          <p className="confirm-leave-modal__subtitle">Tous les changements seront perdus.</p>
        </div>

        <div className="confirm-leave-modal__actions">
          <button type="button" className="confirm-leave-modal__stay-btn" onClick={onStay}>
            Non, continuez où j&rsquo;étais
          </button>
          <button type="button" className="confirm-leave-modal__leave-btn" onClick={onLeave}>
            Oui, retournez à l&rsquo;accueil
          </button>
        </div>
      </div>
    </div>
  )
}
