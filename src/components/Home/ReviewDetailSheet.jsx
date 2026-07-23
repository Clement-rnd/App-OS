import { useState } from 'react'
import iconClose from '../../assets/home/icon-detail-close.svg'
import iconReply from '../../assets/home/icon-detail-reply.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import iconBack from '../../assets/questionnaire/icon-back.svg'
import iconClipboardSimple from '../../assets/questionnaire/icon-clipboard-simple.svg'
import iconCompanyBuilding from '../../assets/reviews/icon-company-building.svg'
import iconSurveyBadge from '../../assets/questionnaire/icon-survey-badge.svg'
import { getNpsCategory } from '../../utils/nps'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useSheetViewTransition } from '../../hooks/useSheetViewTransition'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { ReviewSummaryCard } from './ReviewSummaryCard'
import { RespondFields } from './RespondFields'
import {
  GOOGLE_BOOST_DEFAULT_MESSAGE,
  getReviewerPhone,
  GoogleWordmark,
  SmsIcon,
  QrCodeIcon,
  EmailIcon,
  MoreIcon,
} from '../Reviews/GoogleBoostShared'
import { COLLABORATORS } from '../Reviews/CollaboratorSelectSheet'
import './ReviewDetailSheet.css'

const RATING_BARS = [
  { key: 'reception', label: 'Réception' },
  { key: 'qualite', label: 'Qualité' },
  { key: 'communication', label: 'Communication' },
  { key: 'delais', label: 'Délais' },
]

const NPS_CHIP_CLASS = {
  Promoteur: 'review-detail-nps-chip--promoter',
  Passif: 'review-detail-nps-chip--passive',
  Détracteur: 'review-detail-nps-chip--detractor',
}

const CLOSE_ANIMATION_MS = 380

export function ReviewDetailSheet({ review, companyName, onClose, onSubmit, onDelete, onSendGoogleBoost }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  // .review-detail-sheet's own max-height: 80dvh (in CSS) is exposed to the
  // exact same iOS under-measurement as the overlay -- see
  // useStandaloneScreenHeight for why screenHeight is the reliable value.
  const sheetMaxHeight = screenHeight * 0.8
  const npsCategory = getNpsCategory(parseFloat(review.rating))
  const collaboratorName = COLLABORATORS.find(collaborator => collaborator.id === review.collaboratorId)?.name
  // 'details' | 'respond' | 'google-boost' -- switching between them morphs
  // the content of this same sheet (see withViewTransition) instead of
  // opening a second modal on top of it.
  const [view, setView] = useState('details')
  const [replyText, setReplyText] = useState(review.response || '')
  const [googleBoostMessage, setGoogleBoostMessage] = useState(GOOGLE_BOOST_DEFAULT_MESSAGE)
  const [isContentScrolled, setContentScrolled] = useState(false)
  // Footer only needs its own separation shadow while there's more content
  // below still to reveal -- once scrolled all the way down there's nothing
  // left to imply, so the shadow would just be visual noise.
  const [isScrolledToBottom, setScrolledToBottom] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  // Mirrors every other sheet's own close animation (see e.g.
  // ReviewDetailsSheet.jsx in Reviews/) -- tapping the backdrop or the X
  // plays the slide-down instead of unmounting instantly.
  const closeWithAnimation = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  const { swapInnerRef, isContentExiting, withViewTransition, swapStyle, onSwapTransitionEnd } =
    useSheetViewTransition(view, setView)

  const isEditing = Boolean(review.response)
  const isValid = replyText.trim().length > 0
  const hasPendingGoogleReminder = !review.googleShared && Boolean(review.googleReminderSentDate)
  const reviewerPhone = getReviewerPhone(review)

  const handleSubmit = () => {
    onSubmit?.(review, replyText.trim())
    withViewTransition('details')
  }

  const handleDelete = () => {
    onDelete?.(review)
    setReplyText('')
    withViewTransition('details')
  }

  const handleSendGoogleBoost = () => {
    onSendGoogleBoost?.(review)
    withViewTransition('details')
  }

  return (
    <div className={`review-detail-overlay${isClosing ? ' review-detail-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="review-detail-backdrop" onClick={closeWithAnimation} />
      <div
        className={`review-detail-sheet${isClosing ? ' review-detail-sheet--closing' : ''}`}
        role="dialog"
        aria-label={
          view === 'respond'
            ? "Répondre à l'avis"
            : view === 'google-boost'
              ? 'Boostez mon avis sur Google'
              : "Détails de l'avis"
        }
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
            {view !== 'details' && (
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
              {view === 'respond' && (isEditing ? 'Modifier la réponse' : "Répondre à l'avis")}
              {view === 'google-boost' && (
                <>
                  Boostez mon avis sur <GoogleWordmark />
                </>
              )}
              {view === 'details' && "Détails de l'avis"}
            </p>
          </div>
          <button type="button" className="review-detail-sheet__close" onClick={closeWithAnimation} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div
          className="review-detail-sheet__content"
          onScroll={e => {
            const el = e.currentTarget
            setContentScrolled(el.scrollTop > 0)
            setScrolledToBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
          }}
        >
          {view !== 'google-boost' && <ReviewSummaryCard review={review} />}

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
                        <div className="review-detail-response__meta">
                          <p className="review-detail-response__label">
                            <span className="review-detail-response__avatar">
                              <img src={iconCompanyBuilding} alt="" />
                            </span>
                            {companyName}
                          </p>
                          <p className="review-detail-response__date">
                            Répondu le {review.responseDate || review.date}
                          </p>
                        </div>
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

                  <div className="review-detail-divider" />

                  <div className="review-detail-info">
                    <div className="review-detail-info__row">
                      <p className="review-detail-info__label">Type de questionnaire</p>
                      <p className="review-detail-info__value review-detail-info__value--inline">
                        <img
                          src={review.certification === 'standard-os' ? iconClipboardSimple : iconSurveyBadge}
                          alt=""
                          className="review-detail-info__inline-icon"
                        />
                        {review.certification === 'standard-os' ? 'Simple OS' : 'Certifié OS'}
                      </p>
                    </div>
                    {collaboratorName && (
                      <div className="review-detail-info__row">
                        <p className="review-detail-info__label">Collaborateur</p>
                        <p className="review-detail-info__value">{collaboratorName}</p>
                      </div>
                    )}
                    <div className="review-detail-info__row">
                      <p className="review-detail-info__label">Score NPS</p>
                      <p className="review-detail-info__value review-detail-info__value--inline">
                        {review.npsScore} / 10
                        <span className={`review-detail-nps-chip ${NPS_CHIP_CLASS[npsCategory]}`}>{npsCategory}</span>
                      </p>
                    </div>
                    <div className="review-detail-info__row">
                      <p className="review-detail-info__label">Service</p>
                      <p className="review-detail-info__value">{review.service}</p>
                    </div>
                    <div className="review-detail-info__row">
                      <p className="review-detail-info__label">Partage Google</p>
                      <p
                        className={`review-detail-info__value review-detail-info__value--inline${
                          hasPendingGoogleReminder ? ' review-detail-info__value--pending' : ''
                        }`}
                      >
                        <img
                          src={iconGoogle}
                          alt=""
                          className="review-detail-info__inline-icon review-detail-info__inline-icon--google"
                        />
                        {hasPendingGoogleReminder
                          ? `Rappel envoyé le ${review.googleReminderSentDate}`
                          : review.googleShared
                            ? 'Partagé'
                            : 'Non Partagé'}
                      </p>
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
              ) : view === 'respond' ? (
                <RespondFields review={review} replyText={replyText} onReplyTextChange={setReplyText} />
              ) : (
                <>
                  <p className="review-detail-google-boost-intro">
                    Demandez à votre évaluateur de publier aussi son avis sur Google, car les avis publics augmentent
                    votre visibilité, renforcent la confiance et aident votre entreprise à se démarquer.
                  </p>

                  <div className="review-detail-google-boost-section">
                    <p className="review-detail-google-boost-label">Destinataire</p>
                    <div className="review-detail-google-boost-recipient">
                      <span className="review-detail-google-boost-avatar">
                        {review.author.charAt(0).toUpperCase()}
                      </span>
                      <div className="review-detail-google-boost-recipient-text">
                        <p className="review-detail-google-boost-recipient-name">{review.author}</p>
                        <p className="review-detail-google-boost-recipient-contact">{reviewerPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="review-detail-google-boost-section">
                    <p className="review-detail-google-boost-label">Message au destinataire</p>
                    <textarea
                      className="review-detail-google-boost-textarea"
                      value={googleBoostMessage}
                      onChange={e => setGoogleBoostMessage(e.target.value)}
                    />
                  </div>

                  <div className="review-detail-google-boost-section">
                    <p className="review-detail-google-boost-label">Envoyer par</p>
                    <div className="review-detail-google-boost-channels">
                      <button type="button" className="review-detail-google-boost-channel" onClick={handleSendGoogleBoost}>
                        <span className="review-detail-google-boost-channel-icon">
                          <SmsIcon />
                        </span>
                        SMS
                      </button>
                      <button type="button" className="review-detail-google-boost-channel" onClick={handleSendGoogleBoost}>
                        <span className="review-detail-google-boost-channel-icon">
                          <QrCodeIcon />
                        </span>
                        QR Code
                      </button>
                      <button type="button" className="review-detail-google-boost-channel" onClick={handleSendGoogleBoost}>
                        <span className="review-detail-google-boost-channel-icon">
                          <EmailIcon />
                        </span>
                        Email
                      </button>
                      <button
                        type="button"
                        className="review-detail-google-boost-channel review-detail-google-boost-channel--disabled"
                        disabled
                      >
                        <span className="review-detail-google-boost-channel-icon review-detail-google-boost-channel-icon--disabled">
                          <MoreIcon />
                        </span>
                        Plus
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className={`review-detail-sheet__footer${
            isScrolledToBottom ? ' review-detail-sheet__footer--scrolled' : ''
          }`}
        >
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
                {!review.googleShared && !hasPendingGoogleReminder && (
                  <button
                    type="button"
                    className="review-detail-sheet__share-btn"
                    onClick={() => withViewTransition('google-boost')}
                  >
                    <img src={iconGoogle} alt="" />
                    Demander à partager sur Google
                  </button>
                )}
              </>
            ) : view === 'respond' ? (
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
            ) : null}
          </div>
          <div className="review-detail-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
