import iconChevronRightFilled from '../../assets/notifications/icon-chevron-right-filled.svg'
import iconChecksWhite from '../../assets/notifications/icon-checks-white.svg'
import iconArchiveWhite from '../../assets/notifications/icon-archive-white.svg'
import { useSwipeActions } from '../../hooks/useSwipeActions'
import { NOTIFICATION_TYPES } from './notificationsData'
import './NotificationRow.css'

const ACTION_LABELS = {
  respond: 'Répondre',
  boost: 'Envoyer une demande',
}

export function NotificationRow({ notification, onMarkRead, onArchive, onAction }) {
  const { dragHandlers, translateX, isDragging, close } = useSwipeActions()
  const typeConfig = NOTIFICATION_TYPES[notification.type] || {}
  const needsAction = notification.actionable && !notification.actionCompleted

  const handleMarkRead = () => {
    onMarkRead(notification.id)
    close()
  }

  const handleArchive = () => {
    onArchive(notification.id)
  }

  const handleRowClick = () => {
    if (translateX !== 0) {
      close()
      return
    }
    if (needsAction) {
      onAction(notification)
    } else if (notification.unread) {
      onMarkRead(notification.id)
    }
  }

  const handleRowKeyDown = e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleRowClick()
    }
  }

  return (
    <div className="notif-row-wrap">
      <div className="notif-row-actions">
        <button type="button" className="notif-row-action notif-row-action--read" onClick={handleMarkRead}>
          <img src={iconChecksWhite} alt="" />
          Lu
        </button>
        <button type="button" className="notif-row-action notif-row-action--archive" onClick={handleArchive}>
          <img src={iconArchiveWhite} alt="" />
          Archiver
        </button>
      </div>

      <div
        className={`notif-row${notification.unread ? ' notif-row--unread' : ''}`}
        style={{ transform: `translateX(${translateX}px)`, transition: isDragging ? 'none' : 'transform 200ms ease' }}
        role="button"
        tabIndex={0}
        onClick={handleRowClick}
        onKeyDown={handleRowKeyDown}
        {...dragHandlers}
      >
        {typeConfig.avatarIcon ? (
          <span className="notif-row__avatar" style={{ backgroundColor: typeConfig.avatarBg }}>
            <img src={typeConfig.avatarIcon} alt="" className="notif-row__avatar-icon" />
          </span>
        ) : (
          <span className="notif-row__avatar">
            {notification.actorInitial}
            {typeConfig.badgeIcon && (
              <span className="notif-row__avatar-badge" style={{ backgroundColor: typeConfig.badgeColor }}>
                <img src={typeConfig.badgeIcon} alt="" />
              </span>
            )}
          </span>
        )}

        <div className="notif-row__body">
          <p className="notif-row__message">{notification.message}</p>
          <div className="notif-row__meta">
            <span className="notif-row__time">{notification.time}</span>
            {needsAction && (
              <button
                type="button"
                className="notif-row__reply-btn"
                onClick={e => {
                  e.stopPropagation()
                  onAction(notification)
                }}
              >
                {ACTION_LABELS[typeConfig.actionType] || 'Voir'}
                <img src={iconChevronRightFilled} alt="" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
