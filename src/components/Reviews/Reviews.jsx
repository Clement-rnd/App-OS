import { useEffect, useRef, useState } from 'react'
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
import { CollaboratorSelectSheet, COLLABORATORS } from './CollaboratorSelectSheet'
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

const NAME_EXIT_MS = 180

export function Reviews({ onNavigate }) {
  const [isShareSheetOpen, setShareSheetOpen] = useState(false)
  const [isCompanySheetOpen, setCompanySheetOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0])
  const [displayedCompany, setDisplayedCompany] = useState(COMPANIES[0])
  const [isCompanyNameExiting, setCompanyNameExiting] = useState(false)
  const companyExitTimeoutRef = useRef(null)

  const [isCollaboratorSheetOpen, setCollaboratorSheetOpen] = useState(false)
  const [selectedCollaborator, setSelectedCollaborator] = useState(COLLABORATORS[0])
  const [displayedCollaborator, setDisplayedCollaborator] = useState(COLLABORATORS[0])
  const [isCollaboratorNameExiting, setCollaboratorNameExiting] = useState(false)
  const collaboratorExitTimeoutRef = useRef(null)

  useEffect(() => {
    if (selectedCompany.id === displayedCompany.id) return
    setCompanyNameExiting(true)
    companyExitTimeoutRef.current = setTimeout(() => {
      setDisplayedCompany(selectedCompany)
      setCompanyNameExiting(false)
    }, NAME_EXIT_MS)
    return () => clearTimeout(companyExitTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany])

  useEffect(() => {
    if (selectedCollaborator.id === displayedCollaborator.id) return
    setCollaboratorNameExiting(true)
    collaboratorExitTimeoutRef.current = setTimeout(() => {
      setDisplayedCollaborator(selectedCollaborator)
      setCollaboratorNameExiting(false)
    }, NAME_EXIT_MS)
    return () => clearTimeout(collaboratorExitTimeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCollaborator])

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
              <span
                key={displayedCompany.id}
                className={`reviews__summary-value${isCompanyNameExiting ? ' reviews__summary-value--exiting' : ''}`}
              >
                {displayedCompany.name}
              </span>
              <img src={iconChevronBig} alt="" className="reviews__summary-chevron" />
            </div>
          </button>

          <button
            type="button"
            className="reviews__summary-row reviews__summary-row--border reviews__summary-row--clickable"
            onClick={() => setCollaboratorSheetOpen(true)}
          >
            <p className="reviews__summary-label">Collaborateur</p>
            <div className="reviews__summary-value-row">
              <span
                key={displayedCollaborator.id}
                className={`reviews__summary-value${isCollaboratorNameExiting ? ' reviews__summary-value--exiting' : ''}`}
              >
                {displayedCollaborator.name}
              </span>
              <img src={iconChevronBig} alt="" className="reviews__summary-chevron" />
            </div>
          </button>

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
          onSelect={company => {
            setSelectedCompany(company)
            setCompanySheetOpen(false)
          }}
        />
      )}

      {isCollaboratorSheetOpen && (
        <CollaboratorSelectSheet
          selectedId={selectedCollaborator.id}
          onClose={() => setCollaboratorSheetOpen(false)}
          onSelect={collaborator => {
            setSelectedCollaborator(collaborator)
            setCollaboratorSheetOpen(false)
          }}
        />
      )}
    </div>
  )
}
