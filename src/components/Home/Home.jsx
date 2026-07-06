import { useEffect, useRef, useState } from 'react'
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
import { getNpsCategory } from '../../utils/nps'
import './Home.css'

const initialReviews = [
  {
    id: 1,
    author: 'Jean David Lépineux',
    rating: '4.5',
    date: '06/09/2026',
    text: "Une expérience fantastique du début à la fin ! L'équipe était professionel et m'ont aider à chaque étape du processus, je recommande vivement leurs services.",
    npsScore: 10,
    service: 'Vente de propriété',
    googleShared: false,
    ratings: { reception: 5, qualite: 4, communication: 5, delais: 4 },
    response: null,
  },
  {
    id: 2,
    author: 'Amélie Rousseau',
    rating: '3.5',
    date: '05/09/2026',
    text: "Service rapide et efficace, seul bémol le délai d'attente initial mais le résultat final était à la hauteur de nos attentes.",
    npsScore: 6,
    service: 'Location de propriété',
    googleShared: true,
    ratings: { reception: 4, qualite: 4, communication: 3, delais: 3 },
    response: null,
  },
  {
    id: 3,
    author: 'Sophie Marchand',
    rating: '5.0',
    date: '04/09/2026',
    text: 'Un accompagnement impeccable du début à la fin, je recommande vivement cette agence à tous ceux qui cherchent un service de qualité.',
    npsScore: 10,
    service: 'Vente de propriété',
    googleShared: false,
    ratings: { reception: 5, qualite: 5, communication: 5, delais: 5 },
    response: null,
  },
  {
    id: 4,
    author: 'Marc Villeneuve',
    rating: '4.0',
    date: '02/09/2026',
    text: "Bonne expérience globale, quelques délais de réponse mais l'équipe a su nous rassurer et répondre à toutes nos questions.",
    npsScore: 7,
    service: 'Estimation immobilière',
    googleShared: false,
    ratings: { reception: 4, qualite: 4, communication: 3, delais: 2 },
    response: null,
  },
  {
    id: 5,
    author: 'Claire Dubois',
    rating: '4.5',
    date: '30/08/2026',
    text: 'Très professionnel et à l’écoute de nos besoins, un grand merci pour leur réactivité et leur suivi personnalisé.',
    npsScore: 9,
    service: 'Vente de propriété',
    googleShared: true,
    ratings: { reception: 5, qualite: 4, communication: 4, delais: 4 },
    response: null,
  },
  {
    id: 6,
    author: 'Chris P. Bacon',
    rating: '2.0',
    date: '06/09/2026',
    text: 'Une expérience horrible du début à la fin. Personne ne répondait à mes messages et le suivi du dossier a été très mal géré.',
    npsScore: 2,
    service: 'Location de propriété',
    googleShared: false,
    ratings: { reception: 2, qualite: 1, communication: 1, delais: 2 },
    response: null,
  },
]

const NPS_CHIP_CLASS = {
  Promoteur: 'home__chip--promoter',
  Passif: 'home__chip--passive',
  Détracteur: 'home__chip--detractor',
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
        <span className="home__chip home__chip--muted">
          <img src={logoIconSmall} alt="" />
          Certifié OS
        </span>
        <span className="home__chip home__chip--muted">
          <img src={iconGoogle} alt="" />
          {review.googleShared ? 'Partagé' : 'Non partagé'}
        </span>
      </div>

      <p className="home__review-text">{review.text}</p>

      <div className="home__review-actions">
        {!review.response && (
          <button
            type="button"
            className="home__review-action"
            onClick={e => {
              e.stopPropagation()
              onOpenRespond?.(review)
            }}
          >
            <img src={iconArrowReply} alt="" />
            Répondre
          </button>
        )}
        <button type="button" className="home__review-action home__review-action--end">
          Détails
          <img src={iconChevronRight} alt="" />
        </button>
      </div>
    </div>
  )
}

const REVIEW_CARD_STEP = 312 + 16 // card width + gap

export function Home({ onNavigate, onOpenQuestionnaire }) {
  const reviewsScrollerRef = useRef(null)
  const [reviews, setReviews] = useState(initialReviews)
  const [activeReviewIndex, setActiveReviewIndex] = useState(0)
  const [selectedReview, setSelectedReview] = useState(null)
  const [respondingReview, setRespondingReview] = useState(null)
  const [showResponseAlert, setShowResponseAlert] = useState(false)
  const [responseAlertText, setResponseAlertText] = useState('')

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
    setResponseAlertText(wasEditing ? 'Une reponse a ete modifiee' : 'Une reponse a ete envoye')
    setShowResponseAlert(true)
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

  useEffect(() => {
    if (!showResponseAlert) return
    const timer = setTimeout(() => setShowResponseAlert(false), 4000)
    return () => clearTimeout(timer)
  }, [showResponseAlert])

  return (
    <div className="home">
      <header className="home__header">
        <div className="home__status-bar" />
        <div className="home__appbar">
          <img className="home__logo" src={logoCompact} alt="Opinion System" />
          <button className="home__notif-btn" type="button" aria-label="Notifications">
            <img src={iconBell} alt="" />
            <span className="home__notif-badge">1</span>
          </button>
        </div>
      </header>

      <div className="home__content">
        <div className="home__greeting">
          <div className="home__greeting-text">
            <p className="home__greeting-name">Annie Mation</p>
            <div className="home__greeting-company">
              <span>Bastien Arfi Immobilier</span>
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
          <div className="home__stat home__stat--tint">
            <p className="home__stat-label">Avis collectés</p>
            <div className="home__stat-value-row">
              <p className="home__stat-value home__stat-value--medium">527</p>
              <img src={iconStatReviews} alt="" className="home__stat-icon" />
            </div>
          </div>
          <div className="home__stat home__stat--light">
            <p className="home__stat-label home__stat-label--dark">Avis sans réponse</p>
            <div className="home__stat-value-row">
              <p className="home__stat-value home__stat-value--medium home__stat-value--dark">17</p>
              <img src={iconStatChevron} alt="" className="home__stat-icon" />
            </div>
          </div>
          <div className="home__stat home__stat--light">
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

      <BottomNav active="home" onNavigate={onNavigate} badges={{ chat: 8 }} />

      {selectedReview && (
        <ReviewDetailSheet
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onOpenRespond={handleOpenRespond}
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

      {showResponseAlert && (
        <div className="home__response-alert" role="status">
          <p className="home__response-alert-text">{responseAlertText}</p>
          <button
            type="button"
            className="home__response-alert-close"
            onClick={() => setShowResponseAlert(false)}
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
              <path
                d="M15.1828 3.93281C15.4268 3.68883 15.8225 3.68903 16.0666 3.93281C16.3107 4.17688 16.3107 4.57252 16.0666 4.8166L10.883 9.99921L16.0666 15.1828C16.3107 15.4269 16.3107 15.8225 16.0666 16.0666C15.8225 16.3107 15.4269 16.3107 15.1828 16.0666L9.99921 10.883L4.8166 16.0666C4.57252 16.3107 4.17688 16.3107 3.93281 16.0666C3.68903 15.8225 3.68883 15.4268 3.93281 15.1828L9.11542 9.99921L3.93281 4.8166C3.68912 4.57249 3.68886 4.17675 3.93281 3.93281C4.17675 3.68886 4.57249 3.68912 4.8166 3.93281L9.99921 9.11542L15.1828 3.93281Z"
                fill="#4294f7"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
