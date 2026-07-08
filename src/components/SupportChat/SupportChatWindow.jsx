import { useEffect, useRef, useState } from 'react'
import iconBack from '../../assets/support-chat/icon-back.svg'
import iconClose from '../../assets/support-chat/icon-close.svg'
import iconAssistantAvatar from '../../assets/support-chat/icon-assistant-avatar.svg'
import iconAttach from '../../assets/support-chat/icon-attach.svg'
import iconSend from '../../assets/home/icon-send.svg'
import { generateSupportReply } from './supportChatKnowledgeBase'
import './SupportChatWindow.css'

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
  const [messages, setMessages] = useState([seedMessage])
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping, isOpen])

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
    <div className={`support-chat-overlay${isOpen ? '' : ' support-chat-overlay--hidden'}`}>
      <div className="support-chat-backdrop" onClick={onClose} />
      <div className="support-chat-panel" role="dialog" aria-label="Assistant support">
        <div className="support-chat-panel__header">
          <button type="button" className="support-chat-panel__icon-btn" aria-label="Retour" onClick={onClose}>
            <img src={iconBack} alt="" />
          </button>
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
              type="text"
              placeholder="Écrire un message..."
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
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
