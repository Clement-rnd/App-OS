import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import { StarRating } from '../StarRating/StarRating'
import { getNpsCategory } from '../../utils/nps'
import './ReviewSummaryCard.css'

const NPS_CHIP_CLASS = {
  Promoteur: 'review-summary-card__chip--promoter',
  Passif: 'review-summary-card__chip--passive',
  Détracteur: 'review-summary-card__chip--detractor',
}

export function ReviewSummaryCard({ review, showChips = false }) {
  const initial = review.author.trim().charAt(0).toUpperCase()
  const rating = parseFloat(review.rating)
  const npsCategory = getNpsCategory(rating)

  return (
    <div className="review-summary-card">
      <div className="review-summary-card__title">
        <div className="review-summary-card__avatar">{initial}</div>
        <div className="review-summary-card__title-text">
          <div className="review-summary-card__row">
            <p className="review-summary-card__author">{review.author}</p>
            <div className="review-summary-card__rating">
              <img src={iconReviewRating} alt="" />
              <span>{review.rating}</span>
            </div>
          </div>
          <div className="review-summary-card__row">
            <p className="review-summary-card__date">{review.date}</p>
            <StarRating rating={rating} />
          </div>
        </div>
      </div>

      {showChips && (
        <div className="review-summary-card__chips">
          <span className={`review-summary-card__chip ${NPS_CHIP_CLASS[npsCategory]}`}>
            {npsCategory}
          </span>
          <span className="review-summary-card__chip review-summary-card__chip--muted">
            <img src={logoIconSmall} alt="" />
            Certifié OS
          </span>
          <span className="review-summary-card__chip review-summary-card__chip--muted">
            <img src={iconGoogle} alt="" />
            {review.googleShared ? 'Partagé' : 'Non Partagé'}
          </span>
        </div>
      )}

      <p className="review-summary-card__text">{review.text}</p>
    </div>
  )
}
