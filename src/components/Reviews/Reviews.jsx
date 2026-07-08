import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { ReviewDetailsSheet } from './ReviewDetailsSheet'
import { RespondSheet } from '../Home/RespondSheet'
import iconPillClose from '../../assets/reviews/icon-pill-close.svg'
import iconFabUp from '../../assets/reviews/icon-fab-up.svg'
import iconFabFunnel from '../../assets/reviews/icon-fab-funnel.svg'
import { COMPANY_REVIEWS_DATA } from './mockReviewsData'
import {
  FiltersSheet,
  EMPTY_FILTERS,
  countActiveFilters,
  getActiveFilterEntries,
  removeFilterEntry,
} from './FiltersSheet'
import { reviewMatchesFilters, getNpsFilterId } from './filterReviews'
import { getNpsCategory } from '../../utils/nps'
import './Reviews.css'

const NPS_CHIP_CLASS = {
  Promoteur: 'reviews__chip--promoter',
  Passif: 'reviews__chip--passive',
  Détracteur: 'reviews__chip--detractor',
}

// RespondSheet/ReviewSummaryCard are shared with Home, which models Google
// sharing as a plain boolean (googleShared) instead of our string enum
// (googleSharing). Adapt at the boundary rather than changing either
// review data shape.
function toRespondSheetReview(review) {
  return { ...review, googleShared: review.googleSharing === 'google-partage' }
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

function ReviewCard({ review, onOpenDetails, onReply }) {
  const npsCategory = getNpsCategory(parseFloat(review.rating))

  return (
    <div className="reviews__card" onClick={() => onOpenDetails(review)}>
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
          className="reviews__card-action"
          onClick={e => {
            e.stopPropagation()
            onReply(review)
          }}
        >
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

// The part of the header that stays pinned right below the topbar while
// scrolling a little: only the summary card + KPIs. Tabs and the filters
// row are NOT pinned — they scroll away normally with the review cards.
function SummaryPinnedContent({
  displayedCompany,
  isCompanyNameExiting,
  onOpenCompanySheet,
  displayedCollaborator,
  isCollaboratorNameExiting,
  onOpenCollaboratorSheet,
  companyData,
  activeSources,
  onToggleSource,
}) {
  return (
    <div className="reviews__summary">
      <button
        type="button"
        className="reviews__summary-row reviews__summary-row--border reviews__summary-row--clickable"
        onClick={onOpenCompanySheet}
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
        onClick={onOpenCollaboratorSheet}
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
        <button
          type="button"
          className={`reviews__kpi${activeSources.includes('opinion-system') ? ' reviews__kpi--active' : ''}`}
          onClick={() => onToggleSource('opinion-system')}
        >
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
        </button>
        <button
          type="button"
          className={`reviews__kpi${activeSources.includes('google') ? ' reviews__kpi--active' : ''}`}
          onClick={() => onToggleSource('google')}
        >
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
        </button>
      </div>
    </div>
  )
}

function CompactPinnedContent({ activeFilters, activeFilterEntries, removeActiveFilter, resultsCount, onOpenFilters }) {
  return (
    <div className="reviews__compact-bar">
      <FiltersRow
        dark
        activeFilters={activeFilters}
        activeFilterEntries={activeFilterEntries}
        removeActiveFilter={removeActiveFilter}
        resultsCount={resultsCount}
        onOpenFilters={onOpenFilters}
      />
    </div>
  )
}

const NAME_EXIT_MS = 180
const PINNED_EXIT_MS = 220
const PINNED_HEIGHT_TRANSITION_MS = 320
// The trigger is tied to actual content, not a guessed distance: once
// scrolling has pushed most of the way past the summary/KPI card's own
// height, that's the natural moment to start swapping it for the compact
// bar. Triggering at a fraction (not 100%) of that height leaves a buffer
// so the ~540ms transition has time to finish before the user could
// otherwise scroll far enough to see cards underneath it. Hysteresis
// (enter past DOWN_RATIO of that height, only leave once back under
// UP_RATIO of it) absorbs small scrollY clamps from the pinned block's
// height changing -- but on short pages that isn't enough on its own
// (see the guard in nextScrolled below).
const SCROLL_DOWN_RATIO = 0.7
const SCROLL_UP_RATIO = 0.4
// Fallback used for the one frame before the summary card's real height
// has been measured.
const FALLBACK_EXPANDED_HEIGHT = 280

function nextScrolled(prev, scrollY, expandedHeight, compactHeight) {
  const reference = expandedHeight ?? FALLBACK_EXPANDED_HEIGHT
  if (!prev && scrollY > reference * SCROLL_DOWN_RATIO) {
    // Guard against short pages (few reviews): collapsing the pinned block
    // shrinks the page by (expanded - compact) height. On a page with
    // little scrollable content, that shrink can push the max scroll
    // position below the UP threshold, so the browser's own scroll clamp
    // immediately reads as "scrolled back near the top" and reverts --
    // which then re-expands the page, undoing the clamp, so the very next
    // scroll re-triggers compact again: an infinite bounce. Only actually
    // collapse if there's enough real scrollable room to support it
    // without the browser needing to clamp.
    if (compactHeight != null) {
      const heightDelta = reference - compactHeight
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll - heightDelta < reference * SCROLL_UP_RATIO + 20) return false
    }
    return true
  }
  if (prev && scrollY < reference * SCROLL_UP_RATIO) return false
  return prev
}

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

  const [detailsReview, setDetailsReview] = useState(null)
  const [replyReview, setReplyReview] = useState(null)

  const isAnySheetOpen =
    isShareSheetOpen ||
    isCompanySheetOpen ||
    isCollaboratorSheetOpen ||
    isFiltersSheetOpen ||
    detailsReview != null ||
    replyReview != null

  // Scroll-driven pinned header: stays expanded (summary + KPIs) for small
  // scroll amounts, cards simply pass underneath it. Only once scrolling
  // has pushed past the summary card's own height does it swap to the
  // compact dark filters bar, via a move+fade transition on the content
  // plus a matching height transition on the container so nothing snaps
  // into place.
  const [scrolled, setScrolled] = useState(false)
  const [pinnedMode, setPinnedMode] = useState('expanded')
  const [isPinnedExiting, setPinnedExiting] = useState(false)
  const pinnedExitTimeoutRef = useRef(null)
  const ignoreScrollUntilRef = useRef(0)

  // useLockBodyScroll (used by every sheet) pins the body via
  // position:fixed while a sheet is open, which itself fires a native
  // 'scroll' event as a side effect (not real user intent to scroll back
  // up) and can desync our pinned/compact state. Suppress scroll tracking
  // entirely while any sheet is open, and for a moment after it closes
  // while the sheet's own close animation + scroll-position restore
  // settle, so opening/closing a sheet can never change this state.
  useEffect(() => {
    ignoreScrollUntilRef.current = isAnySheetOpen ? Infinity : performance.now() + 500
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnySheetOpen])

  const expandedMeasureRef = useRef(null)
  const compactMeasureRef = useRef(null)
  const [measuredHeights, setMeasuredHeights] = useState({ expanded: null, compact: null })
  const [pinnedHeight, setPinnedHeight] = useState(null)
  // Mirrors measuredHeights for the scroll listener below, which is
  // registered once ([] deps) and would otherwise read stale values.
  const expandedHeightRef = useRef(null)
  const compactHeightRef = useRef(null)
  expandedHeightRef.current = measuredHeights.expanded
  compactHeightRef.current = measuredHeights.compact

  const removeActiveFilter = entry => {
    setAppliedFilters(prev => removeFilterEntry(prev, entry))
  }

  const applyFilters = nextFilters => {
    setAppliedFilters(nextFilters)
    setHasAppliedFilters(countActiveFilters(nextFilters) > 0)
  }

  const toggleSourceFilter = sourceId => {
    const current = activeFilters.source
    const nextSource = current.includes(sourceId) ? current.filter(id => id !== sourceId) : [...current, sourceId]
    applyFilters({ ...activeFilters, source: nextSource })
  }

  const toggleTabFilter = tabDef => {
    const isActive = sameFilterSet(activeFilters.etat, tabDef.etat) && sameFilterSet(activeFilters.nps, tabDef.nps)
    applyFilters({ ...activeFilters, etat: isActive ? [] : tabDef.etat, nps: isActive ? [] : tabDef.nps })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
  const filteredReviews = companyData.reviews
    .filter(review => selectedCollaborator.id === 'all' || review.collaboratorId === selectedCollaborator.id)
    .filter(review => reviewMatchesFilters(review, activeFilters))

  // Tab badge counts stay based on every OTHER active filter (source,
  // collaborator, etc.) but ignore etat/nps specifically, since those are
  // exactly what the tabs themselves control -- otherwise selecting a tab
  // would change the numbers shown on the other two.
  const tabCountReviews = companyData.reviews
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

  // Track scroll depth (rAF-throttled) with hysteresis to decide expanded
  // vs compact, ignoring scroll events for a short window right after we
  // trigger our own height transition (that transition can shorten the
  // page and cause the browser to clamp scrollY, which must not be read
  // as user intent to scroll back up).
  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        if (performance.now() < ignoreScrollUntilRef.current) return
        setScrolled(prev => nextScrolled(prev, window.scrollY, expandedHeightRef.current, compactHeightRef.current))
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Measure the real height of both variants so the container can animate
  // between them instead of snapping when the content swaps.
  useLayoutEffect(() => {
    const measure = () => {
      setMeasuredHeights({
        expanded: expandedMeasureRef.current?.scrollHeight ?? null,
        compact: compactMeasureRef.current?.scrollHeight ?? null,
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    if (expandedMeasureRef.current) observer.observe(expandedMeasureRef.current)
    if (compactMeasureRef.current) observer.observe(compactMeasureRef.current)
    return () => observer.disconnect()
  }, [companyData, activeFilterEntries.length, filteredReviews.length])

  // Keep the committed height in sync with the currently displayed mode
  // whenever it's not mid-transition (e.g. active filter pills changing).
  useEffect(() => {
    if (isPinnedExiting) return
    const height = measuredHeights[pinnedMode]
    if (height != null) setPinnedHeight(height)
  }, [measuredHeights, pinnedMode, isPinnedExiting])

  // Trigger the swap: fade the old content out FIRST, at its current
  // height (so overflow:hidden never clips still-visible text while the
  // container is also resizing underneath it — that combination is what
  // caused the blurry/glitchy look). Only once the old content is fully
  // gone and the new content mounts does the height-sync effect above
  // animate the container to match, concurrent with the new content's
  // own fade-in.
  useEffect(() => {
    const targetMode = scrolled ? 'compact' : 'expanded'
    if (targetMode === pinnedMode) return
    setPinnedExiting(true)
    const ignoreMs = PINNED_EXIT_MS + PINNED_HEIGHT_TRANSITION_MS + 120
    ignoreScrollUntilRef.current = performance.now() + ignoreMs
    pinnedExitTimeoutRef.current = setTimeout(() => {
      setPinnedMode(targetMode)
      setPinnedExiting(false)
    }, PINNED_EXIT_MS)
    // A scroll event that lands inside the ignore window is dropped, and if
    // no further scroll event ever arrives (e.g. that was the last event of
    // the gesture), scrolled would stay stuck. Force one re-check right as
    // the window closes so the state always resyncs with the real scrollY.
    const resyncTimeoutRef = setTimeout(() => {
      setScrolled(prev => nextScrolled(prev, window.scrollY, expandedHeightRef.current, compactHeightRef.current))
    }, ignoreMs + 20)
    return () => {
      clearTimeout(pinnedExitTimeoutRef.current)
      clearTimeout(resyncTimeoutRef)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrolled])

  const sharedFiltersProps = {
    activeFilters,
    activeFilterEntries,
    removeActiveFilter,
    resultsCount: filteredReviews.length,
    onOpenFilters: () => setFiltersSheetOpen(true),
  }

  return (
    <div className="reviews">
      <header className={`reviews__topbar${isAnySheetOpen ? ' reviews__topbar--locked' : ''}`}>
        <div className="reviews__status-bar" />
        <div className="reviews__appbar">
          <button type="button" className="reviews__icon-btn" aria-label="Retour" onClick={() => onNavigate?.('home')}>
            <img src={iconBack} alt="" />
          </button>
          <h1 className="reviews__title">Mes Avis</h1>
          <button
            type="button"
            className={`reviews__icon-btn reviews__icon-btn--share${scrolled ? ' reviews__icon-btn--hidden' : ''}`}
            aria-label="Partager"
            onClick={() => setShareSheetOpen(true)}
            tabIndex={scrolled ? -1 : 0}
          >
            <img src={iconShare} alt="" />
          </button>
        </div>
      </header>

      <div className={`reviews__fab${scrolled ? ' reviews__fab--visible' : ''}`}>
        <button type="button" className="reviews__fab-btn" onClick={scrollToTop} aria-label="Remonter en haut">
          <img src={iconFabUp} alt="" />
        </button>
        <div className="reviews__fab-divider" />
        <button
          type="button"
          className="reviews__fab-btn"
          onClick={() => setFiltersSheetOpen(true)}
          aria-label="Ouvrir les filtres"
        >
          <img src={iconFabFunnel} alt="" />
          {countActiveFilters(activeFilters) > 0 && <span className="reviews__fab-dot" />}
        </button>
      </div>

      <div
        className={`reviews__pinned${isAnySheetOpen ? ' reviews__pinned--locked' : ''}`}
        style={pinnedHeight != null ? { height: pinnedHeight } : undefined}
      >
        <div
          key={pinnedMode}
          className={`reviews__pinned-inner${isPinnedExiting ? ' reviews__pinned-inner--exiting' : ''}`}
        >
          {pinnedMode === 'expanded' ? (
            <SummaryPinnedContent
              displayedCompany={displayedCompany}
              isCompanyNameExiting={isCompanyNameExiting}
              onOpenCompanySheet={() => setCompanySheetOpen(true)}
              displayedCollaborator={displayedCollaborator}
              isCollaboratorNameExiting={isCollaboratorNameExiting}
              onOpenCollaboratorSheet={() => setCollaboratorSheetOpen(true)}
              companyData={companyData}
              activeSources={activeFilters.source}
              onToggleSource={toggleSourceFilter}
            />
          ) : (
            <CompactPinnedContent {...sharedFiltersProps} />
          )}
        </div>

        {/* Hidden measurement copies, kept in sync with real data so the
            container's height transition always animates to an accurate target. */}
        <div className="reviews__pinned-measure" aria-hidden="true" ref={expandedMeasureRef}>
          <SummaryPinnedContent
            displayedCompany={displayedCompany}
            isCompanyNameExiting={false}
            onOpenCompanySheet={() => {}}
            displayedCollaborator={displayedCollaborator}
            isCollaboratorNameExiting={false}
            onOpenCollaboratorSheet={() => {}}
            companyData={companyData}
            activeSources={activeFilters.source}
            onToggleSource={() => {}}
          />
        </div>
        <div className="reviews__pinned-measure" aria-hidden="true" ref={compactMeasureRef}>
          <CompactPinnedContent {...sharedFiltersProps} />
        </div>
      </div>

      {/* position:fixed (used while a sheet is open, see --locked above)
          doesn't reserve space in the flow the way position:sticky does --
          without this, switching modes would make the cards below jump up
          to fill the gap, then jump back down when the sheet closes. */}
      {isAnySheetOpen && (
        <div
          aria-hidden="true"
          style={{ height: `calc(72px + env(safe-area-inset-top) + ${pinnedHeight ?? 0}px)` }}
        />
      )}

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
          <FiltersRow {...sharedFiltersProps} />

          {filteredReviews.length > 0 ? (
            filteredReviews.map(review => (
              <ReviewCard key={review.id} review={review} onOpenDetails={setDetailsReview} onReply={setReplyReview} />
            ))
          ) : (
            <p className="reviews__empty">Aucun avis ne correspond à ces critères.</p>
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

      {isFiltersSheetOpen && (
        <FiltersSheet
          initialFilters={appliedFilters}
          onClose={() => setFiltersSheetOpen(false)}
          onReset={() => {
            setAppliedFilters(EMPTY_FILTERS)
            setHasAppliedFilters(false)
          }}
          onApply={filters => {
            setAppliedFilters(filters)
            setHasAppliedFilters(true)
            setFiltersSheetOpen(false)
          }}
        />
      )}

      {detailsReview && (
        <ReviewDetailsSheet
          review={detailsReview}
          onClose={() => setDetailsReview(null)}
          onReply={review => {
            setDetailsReview(null)
            setReplyReview(review)
          }}
        />
      )}

      {replyReview && (
        <RespondSheet
          review={toRespondSheetReview(replyReview)}
          onClose={() => setReplyReview(null)}
          onSubmit={() => setReplyReview(null)}
        />
      )}
    </div>
  )
}
