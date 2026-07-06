import { useState } from 'react'
import iconClose from '../../assets/home/icon-detail-close.svg'
import iconReply from '../../assets/home/icon-detail-reply.svg'
import iconRegenerate from '../../assets/home/icon-regenerate.svg'
import { ReviewSummaryCard } from './ReviewSummaryCard'
import './RespondSheet.css'

const SUGGESTIONS = [
  name =>
    `Merci pour votre retour, ${name} ! Nous sommes heureux d'avoir pu vous accompagner et apprécions votre confiance. N'hésitez pas à nous contacter pour tout futur projet.`,
  name =>
    `Nous vous remercions chaleureusement, ${name}, pour ce retour. Toute l'équipe est ravie d'avoir répondu à vos attentes et reste à votre disposition.`,
  name =>
    `${name}, merci beaucoup pour votre confiance et ce message ! C'est un plaisir de vous avoir accompagné, à bientôt pour de nouveaux projets.`,
]

export function RespondSheet({ review, onClose, onSubmit, onDelete }) {
  const firstName = review.author.trim().split(' ')[0]
  const isEditing = Boolean(review.response)
  const [suggestionIndex, setSuggestionIndex] = useState(0)
  const [replyText, setReplyText] = useState(review.response || '')

  const suggestion = SUGGESTIONS[suggestionIndex % SUGGESTIONS.length](firstName)
  const isValid = replyText.trim().length > 0

  return (
    <div className="respond-sheet-overlay">
      <div className="respond-sheet-backdrop" onClick={onClose} />
      <div className="respond-sheet" role="dialog" aria-label="Répondre a l'avis">
        <div className="respond-sheet__handle-row">
          <span className="respond-sheet__handle" />
        </div>

        <div className="respond-sheet__appbar">
          <p className="respond-sheet__title">{isEditing ? 'Modifier la réponse' : "Répondre a l'avis"}</p>
          <button
            type="button"
            className="respond-sheet__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="respond-sheet__content">
          <ReviewSummaryCard review={review} showChips />

          <div className="respond-sheet__ai">
            <div className="respond-sheet__ai-header">
              <p className="respond-sheet__ai-label">✨ Suggestion IA</p>
              <div className="respond-sheet__ai-actions">
                <button
                  type="button"
                  className="respond-sheet__ai-regenerate"
                  onClick={() => setSuggestionIndex(i => i + 1)}
                >
                  <img src={iconRegenerate} alt="" />
                  Régénérer
                </button>
                <button
                  type="button"
                  className="respond-sheet__ai-use"
                  onClick={() => setReplyText(suggestion)}
                >
                  Utiliser
                </button>
              </div>
            </div>
            <p className="respond-sheet__ai-text">{suggestion}</p>
          </div>

          <div className="respond-sheet__message">
            <p className="respond-sheet__message-label">Votre Réponse</p>
            <textarea
              className="respond-sheet__textarea"
              placeholder="Écrivez votre réponse..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
            />
          </div>
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
            <button
              type="button"
              className="respond-sheet__delete-btn"
              onClick={() => onDelete?.(review)}
            >
              Supprimer la réponse
            </button>
          )}
          <div className="respond-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
