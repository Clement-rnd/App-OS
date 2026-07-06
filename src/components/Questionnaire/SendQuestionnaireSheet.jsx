import { useState } from 'react'
import iconCaretLeft from '../../assets/questionnaire/icon-caret-left.svg'
import iconCaretRight from '../../assets/questionnaire/icon-caret-right.svg'
import iconSms from '../../assets/questionnaire/icon-sms.svg'
import iconQrCode from '../../assets/questionnaire/icon-qr-code.svg'
import iconEmail from '../../assets/questionnaire/icon-email.svg'
import iconPlusChannel from '../../assets/questionnaire/icon-plus-channel.svg'
import iconAutoSend from '../../assets/questionnaire/icon-auto-send.svg'
import iconChevronRightSmall from '../../assets/questionnaire/icon-chevron-right-small.svg'
import iconSendDisabled from '../../assets/questionnaire/icon-send-disabled.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import './SendQuestionnaireSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

const CHANNELS = [
  { id: 'sms', label: 'SMS', icon: iconSms },
  { id: 'qrcode', label: 'QR Code', icon: iconQrCode },
  { id: 'email', label: 'Email', icon: iconEmail },
]

const DEFAULT_MESSAGE =
  'Salut ! Pourriez-vous prendre un moment pour partager vos retours ? Cela nous aide vraiment. Merci !\n\nURL'

export function SendQuestionnaireSheet({ recipients, onClose }) {
  const [isClosing, setIsClosing] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedChannels, setSelectedChannels] = useState(() => new Set())
  const [sentIndices, setSentIndices] = useState(() => new Set())
  const [autoSendByEmail, setAutoSendByEmail] = useState(false)
  const [messages, setMessages] = useState({})

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
  const message = messages[recipient.id] ?? DEFAULT_MESSAGE
  const isSent = sentIndices.has(recipient.id)

  const goPrev = () => setCurrentIndex(i => Math.max(0, i - 1))
  const goNext = () => setCurrentIndex(i => Math.min(total - 1, i + 1))

  const toggleChannel = channelId => {
    setSelectedChannels(prev => {
      const next = new Set(prev)
      if (next.has(channelId)) {
        next.delete(channelId)
      } else {
        next.add(channelId)
      }
      return next
    })
  }

  const handleSend = () => {
    setSentIndices(prev => new Set(prev).add(recipient.id))
  }

  return (
    <div className={`send-sheet-overlay${isClosing ? ' send-sheet-overlay--closing' : ''}`}>
      <div className="send-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`send-sheet${isClosing && !isDragClosing ? ' send-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Envoyer le questionnaire"
        style={dragStyle}
      >
        <div className="send-sheet__handle-row" {...dragHandlers}>
          <span className="send-sheet__handle" />
        </div>

        <div className="send-sheet__appbar">
          <div className="send-sheet__title-row">
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
                <span className="send-sheet__recipient-phone">{recipient.phone}</span>
              </span>
            </div>
          </div>

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
                  onClick={() => toggleChannel(channel.id)}
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
            <span className="send-sheet__auto-send-text">
              Laissez le système d&rsquo;opinion l&rsquo;envoyer par e-mail
            </span>
            <img
              src={iconChevronRightSmall}
              alt=""
              className={`send-sheet__auto-send-chevron${autoSendByEmail ? ' send-sheet__auto-send-chevron--active' : ''}`}
            />
          </button>
        </div>

        <div className="send-sheet__footer">
          <button type="button" className="send-sheet__submit-btn" onClick={handleSend}>
            {isSent ? 'Renvoyer le sondage' : 'Envoyer le sondage'}
            <img src={iconSendDisabled} alt="" />
          </button>
          <div className="send-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
