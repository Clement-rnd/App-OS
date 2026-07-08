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
import iconChevronDown from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import { BottomNav } from '../BottomNav/BottomNav'
import { RespondSheet } from '../Home/RespondSheet'
import { ShareReviewsSheet } from './ShareReviewsSheet'
import { CompanySelectSheet, COMPANIES } from './CompanySelectSheet'
import { CollaboratorSelectSheet, COLLABORATORS } from './CollaboratorSelectSheet'
import { ReviewDetailsSheet } from './ReviewDetailsSheet'
import iconPillClose from '../../assets/reviews/icon-pill-close.svg'
import { COMPANY_REVIEWS_DATA } from './mockReviewsData'
import {
  FiltersSheet,
  EMPTY_FILTERS,
  countActiveFilters,
  getActiveFilterEntries,
  removeFilterEntry,
} from './FiltersSheet'
import { reviewMatchesFilters, parseReviewDate, getNpsFilterId } from './filterReviews'
import { getNpsCategory } from '../../utils/nps'
import './Reviews.css'

const PAGE_SIZE = 10

const NPS_CHIP_CLASS = {
  Promoteur: 'reviews__chip--promoter',
  Passif: 'reviews__chip--passive',
  Détracteur: 'reviews__chip--detractor',
}

// Each tab is a shortcut onto the same etat/nps filter groups the Filtres
// sheet already exposes (not a separate filter dimension), so tapping a
// tab and picking the equivalent chips in the sheet stay in sync with each
// other. Exclusive (radio-like): selecting one replaces whatever etat/nps
// combination was active, since combining them freely would make two tabs
// appear partially active at once.
const TAB_DEFS = [
  { label: 'Sans Réponses', etat: ['sans-reponse'], nps: [], tone: 'info' },
  { label: 'Avis Négatifs', etat: [], nps: ['detracteur'], tone: 'danger' },
  { label: 'À Récupérer', etat: ['sans-reponse'], nps: ['detracteur'], tone: 'warning' },
]

function sameFilterSet(a, b) {
  return a.length === b.length && a.every(id => b.includes(id))
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
  const npsCategory = getNpsCategory(parseFloat(review.rating))

  return (
    <div
      className="reviews__card"
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetails?.(review)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onOpenDetails?.(review)
      }}
    >
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
        <span className={`reviews__chip ${NPS_CHIP_CLASS[npsCategory]}`}>{npsCategory}</span>
        {review.certification === 'certifie-os' && (
          <span className="reviews__chip reviews__chip--muted">
            <img src={logoIconSmall} alt="" />
            Certifié OS
          </span>
        )}
        <span className="reviews__chip reviews__chip--muted">
          <img src={iconGoogle} alt="" />
          {review.googleSharing === 'google-partage' ? 'Partagé' : 'Non partagé'}
        </span>
      </div>

      <p className="reviews__card-text">{review.text}</p>

      <div className="reviews__card-actions">
        <button
          type="button"
          className={`reviews__card-action${review.response ? ' reviews__card-action--responded' : ''}`}
          onClick={e => {
            e.stopPropagation()
            if (review.response) onOpenDetails?.(review)
            else onOpenRespond?.(review)
          }}
        >
          {review.response ? <ReplyBubbleIcon /> : <img src={iconArrowReply} alt="" />}
          {review.response ? 'Répondu' : 'Répondre'}
        </button>
        <button type="button" className="reviews__card-action reviews__card-action--end">
          Détails
          <img src={iconChevronRight} alt="" />
        </button>
      </div>
    </div>
  )
}

function FiltersRow({ dark, activeFilters, activeFilterEntries, removeActiveFilter, resultsCount, onOpenFilters }) {
  return (
    <div className={`reviews__filters${dark ? ' reviews__filters--dark' : ''}`}>
      <div className="reviews__filters-row">
        <button
          type="button"
          className={`reviews__filter-chip${dark ? ' reviews__filter-chip--dark' : ''}${
            countActiveFilters(activeFilters) > 0 ? ' reviews__filter-chip--active' : ''
          }`}
          onClick={onOpenFilters}
        >
          <img src={iconFunnel} alt="" />
          Filtres
          {countActiveFilters(activeFilters) > 0 && (
            <span className={`reviews__filter-badge${dark ? ' reviews__filter-badge--dark' : ''}`}>
              {countActiveFilters(activeFilters)}
            </span>
          )}
        </button>
        <button type="button" className={`reviews__filter-chip${dark ? ' reviews__filter-chip--dark' : ''}`}>
          <img src={iconSort} alt="" />
          Plus récent
        </button>
        <span className={`reviews__results-count${dark ? ' reviews__results-count--dark' : ''}`}>
          {resultsCount} résultat{resultsCount !== 1 ? 's' : ''}
        </span>
      </div>

      {activeFilterEntries.length > 0 && (
        <div className="reviews__active-pills">
          {activeFilterEntries.map(entry => (
            <button
              key={`${entry.groupId}-${entry.optionId}`}
              type="button"
              className="reviews__active-pill"
              onClick={() => removeActiveFilter(entry)}
            >
              {entry.label}
              <img src={iconPillClose} alt="" />
            </button>
          ))}
        </div>
      )}
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

  const [isFiltersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false)
  const activeFilters = hasAppliedFilters ? appliedFilters : EMPTY_FILTERS
  const activeFilterEntries = hasAppliedFilters ? getActiveFilterEntries(appliedFilters) : []

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [reviewsByCompany, setReviewsByCompany] = useState(() =>
    Object.fromEntries(Object.entries(COMPANY_REVIEWS_DATA).map(([id, data]) => [id, data.reviews]))
  )
  const [selectedReview, setSelectedReview] = useState(null)
  const [respondingReview, setRespondingReview] = useState(null)

  const removeActiveFilter = entry => {
    setAppliedFilters(prev => removeFilterEntry(prev, entry))
  }

  const applyFilters = nextFilters => {
    setAppliedFilters(nextFilters)
    setHasAppliedFilters(countActiveFilters(nextFilters) > 0)
    setVisibleCount(PAGE_SIZE)
  }

  const toggleTabFilter = tabDef => {
    const isActive = sameFilterSet(activeFilters.etat, tabDef.etat) && sameFilterSet(activeFilters.nps, tabDef.nps)
    applyFilters({ ...activeFilters, etat: isActive ? [] : tabDef.etat, nps: isActive ? [] : tabDef.nps })
  }

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

  const companyData = COMPANY_REVIEWS_DATA[selectedCompany.id]
  const companyReviews = reviewsByCompany[selectedCompany.id]
  const filteredReviews = companyReviews
    .filter(review => selectedCollaborator.id === 'all' || review.collaboratorId === selectedCollaborator.id)
    .filter(review => reviewMatchesFilters(review, activeFilters))
    .slice()
    .sort((a, b) => parseReviewDate(b.date) - parseReviewDate(a.date))

  const visibleReviews = filteredReviews.slice(0, visibleCount)
  const hasMore = filteredReviews.length > visibleCount

  const handleLoadMore = () => setVisibleCount(count => count + PAGE_SIZE)

  const handleOpenRespond = review => {
    setSelectedReview(null)
    setRespondingReview(review)
  }

  const handleOpenDetails = review => setSelectedReview(review)

  const updateReviewResponse = (review, response) => {
    setReviewsByCompany(data => ({
      ...data,
      [selectedCompany.id]: data[selectedCompany.id].map(r => (r.id === review.id ? { ...r, response } : r)),
    }))
    return { ...review, response }
  }

  const handleSubmitResponse = (review, responseText) => {
    const updatedReview = updateReviewResponse(review, responseText)
    setRespondingReview(null)
    setSelectedReview(updatedReview)
  }

  const handleDeleteResponse = review => {
    const updatedReview = updateReviewResponse(review, null)
    setRespondingReview(null)
    setSelectedReview(updatedReview)
  }

  // Tab badge counts stay based on every OTHER active filter (source,
  // collaborator, etc.) but ignore etat/nps specifically, since those are
  // exactly what the tabs themselves control -- otherwise selecting a tab
  // would change the numbers shown on the other two.
  const tabCountReviews = companyReviews
    .filter(review => selectedCollaborator.id === 'all' || review.collaboratorId === selectedCollaborator.id)
    .filter(review => reviewMatchesFilters(review, { ...activeFilters, etat: [], nps: [] }))

  const tabs = TAB_DEFS.map(tabDef => {
    const count = tabCountReviews.filter(
      review =>
        (tabDef.etat.length === 0 || tabDef.etat.includes(review.status)) &&
        (tabDef.nps.length === 0 || tabDef.nps.includes(getNpsFilterId(review.rating))),
    ).length
    return {
      ...tabDef,
      value: String(count),
      isActive: sameFilterSet(activeFilters.etat, tabDef.etat) && sameFilterSet(activeFilters.nps, tabDef.nps),
    }
  })

  const sharedFiltersProps = {
    activeFilters,
    activeFilterEntries,
    removeActiveFilter,
    resultsCount: filteredReviews.length,
    onOpenFilters: () => setFiltersSheetOpen(true),
  }

  return (
    <div className="reviews">
      <header className="reviews__topbar">
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
      </header>

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
                {companyData.kpiOS.rating}
                <span className="reviews__kpi-value-suffix">/5</span>
              </p>
              <span className="reviews__kpi-badge">{companyData.kpiOS.count} AVIS</span>
            </div>
          </div>
          <div className="reviews__kpi">
            <div className="reviews__kpi-title">
              <img src={iconGoogleBadge} alt="" />
              <span>Google</span>
            </div>
            <div className="reviews__kpi-value-row">
              <p className="reviews__kpi-value">
                {companyData.kpiGoogle.rating}
                <span className="reviews__kpi-value-suffix">/5</span>
              </p>
              <span className="reviews__kpi-badge">{companyData.kpiGoogle.count} AVIS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="reviews__filters-sticky">
        <FiltersRow dark {...sharedFiltersProps} />
      </div>

      <div className="reviews__panel">
        <div className="reviews__tabs">
          {tabs.map(tab => (
            <button
              type="button"
              className={`reviews__tab${tab.isActive ? ` reviews__tab--active reviews__tab--active-${tab.tone}` : ''}`}
              key={tab.label}
              onClick={() => toggleTabFilter(tab)}
            >
              <p className="reviews__tab-value">{tab.value}</p>
              <p className="reviews__tab-label">{tab.label}</p>
            </button>
          ))}
        </div>

        <div className="reviews__list">
          {visibleReviews.length > 0 ? (
            visibleReviews.map(review => (
              <ReviewCard
                key={review.id}
                review={review}
                onOpenDetails={handleOpenDetails}
                onOpenRespond={handleOpenRespond}
              />
            ))
          ) : (
            <p className="reviews__empty">Aucun avis ne correspond à ces critères.</p>
          )}

          {hasMore && (
            <button type="button" className="reviews__load-more" onClick={handleLoadMore}>
              Charger plus
              <img src={iconChevronDown} alt="" />
            </button>
          )}
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
            setSelectedCollaborator(COLLABORATORS[0])
            setVisibleCount(PAGE_SIZE)
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
            setVisibleCount(PAGE_SIZE)
            setCollaboratorSheetOpen(false)
          }}
        />
      )}

      {isFiltersSheetOpen && (
        <FiltersSheet
          initialFilters={appliedFilters}
          onClose={() => setFiltersSheetOpen(false)}
          onReset={() => {
            setAppliedFilters(EMPTY_FILTERS)
            setHasAppliedFilters(false)
            setVisibleCount(PAGE_SIZE)
          }}
          onApply={filters => {
            setAppliedFilters(filters)
            setHasAppliedFilters(true)
            setVisibleCount(PAGE_SIZE)
            setFiltersSheetOpen(false)
          }}
        />
      )}

      {selectedReview && (
        <ReviewDetailsSheet review={selectedReview} onClose={() => setSelectedReview(null)} onReply={handleOpenRespond} />
      )}

      {respondingReview && (
        <RespondSheet
          review={{ ...respondingReview, googleShared: respondingReview.googleSharing === 'google-partage' }}
          onClose={() => setRespondingReview(null)}
          onSubmit={handleSubmitResponse}
          onDelete={handleDeleteResponse}
        />
      )}
    </div>
  )
}
