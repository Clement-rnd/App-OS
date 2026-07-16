import { useState } from 'react'
import iconFilterClose from '../../assets/reviews/icon-filter-close.svg'
import iconBack from '../../assets/questionnaire/icon-back.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import iconChevronRightSmall from '../../assets/questionnaire/icon-chevron-right-small.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useSheetViewTransition } from '../../hooks/useSheetViewTransition'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { parseReviewDate } from './filterReviews'
import './ResendQuestionnaireSheet.css'

const CLOSE_ANIMATION_MS = 380

const DEFAULT_MESSAGE =
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

export function ResendQuestionnaireSheet({ item, initialView = 'resend', onClose, onResend, onSaveRecipient }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)
  // 'resend' | 'edit-recipient' -- switching between them morphs the content
  // of this same sheet instead of stacking a second sheet on top of itself
  // (same pattern as ReviewDetailsSheet).
  const [view, setView] = useState(initialView)
  // Same link shape SendQuestionnaireSheet's QR code encodes -- included
  // directly in the message text (not as a separate, disconnected "URL"
  // caption) since that's the actual link the recipient would tap.
  const [message, setMessage] = useState(() => `${DEFAULT_MESSAGE}\n\nhttps://avis.opinion-system.fr/r/${item.id}`)
  const [firstName, setFirstName] = useState(item.author.trim().split(' ')[0] || '')
  const [lastName, setLastName] = useState(item.author.trim().split(' ').slice(1).join(' '))
  const [email, setEmail] = useState(item.email || '')
  const [phone, setPhone] = useState(item.phone || '')

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

  const contactLine = email || phone

  const handleSend = () => {
    onResend?.(item)
    closeWithAnimation()
  }

  const handleSaveRecipient = () => {
    const author = `${firstName.trim()} ${lastName.trim()}`.trim()
    onSaveRecipient?.(item, { author, email: email.trim() || null, phone: phone.trim() })
    withViewTransition('resend')
  }

  const isRecipientValid = firstName.trim().length > 0 && lastName.trim().length > 0 && phone.trim().length > 0

  return (
    <div
      className={`resend-sheet-overlay${isClosing ? ' resend-sheet-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="resend-sheet-backdrop" onClick={closeWithAnimation} />
      <div
        className={`resend-sheet${isClosing && !isDragClosing ? ' resend-sheet--closing' : ''}`}
        role="dialog"
        aria-label={view === 'edit-recipient' ? 'Modifier le destinataire' : 'Renvoyer le questionnaire'}
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="resend-sheet__handle-row" {...dragHandlers}>
          <span className="resend-sheet__handle" />
        </div>

        <div className="resend-sheet__appbar">
          <div
            key={view}
            className={`resend-sheet__appbar-main${isContentExiting ? ' resend-sheet__appbar-main--exiting' : ''}`}
          >
            {view === 'edit-recipient' && (
              <button
                type="button"
                className="resend-sheet__back"
                onClick={() => withViewTransition('resend')}
                aria-label="Retour"
              >
                <img src={iconBack} alt="" />
              </button>
            )}
            <p className="resend-sheet__title">
              {view === 'edit-recipient' ? 'Modifier le destinataire' : 'Renvoyer le questionnaire'}
            </p>
          </div>
          <button type="button" className="resend-sheet__close" onClick={closeWithAnimation} aria-label="Fermer">
            <img src={iconFilterClose} alt="" />
          </button>
        </div>

        <div className="resend-sheet__content">
        <div className="resend-sheet__swap" style={swapStyle} onTransitionEnd={onSwapTransitionEnd}>
          <div
            key={view}
            ref={swapInnerRef}
            className={`resend-sheet__swap-inner${isContentExiting ? ' resend-sheet__swap-inner--exiting' : ''}`}
          >
            {view === 'resend' ? (
              <>
                <div className="resend-sheet__section">
                  <p className="resend-sheet__section-label">Destinataire</p>
                  <div className="resend-sheet__recipient">
                    <span className="resend-sheet__recipient-avatar">
                      {item.author.trim().charAt(0).toUpperCase()}
                    </span>
                    <div className="resend-sheet__recipient-text">
                      <p className="resend-sheet__recipient-name">{item.author}</p>
                      {contactLine && <p className="resend-sheet__recipient-contact">{contactLine}</p>}
                    </div>
                    <button
                      type="button"
                      className="resend-sheet__recipient-edit"
                      onClick={() => withViewTransition('edit-recipient')}
                      aria-label="Modifier le destinataire"
                    >
                      <img src={iconPencil} alt="" />
                    </button>
                  </div>
                  <p className="resend-sheet__recipient-warning">
                    {item.author} n'a pas encore répondu au questionnaire envoyé le {formatFullDate(item.sentDate)}.
                  </p>
                </div>

                <div className="resend-sheet__section">
                  <p className="resend-sheet__section-label">Message au destinataire</p>
                  <textarea
                    className="resend-sheet__textarea"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                  />
                </div>

                <div className="resend-sheet__section">
                  <p className="resend-sheet__section-label">Envoyer par</p>
                  <div className="resend-sheet__channels">
                    <button type="button" className="resend-sheet__channel" onClick={handleSend}>
                      <span className="resend-sheet__channel-icon">
                        <SmsIcon />
                      </span>
                      SMS
                    </button>
                    <button type="button" className="resend-sheet__channel" onClick={handleSend}>
                      <span className="resend-sheet__channel-icon">
                        <QrCodeIcon />
                      </span>
                      QR Code
                    </button>
                    <button type="button" className="resend-sheet__channel" onClick={handleSend}>
                      <span className="resend-sheet__channel-icon">
                        <EmailIcon />
                      </span>
                      Email
                    </button>
                    <button type="button" className="resend-sheet__channel resend-sheet__channel--disabled" disabled>
                      <span className="resend-sheet__channel-icon resend-sheet__channel-icon--disabled">
                        <MoreIcon />
                      </span>
                      Plus
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="resend-sheet__recipient resend-sheet__recipient--summary">
                  <span className="resend-sheet__recipient-avatar">
                    {item.author.trim().charAt(0).toUpperCase()}
                  </span>
                  <div className="resend-sheet__recipient-text">
                    <p className="resend-sheet__recipient-name">{item.author}</p>
                    {contactLine && <p className="resend-sheet__recipient-contact">{contactLine}</p>}
                  </div>
                </div>

                <div className="resend-sheet__field">
                  <label className="resend-sheet__label">Prénom*</label>
                  <input
                    type="text"
                    className="resend-sheet__input"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                  />
                </div>

                <div className="resend-sheet__field">
                  <label className="resend-sheet__label">Nom de famille*</label>
                  <input
                    type="text"
                    className="resend-sheet__input"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                  />
                </div>

                <div className="resend-sheet__field">
                  <label className="resend-sheet__label">Email</label>
                  <input
                    type="email"
                    className="resend-sheet__input"
                    placeholder="Entrez une adresse email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

                <div className="resend-sheet__field">
                  <label className="resend-sheet__label">Numéro de téléphone*</label>
                  <input
                    type="tel"
                    className="resend-sheet__input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <p className="resend-sheet__hint">* Informations Requise</p>
              </>
            )}
          </div>
        </div>
        </div>

        <div className="resend-sheet__footer">
          <div
            key={view}
            className={`resend-sheet__footer-buttons${isContentExiting ? ' resend-sheet__footer-buttons--exiting' : ''}`}
          >
            {view === 'resend' ? (
              <button type="button" className="resend-sheet__system-link">
                <img className="resend-sheet__system-link-badge" src={logoIconSmall} alt="" />
                <span className="resend-sheet__system-link-text">
                  Laissez Opinion System l'envoyer par e-mail
                </span>
                <img className="resend-sheet__system-link-chevron" src={iconChevronRightSmall} alt="" />
              </button>
            ) : (
              <button
                type="button"
                className={`resend-sheet__save-btn${isRecipientValid ? '' : ' resend-sheet__save-btn--disabled'}`}
                disabled={!isRecipientValid}
                onClick={handleSaveRecipient}
              >
                Enregistrer
              </button>
            )}
          </div>
          <div className="resend-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
