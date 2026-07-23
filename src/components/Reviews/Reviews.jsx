import { useEffect, useRef, useState } from 'react'
import iconShare from '../../assets/reviews/icon-share.svg'
import iconChevronBig from '../../assets/reviews/icon-chevron-big.svg'
import iconOsLogoColor from '../../assets/reviews/icon-os-logo-color.svg'
import iconGoogleBadge from '../../assets/reviews/icon-google-badge.svg'
import iconFunnel from '../../assets/reviews/icon-funnel.svg'
import iconSort from '../../assets/reviews/icon-sort.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconArrowReply from '../../assets/home/icon-arrow-reply.svg'
import iconChevronRight from '../../assets/home/icon-chevron-right.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import { BottomNav } from '../BottomNav/BottomNav'
import { StarRating } from '../StarRating/StarRating'
import { RespondSheet } from '../Home/RespondSheet'
import { ResponseAlert } from '../ResponseAlert/ResponseAlert'
import { ShareReviewsSheet } from './ShareReviewsSheet'
import { CompanySelectSheet, COMPANIES } from './CompanySelectSheet'
import { CollaboratorSelectSheet, COLLABORATORS } from './CollaboratorSelectSheet'
import { ReviewDetailsSheet } from './ReviewDetailsSheet'
import { PendingReviewCard } from './PendingReviewCard'
import { ResendQuestionnaireSheet } from './ResendQuestionnaireSheet'
import { ConfirmArchiveModal } from './ConfirmArchiveModal'
import { SortSheet, SORT_OPTIONS } from './SortSheet'
import iconPillClose from '../../assets/reviews/icon-pill-close.svg'
import { COMPANY_PENDING_REVIEWS } from './mockPendingReviews'
import { buildGoogleShareConfirmedNotification } from '../Notifications/notificationsData'
import {
  FiltersSheet,
  EMPTY_FILTERS,
  countActiveFilters,
  getActiveFilterEntries,
  removeFilterEntry,
  applyFilterRules,
} from './FiltersSheet'
import {
  reviewMatchesFilters,
  matchesReponseFilter,
  parseReviewDate,
  getNpsFilterId,
  getNoteCategory,
  getDaysUntil,
} from './filterReviews'
import { getNpsCategory } from '../../utils/nps'
import { REVIEW_TAB_SANS_REPONSE, REVIEW_TAB_NEGATIFS, REVIEW_TAB_A_RECUPERER } from '../../utils/reviewTabs'
import { useSimulatedLoading } from '../../hooks/useSimulatedLoading'
import { Skeleton } from '../Skeleton/Skeleton'
import './Reviews.css'

const PAGE_SIZE = 10
// Matches filterReviews.js's TODAY anchor -- used to stamp a relance date
// when a pending questionnaire is resent.
const TODAY_STR = '06/09/2026'
// Simulates the delay before "OS" confirms a Google-boost reminder was
// accepted -- long enough to read as a real async step, short enough that
// the owner is still likely on this page to see the notification land.
const GOOGLE_BOOST_CONFIRM_MS = 6000

const SORT_COMPARATORS = {
  'plus-recent': (a, b) => parseReviewDate(b.date) - parseReviewDate(a.date),
  'plus-ancien': (a, b) => parseReviewDate(a.date) - parseReviewDate(b.date),
  alphabetique: (a, b) => a.author.localeCompare(b.author, 'fr'),
}

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
  { label: REVIEW_TAB_SANS_REPONSE, reponse: 'sans-reponse', nps: [], note: [], tone: 'info' },
  // Note (the review's own rating sentiment) is a separate axis from NPS
  // Badge (a distinct 1-10 score bucketed into promoteur/passif/détracteur)
  // -- a Détracteur badge doesn't imply a Négatif review, so this tab keys
  // off Note directly rather than the NPS badge.
  { label: REVIEW_TAB_NEGATIFS, reponse: null, nps: [], note: ['negatif'], tone: 'danger' },
  // Not a filter shortcut like the two above -- questionnaires that were
  // sent but never answered aren't reviews at all yet (see
  // COMPANY_PENDING_REVIEWS), so this tab switches the whole list to a
  // different data source and card type instead of filtering the same one.
  { label: REVIEW_TAB_A_RECUPERER, tone: 'warning', isPending: true },
]

// The only three État options there are -- see the comment on reviewFilters
// below for why they get stripped out before matching against real reviews.
const PENDING_ETAT_IDS = ['en-attente', 'expire', 'archive']

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
        <StarRating rating={parseFloat(review.rating)} />
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

// Mirrors ReviewCard's own box/padding exactly so the shimmer occupies the
// same footprint the real card will snap into once loading finishes.
function ReviewCardSkeleton() {
  return (
    <div className="reviews__card reviews__card--skeleton" aria-hidden="true">
      <div className="reviews__card-skeleton-title">
        <Skeleton width={120} height={14} />
        <Skeleton width={40} height={14} />
      </div>
      <div className="reviews__card-meta">
        <Skeleton width={70} height={10} />
        <Skeleton width={90} height={12} />
      </div>
      <div className="reviews__card-chips">
        <Skeleton width={72} height={20} radius={100} />
        <Skeleton width={88} height={20} radius={100} />
        <Skeleton width={80} height={20} radius={100} />
      </div>
      <div className="reviews__card-skeleton-text">
        <Skeleton width="100%" height={12} />
        <Skeleton width="100%" height={12} />
        <Skeleton width="60%" height={12} />
      </div>
      <div className="reviews__card-actions">
        <Skeleton width={90} height={14} />
        <Skeleton width={60} height={14} style={{ marginLeft: 'auto' }} />
      </div>
    </div>
  )
}

function FiltersRow({
  dark,
  activeFilters,
  activeFilterEntries,
  removeActiveFilter,
  resultsCount,
  onOpenFilters,
  sortLabel,
  onOpenSort,
  stuck,
}) {
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
        <button
          type="button"
          className={`reviews__filter-chip${dark ? ' reviews__filter-chip--dark' : ''}`}
          onClick={onOpenSort}
        >
          <img src={iconSort} alt="" />
          {sortLabel}
        </button>
        <span className={`reviews__results-count${dark || stuck ? ' reviews__results-count--dark' : ''}`}>
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
// Matches the CSS transition duration on .reviews__list > .reviews__card.
const LIST_EXIT_MS = 180

export function Reviews({
  onNavigate,
  initialTabLabel,
  initialSelectedReview,
  onAddNotification,
  reviewsByCompany,
  onChangeReviewsByCompany,
}) {
  const isLoading = useSimulatedLoading('reviews')
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

  const googleBoostTimeoutsRef = useRef([])
  useEffect(() => () => googleBoostTimeoutsRef.current.forEach(clearTimeout), [])

  // Home's stat tiles deep-link here with the matching tab's label (see
  // App.jsx) so the tab it corresponds to is already selected on the very
  // first render -- reviews.jsx fully remounts on every navigation (App.jsx
  // renders one page at a time), so a lazy initializer is enough; no need
  // for an effect that would otherwise flash the unfiltered list first.
  const initialTabDef =
    initialTabLabel && initialTabLabel !== REVIEW_TAB_A_RECUPERER
      ? TAB_DEFS.find(tab => tab.label === initialTabLabel)
      : null

  const [isFiltersSheetOpen, setFiltersSheetOpen] = useState(false)
  const [isSortSheetOpen, setSortSheetOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState('plus-recent')
  const [appliedFilters, setAppliedFilters] = useState(() => {
    if (initialTabDef) return { ...EMPTY_FILTERS, reponse: initialTabDef.reponse, nps: initialTabDef.nps }
    // État's "En attente" IS "À Relancer" (see isPendingView below) -- this
    // deep-links the same way the other two tabs do, just through etat
    // instead of reponse/nps.
    if (initialTabLabel === REVIEW_TAB_A_RECUPERER) return { ...EMPTY_FILTERS, etat: ['en-attente'] }
    return EMPTY_FILTERS
  })
  const [hasAppliedFilters, setHasAppliedFilters] = useState(
    () => Boolean(initialTabDef) || initialTabLabel === REVIEW_TAB_A_RECUPERER,
  )
  const activeFilters = hasAppliedFilters ? appliedFilters : EMPTY_FILTERS
  const activeFilterEntries = hasAppliedFilters ? getActiveFilterEntries(appliedFilters) : []
  // Derived, not its own state: État's "En attente" chip and the "À
  // Relancer" tab are the same thing, so whichever one gets toggled -- the
  // chip in Filtres, or the tab itself -- the other reflects it for free
  // instead of needing to stay manually in sync.
  const isPendingView = activeFilters.etat.includes('en-attente')
  // En attente/Expiré/Archivé describe the SENT QUESTIONNAIRE, not a
  // submitted review -- they redirect the whole page to the pending-
  // questionnaires data source (see isPendingView/isArchivedView below)
  // rather than filtering real reviews by these three statuses, so real-
  // review counts (résultats badge, tab counts) need them stripped out or
  // "27 résultats" would show above a list of 5 pending cards.
  const reviewFilters = { ...activeFilters, etat: activeFilters.etat.filter(id => !PENDING_ETAT_IDS.includes(id)) }
  const [companyPendingReviews, setCompanyPendingReviews] = useState(() =>
    Object.fromEntries(Object.entries(COMPANY_PENDING_REVIEWS).map(([id, items]) => [id, items])),
  )
  const [resendingItem, setResendingItem] = useState(null)
  const [resendInitialView, setResendInitialView] = useState('resend')
  const [archivingItem, setArchivingItem] = useState(null)

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loadMoreSentinelRef = useRef(null)
  const setReviewsByCompany = onChangeReviewsByCompany
  // A notification (e.g. an already-answered negative review) can deep-link
  // straight to that review's details sheet (see App.jsx's
  // handleOpenReviewDetails) -- same lazy-initializer reasoning as
  // initialTabDef above: this component remounts fresh on every
  // navigation, so there's no flash of the list before the sheet opens.
  const [selectedReview, setSelectedReview] = useState(() => initialSelectedReview || null)
  const [respondingReview, setRespondingReview] = useState(null)
  const [responseAlert, setResponseAlert] = useState(null)

  const isAnySheetOpen =
    isShareSheetOpen ||
    isCompanySheetOpen ||
    isCollaboratorSheetOpen ||
    isFiltersSheetOpen ||
    isSortSheetOpen ||
    selectedReview != null ||
    respondingReview != null ||
    resendingItem != null ||
    archivingItem != null

  // useLockBodyScroll (used by every sheet) pins <body> via position:fixed
  // while a sheet is open, which stops real scrolling -- position:sticky
  // relies on that scrolling to stay pinned, so without a real scroll the
  // topbar/filters bar would just render at their in-flow position instead
  // of staying anchored to the viewport. Switch both to position:fixed for
  // the duration so they stay put regardless of what the locked body is
  // doing underneath them.
  const [isScrolled, setScrolled] = useState(false)

  // The filters bar only gets an opaque background + shadow once it has
  // actually docked below the topbar (cards sliding underneath it, needing
  // to be hidden) -- never while it's still in normal flow over the dark
  // summary area, even if the page has already scrolled a little. There's
  // no CSS way to query "is this sticky element currently stuck", so this
  // compares its own top edge against the topbar's bottom edge each frame:
  // once they touch, it has docked.
  const [isFiltersStuck, setFiltersStuck] = useState(false)
  const [filtersStickyHeight, setFiltersStickyHeight] = useState(null)
  const topbarRef = useRef(null)
  const filtersStickyRef = useRef(null)

  // useLockBodyScroll (used by every sheet) pins <body> via position:fixed
  // while a sheet is open, and setting that resets window.scrollY to 0 as
  // a side effect (there's nothing left to actually scroll) -- which fires
  // a real 'scroll' event our handler below would otherwise read as "back
  // at the top", wrongly un-fading the summary card and un-sticking the
  // filters bar behind the sheet. Freeze both while any sheet is open, and
  // for a moment after it closes while the scroll position is restored.
  const ignoreScrollUntilRef = useRef(0)

  useEffect(() => {
    ignoreScrollUntilRef.current = isAnySheetOpen ? Infinity : performance.now() + 500
  }, [isAnySheetOpen])

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (performance.now() < ignoreScrollUntilRef.current) return
        setScrolled(window.scrollY > 24)
        if (topbarRef.current && filtersStickyRef.current) {
          const filtersRect = filtersStickyRef.current.getBoundingClientRect()
          setFiltersStuck(filtersRect.top <= topbarRef.current.getBoundingClientRect().bottom)
          setFiltersStickyHeight(filtersRect.height)
        }
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Whenever a filter change would swap the visible review cards, fade the
  // current ones out first instead of snapping straight to the new set --
  // the mutation itself only runs after the exit transition finishes, so
  // the cards that replace them mount/settle into an already-invisible
  // list and fade back in cleanly (see .reviews__list--exiting).
  const [isListExiting, setListExiting] = useState(false)
  const listExitTimeoutRef = useRef(null)

  useEffect(() => () => clearTimeout(listExitTimeoutRef.current), [])

  const withListTransition = mutate => {
    setListExiting(true)
    clearTimeout(listExitTimeoutRef.current)
    listExitTimeoutRef.current = setTimeout(() => {
      mutate()
      setListExiting(false)
    }, LIST_EXIT_MS)
  }

  const removeActiveFilter = entry => {
    // Same lock as the "En attente" chip in FiltersSheet.jsx (see its
    // DISABLE_RULES) -- Expiré/Archivé depend on it staying selected, so
    // its pill can't be removed out from under them either.
    if (entry.groupId === 'etat' && entry.optionId === 'en-attente' && activeFilters.etat.some(id => id === 'expire' || id === 'archive')) {
      return
    }
    withListTransition(() => setAppliedFilters(prev => removeFilterEntry(prev, entry)))
  }

  const applyFilters = nextFilters => {
    withListTransition(() => {
      setAppliedFilters(nextFilters)
      setHasAppliedFilters(countActiveFilters(nextFilters) > 0)
      setVisibleCount(PAGE_SIZE)
    })
  }

  const toggleSourceFilter = sourceId => {
    const current = activeFilters.source
    const nextSource = current.includes(sourceId) ? current.filter(id => id !== sourceId) : [...current, sourceId]
    // Routed through applyFilterRules so this gets the same cascade a
    // manual tap in Filtres would (e.g. selecting Google here also
    // auto-selects "Google Partagé", hiding non-partagé reviews).
    applyFilters(applyFilterRules({ ...activeFilters, source: nextSource }, 'source'))
  }

  const toggleTabFilter = tabDef => {
    if (tabDef.isPending) {
      // Toggling this tab just toggles État's "En attente" chip -- see
      // isPendingView above. Routed through applyFilterRules so this gets
      // the exact same cascade a manual "En attente" chip tap in Filtres
      // gets (clearing source/note/nps/reponse/googleSharing) -- otherwise
      // switching straight from e.g. "Avis Négatifs" to "À Relancer" would
      // leave "Détracteur" selected alongside "En attente" ("en attente is
      // only paired with expired or archived").
      const nextEtat = isPendingView
        ? activeFilters.etat.filter(id => id !== 'en-attente')
        : [...activeFilters.etat, 'en-attente']
      applyFilters(applyFilterRules({ ...activeFilters, etat: nextEtat }, 'etat'))
      return
    }
    const isActive =
      activeFilters.reponse === tabDef.reponse &&
      sameFilterSet(activeFilters.nps, tabDef.nps) &&
      sameFilterSet(activeFilters.note, tabDef.note)
    applyFilters({
      ...activeFilters,
      reponse: isActive ? null : tabDef.reponse,
      nps: isActive ? [] : tabDef.nps,
      note: isActive ? [] : tabDef.note,
      // Switching to a different tab leaves "À Relancer" behind entirely --
      // Expiré/Archivé only make sense alongside En attente (see
      // AUTO_SELECT_RULES in FiltersSheet.jsx), so all three go together.
      etat: activeFilters.etat.filter(id => !['en-attente', 'expire', 'archive'].includes(id)),
    })
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

  const companyReviews = reviewsByCompany[selectedCompany.id]
  // Scoped to the selected collaborator (like filteredReviews below) so the
  // KPI cards' ratings/counts, the quick filters, and "X résultats" all
  // agree with each other instead of the cards staying company-wide while
  // everything else narrows down.
  const collaboratorReviews = companyReviews.filter(
    review => selectedCollaborator.id === 'all' || review.collaboratorId === selectedCollaborator.id
  )
  const osReviews = collaboratorReviews.filter(review => review.source === 'opinion-system')
  const googleReviews = collaboratorReviews.filter(review => review.source === 'google')
  const osReviewCount = osReviews.length
  const googleReviewCount = googleReviews.length
  const averageRating = reviews =>
    reviews.length === 0
      ? '0.0'
      : (Math.round((reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0) / reviews.length) * 10) / 10).toFixed(1)
  const osRating = averageRating(osReviews)
  const googleRating = averageRating(googleReviews)
  const filteredReviews = collaboratorReviews
    .filter(review => reviewMatchesFilters(review, reviewFilters))
    .slice()
    .sort(SORT_COMPARATORS[sortOrder])

  const visibleReviews = filteredReviews.slice(0, visibleCount)
  const hasMore = filteredReviews.length > visibleCount

  const handleOpenRespond = review => {
    setSelectedReview(null)
    setRespondingReview(review)
  }

  const handleOpenDetails = review => setSelectedReview(review)

  const updateReviewResponse = (review, response) => {
    // A response also settles the review's état -- back to "sans réponse"
    // if the response is deleted, so the "Sans Réponses"/"À Récupérer" tabs
    // and their counts pick it back up.
    const status = response ? 'archive' : 'sans-reponse'
    const responseDate = response ? TODAY_STR : null
    setReviewsByCompany(data => ({
      ...data,
      [selectedCompany.id]: data[selectedCompany.id].map(r =>
        r.id === review.id ? { ...r, response, status, responseDate } : r
      ),
    }))
    return { ...review, response, status, responseDate }
  }

  const handleSubmitResponse = (review, responseText) => {
    const wasEditing = Boolean(review.response)
    const updatedReview = updateReviewResponse(review, responseText)
    setRespondingReview(null)
    setSelectedReview(updatedReview)
    setResponseAlert(wasEditing ? 'Une réponse a été modifiée' : 'Une réponse a été envoyée')
  }

  const handleDeleteResponse = review => {
    const updatedReview = updateReviewResponse(review, null)
    setRespondingReview(null)
    setSelectedReview(updatedReview)
  }

  const updateReviewGoogleField = (review, patch, companyId) => {
    setReviewsByCompany(data => ({
      ...data,
      [companyId]: data[companyId].map(r => (r.id === review.id ? { ...r, ...patch } : r)),
    }))
    return { ...review, ...patch }
  }

  // Sending the boost link only marks the review as "reminder sent" --
  // COMPANY_REVIEWS_DATA has no notion of a pending Google share yet, so it
  // lives purely in this component's own reviewsByCompany state. A few
  // seconds later (standing in for "OS" actually confirming it), the review
  // flips to fully shared and a notification lands, mirroring how a real
  // confirmation would arrive well after the owner has moved on.
  const handleSendGoogleBoost = review => {
    const companyId = selectedCompany.id
    const updatedReview = updateReviewGoogleField(review, { googleReminderSentDate: TODAY_STR }, companyId)
    setSelectedReview(current => (current && current.id === review.id ? updatedReview : current))
    setResponseAlert('Rappel de duplication envoyé')

    const timeoutId = setTimeout(() => {
      const confirmedReview = updateReviewGoogleField(
        updatedReview,
        { googleSharing: 'google-partage', googleReminderSentDate: null },
        companyId,
      )
      setSelectedReview(current => (current && current.id === review.id ? confirmedReview : current))
      onAddNotification?.(buildGoogleShareConfirmedNotification(confirmedReview))
    }, GOOGLE_BOOST_CONFIRM_MS)
    googleBoostTimeoutsRef.current.push(timeoutId)
  }

  // Expired questionnaires drop off this (default) list -- they only show
  // up once "Expiré" is explicitly selected, via expiredPendingReviews below.
  const pendingReviews = (companyPendingReviews[selectedCompany.id] || [])
    .filter(item => selectedCollaborator.id === 'all' || item.collaboratorId === selectedCollaborator.id)
    .filter(item => !item.archived && getDaysUntil(item.expiryDate) >= 0)

  // Selecting "Archivé"/"Expiré" under État switches the whole list to that
  // slice of the pending questionnaires instead of filtering the current
  // tab's content -- these are still the same data source (see
  // COMPANY_PENDING_REVIEWS), just narrowed the other two ways.
  const isArchivedView = hasAppliedFilters && activeFilters.etat.includes('archive')
  const archivedPendingReviews = (companyPendingReviews[selectedCompany.id] || []).filter(
    item => item.archived && (selectedCollaborator.id === 'all' || item.collaboratorId === selectedCollaborator.id),
  )
  const isExpiredView = hasAppliedFilters && activeFilters.etat.includes('expire')
  const expiredPendingReviews = (companyPendingReviews[selectedCompany.id] || []).filter(
    item =>
      !item.archived &&
      getDaysUntil(item.expiryDate) < 0 &&
      (selectedCollaborator.id === 'all' || item.collaboratorId === selectedCollaborator.id),
  )

  // Infinite scroll: loads the next page itself once the sentinel at the
  // bottom of the list comes near the viewport, instead of a "Charger
  // plus" button the user has to tap.
  useEffect(() => {
    if (isLoading || isPendingView || !hasMore) return
    const el = loadMoreSentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) setVisibleCount(count => count + PAGE_SIZE)
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isLoading, isPendingView, hasMore])

  const handleOpenResend = item => {
    setResendInitialView('resend')
    setResendingItem(item)
  }

  const handleEditPending = item => {
    setResendInitialView('edit-recipient')
    setResendingItem(item)
  }

  const handleRequestArchive = item => setArchivingItem(item)

  const handleConfirmArchive = () => {
    const item = archivingItem
    setCompanyPendingReviews(data => ({
      ...data,
      [selectedCompany.id]: data[selectedCompany.id].map(p => (p.id === item.id ? { ...p, archived: true } : p)),
    }))
    setArchivingItem(null)
    setResponseAlert('1 questionnaire en attente a été archivé')
  }

  const handleUnarchivePending = item => {
    setCompanyPendingReviews(data => ({
      ...data,
      [selectedCompany.id]: data[selectedCompany.id].map(p => (p.id === item.id ? { ...p, archived: false } : p)),
    }))
    setResponseAlert('Le questionnaire a été désarchivé')
  }

  const handleResendConfirmed = item => {
    setCompanyPendingReviews(data => ({
      ...data,
      [selectedCompany.id]: data[selectedCompany.id].map(p => (p.id === item.id ? { ...p, relanceDate: TODAY_STR } : p)),
    }))
    setResponseAlert('Questionnaire renvoyé avec succès')
  }

  const handleSaveRecipient = (item, updates) => {
    setCompanyPendingReviews(data => ({
      ...data,
      [selectedCompany.id]: data[selectedCompany.id].map(p => (p.id === item.id ? { ...p, ...updates } : p)),
    }))
    setResendingItem(current => (current && current.id === item.id ? { ...current, ...updates } : current))
    setResponseAlert('Le destinataire a été modifié')
  }

  // Tab badge counts stay based on every OTHER active filter (source,
  // collaborator, etc.) but ignore reponse/nps/note specifically, since
  // those are exactly what the tabs themselves control -- otherwise
  // selecting a tab would change the numbers shown on the other two.
  const tabCountReviews = collaboratorReviews.filter(review =>
    reviewMatchesFilters(review, { ...reviewFilters, reponse: null, nps: [], note: [] })
  )

  const tabs = TAB_DEFS.map(tabDef => {
    if (tabDef.isPending) {
      // Stays active/highlighted even once narrowed to Expiré or Archivé --
      // both still mean "En attente" underneath (see AUTO_SELECT_RULES in
      // FiltersSheet.jsx), so this is still the same view, just filtered.
      return { ...tabDef, value: String(pendingReviews.length), isActive: isPendingView }
    }
    const count = tabCountReviews.filter(
      review =>
        (!tabDef.reponse || matchesReponseFilter(review, tabDef.reponse)) &&
        (tabDef.nps.length === 0 || tabDef.nps.includes(getNpsFilterId(review.rating))) &&
        (tabDef.note.length === 0 || tabDef.note.includes(getNoteCategory(review.rating))),
    ).length
    return {
      ...tabDef,
      value: String(count),
      isActive:
        !isPendingView &&
        activeFilters.reponse === tabDef.reponse &&
        sameFilterSet(activeFilters.nps, tabDef.nps) &&
        sameFilterSet(activeFilters.note, tabDef.note),
    }
  })

  const sharedFiltersProps = {
    activeFilters,
    // "En attente" (and Expiré/Archivé alongside it) already shows up here
    // as a real pill -- État is a normal filter group now, not a synthetic
    // stand-in for the "À Relancer" tab (see isPendingView above).
    activeFilterEntries,
    removeActiveFilter,
    resultsCount: isPendingView ? pendingReviews.length : filteredReviews.length,
    onOpenFilters: () => setFiltersSheetOpen(true),
    sortLabel: SORT_OPTIONS.find(option => option.id === sortOrder)?.label,
    onOpenSort: () => setSortSheetOpen(true),
    stuck: isFiltersStuck,
  }

  return (
    <div className="reviews">
      <header
        ref={topbarRef}
        className={`reviews__topbar${isAnySheetOpen ? ' reviews__topbar--locked' : ''}${
          isFiltersStuck ? ' reviews__topbar--stuck' : ''
        }`}
      >
        <div className="reviews__status-bar" />
        <div className="reviews__appbar">
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

      {/* position:fixed (used while a sheet is open, see --locked above)
          doesn't reserve space in the flow the way position:sticky does --
          without this, everything below would jump up by the topbar's
          height the instant a sheet opens, then jump back down on close. */}
      {isAnySheetOpen && (
        <div aria-hidden="true" style={{ height: `calc(72px + env(safe-area-inset-top))` }} />
      )}

      <div className={`reviews__summary${isScrolled ? ' reviews__summary--hidden' : ''}`}>
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
          {isLoading ? (
            <>
              <div className="reviews__kpi" aria-hidden="true">
                <div className="reviews__kpi-title">
                  <Skeleton className="skeleton-bar--light" width={24} height={24} radius={100} />
                  <Skeleton className="skeleton-bar--light" width={90} height={12} />
                </div>
                <div className="reviews__kpi-value-row">
                  <Skeleton className="skeleton-bar--light" width={50} height={24} />
                  <Skeleton className="skeleton-bar--light" width={50} height={20} radius={20} />
                </div>
              </div>
              <div className="reviews__kpi" aria-hidden="true">
                <div className="reviews__kpi-title">
                  <Skeleton className="skeleton-bar--light" width={24} height={24} radius={100} />
                  <Skeleton className="skeleton-bar--light" width={60} height={12} />
                </div>
                <div className="reviews__kpi-value-row">
                  <Skeleton className="skeleton-bar--light" width={50} height={24} />
                  <Skeleton className="skeleton-bar--light" width={50} height={20} radius={20} />
                </div>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                className={`reviews__kpi${activeFilters.source.includes('opinion-system') ? ' reviews__kpi--active' : ''}`}
                onClick={() => toggleSourceFilter('opinion-system')}
              >
                <div className="reviews__kpi-title">
                  <img src={iconOsLogoColor} alt="" />
                  <span>Opinion System</span>
                </div>
                <div className="reviews__kpi-value-row">
                  <p className="reviews__kpi-value">
                    {osRating}
                    <span className="reviews__kpi-value-suffix">/5</span>
                  </p>
                  <span className="reviews__kpi-badge">{osReviewCount} AVIS</span>
                </div>
              </button>
              <button
                type="button"
                className={`reviews__kpi${activeFilters.source.includes('google') ? ' reviews__kpi--active' : ''}`}
                onClick={() => toggleSourceFilter('google')}
              >
                <div className="reviews__kpi-title">
                  <img src={iconGoogleBadge} alt="" />
                  <span>Google</span>
                </div>
                <div className="reviews__kpi-value-row">
                  <p className="reviews__kpi-value">
                    {googleRating}
                    <span className="reviews__kpi-value-suffix">/5</span>
                  </p>
                  <span className="reviews__kpi-badge">{googleReviewCount} AVIS</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="reviews__quick-filters">
        {tabs.map(tab => (
          <button
            type="button"
            className={`reviews__quick-filter${
              tab.isActive ? ` reviews__quick-filter--active reviews__quick-filter--active-${tab.tone}` : ''
            }`}
            key={tab.label}
            onClick={() => toggleTabFilter(tab)}
          >
            <p className="reviews__quick-filter-value">{tab.value}</p>
            <p className="reviews__quick-filter-label">{tab.label}</p>
          </button>
        ))}
      </div>

      <div
        ref={filtersStickyRef}
        className={`reviews__filters-sticky${
          isAnySheetOpen && isFiltersStuck ? ' reviews__filters-sticky--locked' : ''
        }${isFiltersStuck ? ' reviews__filters-sticky--stuck' : ''}`}
      >
        <FiltersRow dark {...sharedFiltersProps} />
      </div>

      {/* Same reasoning as the topbar's spacer above -- only needed here
          when this bar is *also* locked (i.e. it had already docked
          before the sheet opened), since only then does switching it to
          position:fixed pull it out of the flow. */}
      {isAnySheetOpen && isFiltersStuck && filtersStickyHeight != null && (
        <div aria-hidden="true" style={{ height: filtersStickyHeight }} />
      )}

      <div className="reviews__panel">
        <div className={`reviews__list${isListExiting ? ' reviews__list--exiting' : ''}`}>
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => <ReviewCardSkeleton key={index} />)
          ) : isArchivedView ? (
            archivedPendingReviews.length > 0 ? (
              archivedPendingReviews.map(item => (
                <PendingReviewCard
                  key={item.id}
                  item={item}
                  onOpenResend={handleOpenResend}
                  onUnarchive={handleUnarchivePending}
                />
              ))
            ) : (
              <p className="reviews__empty">Aucun questionnaire archivé.</p>
            )
          ) : isExpiredView ? (
            expiredPendingReviews.length > 0 ? (
              expiredPendingReviews.map(item => (
                <PendingReviewCard
                  key={item.id}
                  item={item}
                  onOpenResend={handleOpenResend}
                  onEdit={handleEditPending}
                  onArchiveRequest={handleRequestArchive}
                />
              ))
            ) : (
              <p className="reviews__empty">Aucun questionnaire expiré.</p>
            )
          ) : isPendingView ? (
            pendingReviews.length > 0 ? (
              pendingReviews.map(item => (
                <PendingReviewCard
                  key={item.id}
                  item={item}
                  onOpenResend={handleOpenResend}
                  onEdit={handleEditPending}
                  onArchiveRequest={handleRequestArchive}
                />
              ))
            ) : (
              <p className="reviews__empty">Aucun questionnaire en attente.</p>
            )
          ) : visibleReviews.length > 0 ? (
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

          {!isLoading && !isPendingView && hasMore && (
            <div ref={loadMoreSentinelRef} className="reviews__load-more-sentinel" aria-hidden="true" />
          )}
        </div>
      </div>

      <BottomNav active="chat" onNavigate={onNavigate} />

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

      {isSortSheetOpen && (
        <SortSheet
          selectedId={sortOrder}
          onClose={() => setSortSheetOpen(false)}
          onSelect={option => {
            withListTransition(() => {
              setSortOrder(option.id)
              setVisibleCount(PAGE_SIZE)
            })
            setSortSheetOpen(false)
          }}
        />
      )}

      {isFiltersSheetOpen && (
        <FiltersSheet
          initialFilters={appliedFilters}
          onClose={() => setFiltersSheetOpen(false)}
          onReset={() => {
            withListTransition(() => {
              setAppliedFilters(EMPTY_FILTERS)
              setHasAppliedFilters(false)
              setVisibleCount(PAGE_SIZE)
            })
          }}
          onApply={filters => {
            withListTransition(() => {
              setAppliedFilters(filters)
              setHasAppliedFilters(true)
              setVisibleCount(PAGE_SIZE)
            })
            setFiltersSheetOpen(false)
          }}
        />
      )}

      {selectedReview && (
        <ReviewDetailsSheet
          review={selectedReview}
          companyName={selectedCompany.name}
          onClose={() => setSelectedReview(null)}
          onSubmit={handleSubmitResponse}
          onDelete={handleDeleteResponse}
          onSendGoogleBoost={handleSendGoogleBoost}
        />
      )}

      {respondingReview && (
        <RespondSheet
          review={{ ...respondingReview, googleShared: respondingReview.googleSharing === 'google-partage' }}
          onClose={() => setRespondingReview(null)}
          onSubmit={handleSubmitResponse}
          onDelete={handleDeleteResponse}
        />
      )}

      {resendingItem && (
        <ResendQuestionnaireSheet
          item={resendingItem}
          initialView={resendInitialView}
          onClose={() => setResendingItem(null)}
          onResend={handleResendConfirmed}
          onSaveRecipient={handleSaveRecipient}
        />
      )}

      {archivingItem && (
        <ConfirmArchiveModal onConfirm={handleConfirmArchive} onCancel={() => setArchivingItem(null)} />
      )}

      {responseAlert && <ResponseAlert message={responseAlert} onClose={() => setResponseAlert(null)} />}
    </div>
  )
}
