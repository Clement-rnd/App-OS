import iconHouse from '../../assets/home/icon-house.svg'
import iconChat from '../../assets/home/icon-chat.svg'
import iconSend from '../../assets/home/icon-send.svg'
import iconUser from '../../assets/home/icon-user.svg'
import './BottomNav.css'

const TABS = [
  { key: 'home', icon: iconHouse },
  { key: 'chat', icon: iconChat },
  { key: 'send', icon: iconSend },
  { key: 'user', icon: iconUser },
]

export function BottomNav({ active, onNavigate }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(tab => (
        <button
          key={tab.key}
          type="button"
          className={`bottom-nav__item${tab.key === active ? ' bottom-nav__item--active' : ''}`}
          onClick={() => onNavigate?.(tab.key)}
        >
          <span className="bottom-nav__icon-wrap">
            <img src={tab.icon} alt="" />
          </span>
        </button>
      ))}
    </nav>
  )
}
