import iconClose from '../../assets/home/icon-detail-close.svg'
import iconReply from '../../assets/home/icon-detail-reply.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { StarRating } from '../StarRating/StarRating'
import { getNpsCategory } from '../../utils/nps'
import { COLLABORATORS } from './CollaboratorSelectSheet'
import './ReviewsDetailSheet.css'

const NPS_CHIP_CLASS = {
  Promoteur: 'reviews-detail-chip--promoter',
  Passif: 'reviews-detail-chip--passive',
  Détracteur: 'reviews-detail-chip--detractor',
}

const STATUS_LABELS = {
  'sans-reponse': 'Sans réponse',
  'en-attente': 'En attente',
  archive: 'Archivé',
  expire: 'Expiré',
}

export function ReviewsDetailSheet({ review, onClose, onOpenRespond }) {
  useLockBodyScroll()
  const rating = parseFloat(review.rating)
  const npsCategory = getNpsCategory(rating)
  const collaborator = COLLABORATORS.find(c => c.id === review.collaboratorId)

  return (
    <div className="reviews-detail-overlay">
      <div className="reviews-detail-backdrop" onClick={onClose} />
      <div className="reviews-detail-sheet" role="dialog" aria-label="Détails de l'avis">
        <div className="reviews-detail-sheet__handle-row">
          <span className="reviews-detail-sheet__handle" />
        </div>

        <div className="reviews-detail-sheet__appbar">
          <p className="reviews-detail-sheet__title">Détails de l'avis</p>
          <button type="button" className="reviews-detail-sheet__close" onClick={onClose} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="reviews-detail-sheet__content">
          <div className="reviews-detail-summary">
            <div className="reviews-detail-summary__row">
              <p className="reviews-detail-summary__author">{review.author}</p>
              <div className="reviews-detail-summary__rating">
                <img src={iconReviewRating} alt="" />
                <span>{review.rating}</span>
              </div>
            </div>
            <div className="reviews-detail-summary__row">
              <p className="reviews-detail-summary__date">{review.date}</p>
              <StarRating rating={rating} />
            </div>
            <div className="reviews-detail-summary__chips">
              <span className={`reviews-detail-chip ${NPS_CHIP_CLASS[npsCategory]}`}>{npsCategory}</span>
              {review.certification === 'certifie-os' && (
                <span className="reviews-detail-chip reviews-detail-chip--muted">
                  <img src={logoIconSmall} alt="" />
                  Certifié OS
                </span>
              )}
              <span className="reviews-detail-chip reviews-detail-chip--muted">
                <img src={iconGoogle} alt="" />
                {review.googleSharing === 'google-partage' ? 'Partagé' : 'Non partagé'}
              </span>
            </div>
            <p className="reviews-detail-summary__text">{review.text}</p>
          </div>

          {review.response && (
            <div className="reviews-detail-response">
              <div className="reviews-detail-response__header">
                <p className="reviews-detail-response__label">Votre réponse</p>
                <button
                  type="button"
                  className="reviews-detail-response__edit"
                  onClick={() => onOpenRespond?.(review)}
                  aria-label="Modifier la réponse"
                >
                  <img src={iconPencil} alt="" />
                </button>
              </div>
              <p className="reviews-detail-response__text">{review.response}</p>
            </div>
          )}

          <div className="reviews-detail-info">
            <div className="reviews-detail-info__row">
              <p className="reviews-detail-info__label">Collaborateur</p>
              <p className="reviews-detail-info__value">{collaborator?.name || '—'}</p>
            </div>
            <div className="reviews-detail-info__row">
              <p className="reviews-detail-info__label">Source</p>
              <p className="reviews-detail-info__value">
                {review.source === 'google' ? 'Avis Google' : 'Opinion System'}
              </p>
            </div>
            <div className="reviews-detail-info__row">
              <p className="reviews-detail-info__label">Statut</p>
              <p className="reviews-detail-info__value">{STATUS_LABELS[review.status] || review.status}</p>
            </div>
          </div>
        </div>

        <div className="reviews-detail-sheet__footer">
          {!review.response && (
            <button
              type="button"
              className="reviews-detail-sheet__respond-btn"
              onClick={() => onOpenRespond?.(review)}
            >
              <img src={iconReply} alt="" />
              Répondre
            </button>
          )}
          <div className="reviews-detail-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
