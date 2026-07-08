import { useEffect, useRef, useState } from 'react'
import iconBack from '../../assets/notifications/icon-back.svg'
import iconKebab from '../../assets/notifications/icon-kebab.svg'
import iconChecks from '../../assets/notifications/icon-checks.svg'
import iconTrash from '../../assets/questionnaire/icon-trash.svg'
import iconChevronDown from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import { NotificationRow } from './NotificationRow'
import { RespondSheet } from '../Home/RespondSheet'
import { GROUP_LABELS, GROUP_ORDER, NOTIFICATION_TYPES } from './notificationsData'
import './Notifications.css'

const PAGE_SIZE = 10

function groupNotifications(notifications) {
  const groups = {}
  for (const notification of notifications) {
    if (!groups[notification.group]) groups[notification.group] = []
    groups[notification.group].push(notification)
  }
  return GROUP_ORDER.filter(group => groups[group]?.length).map(group => ({
    key: group,
    label: GROUP_LABELS[group] || group,
    items: groups[group],
  }))
}

export function Notifications({ notifications, onChangeNotifications, onNavigate }) {
  const [tab, setTab] = useState('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [respondingNotification, setRespondingNotification] = useState(null)
  const menuRef = useRef(null)

  const unreadCount = notifications.filter(n => n.unread).length
  const filtered = tab === 'unread' ? notifications.filter(n => n.unread) : notifications
  const visible = filtered.slice(0, visibleCount)
  const groups = groupNotifications(visible)
  const hasMore = filtered.length > visibleCount

  const handleChangeTab = nextTab => {
    setTab(nextTab)
    setVisibleCount(PAGE_SIZE)
  }

  const handleLoadMore = () => {
    setVisibleCount(count => count + PAGE_SIZE)
  }

  const handleMarkRead = id => {
    onChangeNotifications(list => list.map(n => (n.id === id ? { ...n, unread: false } : n)))
  }

  const handleArchive = id => {
    onChangeNotifications(list => list.filter(n => n.id !== id))
  }

  const handleAction = notification => {
    const actionType = NOTIFICATION_TYPES[notification.type]?.actionType
    if (actionType === 'respond') {
      setRespondingNotification(notification)
    } else if (actionType === 'boost') {
      onChangeNotifications(list =>
        list.map(n => (n.id === notification.id ? { ...n, unread: false, actionCompleted: true } : n))
      )
      onNavigate?.('send')
    }
  }

  const handleSubmitResponse = (review, responseText) => {
    onChangeNotifications(list =>
      list.map(n =>
        n.review?.id === review.id
          ? { ...n, unread: false, actionCompleted: true, review: { ...n.review, response: responseText } }
          : n
      )
    )
    setRespondingNotification(null)
  }

  const handleMarkAllRead = () => {
    onChangeNotifications(list => list.map(n => ({ ...n, unread: false })))
    setIsMenuOpen(false)
  }

  const handleClearAll = () => {
    onChangeNotifications([])
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (!isMenuOpen) return
    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isMenuOpen])

  return (
    <div className="notifications">
      <header className="notifications__header">
        <div className="notifications__status-bar" />
        <div className="notifications__appbar">
          <button
            type="button"
            className="notifications__icon-btn"
            aria-label="Retour"
            onClick={() => onNavigate?.('home')}
          >
            <img src={iconBack} alt="" />
          </button>
          <h1 className="notifications__title">Notifications</h1>
          <div className="notifications__menu-anchor" ref={menuRef}>
            <button
              type="button"
              className="notifications__icon-btn"
              aria-label="Plus d'options"
              onClick={() => setIsMenuOpen(open => !open)}
            >
              <img src={iconKebab} alt="" />
            </button>
            {isMenuOpen && (
              <div className="notifications__menu" role="menu">
                <button type="button" className="notifications__menu-item" onClick={handleMarkAllRead}>
                  <img src={iconChecks} alt="" />
                  Tout marquer comme lu
                </button>
                <button
                  type="button"
                  className="notifications__menu-item notifications__menu-item--danger"
                  onClick={handleClearAll}
                >
                  <img src={iconTrash} alt="" />
                  Effacer toutes les notifications
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="notifications__tabs">
        <button
          type="button"
          className={`notifications__tab${tab === 'all' ? ' notifications__tab--active' : ''}`}
          onClick={() => handleChangeTab('all')}
        >
          Toute
        </button>
        <button
          type="button"
          className={`notifications__tab${tab === 'unread' ? ' notifications__tab--active' : ''}`}
          onClick={() => handleChangeTab('unread')}
        >
          Non Lue
          {unreadCount > 0 && <span className="notifications__tab-badge">{unreadCount}</span>}
        </button>
      </div>

      <div className="notifications__list">
        {groups.map(group => (
          <div key={group.key}>
            <div className="notifications__date-subheader">{group.label}</div>
            {group.items.map(notification => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onArchive={handleArchive}
                onAction={handleAction}
              />
            ))}
          </div>
        ))}

        {groups.length === 0 && <p className="notifications__empty">Aucune notification</p>}

        {hasMore && (
          <button type="button" className="notifications__load-more" onClick={handleLoadMore}>
            Charger plus
            <img src={iconChevronDown} alt="" />
          </button>
        )}
      </div>

      {respondingNotification && (
        <RespondSheet
          review={respondingNotification.review}
          onClose={() => setRespondingNotification(null)}
          onSubmit={handleSubmitResponse}
        />
      )}
    </div>
  )
}
