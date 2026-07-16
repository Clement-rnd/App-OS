import { useEffect, useRef, useState } from 'react'
import iconAvatarClock from '../../assets/notifications/icon-avatar-clock.svg'
import iconMoreVert from '../../assets/notifications/icon-more-vert.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import { getDaysUntil, parseReviewDate } from './filterReviews'
import './PendingReviewCard.css'

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

function formatShortDate(dateStr) {
  const date = parseReviewDate(dateStr)
  return `${date.getDate()} ${MONTHS_FR[date.getMonth()]}`
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
        fill="currentColor"
      />
    </svg>
  )
}

export function PendingReviewCard({ item, onOpenResend, onEdit, onArchiveRequest, onUnarchive }) {
  const [isMenuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return
    const handlePointerDown = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [isMenuOpen])

  const daysLeft = getDaysUntil(item.expiryDate)
  const expiryLabel =
    daysLeft < 0
      ? 'Expiré'
      : daysLeft === 0
        ? "Expire aujourd'hui"
        : `Expire dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`

  return (
    <div className="pending-card">
      <div className="pending-card__top">
        <p className="pending-card__author">{item.author}</p>
        <div className="pending-card__menu-anchor" ref={menuRef}>
          <button
            type="button"
            className="pending-card__menu-btn"
            onClick={() => setMenuOpen(open => !open)}
            aria-label="Plus d'options"
          >
            <img src={iconMoreVert} alt="" />
          </button>
          {isMenuOpen && (
            <div className="pending-card__menu" role="menu">
              {item.archived ? (
                <button
                  type="button"
                  className="pending-card__menu-item"
                  onClick={() => {
                    setMenuOpen(false)
                    onUnarchive?.(item)
                  }}
                >
                  Désarchiver
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="pending-card__menu-item"
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit?.(item)
                    }}
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    className="pending-card__menu-item pending-card__menu-item--danger"
                    onClick={() => {
                      setMenuOpen(false)
                      onArchiveRequest?.(item)
                    }}
                  >
                    Archiver
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pending-card__service-row">
        <span className="pending-card__service">{item.service}</span>
        {item.certification === 'certifie-os' && (
          <span className="pending-card__cert">
            <img src={logoIconSmall} alt="" />
            Certifié OS
          </span>
        )}
      </div>

      <div className="pending-card__expiry">
        <img src={iconAvatarClock} alt="" />
        {item.archived ? 'Archivé' : expiryLabel}
      </div>

      <p className="pending-card__meta">
        Envoyé le {formatShortDate(item.sentDate)}
        {item.relanceDate && <> • Relancé le {formatShortDate(item.relanceDate)}</>}
      </p>

      <div className="pending-card__footer">
        <button type="button" className="pending-card__resend-btn" onClick={() => onOpenResend?.(item)}>
          <RefreshIcon />
          Renvoyer
        </button>
      </div>
    </div>
  )
}
