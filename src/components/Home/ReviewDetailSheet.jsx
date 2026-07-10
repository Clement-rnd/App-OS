import { useState } from 'react'
import iconClose from '../../assets/home/icon-detail-close.svg'
import iconReply from '../../assets/home/icon-detail-reply.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import iconBack from '../../assets/questionnaire/icon-back.svg'
import { getNpsCategory } from '../../utils/nps'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useSheetViewTransition } from '../../hooks/useSheetViewTransition'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { ReviewSummaryCard } from './ReviewSummaryCard'
import { RespondFields } from './RespondFields'
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

export function ReviewDetailSheet({ review, onClose, onSubmit, onDelete }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  // .review-detail-sheet's own max-height: 90vh (in CSS) is exposed to the
  // exact same iOS under-measurement as the overlay -- see
  // useStandaloneScreenHeight for why screenHeight is the reliable value.
  const sheetMaxHeight = screenHeight * 0.9
  const npsCategory = getNpsCategory(parseFloat(review.rating))
  // 'details' | 'respond' -- switching between them morphs the content of
  // this same sheet (see withViewTransition) instead of opening a second
  // modal on top of it.
  const [view, setView] = useState('details')
  const [replyText, setReplyText] = useState(review.response || '')
  const [isContentScrolled, setContentScrolled] = useState(false)

  const { swapInnerRef, isContentExiting, withViewTransition, swapStyle, onSwapTransitionEnd } =
    useSheetViewTransition(view, setView)

  const isEditing = Boolean(review.response)
  const isValid = replyText.trim().length > 0

  const handleSubmit = () => {
    onSubmit?.(review, replyText.trim())
    withViewTransition('details')
  }

  const handleDelete = () => {
    onDelete?.(review)
    setReplyText('')
    withViewTransition('details')
  }

  return (
    <div className="review-detail-overlay" style={{ height: screenHeight }}>
      <div className="review-detail-backdrop" onClick={onClose} />
      <div
        className="review-detail-sheet"
        role="dialog"
        aria-label={view === 'respond' ? "Répondre à l'avis" : "Détails de l'avis"}
        style={{ maxHeight: sheetMaxHeight }}
      >
        <div className="review-detail-sheet__handle-row">
          <span className="review-detail-sheet__handle" />
        </div>

        <div className={`review-detail-sheet__appbar${isContentScrolled ? ' review-detail-sheet__appbar--scrolled' : ''}`}>
          <div
            key={view}
            className={`review-detail-sheet__appbar-main${isContentExiting ? ' review-detail-sheet__appbar-main--exiting' : ''}`}
          >
            {view === 'respond' && (
              <button
                type="button"
                className="review-detail-sheet__back"
                onClick={() => withViewTransition('details')}
                aria-label="Retour aux détails de l'avis"
              >
                <img src={iconBack} alt="" />
              </button>
            )}
            <p className="review-detail-sheet__title">
              {view === 'respond' ? (isEditing ? 'Modifier la réponse' : "Répondre à l'avis") : "Détails de l'avis"}
            </p>
          </div>
          <button type="button" className="review-detail-sheet__close" onClick={onClose} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div
          className="review-detail-sheet__content"
          onScroll={e => setContentScrolled(e.currentTarget.scrollTop > 0)}
        >
          <ReviewSummaryCard review={review} />

          <div className="review-detail-swap" style={swapStyle} onTransitionEnd={onSwapTransitionEnd}>
            <div
              key={view}
              ref={swapInnerRef}
              className={`review-detail-swap-inner${isContentExiting ? ' review-detail-swap-inner--exiting' : ''}`}
            >
              {view === 'details' ? (
                <>
                  {review.response && (
                    <div className="review-detail-response">
                      <div className="review-detail-response__header">
                        <p className="review-detail-response__label">Votre réponse</p>
                        <button
                          type="button"
                          className="review-detail-response__edit"
                          onClick={() => withViewTransition('respond')}
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
                      <span className="review-detail-chip">
                        {review.certification === 'standard-os' ? 'Standard OS' : 'Certifié OS'}
                      </span>
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
                </>
              ) : (
                <RespondFields review={review} replyText={replyText} onReplyTextChange={setReplyText} />
              )}
            </div>
          </div>
        </div>

        <div className="review-detail-sheet__footer">
          <div
            key={view}
            className={`review-detail-sheet__footer-buttons${isContentExiting ? ' review-detail-sheet__footer-buttons--exiting' : ''}`}
          >
            {view === 'details' ? (
              <>
                {!review.response && (
                  <button
                    type="button"
                    className="review-detail-sheet__respond-btn"
                    onClick={() => withViewTransition('respond')}
                  >
                    <img src={iconReply} alt="" />
                    Répondre
                  </button>
                )}
                {!review.googleShared && (
                  <button type="button" className="review-detail-sheet__share-btn">
                    <img src={iconGoogle} alt="" />
                    Demander à partager sur Google
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`review-detail-sheet__respond-btn${isValid ? '' : ' review-detail-sheet__respond-btn--disabled'}`}
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  <img src={iconReply} alt="" />
                  {isEditing ? 'Enregistrer' : 'Répondre'}
                </button>
                {isEditing && (
                  <button type="button" className="review-detail-sheet__share-btn" onClick={handleDelete}>
                    Supprimer la réponse
                  </button>
                )}
              </>
            )}
          </div>
          <div className="review-detail-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
