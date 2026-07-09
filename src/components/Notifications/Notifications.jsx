import { useEffect, useRef, useState } from 'react'
import iconBack from '../../assets/notifications/icon-back.svg'
import iconKebab from '../../assets/notifications/icon-kebab.svg'
import iconChecks from '../../assets/notifications/icon-checks.svg'
import iconTrash from '../../assets/questionnaire/icon-trash.svg'
import iconChevronDown from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import { NotificationRow } from './NotificationRow'
import { GROUP_LABELS, GROUP_ORDER, NOTIFICATION_TYPES } from './notificationsData'
import { REVIEW_TAB_A_RECUPERER } from '../../utils/reviewTabs'
import './Notifications.css'

const PAGE_SIZE = 10
// Matches the CSS animation duration on .notif-row-wrap--exiting.
const ROW_EXIT_MS = 180

// Entrance stagger for the list below the tabs (see Notifications.css's
// notifications-row-fade-up) -- capped so a long first page doesn't take
// forever to finish appearing; everything past the cap just shares the
// last delay instead of continuing to stack up.
const ROW_BASE_DELAY_MS = 140
const ROW_STAGGER_MS = 40
const ROW_STAGGER_CAP = 6

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

// Assigns each date subheader and row a single, continuously-increasing
// delay in top-to-bottom reading order across *all* groups (plus one more
// for whatever trails the list -- the empty state or "Charger plus"),
// instead of resetting per group -- a plain CSS nth-child stagger resets at
// each group's own div, which put later groups' subheaders on the same
// delay as earlier groups' rows, so elements lower on the page could
// animate in before elements above them.
function withEntranceDelays(groups) {
  let index = 0
  const nextDelay = () => {
    const delay = ROW_BASE_DELAY_MS + Math.min(index, ROW_STAGGER_CAP) * ROW_STAGGER_MS
    index += 1
    return delay
  }
  const groupsWithDelays = groups.map(group => ({
    ...group,
    delay: nextDelay(),
    items: group.items.map(notification => ({ notification, delay: nextDelay() })),
  }))
  return { groups: groupsWithDelays, trailingDelay: nextDelay() }
}

export function Notifications({
  notifications,
  onChangeNotifications,
  onNavigate,
  onOpenReviewsTab,
  onOpenReviewDetails,
  onRequestRespond,
}) {
  const [tab, setTab] = useState('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const menuRef = useRef(null)

  // Header + tabs stick to the top as one block (see .notifications__sticky-top);
  // the shadow only kicks in once the page has actually scrolled under it,
  // not while it's still sitting at the very top looking identical to a
  // non-sticky header.
  const [isScrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Switching to "Non Lue" hides the now-read rows -- only *those* fade out
  // (see .notif-row-wrap--exiting below); rows that are visible in both
  // tabs (unread ones) are never unmounted by this and so never animate at
  // all, since nothing about them actually changes. Going back to "Toute"
  // needs no exit step at all -- it only *adds* back rows that aren't in
  // the DOM yet, which get their entrance animation for free on mount.
  const [pendingRemoveIds, setPendingRemoveIds] = useState(() => new Set())
  const removeTimeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(removeTimeoutRef.current), [])

  const unreadCount = notifications.filter(n => n.unread).length
  const filtered = tab === 'unread' ? notifications.filter(n => n.unread) : notifications
  const visible = filtered.slice(0, visibleCount)
  const { groups, trailingDelay } = withEntranceDelays(groupNotifications(visible))
  const hasMore = filtered.length > visibleCount

  const handleChangeTab = nextTab => {
    if (nextTab === tab) return
    if (nextTab === 'unread') {
      const toRemove = visible.filter(n => !n.unread).map(n => n.id)
      if (toRemove.length > 0) {
        setPendingRemoveIds(new Set(toRemove))
        clearTimeout(removeTimeoutRef.current)
        removeTimeoutRef.current = setTimeout(() => {
          setTab(nextTab)
          setVisibleCount(PAGE_SIZE)
          setPendingRemoveIds(new Set())
        }, ROW_EXIT_MS)
        return
      }
    }
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

  // Every row navigates somewhere on click, not just the actionable ones --
  // actionable-and-pending rows keep their existing precise behavior
  // (respond/boost only mark read once the action truly completes); every
  // other row just marks read and jumps to wherever it's about.
  const handleRowClick = notification => {
    const actionType = NOTIFICATION_TYPES[notification.type]?.actionType
    const needsAction = notification.actionable && !notification.actionCompleted

    if (needsAction && actionType === 'respond') {
      onRequestRespond?.(notification)
      return
    }
    if (needsAction && actionType === 'boost') {
      onChangeNotifications(list =>
        list.map(n => (n.id === notification.id ? { ...n, unread: false, actionCompleted: true } : n))
      )
      onNavigate?.('send')
      return
    }

    if (notification.unread) handleMarkRead(notification.id)

    switch (notification.type) {
      case 'negativeReview':
      case 'newReview':
        // Both carry an actual review (see notificationsData.js) -- open
        // its details sheet directly instead of just landing on the
        // unfiltered list ("negativeReview" only reaches here once already
        // answered; needsAction was handled above).
        onOpenReviewDetails?.(notification.review)
        break
      case 'avisARecuperer':
        onOpenReviewsTab?.(REVIEW_TAB_A_RECUPERER)
        break
      case 'expiringDate':
        onNavigate?.('user')
        break
      case 'boostReviews':
        onNavigate?.('send')
        break
      default:
        break
    }
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
      <div className={`notifications__sticky-top${isScrolled ? ' notifications__sticky-top--stuck' : ''}`}>
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
          <div
            className="notifications__tab-indicator"
            style={{ transform: tab === 'unread' ? 'translateX(calc(100% + 8px))' : 'translateX(0%)' }}
          />
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
      </div>

      <div className="notifications__list">
        {groups.map(group => (
          <div key={group.key}>
            <div className="notifications__date-subheader" style={{ animationDelay: `${group.delay}ms` }}>
              {group.label}
            </div>
            {group.items.map(({ notification, delay }) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                animationDelay={delay}
                isExiting={pendingRemoveIds.has(notification.id)}
                onMarkRead={handleMarkRead}
                onArchive={handleArchive}
                onRowClick={handleRowClick}
              />
            ))}
          </div>
        ))}

        {groups.length === 0 && (
          <p className="notifications__empty" style={{ animationDelay: `${trailingDelay}ms` }}>
            Aucune notification
          </p>
        )}

        {hasMore && (
          <button
            type="button"
            className="notifications__load-more"
            style={{ animationDelay: `${trailingDelay}ms` }}
            onClick={handleLoadMore}
          >
            Charger plus
            <img src={iconChevronDown} alt="" />
          </button>
        )}
      </div>
    </div>
  )
}
