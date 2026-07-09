import { useRef, useState } from 'react'
import logoCompact from '../../assets/home/logo-compact.svg'
import iconBell from '../../assets/home/icon-bell.svg'
import iconStatReviews from '../../assets/home/icon-stat-reviews.svg'
import iconStatChevron from '../../assets/home/icon-stat-chevron.svg'
import phoneIllustration1 from '../../assets/home/phone-illustration-1.svg'
import phoneIllustration2 from '../../assets/home/phone-illustration-2.svg'
import phoneIllustration3 from '../../assets/home/phone-illustration-3.svg'
import backgroundStars from '../../assets/home/background-stars.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconArrowReply from '../../assets/home/icon-arrow-reply.svg'
import iconChevronRight from '../../assets/home/icon-chevron-right.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import { BottomNav } from '../BottomNav/BottomNav'
import { StarRating } from '../StarRating/StarRating'
import { ReviewDetailSheet } from './ReviewDetailSheet'
import { RespondSheet } from './RespondSheet'
import { ResponseAlert } from '../ResponseAlert/ResponseAlert'
import { getNpsCategory } from '../../utils/nps'
import { CANONICAL_REVIEWS } from '../../data/canonicalReviews'
import { REVIEW_TAB_SANS_REPONSE, REVIEW_TAB_A_RECUPERER } from '../../utils/reviewTabs'
import './Home.css'

const initialReviews = CANONICAL_REVIEWS.map(review => ({ ...review, response: null }))

const NPS_CHIP_CLASS = {
  Promoteur: 'home__chip--promoter',
  Passif: 'home__chip--passive',
  Détracteur: 'home__chip--detractor',
}

function ReplyBubbleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5058 3.78512C10.5024 3.65956 8.52201 4.2696 6.93648 5.5007C5.35095 6.7318 4.26931 8.4993 3.89461 10.4714C3.5199 12.4435 3.87792 14.4845 4.90143 16.2113C5.00625 16.3882 5.03388 16.6003 4.97788 16.7981L4.09948 19.9005L7.20193 19.0221L7.40625 19.7438L7.78866 19.0986C9.51549 20.1221 11.5565 20.4801 13.5286 20.1054C15.5007 19.7307 17.2682 18.649 18.4993 17.0635C19.7304 15.478 20.3404 13.4976 20.2149 11.4942C20.0893 9.49074 19.2368 7.60203 17.8174 6.1826C16.398 4.76318 14.5093 3.91067 12.5058 3.78512ZM7.30808 20.551C9.28697 21.6359 11.5849 22.0015 13.8086 21.579C16.1397 21.1361 18.2289 19.8576 19.6841 17.9835C21.1393 16.1093 21.8604 13.7685 21.7119 11.4004C21.5635 9.03225 20.5558 6.79974 18.8781 5.12194C17.2003 3.44415 14.9678 2.43646 12.5996 2.28805C10.2315 2.13964 7.89068 2.86072 6.01654 4.31591C4.14241 5.77111 2.86388 7.86034 2.42097 10.1914C1.99845 12.4151 2.36411 14.713 3.44897 16.6919L2.65409 19.4994C2.58005 19.755 2.57576 20.0257 2.64172 20.2836C2.70799 20.5426 2.84273 20.7791 3.03181 20.9682C3.2209 21.1573 3.45738 21.292 3.71644 21.3583C3.97429 21.4242 4.24507 21.42 4.50067 21.3459L7.30808 20.551Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25 10.5C8.25 10.0858 8.58579 9.75 9 9.75H15C15.4142 9.75 15.75 10.0858 15.75 10.5C15.75 10.9142 15.4142 11.25 15 11.25H9C8.58579 11.25 8.25 10.9142 8.25 10.5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25 13.5C8.25 13.0858 8.58579 12.75 9 12.75H15C15.4142 12.75 15.75 13.0858 15.75 13.5C15.75 13.9142 15.4142 14.25 15 14.25H9C8.58579 14.25 8.25 13.9142 8.25 13.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function ReviewCard({ review, onOpenDetails, onOpenRespond }) {
  const rating = parseFloat(review.rating)
  const npsCategory = getNpsCategory(rating)

  return (
    <div
      className="home__review-card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(review)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onOpenDetails?.(review)
      }}
    >
      <div className="home__review-title">
        <p className="home__review-author">{review.author}</p>
        <div className="home__review-score">
          <img src={iconReviewRating} alt="" />
          <span>{review.rating}</span>
        </div>
      </div>

      <div className="home__review-meta">
        <span className="home__review-date">{review.date}</span>
        <StarRating rating={rating} />
      </div>

      <div className="home__review-chips">
        <span className={`home__chip ${NPS_CHIP_CLASS[npsCategory]}`}>{npsCategory}</span>
        {review.certification !== 'standard-os' && (
          <span className="home__chip home__chip--muted">
            <img src={logoIconSmall} alt="" />
            Certifié OS
          </span>
        )}
        <span className="home__chip home__chip--muted">
          <img src={iconGoogle} alt="" />
          {review.googleShared ? 'Partagé' : 'Non partagé'}
        </span>
      </div>

      <p className="home__review-text">{review.text}</p>

      <div className="home__review-actions">
        <button
          type="button"
          className={`home__review-action${review.response ? ' home__review-action--responded' : ''}`}
          onClick={e => {
            e.stopPropagation()
            if (review.response) onOpenDetails?.(review)
            else onOpenRespond?.(review)
          }}
        >
          {review.response ? <ReplyBubbleIcon /> : <img src={iconArrowReply} alt="" />}
          {review.response ? 'Répondu' : 'Répondre'}
        </button>
        <button type="button" className="home__review-action home__review-action--end">
          Détails
          <img src={iconChevronRight} alt="" />
        </button>
      </div>
    </div>
  )
}

const REVIEW_CARD_STEP = 312 + 16 // card width + gap

export function Home({ onNavigate, onOpenQuestionnaire, onOpenNotifications, onOpenReviewsTab, unreadNotifCount = 0 }) {
  const reviewsScrollerRef = useRef(null)
  const [reviews, setReviews] = useState(initialReviews)
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [selectedReview, setSelectedReview] = useState(null)
  const [respondingReview, setRespondingReview] = useState(null)
  const [responseAlert, setResponseAlert] = useState(null)

  const handleOpenRespond = review => {
    setSelectedReview(null)
    setRespondingReview(review)
  }

  const handleSubmitResponse = (review, responseText) => {
    const wasEditing = Boolean(review.response)
    const updatedReview = { ...review, response: responseText }
    setReviews(list => list.map(r => (r.id === review.id ? updatedReview : r)))
    setRespondingReview(null)
    setSelectedReview(updatedReview)
    setResponseAlert(wasEditing ? 'Une réponse a été modifiée' : 'Une réponse a été envoyée')
  }

  const handleDeleteResponse = review => {
    const updatedReview = { ...review, response: null }
    setReviews(list => list.map(r => (r.id === review.id ? updatedReview : r)))
    setRespondingReview(null)
    setSelectedReview(updatedReview)
  }

  const handleReviewsScroll = () => {
    const scroller = reviewsScrollerRef.current
    if (!scroller) return
    const index = Math.round(scroller.scrollLeft / REVIEW_CARD_STEP)
    setActiveReviewIndex(Math.max(0, Math.min(index, reviews.length - 1)))
  }

  const unansweredCount = reviews.filter(review => !review.response).length

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__status-bar" />
        <div className="home__appbar">
          <img className="home__logo" src={logoCompact} alt="Opinion System" />
          <button
            className="home__notif-btn"
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
          >
            <img src={iconBell} alt="" />
            {unreadNotifCount > 0 && <span className="home__notif-badge">{unreadNotifCount}</span>}
          </button>
        </div>
      </header>

      <div className="home__content">
        <div className="home__greeting">
          <div className="home__greeting-text">
            <p className="home__greeting-name">Olivier Dubois</p>
            <div className="home__greeting-company">
              <span>La Boite Immobilier</span>
            </div>
          </div>
          <div className="home__reputation">
            <span className="home__reputation-dot" />
            Réputation excellente
          </div>
        </div>

        <div className="home__dashboard">
          <div className="home__stat home__stat--tint">
            <p className="home__stat-label">Ma note Opinion System</p>
            <div className="home__stat-value-row">
              <p className="home__stat-value">
                4<span className="home__stat-value-sep">,</span>7<span className="home__stat-value-suffix">/5</span>
              </p>
              <svg
                className="home__stat-icon home__stat-icon--logo"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M14.3066 7.99998C14.3066 11.6309 11.2381 14.5452 7.55283 14.2911C4.443 14.0767 1.92349 11.5573 1.7089 8.44752C1.4546 4.76212 4.36894 1.69344 7.99997 1.69344C9.09669 1.69344 10.1277 1.9738 11.0261 2.46611L12.2187 1.20334C10.8652 0.361376 9.24288 -0.089147 7.50887 0.0147358C3.49549 0.255176 0.247282 3.50822 0.0139174 7.52202C-0.109228 9.64011 0.592181 11.5928 1.82698 13.0889L1.04719 15.6519C0.995203 15.8227 1.14643 15.9864 1.32086 15.948L4.57653 15.2314C5.72314 15.7752 7.01905 16.0555 8.38672 15.9908C12.4989 15.7965 15.8304 12.4374 15.9936 8.32387C16.0561 6.74748 15.6598 5.26902 14.931 4.00673L13.8493 5.64247C14.1432 6.37098 14.3066 7.1662 14.3066 7.99998Z"
                  fill="#ffffff"
                />
                <path
                  d="M15.2194 0.306195L8.00714 7.94269L5.5528 5.82212L4.82573 6.54915L3.83049 7.58653L8.00714 11.6391L15.4043 0.452399C15.4834 0.331654 15.3186 0.201358 15.2194 0.306195Z"
                  fill="#23ad85"
                />
              </svg>
            </div>
          </div>
          <div
            className="home__stat home__stat--tint home__stat--clickable"
            role="button"
            tabIndex={0}
            onClick={() => onNavigate?.('chat')}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNavigate?.('chat')
              }
            }}
          >
            <p className="home__stat-label">Avis collectés</p>
            <div className="home__stat-value-row">
              <p className="home__stat-value home__stat-value--medium">527</p>
              <img src={iconStatReviews} alt="" className="home__stat-icon" />
            </div>
          </div>
          <div
            className="home__stat home__stat--light home__stat--clickable"
            role="button"
            tabIndex={0}
            onClick={() => onOpenReviewsTab?.(REVIEW_TAB_SANS_REPONSE)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenReviewsTab?.(REVIEW_TAB_SANS_REPONSE)
              }
            }}
          >
            <p className="home__stat-label home__stat-label--dark">Avis sans réponse</p>
            <div className="home__stat-value-row">
              <p className="home__stat-value home__stat-value--medium home__stat-value--dark">
                {String(unansweredCount).padStart(2, '0')}
              </p>
              <img src={iconStatChevron} alt="" className="home__stat-icon" />
            </div>
          </div>
          <div
            className="home__stat home__stat--light home__stat--clickable"
            role="button"
            tabIndex={0}
            onClick={() => onOpenReviewsTab?.(REVIEW_TAB_A_RECUPERER)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpenReviewsTab?.(REVIEW_TAB_A_RECUPERER)
              }
            }}
          >
            <p className="home__stat-label home__stat-label--dark">Avis à récupérer</p>
            <div className="home__stat-value-row">
              <p className="home__stat-value home__stat-value--medium home__stat-value--dark">06</p>
              <img src={iconStatChevron} alt="" className="home__stat-icon" />
            </div>
          </div>
        </div>

        <div className="home__cta">
          <div className="home__cta-text">
            <h2 className="home__cta-heading">
              Améliorez
              <br />
              votre réputation
            </h2>
            <p className="home__cta-subtext">en envoyant des questionnaires</p>
            <button type="button" className="home__cta-btn" onClick={onOpenQuestionnaire}>
              Récolter des avis
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="18" height="18">
                <path
                  d="M13.557 1.25573C14.3301 0.998052 15.0853 1.72885 14.8245 2.51598L14.825 2.51647L10.9447 14.2816L10.9442 14.2831C10.6654 15.1195 9.52524 15.2129 9.11361 14.4398L6.51595 9.5609L1.71224 7.03258C0.933117 6.62295 1.02313 5.48021 1.86166 5.20055L13.555 1.25622L13.557 1.25573ZM2.1805 6.14831L7.118 8.74743L7.18148 8.78698C7.24153 8.83115 7.29117 8.88859 7.3265 8.95495L9.99496 13.9672L9.99545 13.9667L13.8748 2.20446L13.8739 2.20397L2.1805 6.14831Z"
                  fill="#041b44"
                />
                <path
                  d="M9.39619 6.04697C9.59126 5.85156 9.90778 5.85098 10.1032 6.046C10.2986 6.24108 10.2988 6.55759 10.1037 6.75303L7.279 9.58311C7.08399 9.77847 6.76742 9.77896 6.57197 9.58408C6.37654 9.38899 6.37591 9.072 6.571 8.87656L9.39619 6.04697Z"
                  fill="#041b44"
                />
              </svg>
            </button>
          </div>
          <img src={backgroundStars} alt="" className="home__cta-illustration-bg" />
          <div className="home__cta-illustration">
            <img src={phoneIllustration1} alt="" className="home__cta-illustration-phone" />
            <img src={phoneIllustration2} alt="" className="home__cta-illustration-shadow" />
            <img src={phoneIllustration3} alt="" className="home__cta-illustration-star" />
          </div>
        </div>
      </div>

      <div className="home__reviews">
        <div className="home__reviews-header">
          <p className="home__reviews-title">Derniers avis reçus</p>
          <button type="button" className="home__reviews-see-all">
            Voir tout
          </button>
        </div>

        <div className="home__reviews-scroller" ref={reviewsScrollerRef} onScroll={handleReviewsScroll}>
          {reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onOpenDetails={setSelectedReview}
              onOpenRespond={handleOpenRespond}
            />
          ))}
        </div>

        <div className="home__reviews-dots">
          {reviews.map((review, index) => (
            <span
              key={review.id}
              className={`home__dot${index === activeReviewIndex ? ' home__dot--active' : ''}`}
            />
          ))}
        </div>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />

      {selectedReview && (
        <ReviewDetailSheet
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSubmit={handleSubmitResponse}
          onDelete={handleDeleteResponse}
        />
      )}

      {respondingReview && (
        <RespondSheet
          review={respondingReview}
          onClose={() => setRespondingReview(null)}
          onSubmit={handleSubmitResponse}
          onDelete={handleDeleteResponse}
        />
      )}

      {responseAlert && <ResponseAlert message={responseAlert} onClose={() => setResponseAlert(null)} />}
    </div>
  )
}
