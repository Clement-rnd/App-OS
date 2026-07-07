import { useState } from 'react'
import iconBack from '../../assets/reviews/icon-back.svg'
import iconShare from '../../assets/reviews/icon-share.svg'
import iconChevronBig from '../../assets/reviews/icon-chevron-big.svg'
import iconOsLogoColor from '../../assets/reviews/icon-os-logo-color.svg'
import iconGoogleBadge from '../../assets/reviews/icon-google-badge.svg'
import iconFunnel from '../../assets/reviews/icon-funnel.svg'
import iconSort from '../../assets/reviews/icon-sort.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconStar from '../../assets/home/icon-star.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconArrowReply from '../../assets/home/icon-arrow-reply.svg'
import iconChevronRight from '../../assets/home/icon-chevron-right.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import { BottomNav } from '../BottomNav/BottomNav'
import { ShareReviewsSheet } from './ShareReviewsSheet'
import { CompanySelectSheet, COMPANIES } from './CompanySelectSheet'
import './Reviews.css'

const tabs = [
  { value: '12', label: 'Sans Réponses' },
  { value: '2', label: 'Avis Négatifs' },
  { value: '5', label: 'A Récupérer' },
]

const reviews = [
  {
    id: 1,
    author: 'Jean David Lepinieux',
    rating: '4.5',
    date: '06/09/2026',
    text: "Une expérience fantastique du début à la fin ! L'équipe était professionnelle, réactive et a vraiment compris ce que je voulais atteindre a...",
  },
  {
    id: 2,
    author: 'Jean David Lepinieux',
    rating: '4.5',
    date: '06/09/2026',
    text: "Une expérience fantastique du début à la fin ! L'équipe était professionnelle, réactive et a vraiment compris ce que je voulais atteindre a...",
  },
  {
    id: 3,
    author: 'Jean David Lepinieux',
    rating: '4.5',
    date: '06/09/2026',
    text: "Une expérience fantastique du début à la fin ! L'équipe était professionnelle, réactive et a vraiment compris ce que je voulais atteindre a...",
  },
]

function ReviewCard({ review }) {
  return (
    <div className="reviews__card">
      <div className="reviews__card-title">
        <p className="reviews__card-author">{review.author}</p>
        <div className="reviews__card-score">
          <img src={iconReviewRating} alt="" />
          <span>{review.rating}</span>
        </div>
      </div>

      <div className="reviews__card-meta">
        <span className="reviews__card-date">{review.date}</span>
        <div className="reviews__card-stars">
          {Array.from({ length: 4 }).map((_, i) => (
            <img key={i} src={iconStar} alt="" className="reviews__star" />
          ))}
          <span className="reviews__star reviews__star--half">
            <img src={iconStar} alt="" className="reviews__star-bg" />
            <img src={iconStar} alt="" className="reviews__star-fg" />
          </span>
        </div>
      </div>

      <div className="reviews__card-chips">
        <span className="reviews__chip reviews__chip--promoter">Promoteur</span>
        <span className="reviews__chip reviews__chip--muted">
          <img src={logoIconSmall} alt="" />
          Certifié OS
        </span>
        <span className="reviews__chip reviews__chip--muted">
          <img src={iconGoogle} alt="" />
          Partagé
        </span>
      </div>

      <p className="reviews__card-text">{review.text}</p>

      <div className="reviews__card-actions">
        <button type="button" className="reviews__card-action">
          <img src={iconArrowReply} alt="" />
          Répondre
        </button>
        <button type="button" className="reviews__card-action reviews__card-action--end">
          Détails
          <img src={iconChevronRight} alt="" />
        </button>
      </div>
    </div>
  )
}

export function Reviews({ onNavigate }) {
  const [isShareSheetOpen, setShareSheetOpen] = useState(false)
  const [isCompanySheetOpen, setCompanySheetOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0])

  return (
    <div className="reviews">
      <header className="reviews__header">
        <div className="reviews__status-bar" />
        <div className="reviews__appbar">
          <button type="button" className="reviews__icon-btn" aria-label="Retour" onClick={() => onNavigate?.('home')}>
            <img src={iconBack} alt="" />
          </button>
          <h1 className="reviews__title">Mes Avis</h1>
          <button
            type="button"
            className="reviews__icon-btn reviews__icon-btn--share"
            aria-label="Partager"
            onClick={() => setShareSheetOpen(true)}
          >
            <img src={iconShare} alt="" />
          </button>
        </div>

        <div className="reviews__summary">
          <button
            type="button"
            className="reviews__summary-row reviews__summary-row--border reviews__summary-row--clickable"
            onClick={() => setCompanySheetOpen(true)}
          >
            <p className="reviews__summary-label">votre entreprise</p>
            <div className="reviews__summary-value-row">
              <span className="reviews__summary-value">{selectedCompany.name}</span>
              <img src={iconChevronBig} alt="" className="reviews__summary-chevron" />
            </div>
          </button>

          <div className="reviews__summary-row reviews__summary-row--border">
            <p className="reviews__summary-label">Collaborateur</p>
            <div className="reviews__summary-value-row">
              <span className="reviews__summary-value">Tous les collaborateurs</span>
              <img src={iconChevronBig} alt="" className="reviews__summary-chevron" />
            </div>
          </div>

          <div className="reviews__kpis">
            <div className="reviews__kpi">
              <div className="reviews__kpi-title">
                <img src={iconOsLogoColor} alt="" />
                <span>Opinion System</span>
              </div>
              <div className="reviews__kpi-value-row">
                <p className="reviews__kpi-value">
                  4.5<span className="reviews__kpi-value-suffix">/5</span>
                </p>
                <span className="reviews__kpi-badge">327 AVIS</span>
              </div>
            </div>
            <div className="reviews__kpi">
              <div className="reviews__kpi-title">
                <img src={iconGoogleBadge} alt="" />
                <span>Google</span>
              </div>
              <div className="reviews__kpi-value-row">
                <p className="reviews__kpi-value">
                  4.2<span className="reviews__kpi-value-suffix">/5</span>
                </p>
                <span className="reviews__kpi-badge">200 AVIS</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="reviews__panel">
        <div className="reviews__tabs">
          {tabs.map(tab => (
            <div className="reviews__tab" key={tab.label}>
              <p className="reviews__tab-value">{tab.value}</p>
              <p className="reviews__tab-label">{tab.label}</p>
            </div>
          ))}
        </div>

        <div className="reviews__list">
          <div className="reviews__filters">
            <button type="button" className="reviews__filter-chip">
              <img src={iconFunnel} alt="" />
              Filtres
            </button>
            <button type="button" className="reviews__filter-chip">
              <img src={iconSort} alt="" />
              Plus récent
            </button>
            <span className="reviews__results-count">15 résultats</span>
          </div>

          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      </div>

      <BottomNav active="chat" onNavigate={onNavigate} badges={{ chat: 8 }} />

      {isShareSheetOpen && (
        <ShareReviewsSheet url="https://sofakingdomrealtors.com" onClose={() => setShareSheetOpen(false)} />
      )}

      {isCompanySheetOpen && (
        <CompanySelectSheet
          selectedId={selectedCompany.id}
          onClose={() => setCompanySheetOpen(false)}
          onSelect={setSelectedCompany}
        />
      )}
    </div>
  )
}
