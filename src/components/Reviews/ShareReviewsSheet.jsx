import { useState } from 'react'
import iconOpenSite from '../../assets/reviews/icon-open-site.svg'
import iconShareLink from '../../assets/reviews/icon-share-link.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './ShareReviewsSheet.css'

const CLOSE_ANIMATION_MS = 380

export function ShareReviewsSheet({ url, onClose }) {
  useLockBodyScroll()
  const [isClosing, setIsClosing] = useState(false)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const handleOpenSite = () => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ url })
        return
      } catch {
        return
      }
    }
    navigator.clipboard?.writeText(url)
  }

  return (
    <div className={`share-reviews-sheet-overlay${isClosing ? ' share-reviews-sheet-overlay--closing' : ''}`}>
      <div className="share-reviews-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`share-reviews-sheet${isClosing && !isDragClosing ? ' share-reviews-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Partager"
        style={dragStyle}
      >
        <div className="share-reviews-sheet__handle-row" {...dragHandlers}>
          <span className="share-reviews-sheet__handle" />
        </div>

        <div className="share-reviews-sheet__content">
          <div className="share-reviews-sheet__item">
            <p className="share-reviews-sheet__url">{url}</p>
          </div>

          <button type="button" className="share-reviews-sheet__item share-reviews-sheet__item--action" onClick={handleOpenSite}>
            <span className="share-reviews-sheet__icon">
              <img src={iconOpenSite} alt="" />
            </span>
            <span className="share-reviews-sheet__text">
              <span className="share-reviews-sheet__title">Ouvrir le site</span>
              <span className="share-reviews-sheet__subtitle">Ouvre dans un nouvel onglet</span>
            </span>
          </button>

          <button
            type="button"
            className="share-reviews-sheet__item share-reviews-sheet__item--action share-reviews-sheet__item--last"
            onClick={handleShareLink}
          >
            <span className="share-reviews-sheet__icon">
              <img src={iconShareLink} alt="" />
            </span>
            <span className="share-reviews-sheet__text">
              <span className="share-reviews-sheet__title">Partager le lien</span>
              <span className="share-reviews-sheet__subtitle">Copie ou partage l&rsquo;adresse</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
