import iconClose from '../../assets/home/icon-detail-close.svg'
import iconReply from '../../assets/home/icon-detail-reply.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import { getNpsCategory } from '../../utils/nps'
import { ReviewSummaryCard } from './ReviewSummaryCard'
import './ReviewDetailSheet.css'

const RATING_BARS = [
  { key: 'reception', label: 'Réception' },
  { key: 'qualite', label: 'Qualité' },
  { key: 'communication', label: 'Communication' },
  { key: 'delais', label: 'Délais' },
]

const NPS_BADGE_CLASS = {
  Promoteur: 'review-detail-nps-badge--promoter',
  Passif: 'review-detail-nps-badge--passive',
  Détracteur: 'review-detail-nps-badge--detractor',
}

export function ReviewDetailSheet({ review, onClose, onOpenRespond }) {
  const npsCategory = getNpsCategory(parseFloat(review.rating))

  return (
    <div className="review-detail-overlay">
      <div className="review-detail-backdrop" onClick={onClose} />
      <div className="review-detail-sheet" role="dialog" aria-label="Détails de l'avis">
        <div className="review-detail-sheet__handle-row">
          <span className="review-detail-sheet__handle" />
        </div>

        <div className="review-detail-sheet__appbar">
          <p className="review-detail-sheet__title">Détails de l'avis</p>
          <button
            type="button"
            className="review-detail-sheet__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="review-detail-sheet__content">
          <ReviewSummaryCard review={review} />

          {review.response && (
            <div className="review-detail-response">
              <div className="review-detail-response__header">
                <p className="review-detail-response__label">Votre réponse</p>
                <button
                  type="button"
                  className="review-detail-response__edit"
                  onClick={() => onOpenRespond?.(review)}
                  aria-label="Modifier la réponse"
                >
                  <img src={iconPencil} alt="" />
                </button>
              </div>
              <p className="review-detail-response__text">{review.response}</p>
            </div>
          )}

          <div className="review-detail-info">
            <div className="review-detail-info__row">
              <p className="review-detail-info__label review-detail-info__label--dark">
                Type de questionnaire
              </p>
              <span className="review-detail-chip">Certifié OS</span>
            </div>
            <div className="review-detail-info__row">
              <p className="review-detail-info__label">Score NPS</p>
              <div className="review-detail-info__nps">
                <p className="review-detail-info__nps-score">{review.npsScore} / 10</p>
                <span className={`review-detail-nps-badge ${NPS_BADGE_CLASS[npsCategory]}`}>
                  {npsCategory}
                </span>
              </div>
            </div>
            <div className="review-detail-info__row">
              <p className="review-detail-info__label">Service</p>
              <p className="review-detail-info__value">{review.service}</p>
            </div>
            <div className="review-detail-info__row">
              <p className="review-detail-info__label">Partage Google</p>
              <span className="review-detail-chip review-detail-chip--google">
                <img src={iconGoogle} alt="" />
                {review.googleShared ? 'Partagé' : 'Non Partagé'}
              </span>
            </div>
          </div>

          <div className="review-detail-breakdown">
            <p className="review-detail-breakdown__title">Répartition des notes</p>
            {RATING_BARS.map(bar => (
              <div key={bar.key} className="review-detail-breakdown__row">
                <p className="review-detail-breakdown__label">{bar.label}</p>
                <div className="review-detail-breakdown__track">
                  <div
                    className="review-detail-breakdown__fill"
                    style={{ width: `${(review.ratings[bar.key] / 5) * 100}%` }}
                  />
                </div>
                <p className="review-detail-breakdown__score">{review.ratings[bar.key]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="review-detail-sheet__footer">
          {!review.response && (
            <button
              type="button"
              className="review-detail-sheet__respond-btn"
              onClick={() => onOpenRespond?.(review)}
            >
              <img src={iconReply} alt="" />
              Répondre
            </button>
          )}
          {!review.googleShared && (
            <button type="button" className="review-detail-sheet__share-btn">
              <img src={iconGoogle} alt="" />
              Demandez de partager sur Google
            </button>
          )}
          <div className="review-detail-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
