import { useState } from 'react'
import iconClose from '../../assets/home/icon-detail-close.svg'
import iconReply from '../../assets/home/icon-detail-reply.svg'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { ReviewSummaryCard } from './ReviewSummaryCard'
import { RespondFields } from './RespondFields'
import './RespondSheet.css'

export function RespondSheet({ review, onClose, onSubmit, onDelete }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const isEditing = Boolean(review.response)
  const [replyText, setReplyText] = useState(review.response || '')
  const isValid = replyText.trim().length > 0

  return (
    <div className="respond-sheet-overlay" style={{ height: screenHeight }}>
      <div className="respond-sheet-backdrop" onClick={onClose} />
      <div className="respond-sheet" role="dialog" aria-label="Répondre à l'avis" style={{ maxHeight: screenHeight * 0.9 }}>
        <div className="respond-sheet__handle-row">
          <span className="respond-sheet__handle" />
        </div>

        <div className="respond-sheet__appbar">
          <p className="respond-sheet__title">{isEditing ? 'Modifier la réponse' : "Répondre à l'avis"}</p>
          <button type="button" className="respond-sheet__close" onClick={onClose} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="respond-sheet__content">
          <ReviewSummaryCard review={review} showChips />
          <RespondFields review={review} replyText={replyText} onReplyTextChange={setReplyText} />
        </div>

        <div className="respond-sheet__footer">
          <button
            type="button"
            className={`respond-sheet__submit-btn${isValid ? ' respond-sheet__submit-btn--enabled' : ''}`}
            disabled={!isValid}
            onClick={() => onSubmit?.(review, replyText.trim())}
          >
            <img src={iconReply} alt="" />
            {isEditing ? 'Enregistrer' : 'Répondre'}
          </button>
          {isEditing && (
            <button type="button" className="respond-sheet__delete-btn" onClick={() => onDelete?.(review)}>
              Supprimer la réponse
            </button>
          )}
          <div className="respond-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
