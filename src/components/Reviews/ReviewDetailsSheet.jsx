import { useState } from 'react'
import iconFilterClose from '../../assets/reviews/icon-filter-close.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconStar from '../../assets/home/icon-star.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconArrowReply from '../../assets/home/icon-arrow-reply.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { getNpsCategory, getNpsScore, getRatingBreakdown } from '../../utils/nps'
import './ReviewDetailsSheet.css'

const CLOSE_ANIMATION_MS = 380

// The mock data has no "type of service" field; derive a plausible, stable
// one per review instead of hand-authoring it onto every mock entry.
const SERVICE_TYPES = [
  'Vente de propriété',
  'Location de propriété',
  'Estimation immobilière',
  'Gestion locative',
  'Achat de propriété',
]

function getServiceType(review) {
  const hash = review.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return SERVICE_TYPES[hash % SERVICE_TYPES.length]
}

const RATING_BAR_LABELS = {
  reception: 'Réception',
  qualite: 'Qualité',
  communication: 'Communication',
  delais: 'Délais',
}

const NPS_BADGE_CLASS = {
  Promoteur: 'review-details__nps-badge--promoter',
  Passif: 'review-details__nps-badge--passive',
  Détracteur: 'review-details__nps-badge--detractor',
}

export function ReviewDetailsSheet({ review, onClose, onReply }) {
  useLockBodyScroll()
  const [isClosing, setIsClosing] = useState(false)

  const closeWithAnimation = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: closeWithAnimation,
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const rating = parseFloat(review.rating)
  const npsCategory = getNpsCategory(rating)
  const npsScore = getNpsScore(rating)
  const breakdown = getRatingBreakdown(review)
  const serviceType = getServiceType(review)
  const initial = review.author.charAt(0).toUpperCase()

  return (
    <div className={`review-details-overlay${isClosing ? ' review-details-overlay--closing' : ''}`}>
      <div className="review-details-backdrop" onClick={closeWithAnimation} />
      <div
        className={`review-details-sheet${isClosing && !isDragClosing ? ' review-details-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Détails de l'avis"
        style={dragStyle}
      >
        <div className="review-details-sheet__handle-row" {...dragHandlers}>
          <span className="review-details-sheet__handle" />
        </div>

        <div className="review-details-sheet__appbar">
          <p className="review-details-sheet__title">Détails de l'avis</p>
          <button
            type="button"
            className="review-details-sheet__close"
            onClick={closeWithAnimation}
            aria-label="Fermer"
          >
            <img src={iconFilterClose} alt="" />
          </button>
        </div>

        <div className="review-details-sheet__content">
          <div className="review-details__card">
            <div className="review-details__title-row">
              <div className="review-details__avatar">{initial}</div>
              <p className="review-details__author">{review.author}</p>
              <div className="review-details__score">
                <img src={iconReviewRating} alt="" />
                <span>{review.rating}</span>
              </div>
            </div>
            <div className="review-details__meta-row">
              <span className="review-details__date">{review.date}</span>
              <div className="review-details__stars">
                {Array.from({ length: 4 }).map((_, i) => (
                  <img key={i} src={iconStar} alt="" className="review-details__star" />
                ))}
                <span className="review-details__star review-details__star--half">
                  <img src={iconStar} alt="" className="review-details__star-bg" />
                  <img src={iconStar} alt="" className="review-details__star-fg" />
                </span>
              </div>
            </div>
            <p className="review-details__text">{review.text}</p>
          </div>

          <div className="review-details__info-rows">
            <div className="review-details__info-row">
              <span className="review-details__info-label review-details__info-label--strong">
                Type de questionnaire
              </span>
              <span className="review-details__info-value">
                {review.certification === 'certifie-os' ? 'Certifié OS' : 'Standard OS'}
              </span>
            </div>
            <div className="review-details__info-row">
              <span className="review-details__info-label">Score NPS</span>
              <div className="review-details__nps">
                <span className="review-details__nps-score">{npsScore} / 10</span>
                <span className={`review-details__nps-badge ${NPS_BADGE_CLASS[npsCategory]}`}>{npsCategory}</span>
              </div>
            </div>
            <div className="review-details__info-row">
              <span className="review-details__info-label">Service</span>
              <span className="review-details__info-value">{serviceType}</span>
            </div>
            <div className="review-details__info-row">
              <span className="review-details__info-label">Partage Google</span>
              <span className="review-details__info-value review-details__info-value--icon">
                <img src={iconGoogle} alt="" />
                {review.googleSharing === 'google-partage' ? 'Partagé' : 'Non Partagé'}
              </span>
            </div>
          </div>

          <div className="review-details__breakdown">
            <p className="review-details__breakdown-title">Répartition des notes</p>
            {Object.entries(breakdown).map(([key, value]) => (
              <div className="review-details__bar-row" key={key}>
                <span className="review-details__bar-label">{RATING_BAR_LABELS[key]}</span>
                <div className="review-details__bar-track">
                  <div className="review-details__bar-fill" style={{ width: `${(value / 5) * 100}%` }} />
                </div>
                <span className="review-details__bar-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="review-details-sheet__footer">
          <button type="button" className="review-details-sheet__reply-btn" onClick={() => onReply(review)}>
            <img src={iconArrowReply} alt="" />
            Répondre
          </button>
          {review.googleSharing !== 'google-partage' && (
            <button type="button" className="review-details-sheet__share-btn">
              <img src={iconGoogle} alt="" />
              Demandez de partager sur Google
            </button>
          )}
          <div className="review-details-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
