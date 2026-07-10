import { useEffect, useState } from 'react'
import iconFilterClose from '../../assets/reviews/icon-filter-close.svg'
import iconBack from '../../assets/questionnaire/icon-back.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconArrowReply from '../../assets/home/icon-arrow-reply.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useSheetViewTransition } from '../../hooks/useSheetViewTransition'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { StarRating } from '../StarRating/StarRating'
import { RespondFields } from '../Home/RespondFields'
import { getNpsCategory, getNpsScore, getRatingBreakdown } from '../../utils/nps'
import { parseReviewDate } from './filterReviews'
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

function hashId(id) {
  return id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
}

function getServiceType(review) {
  return SERVICE_TYPES[hashId(review.id) % SERVICE_TYPES.length]
}

// Same reasoning as getServiceType -- the mock data has no contact info for
// the reviewer, so derive a plausible, stable phone number instead of
// hand-authoring one onto every mock entry. Always 9 digits starting with 6
// (600000000-699999999), formatted like a French mobile number.
function getReviewerPhone(review) {
  const hash = hashId(review.id)
  const nine = String(600000000 + (hash % 99999999))
  return `+33 0${nine[0]} ${nine.slice(1, 3)} ${nine.slice(3, 5)} ${nine.slice(5, 7)} ${nine.slice(7, 9)}`
}

const GOOGLE_BOOST_DEFAULT_MESSAGE =
  'Salut ! Pourriez-vous prendre un moment pour partager vos retours ? Cela nous aide vraiment. Merci !'

function formatFullDate(dateStr) {
  const date = parseReviewDate(dateStr)
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}

function SmsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        fill="currentColor"
      />
    </svg>
  )
}

function QrCodeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm4 0h1v2h-1v-2zm-4 4h1v1h-1v-1zm0 3h1v1h-1v-1zm3-3h2v1h-2v-1zm0 3h2v1h-2v-1zm2-5h1v5h-1v-5z"
        fill="currentColor"
      />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm1 2.4V17h14V7.4l-6.4 4.48a1 1 0 0 1-1.2 0L5 7.4zm.8-.4L12 10.6 18.2 7H5.8z"
        fill="currentColor"
      />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM21 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"
        fill="currentColor"
      />
    </svg>
  )
}

// Google's own brand colors, one per letter, so "Google" in the sheet title
// reads as the actual Google wordmark instead of plain text.
const GOOGLE_WORDMARK_LETTERS = [
  { char: 'G', color: '#4285f4' },
  { char: 'o', color: '#ea4335' },
  { char: 'o', color: '#fbbc05' },
  { char: 'g', color: '#4285f4' },
  { char: 'l', color: '#34a853' },
  { char: 'e', color: '#ea4335' },
]

function GoogleWordmark() {
  return (
    <>
      {GOOGLE_WORDMARK_LETTERS.map((letter, index) => (
        <span key={index} style={{ color: letter.color }}>
          {letter.char}
        </span>
      ))}
    </>
  )
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

export function ReviewDetailsSheet({ review, onClose, onSubmit, onDelete, onSendGoogleBoost }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  // .review-details-sheet's own max-height: 90vh (in CSS) is exposed to the
  // exact same iOS under-measurement as the overlay -- see
  // useStandaloneScreenHeight for why screenHeight is the reliable value.
  const sheetMaxHeight = screenHeight * 0.9
  const [isClosing, setIsClosing] = useState(false)
  const [isContentScrolled, setContentScrolled] = useState(false)
  // TEMPORARY debug readout -- remove once the share button cutoff on
  // real iOS devices is understood; on-device measurements have been the
  // only reliable way to resolve this class of bug (see the Login viewport
  // investigation), so surface the real numbers instead of guessing again.
  const [debugInfo, setDebugInfo] = useState('')
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const sheetEl = document.querySelector('.review-details-sheet')
      const footerEl = document.querySelector('.review-details-sheet__footer')
      const shareBtnEl = document.querySelector('.review-details-sheet__share-btn')
      const sheetRect = sheetEl?.getBoundingClientRect()
      const footerRect = footerEl?.getBoundingClientRect()
      const shareBtnRect = shareBtnEl?.getBoundingClientRect()
      setDebugInfo(
        `scr.h=${window.screen.height} inner.h=${window.innerHeight} vv.h=${Math.round(window.visualViewport?.height || 0)} ` +
          `maxH=${Math.round(sheetMaxHeight)} sheet.bot=${Math.round(sheetRect?.bottom || 0)} ` +
          `footer.bot=${Math.round(footerRect?.bottom || 0)} btn.bot=${Math.round(shareBtnRect?.bottom || 0)}`
      )
    })
    return () => cancelAnimationFrame(id)
  }, [sheetMaxHeight])
  // 'details' | 'respond' | 'google-boost' -- switching between them morphs
  // the content of this same sheet (see withViewTransition) instead of
  // opening a second modal on top of it.
  const [view, setView] = useState('details')
  const [replyText, setReplyText] = useState(review.response || '')
  const [googleBoostMessage, setGoogleBoostMessage] = useState(GOOGLE_BOOST_DEFAULT_MESSAGE)

  const closeWithAnimation = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: closeWithAnimation,
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

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

  const handleSendGoogleBoost = () => {
    onSendGoogleBoost?.(review)
    withViewTransition('details')
  }

  const rating = parseFloat(review.rating)
  const npsCategory = getNpsCategory(rating)
  const npsScore = getNpsScore(rating)
  const breakdown = getRatingBreakdown(review)
  const serviceType = getServiceType(review)
  const reviewerPhone = getReviewerPhone(review)
  const initial = review.author.charAt(0).toUpperCase()
  const isGoogleShared = review.googleSharing === 'google-partage'
  const hasPendingGoogleReminder = !isGoogleShared && Boolean(review.googleReminderSentDate)

  const reviewCard = (
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
        <StarRating rating={rating} />
      </div>
      <p className="review-details__text">{review.text}</p>
    </div>
  )

  return (
    <div
      className={`review-details-overlay${isClosing ? ' review-details-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="review-details-backdrop" onClick={closeWithAnimation} />
      <p
        style={{
          position: 'fixed',
          top: 4,
          left: 4,
          zIndex: 999,
          fontSize: 9,
          lineHeight: 1.3,
          color: '#ff3b30',
          backgroundColor: 'rgba(255,255,255,0.9)',
          padding: '2px 4px',
          maxWidth: '95vw',
          wordBreak: 'break-all',
        }}
      >
        {debugInfo}
      </p>
      <div
        className={`review-details-sheet${isClosing && !isDragClosing ? ' review-details-sheet--closing' : ''}`}
        role="dialog"
        aria-label={
          view === 'respond'
            ? "Répondre à l'avis"
            : view === 'google-boost'
              ? 'Boostez mon avis sur Google'
              : "Détails de l'avis"
        }
        style={{ ...dragStyle, maxHeight: sheetMaxHeight }}
      >
        <div className="review-details-sheet__handle-row" {...dragHandlers}>
          <span className="review-details-sheet__handle" />
        </div>

        <div className={`review-details-sheet__appbar${isContentScrolled ? ' review-details-sheet__appbar--scrolled' : ''}`}>
          <div
            key={view}
            className={`review-details-sheet__appbar-main${isContentExiting ? ' review-details-sheet__appbar-main--exiting' : ''}`}
          >
            {view !== 'details' && (
              <button
                type="button"
                className="review-details-sheet__back"
                onClick={() => withViewTransition('details')}
                aria-label="Retour aux détails de l'avis"
              >
                <img src={iconBack} alt="" />
              </button>
            )}
            <p className="review-details-sheet__title">
              {view === 'respond' && (isEditing ? 'Modifier la réponse' : "Répondre à l'avis")}
              {view === 'google-boost' && (
                <>
                  Boostez mon avis sur <GoogleWordmark />
                </>
              )}
              {view === 'details' && "Détails de l'avis"}
            </p>
          </div>
          <button type="button" className="review-details-sheet__close" onClick={closeWithAnimation} aria-label="Fermer">
            <img src={iconFilterClose} alt="" />
          </button>
        </div>

        <div
          className="review-details-sheet__content"
          onScroll={e => setContentScrolled(e.currentTarget.scrollTop > 0)}
        >
          {view !== 'google-boost' && reviewCard}

          <div className="review-details__swap" style={swapStyle} onTransitionEnd={onSwapTransitionEnd}>
            <div
              key={view}
              ref={swapInnerRef}
              className={`review-details__swap-inner${isContentExiting ? ' review-details__swap-inner--exiting' : ''}`}
            >
              {view === 'details' ? (
                <>
                  {review.response && (
                    <div className="review-details__response">
                      <div className="review-details__response-header">
                        <p className="review-details__response-label">Votre réponse</p>
                        <button
                          type="button"
                          className="review-details__response-edit"
                          onClick={() => withViewTransition('respond')}
                          aria-label="Modifier la réponse"
                        >
                          <img src={iconPencil} alt="" />
                        </button>
                      </div>
                      <p className="review-details__response-text">{review.response}</p>
                    </div>
                  )}

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
                        <span className={`review-details__nps-badge ${NPS_BADGE_CLASS[npsCategory]}`}>
                          {npsCategory}
                        </span>
                      </div>
                    </div>
                    <div className="review-details__info-row">
                      <span className="review-details__info-label">Service</span>
                      <span className="review-details__info-value">{serviceType}</span>
                    </div>
                    <div className="review-details__info-row">
                      <span className="review-details__info-label">Partage Google</span>
                      {hasPendingGoogleReminder ? (
                        <span className="review-details__info-value review-details__info-value--pending">
                          Rappel envoyé le {formatFullDate(review.googleReminderSentDate)}
                        </span>
                      ) : (
                        <span className="review-details__info-value review-details__info-value--icon">
                          <img src={iconGoogle} alt="" />
                          {isGoogleShared ? 'Partagé' : 'Non Partagé'}
                        </span>
                      )}
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
                </>
              ) : view === 'respond' ? (
                <RespondFields review={review} replyText={replyText} onReplyTextChange={setReplyText} />
              ) : (
                <>
                  <p className="review-details__google-boost-intro">
                    Demandez à votre évaluateur de publier aussi son avis sur Google, car les avis publics augmentent
                    votre visibilité, renforcent la confiance et aident votre entreprise à se démarquer.
                  </p>

                  <div className="review-details__google-boost-section">
                    <p className="review-details__google-boost-label">Destinataire</p>
                    <div className="review-details__google-boost-recipient">
                      <span className="review-details__google-boost-avatar">{initial}</span>
                      <div className="review-details__google-boost-recipient-text">
                        <p className="review-details__google-boost-recipient-name">{review.author}</p>
                        <p className="review-details__google-boost-recipient-contact">{reviewerPhone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="review-details__google-boost-section">
                    <p className="review-details__google-boost-label">Message au destinataire</p>
                    <textarea
                      className="review-details__google-boost-textarea"
                      value={googleBoostMessage}
                      onChange={e => setGoogleBoostMessage(e.target.value)}
                    />
                    <p className="review-details__google-boost-url">URL</p>
                  </div>

                  <div className="review-details__google-boost-section">
                    <p className="review-details__google-boost-label">Envoyer par</p>
                    <div className="review-details__google-boost-channels">
                      <button type="button" className="review-details__google-boost-channel" onClick={handleSendGoogleBoost}>
                        <span className="review-details__google-boost-channel-icon">
                          <SmsIcon />
                        </span>
                        SMS
                      </button>
                      <button type="button" className="review-details__google-boost-channel" onClick={handleSendGoogleBoost}>
                        <span className="review-details__google-boost-channel-icon">
                          <QrCodeIcon />
                        </span>
                        QR Code
                      </button>
                      <button type="button" className="review-details__google-boost-channel" onClick={handleSendGoogleBoost}>
                        <span className="review-details__google-boost-channel-icon">
                          <EmailIcon />
                        </span>
                        Email
                      </button>
                      <button
                        type="button"
                        className="review-details__google-boost-channel review-details__google-boost-channel--disabled"
                        disabled
                      >
                        <span className="review-details__google-boost-channel-icon review-details__google-boost-channel-icon--disabled">
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

        <div className="review-details-sheet__footer">
          <div
            key={view}
            className={`review-details-sheet__footer-buttons${isContentExiting ? ' review-details-sheet__footer-buttons--exiting' : ''}`}
          >
            {view === 'details' ? (
              <>
                {!review.response && (
                  <button
                    type="button"
                    className="review-details-sheet__reply-btn"
                    onClick={() => withViewTransition('respond')}
                  >
                    <img src={iconArrowReply} alt="" />
                    Répondre
                  </button>
                )}
                {!isGoogleShared && !hasPendingGoogleReminder && (
                  <button
                    type="button"
                    className="review-details-sheet__share-btn"
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
                  className={`review-details-sheet__reply-btn${isValid ? '' : ' review-details-sheet__reply-btn--disabled'}`}
                  disabled={!isValid}
                  onClick={handleSubmit}
                >
                  <img src={iconArrowReply} alt="" />
                  {isEditing ? 'Enregistrer' : 'Répondre'}
                </button>
                {isEditing && (
                  <button type="button" className="review-details-sheet__share-btn" onClick={handleDelete}>
                    Supprimer la réponse
                  </button>
                )}
              </>
            ) : null}
          </div>
          <div className="review-details-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
