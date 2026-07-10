import { useEffect, useRef, useState } from 'react'
import iconClose from '../../assets/support-chat/icon-close.svg'
import iconAssistantAvatar from '../../assets/support-chat/icon-assistant-avatar.svg'
import iconAttach from '../../assets/support-chat/icon-attach.svg'
import iconSend from '../../assets/home/icon-send.svg'
import { generateSupportReply } from './supportChatKnowledgeBase'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './SupportChatWindow.css'

const CLOSE_ANIMATION_MS = 260
// A plain estimate (~most iOS keyboards without a QuickType/predictive
// bar showing) -- there's no way to measure the real one from here, and
// visualViewport's resize event isn't reliable enough on-device to be the
// only source (see handleInputFocus below).
const FALLBACK_KEYBOARD_INSET = 300

function formatTime(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

const seedMessage = {
  id: 'seed',
  sender: 'bot',
  text: "Bonjour ! Je suis l'assistant IA d'Opinion System.\nPosez vos questions et je me ferai un plaisir de vous aider.",
  time: null,
  showLabel: false,
}

export function SupportChatWindow({ isOpen, onClose }) {
  useLockBodyScroll(isOpen)
  const screenHeight = useStandaloneScreenHeight()
  const [messages, setMessages] = useState([seedMessage])
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)
  // How much of the bottom of the screen the keyboard currently covers --
  // NOT used to resize the overlay/panel (that made the whole sheet lurch
  // when tried before); applied as bottom padding on the panel instead, so
  // only its flex layout reacts: the messages list (flex: 1) yields that
  // much space and the input row rides up to sit just above the keyboard,
  // while the panel's own height stays fixed at "opens straight to max".
  const [keyboardInset, setKeyboardInset] = useState(0)

  // This window stays mounted for the whole session (so chat history
  // survives being closed) instead of unmounting like every other sheet --
  // isOpen alone used to snap display: none the instant it went false,
  // skipping the slide-down/fade-out entirely. isVisible is DERIVED
  // (open, or still playing the exit), not effect-managed state: the
  // overlay must leave display: none in the very same render isOpen
  // flips true, so App.jsx's flushSync can focus the input while still
  // inside the tap gesture -- an effect setting isVisible a tick later
  // would leave the input under display: none for that whole tick, and
  // focusing a display: none element is a silent no-op.
  const [isClosing, setIsClosing] = useState(false)
  const wasOpenRef = useRef(isOpen)
  const isVisible = isOpen || isClosing

  useEffect(() => {
    const wasOpen = wasOpenRef.current
    wasOpenRef.current = isOpen
    if (isOpen) {
      setIsClosing(false)
      return
    }
    if (!wasOpen) return
    setIsClosing(true)
    const timeoutId = setTimeout(() => setIsClosing(false), CLOSE_ANIMATION_MS)
    return () => clearTimeout(timeoutId)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping, isOpen])

  // The actual focus happens synchronously inside the FAB's own onClick
  // in App.jsx (flushSync + focus, still inside the tap) -- iOS only
  // raises the keyboard for a focus() in that exact synchronous gesture
  // window, so a React effect here (necessarily a tick later) would focus
  // the field but never show the keyboard.

  // window.visualViewport's resize event turned out not to be reliable
  // enough on-device to hang the keyboard-inset logic on (it may not fire
  // at all in this installed-PWA context) -- focus/blur on the input
  // itself is guaranteed to fire, since the keyboard opening off of it is
  // the whole feature. FALLBACK_KEYBOARD_INSET is a plain estimate (no
  // device can be measured live from here); visualViewport, if it *does*
  // report something, refines that estimate once the keyboard's open
  // animation has actually finished.
  const handleInputFocus = () => {
    setKeyboardInset(FALLBACK_KEYBOARD_INSET)
    const vv = window.visualViewport
    if (!vv) return
    setTimeout(() => {
      const measured = Math.max(0, window.innerHeight - vv.height)
      if (measured > 0) setKeyboardInset(measured)
      window.scrollTo(0, 0)
    }, 350)
  }

  const handleInputBlur = () => setKeyboardInset(0)

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    const userMessage = { id: `u-${Date.now()}`, sender: 'user', text: trimmed, time: formatTime(new Date()) }
    setMessages(list => [...list, userMessage])
    setDraft('')
    setIsTyping(true)

    setTimeout(() => {
      const replyText = generateSupportReply(trimmed)
      setMessages(list => [
        ...list,
        { id: `b-${Date.now()}`, sender: 'bot', text: replyText, time: formatTime(new Date()), showLabel: true },
      ])
      setIsTyping(false)
    }, 750)
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className={`support-chat-overlay${isVisible ? '' : ' support-chat-overlay--hidden'}${isClosing ? ' support-chat-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="support-chat-backdrop" onClick={onClose} />
      <div
        className={`support-chat-panel${isClosing ? ' support-chat-panel--closing' : ''}`}
        role="dialog"
        aria-label="Assistant support"
        style={{
          height: screenHeight === undefined ? undefined : screenHeight * 0.9,
          paddingBottom: keyboardInset,
        }}
      >
        <div className="support-chat-panel__header">
          <span className="support-chat-panel__avatar">
            <img src={iconAssistantAvatar} alt="" />
          </span>
          <div className="support-chat-panel__title-block">
            <p className="support-chat-panel__title">Assistant support</p>
            <p className="support-chat-panel__subtitle">Optimisé par l'IA</p>
          </div>
          <button type="button" className="support-chat-panel__icon-btn" aria-label="Fermer" onClick={onClose}>
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="support-chat-panel__messages" ref={listRef}>
          {messages.map(message => (
            <div
              key={message.id}
              className={`support-chat-message support-chat-message--${message.sender}`}
            >
              {message.sender === 'bot' && (
                <span className="support-chat-message__avatar">
                  <img src={iconAssistantAvatar} alt="" />
                </span>
              )}
              <div className="support-chat-message__body">
                {message.showLabel && <p className="support-chat-message__label">Assistant support</p>}
                <div className="support-chat-message__bubble">
                  {message.text.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                  {message.time && <span className="support-chat-message__time">{message.time}</span>}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="support-chat-message support-chat-message--bot">
              <span className="support-chat-message__avatar">
                <img src={iconAssistantAvatar} alt="" />
              </span>
              <div className="support-chat-message__body">
                <div className="support-chat-message__bubble support-chat-message__bubble--typing">
                  <span className="support-chat-typing-dot" />
                  <span className="support-chat-typing-dot" />
                  <span className="support-chat-typing-dot" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="support-chat-panel__input-row">
          <div className="support-chat-panel__input">
            <input
              ref={inputRef}
              type="text"
              placeholder="Écrire un message..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            <button type="button" className="support-chat-panel__attach-btn" aria-label="Joindre un fichier">
              <img src={iconAttach} alt="" />
            </button>
          </div>
          <button
            type="button"
            className="support-chat-panel__send-btn"
            aria-label="Envoyer"
            onClick={handleSend}
            disabled={!draft.trim()}
          >
            <img src={iconSend} alt="" />
          </button>
        </div>
        <p className="support-chat-panel__disclaimer">Le contenu généré par l'IA peut être inexact.</p>
      </div>
    </div>
  )
}
