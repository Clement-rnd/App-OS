import { useEffect, useRef, useState } from 'react'
import iconClose from '../../assets/support-chat/icon-close.svg'
import iconAssistantAvatar from '../../assets/support-chat/icon-assistant-avatar.svg'
import iconAttach from '../../assets/support-chat/icon-attach.svg'
import iconBack from '../../assets/support-chat/icon-back.svg'
import iconHelpCircle from '../../assets/support-chat/icon-help-circle.svg'
import iconArticle from '../../assets/support-chat/icon-article.svg'
import iconSend from '../../assets/home/icon-send.svg'
import iconChat from '../../assets/home/icon-chat.svg'
import iconSearch from '../../assets/recipients/icon-search.svg'
import iconChevronRightSmall from '../../assets/questionnaire/icon-chevron-right-small.svg'
import { generateSupportReply } from './supportChatKnowledgeBase'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './SupportChatWindow.css'

const CLOSE_ANIMATION_MS = 260

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

const HISTORY_ITEMS = [
  { id: 'h-1', name: 'Assistant support', kind: 'bot', time: 'il y a 1 min', preview: 'Ai-je répondu à votre question ?' },
  { id: 'h-2', name: 'Assistant support', kind: 'bot', time: 'il y a 6 j', preview: 'Votre chat est terminé.' },
  { id: 'h-3', name: 'Camille Perrot', kind: 'person', time: 'il y a 2 sem.', preview: 'Votre chat est terminé.' },
  { id: 'h-4', name: 'Assistant support', kind: 'bot', time: 'il y a 3 sem.', preview: 'Votre chat est terminé.' },
  { id: 'h-5', name: 'Assistant support', kind: 'bot', time: 'il y a 2 mois', preview: 'Votre chat est terminé.' },
]

const TRENDING_ARTICLES = [
  'Comment faire la synchronisation avec Google Business Profil ?',
  'Que deviennent mes avis Opinion System après résiliation ?',
  'Comment répondre à un avis depuis votre interface Opinion System ?',
]

const HELP_CATEGORIES = [
  { name: 'Questionnaire', count: 14 },
  { name: 'Avis', count: 16 },
  { name: 'Compact CRM', count: 5 },
  { name: 'Outils', count: 11 },
  { name: 'Mes avis dans Google', count: 4 },
  { name: 'Mon compte', count: 17 },
  { name: 'Accueil', count: 4 },
  { name: 'Extranet', count: 8 },
  { name: 'Site Web', count: 3 },
  { name: 'Huwin', count: 2 },
]

export function SupportChatWindow({ onClose }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [view, setView] = useState('chat')
  const [messages, setMessages] = useState([seedMessage])
  const [draft, setDraft] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [helpQuery, setHelpQuery] = useState('')
  const [isClosing, setIsClosing] = useState(false)
  const listRef = useRef(null)
  const inputRef = useRef(null)

  // Mounted fresh on every open and unmounted on close, exactly like every
  // other sheet in the app -- closeWithAnimation just delays the real
  // onClose (which unmounts this) until the slide-down finishes, instead
  // of this window staying alive in the background and toggling its own
  // visibility (that split responsibility was the source of the glitchy
  // transitions).
  const closeWithAnimation = () => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(onClose, CLOSE_ANIMATION_MS)
  }

  useEffect(() => {
    if (view !== 'chat') return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isTyping, view])

  const handleSend = () => {
    const trimmed = draft.trim()
    if (!trimmed) return

    inputRef.current?.blur()

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

  const isHubView = view === 'history' || view === 'help'

  return (
    <div className={`support-chat-overlay${isClosing ? ' support-chat-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="support-chat-backdrop" onClick={closeWithAnimation} />
      <div
        className={`support-chat-panel${isClosing ? ' support-chat-panel--closing' : ''}`}
        role="dialog"
        aria-label="Assistant support"
        style={{ height: screenHeight === undefined ? undefined : screenHeight * 0.5 }}
      >
        {view === 'chat' ? (
          <div className="support-chat-panel__header">
            <button
              type="button"
              className="support-chat-panel__icon-btn"
              aria-label="Retour à l'historique"
              onClick={() => setView('history')}
            >
              <img src={iconBack} alt="" />
            </button>
            <span className="support-chat-panel__avatar">
              <img src={iconAssistantAvatar} alt="" />
            </span>
            <div className="support-chat-panel__title-block">
              <p className="support-chat-panel__title">Assistant support</p>
              <p className="support-chat-panel__subtitle">Optimisé par l'IA</p>
            </div>
            <button type="button" className="support-chat-panel__icon-btn" aria-label="Fermer" onClick={closeWithAnimation}>
              <img src={iconClose} alt="" />
            </button>
          </div>
        ) : (
          <div className="support-chat-panel__header support-chat-panel__header--hub">
            <div className="support-chat-panel__hub-title-row">
              <p className="support-chat-panel__hub-title">{view === 'history' ? 'Chat' : 'Aide'}</p>
              <div className="support-chat-panel__hub-actions">
                <button
                  type="button"
                  className="support-chat-panel__icon-btn"
                  aria-label="Revenir à la conversation"
                  onClick={() => setView('chat')}
                >
                  <img src={iconChat} alt="" />
                </button>
                <button type="button" className="support-chat-panel__icon-btn" aria-label="Fermer" onClick={closeWithAnimation}>
                  <img src={iconClose} alt="" />
                </button>
              </div>
            </div>

            {view === 'help' && (
              <div className="support-chat-panel__search">
                <img src={iconSearch} alt="" />
                <input
                  type="text"
                  placeholder="Rechercher des articles"
                  value={helpQuery}
                  onChange={e => setHelpQuery(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {view === 'chat' && (
          <>
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
          </>
        )}

        {view === 'history' && (
          <div className="support-chat-history__list">
            {HISTORY_ITEMS.map(item => (
              <button
                key={item.id}
                type="button"
                className="support-chat-history__row"
                onClick={() => setView('chat')}
              >
                {item.kind === 'bot' ? (
                  <span className="support-chat-history__avatar">
                    <img src={iconAssistantAvatar} alt="" />
                  </span>
                ) : (
                  <span className="support-chat-history__avatar support-chat-history__avatar--person">
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="support-chat-history__text">
                  <div className="support-chat-history__row-top">
                    <p className="support-chat-history__name">{item.name}</p>
                    <span className="support-chat-history__time">{item.time}</span>
                  </div>
                  <p className="support-chat-history__preview">{item.preview}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {view === 'help' && (
          <div className="support-chat-help__content">
            <p className="support-chat-help__section-title">Articles en vogue</p>
            <div className="support-chat-help__articles">
              {TRENDING_ARTICLES.map(article => (
                <button type="button" key={article} className="support-chat-help__article">
                  <img src={iconArticle} alt="" />
                  <span>{article}</span>
                </button>
              ))}
            </div>

            <p className="support-chat-help__section-title">Parcourir les catégories</p>
            <div className="support-chat-help__categories">
              {HELP_CATEGORIES.map(category => (
                <button type="button" key={category.name} className="support-chat-help__category">
                  <span className="support-chat-help__category-text">
                    <span className="support-chat-help__category-name">{category.name}</span>
                    <span className="support-chat-help__category-count">{category.count} articles</span>
                  </span>
                  <img src={iconChevronRightSmall} alt="" />
                </button>
              ))}
            </div>
          </div>
        )}

        {isHubView && (
          <div className="support-chat-tabs">
            <button
              type="button"
              className={`support-chat-tabs__pill${view === 'history' ? ' support-chat-tabs__pill--active' : ''}`}
              onClick={() => setView('history')}
            >
              <img src={iconChat} alt="" />
              Chat
            </button>
            <button
              type="button"
              className={`support-chat-tabs__pill${view === 'help' ? ' support-chat-tabs__pill--active' : ''}`}
              onClick={() => setView('help')}
            >
              <img src={iconHelpCircle} alt="" />
              Aide
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
