import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import iconCaretLeft from '../../assets/questionnaire/icon-caret-left.svg'
import iconCaretRight from '../../assets/questionnaire/icon-caret-right.svg'
import iconSms from '../../assets/questionnaire/icon-sms.svg'
import iconQrCode from '../../assets/questionnaire/icon-qr-code.svg'
import iconEmail from '../../assets/questionnaire/icon-email.svg'
import iconPlusChannel from '../../assets/questionnaire/icon-plus-channel.svg'
import iconAutoSend from '../../assets/questionnaire/icon-auto-send.svg'
import iconChevronRightSmall from '../../assets/questionnaire/icon-chevron-right-small.svg'
import iconBack from '../../assets/questionnaire/icon-back.svg'
import iconSendDisabled from '../../assets/questionnaire/icon-send-disabled.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './SendQuestionnaireSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

const CHANNELS = [
  { id: 'sms', label: 'SMS', icon: iconSms },
  { id: 'qrcode', label: 'QR Code', icon: iconQrCode },
  { id: 'email', label: 'Email', icon: iconEmail },
]

const DEFAULT_MESSAGE_INTRO =
  'Salut ! Pourriez-vous prendre un moment pour partager vos retours ? Cela nous aide vraiment. Merci !'

// The link itself lives in the message text, not a separate disconnected
// "URL" caption underneath -- same reasoning as ResendQuestionnaireSheet's
// own message field.
function getDefaultMessage(recipient) {
  return `${DEFAULT_MESSAGE_INTRO}\n\nhttps://avis.opinion-system.fr/r/${recipient.id}`
}

// Contacts picked from the phone's address book only ever carry a phone
// number here (see RecipientSelectSheet's CONTACTS) -- a manually-added
// contact can have a real one, but for the rest the simulated Email screen
// still needs something plausible to address the message to.
function getRecipientEmail(recipient) {
  if (recipient.email) return recipient.email
  const normalized = recipient.name
    .toLowerCase()
    .replace(/[àâá]/g, 'a')
    .replace(/[èêéë]/g, 'e')
    .replace(/[ìîï]/g, 'i')
    .replace(/[òôö]/g, 'o')
    .replace(/[ùûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .join('.')
  return `${normalized}@exemple.fr`
}

const EMAIL_SUBJECT = 'Demande d’avis - Opinion System'

export function SendQuestionnaireSheet({ recipients, onClose, onSent }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChannels, setSelectedChannels] = useState(() => new Set())
  const [sentIndices, setSentIndices] = useState(() => new Set())
  const [autoSendByEmail, setAutoSendByEmail] = useState(false)
  const [messages, setMessages] = useState({})
  // 'sms' | 'email' | 'qrcode' | null -- which channel's simulated send
  // screen is currently showing in place of the main compose view.
  const [channelScreen, setChannelScreen] = useState(null)
  const [qrDataUrl, setQrDataUrl] = useState(null)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const total = recipients.length
  const recipient = recipients[currentIndex]
  const message = messages[recipient.id] ?? getDefaultMessage(recipient)
  const isSent = sentIndices.has(recipient.id)

  const goPrev = () => setCurrentIndex(i => Math.max(0, i - 1))
  const goNext = () => setCurrentIndex(i => Math.min(total - 1, i + 1))

  // Tapping a channel just opens its simulated send screen -- the
  // recipient isn't marked sent until the user confirms *inside* that
  // screen (see handleConfirmSend), same as actually switching to the
  // Messages/Mail app would only send once you tap its own send button.
  const openChannelScreen = channelId => setChannelScreen(channelId)

  const handleConfirmSend = () => {
    const channelId = channelScreen
    setChannelScreen(null)
    setSelectedChannels(prev => new Set(prev).add(channelId))

    const next = new Set(sentIndices).add(recipient.id)
    setSentIndices(next)
    // Every recipient has been dispatched through some channel -- the
    // batch is done, so hand off to the success screen instead of leaving
    // the sheet open with nothing left to do.
    if (next.size === recipients.length) {
      setTimeout(() => closeWithAnimation(onSent), 600)
    } else if (currentIndex < total - 1) {
      // Otherwise move straight on to the next recipient so the same
      // pick-a-channel-and-send flow can repeat for them.
      goNext()
    }
  }

  useEffect(() => {
    if (channelScreen !== 'qrcode') return
    let cancelled = false
    const surveyUrl = `https://avis.opinion-system.fr/r/${recipient.id}`
    QRCode.toDataURL(surveyUrl, {
      margin: 1,
      width: 460,
      color: { dark: '#041b44', light: '#f7fafc' },
    }).then(url => {
      if (!cancelled) setQrDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [channelScreen, recipient.id])

  return (
    <div
      className={`send-sheet-overlay${isClosing ? ' send-sheet-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="send-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`send-sheet${isClosing && !isDragClosing ? ' send-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Envoyer le questionnaire"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="send-sheet__handle-row" {...dragHandlers}>
          <span className="send-sheet__handle" />
        </div>

        <div className="send-sheet__appbar">
          <div className="send-sheet__title-row">
            {channelScreen && (
              <button
                type="button"
                className="send-sheet__back-btn"
                aria-label="Retour"
                onClick={() => setChannelScreen(null)}
              >
                <img src={iconBack} alt="" />
              </button>
            )}
            <p className="send-sheet__title">Envoyer le questionnaire</p>
            <div className="send-sheet__pagination">
              <button
                type="button"
                className="send-sheet__caret"
                aria-label="Destinataire précédent"
                disabled={currentIndex === 0}
                onClick={goPrev}
              >
                <img src={iconCaretLeft} alt="" />
              </button>
              <span className="send-sheet__pagination-label">
                {currentIndex + 1}/{total}
              </span>
              <button
                type="button"
                className="send-sheet__caret"
                aria-label="Destinataire suivant"
                disabled={currentIndex === total - 1}
                onClick={goNext}
              >
                <img src={iconCaretRight} alt="" />
              </button>
            </div>
          </div>
          {isSent && <p className="send-sheet__sent-label">Envoyé</p>}
        </div>

        <div className="send-sheet__content">
          <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
            <span className="send-sheet__label">Destinataire</span>
            <div className="send-sheet__recipient">
              <span className="send-sheet__recipient-avatar">{recipient.name[0]}</span>
              <span className="send-sheet__recipient-text">
                <span className="send-sheet__recipient-name">{recipient.name}</span>
                <span className="send-sheet__recipient-phone">
                  {channelScreen === 'email' ? getRecipientEmail(recipient) : recipient.phone}
                </span>
              </span>
            </div>
          </div>

          {channelScreen === 'qrcode' ? (
            <>
              <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
                <span className="send-sheet__label">Code QR</span>
                <div className="send-sheet__qr-box">
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="QR code du questionnaire" className="send-sheet__qr-image" />
                  )}
                </div>
              </div>
              <button
                type="button"
                className="send-sheet__confirm-btn"
                style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}
                onClick={handleConfirmSend}
              >
                J&rsquo;ai terminé
              </button>
            </>
          ) : channelScreen === 'sms' || channelScreen === 'email' ? (
            <>
              <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
                <span className="send-sheet__sim-banner">
                  <img src={channelScreen === 'sms' ? iconSms : iconEmail} alt="" />
                  Simulation {channelScreen === 'sms' ? 'de l’application Messages' : 'de l’application Mail'}
                </span>
              </div>

              {channelScreen === 'email' && (
                <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 75}ms` }}>
                  <span className="send-sheet__label">Objet</span>
                  <p className="send-sheet__sim-subject">{EMAIL_SUBJECT}</p>
                </div>
              )}

              <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
                <span className="send-sheet__label">Message</span>
                <p className="send-sheet__sim-message">{message}</p>
              </div>

              <button
                type="button"
                className="send-sheet__confirm-btn"
                style={{ animationDelay: `${SHEET_ENTRANCE_MS + 150}ms` }}
                onClick={handleConfirmSend}
              >
                <img src={iconSendDisabled} alt="" className="send-sheet__confirm-btn-icon" />
                Envoyer {channelScreen === 'sms' ? 'le SMS' : 'l’email'}
              </button>
            </>
          ) : (
            <>
              <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 50}ms` }}>
                <span className="send-sheet__label">Message au destinataire</span>
                <textarea
                  className="send-sheet__message"
                  value={message}
                  onChange={e => setMessages(prev => ({ ...prev, [recipient.id]: e.target.value }))}
                />
              </div>

              <div className="send-sheet__field" style={{ animationDelay: `${SHEET_ENTRANCE_MS + 100}ms` }}>
                <span className="send-sheet__label">Envoyer par</span>
                <div className="send-sheet__channels">
                  {CHANNELS.map(channel => (
                    <button
                      key={channel.id}
                      type="button"
                      className={`send-sheet__channel${
                        selectedChannels.has(channel.id) ? ' send-sheet__channel--selected' : ''
                      }`}
                      onClick={() => openChannelScreen(channel.id)}
                    >
                      <span className="send-sheet__channel-avatar">
                        <img src={channel.icon} alt="" />
                      </span>
                      <span className="send-sheet__channel-label">{channel.label}</span>
                    </button>
                  ))}
                  <span className="send-sheet__channel send-sheet__channel--disabled">
                    <span className="send-sheet__channel-avatar send-sheet__channel-avatar--disabled">
                      <img src={iconPlusChannel} alt="" />
                    </span>
                    <span className="send-sheet__channel-label send-sheet__channel-label--disabled">Plus</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="send-sheet__auto-send"
                style={{ animationDelay: `${SHEET_ENTRANCE_MS + 150}ms` }}
                onClick={() => setAutoSendByEmail(v => !v)}
              >
                <span className="send-sheet__auto-send-icon">
                  <img src={iconAutoSend} alt="" />
                </span>
                <span className="send-sheet__auto-send-text">Laissez Opinion System l&rsquo;envoyer par e-mail</span>
                <img
                  src={iconChevronRightSmall}
                  alt=""
                  className={`send-sheet__auto-send-chevron${autoSendByEmail ? ' send-sheet__auto-send-chevron--active' : ''}`}
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
