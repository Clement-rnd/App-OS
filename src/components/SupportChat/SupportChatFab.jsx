import iconFabAi from '../../assets/support-chat/icon-fab-ai.svg'
import './SupportChatFab.css'

export function SupportChatFab({ onClick, hidden = false }) {
  if (hidden) return null

  return (
    <button type="button" className="support-chat-fab" onClick={onClick} aria-label="Ouvrir l'assistant support">
      <img src={iconFabAi} alt="" />
    </button>
  )
}
