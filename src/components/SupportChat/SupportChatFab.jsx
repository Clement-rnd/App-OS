import iconFabSupport from '../../assets/support-chat/icon-fab-support.svg'
import './SupportChatFab.css'

export function SupportChatFab({ onClick, hidden = false }) {
  if (hidden) return null

  return (
    <button type="button" className="support-chat-fab" onClick={onClick} aria-label="Ouvrir l'assistant support">
      <img src={iconFabSupport} alt="" />
    </button>
  )
}
