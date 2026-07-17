import { useState } from 'react'
import iconFilterReset from '../../assets/reviews/icon-filter-reset.svg'
import iconFilterClose from '../../assets/reviews/icon-filter-close.svg'
import iconFilterOsWhite from '../../assets/reviews/icon-filter-os-white.svg'
import iconFilterOsDark from '../../assets/reviews/icon-filter-os-dark.svg'
import iconFilterGoogleColor from '../../assets/reviews/icon-filter-google-color.svg'
import iconFilterOsCertifWhite from '../../assets/reviews/icon-filter-os-certif-white.svg'
import iconFilterGoogleCertif from '../../assets/reviews/icon-filter-google-certif.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './FiltersSheet.css'

const CLOSE_ANIMATION_MS = 380

export const FILTER_GROUPS = [
  {
    id: 'periode',
    label: 'Période',
    multi: false,
    options: [
      { id: 'aujourdhui', label: "Aujourd'hui" },
      { id: 'semaine', label: 'Cette semaine' },
      { id: 'mois', label: 'Ce mois' },
      { id: 'annee', label: 'Cette année' },
      { id: 'personnalise', label: 'Personnalisé' },
    ],
  },
  {
    id: 'type',
    label: 'Questionnaire envoyé',
    multi: true,
    options: [
      { id: 'certifie-os', label: 'Certifié OS', icon: iconFilterOsCertifWhite, iconMuted: iconFilterOsDark },
      { id: 'standard-os', label: 'Simple OS', icon: iconFilterOsCertifWhite, iconMuted: iconFilterOsDark },
    ],
  },
  {
    id: 'etat',
    label: "État de l'envoi du questionnaire",
    multi: true,
    options: [
      { id: 'en-attente', label: 'En attente' },
      { id: 'expire', label: 'Expiré' },
      { id: 'archive', label: 'Archivé' },
    ],
  },
  {
    id: 'source',
    // No review exists yet while "En attente" is active (see the État
    // group above) -- hidden outright instead of shown disabled, rather
    // than greying out a whole section of chips the user can't use anyway.
    hiddenWhenPending: true,
    label: "Source de l'avis",
    multi: true,
    options: [
      { id: 'opinion-system', label: 'Opinion System', icon: iconFilterOsWhite, iconMuted: iconFilterOsDark },
      { id: 'google', label: 'Google', icon: iconFilterGoogleColor },
    ],
  },
  {
    id: 'note',
    hiddenWhenPending: true,
    label: "Note de l'avis",
    multi: true,
    options: [
      { id: 'positif', label: 'Positif' },
      { id: 'neutre', label: 'Neutre' },
      { id: 'negatif', label: 'Négatif' },
    ],
  },
  {
    id: 'nps',
    hiddenWhenPending: true,
    label: 'Badge NPS',
    multi: true,
    options: [
      { id: 'promoteur', label: 'Promoteur' },
      { id: 'passif', label: 'Passif' },
      { id: 'detracteur', label: 'Détracteur' },
    ],
  },
  {
    id: 'reponse',
    hiddenWhenPending: true,
    label: "Réponse a l'avis",
    multi: false,
    options: [
      { id: 'sans-reponse', label: 'Sans-Réponse' },
      { id: 'avis-repondu', label: 'Répondu' },
    ],
  },
  {
    id: 'googleSharing',
    hiddenWhenPending: true,
    label: 'Partage sur Google',
    multi: true,
    // Google's logo always renders in its own brand colors (no muted
    // variant) regardless of selection -- unlike the OS icons above,
    // which do dim when unselected.
    options: [
      { id: 'google-partage', label: 'Google Partagé', icon: iconFilterGoogleCertif },
      { id: 'google-non-partage', label: 'Google Non-Partagé', icon: iconFilterGoogleCertif },
    ],
  },
]

export const EMPTY_FILTERS = {
  source: [],
  etat: [],
  reponse: null,
  note: [],
  nps: [],
  type: [],
  googleSharing: [],
  periode: null,
  periodeRange: { start: '', end: '' },
}

// Cross-group rules: selecting the option on the left disables (and, if
// already selected, clears) the option on the right -- combinations that
// don't make sense together in this data model. One-directional by design
// (only listed here in the direction the product asked for). Omitting
// disablesOption disables every option in that group instead of just one.
const DISABLE_RULES = [
  { whenGroup: 'source', whenOption: 'google', disablesGroup: 'googleSharing', disablesOption: 'google-non-partage' },
  { whenGroup: 'type', whenOption: 'standard-os', disablesGroup: 'source', disablesOption: 'google' },
  { whenGroup: 'reponse', whenOption: 'avis-repondu', disablesGroup: 'reponse', disablesOption: 'sans-reponse' },

  // "En attente": no review exists yet, so nothing about it (its source,
  // note, badge, whether it got a reply, whether it's shared on Google) is
  // meaningful to filter on. "Expiré"/"Archivé" force this on too (see
  // AUTO_SELECT_RULES below), so they inherit the same disables for free
  // instead of needing their own copies of these five rules.
  { whenGroup: 'etat', whenOption: 'en-attente', disablesGroup: 'source' },
  { whenGroup: 'etat', whenOption: 'en-attente', disablesGroup: 'note' },
  { whenGroup: 'etat', whenOption: 'en-attente', disablesGroup: 'nps' },
  { whenGroup: 'etat', whenOption: 'en-attente', disablesGroup: 'reponse' },
  { whenGroup: 'etat', whenOption: 'en-attente', disablesGroup: 'googleSharing' },

  // "Expiré" and "Archivé" are mutually exclusive -- a questionnaire is
  // either one or the other, never both.
  { whenGroup: 'etat', whenOption: 'expire', disablesGroup: 'etat', disablesOption: 'archive' },
  { whenGroup: 'etat', whenOption: 'archive', disablesGroup: 'etat', disablesOption: 'expire' },

  // Both auto-select "En attente" on (see AUTO_SELECT_RULES below) and
  // depend on it staying selected -- locks the chip so it can't be toggled
  // back off out from under them while either is active. noClear: this
  // rule is the reason "En attente" IS selected right now, so the usual
  // clear-on-disable behavior (see toggleOption) would immediately undo
  // the auto-select that just put it there.
  { whenGroup: 'etat', whenOption: 'expire', disablesGroup: 'etat', disablesOption: 'en-attente', noClear: true },
  { whenGroup: 'etat', whenOption: 'archive', disablesGroup: 'etat', disablesOption: 'en-attente', noClear: true },
]

// Some options imply another option in the same group -- applied before
// DISABLE_RULES on every toggle (see toggleOption) so a rule keyed off the
// implied option fires in the same click instead of needing a second one.
const AUTO_SELECT_RULES = [
  { whenGroup: 'etat', whenOption: 'expire', alsoSelectGroup: 'etat', alsoSelectOption: 'en-attente' },
  { whenGroup: 'etat', whenOption: 'archive', alsoSelectGroup: 'etat', alsoSelectOption: 'en-attente' },
  // A Google-sourced review is trivially "on Google" -- pairs with the
  // DISABLE_RULES entry below that blocks "Google Non-Partagé" from being
  // selected alongside it, so filtering by Google source actually hides
  // non-partagé reviews instead of just greying out the chip that would've
  // shown them. clearOnDeselect undoes the pairing when Google source is
  // turned back off, so "Google Partagé" doesn't stay stuck selected and
  // keep hiding unshared Opinion System reviews afterward.
  {
    whenGroup: 'source',
    whenOption: 'google',
    alsoSelectGroup: 'googleSharing',
    alsoSelectOption: 'google-partage',
    clearOnDeselect: true,
  },
]

function groupIncludes(value, optionId) {
  return Array.isArray(value) ? value.includes(optionId) : value === optionId
}

function clearOption(value, optionId) {
  if (Array.isArray(value)) return value.filter(id => id !== optionId)
  return value === optionId ? null : value
}

// Every filter starts out enabled -- DISABLE_RULES only ever grey out an
// option as a RESULT of some other option actively being selected, never
// by default.
export function isOptionDisabled(groupId, optionId, filters) {
  return DISABLE_RULES.some(
    rule =>
      rule.disablesGroup === groupId &&
      (rule.disablesOption === undefined || rule.disablesOption === optionId) &&
      groupIncludes(filters[rule.whenGroup], rule.whenOption),
  )
}

export function countActiveFilters(filters) {
  return FILTER_GROUPS.reduce((total, group) => {
    const value = filters[group.id]
    return total + (group.multi ? value.length : value ? 1 : 0)
  }, 0)
}

export function getActiveFilterEntries(filters) {
  const entries = []
  FILTER_GROUPS.forEach(group => {
    const value = filters[group.id]
    const optionIds = group.multi ? value : value ? [value] : []
    optionIds.forEach(optionId => {
      const option = group.options.find(o => o.id === optionId)
      if (option) entries.push({ groupId: group.id, optionId, multi: group.multi, label: option.label })
    })
  })
  return entries
}

export function removeFilterEntry(filters, entry) {
  if (entry.multi) {
    return { ...filters, [entry.groupId]: filters[entry.groupId].filter(id => id !== entry.optionId) }
  }
  return { ...filters, [entry.groupId]: null }
}

// The AUTO_SELECT_RULES/DISABLE_RULES cascade that follows any change to
// changedGroupId's value -- shared so every place that mutates filters (the
// chip taps in this sheet's own toggleOption below, but also Reviews.jsx's
// "Mes Avis" tab shortcuts) gets the exact same business rules instead of
// the tabs silently bypassing them (e.g. leaving "Détracteur" selected
// alongside "En attente").
export function applyFilterRules(filters, changedGroupId) {
  const updated = { ...filters }

  // Auto-select first, so a rule keyed off the implied option (e.g.
  // selecting "Expiré" implying "En attente") also takes effect in this same
  // pass -- DISABLE_RULES below reads updated[changedGroupId], not the
  // pre-auto-select value, so it sees the implied option too.
  AUTO_SELECT_RULES.forEach(rule => {
    if (rule.whenGroup === changedGroupId && groupIncludes(updated[changedGroupId], rule.whenOption)) {
      const targetGroup = FILTER_GROUPS.find(g => g.id === rule.alsoSelectGroup)
      const targetValue = updated[rule.alsoSelectGroup]
      if (targetGroup.multi) {
        if (!targetValue.includes(rule.alsoSelectOption)) {
          updated[rule.alsoSelectGroup] = [...targetValue, rule.alsoSelectOption]
        }
      } else if (targetValue !== rule.alsoSelectOption) {
        updated[rule.alsoSelectGroup] = rule.alsoSelectOption
      }
    }
  })

  // Mirrors the pass above for any rule opted into it (clearOnDeselect) --
  // turning the trigger option back off undoes the pairing instead of
  // leaving the paired option stuck selected forever. Only applies to
  // rules that ask for it (e.g. NOT the etat:expire/archive ones, which
  // deliberately keep "en-attente" locked on via their own noClear
  // DISABLE_RULES instead of this).
  AUTO_SELECT_RULES.forEach(rule => {
    if (
      rule.clearOnDeselect &&
      rule.whenGroup === changedGroupId &&
      !groupIncludes(updated[changedGroupId], rule.whenOption)
    ) {
      updated[rule.alsoSelectGroup] = clearOption(updated[rule.alsoSelectGroup], rule.alsoSelectOption)
    }
  })

  // Newly selecting an option (directly, or via AUTO_SELECT_RULES above) can
  // invalidate an already-selected one in another group (see DISABLE_RULES)
  // -- clear it so a disabled chip is never left looking selected.
  DISABLE_RULES.forEach(rule => {
    if (rule.noClear) return
    if (rule.whenGroup === changedGroupId && groupIncludes(updated[changedGroupId], rule.whenOption)) {
      if (rule.disablesOption) {
        updated[rule.disablesGroup] = clearOption(updated[rule.disablesGroup], rule.disablesOption)
      } else {
        const targetGroup = FILTER_GROUPS.find(g => g.id === rule.disablesGroup)
        updated[rule.disablesGroup] = targetGroup.multi ? [] : null
      }
    }
  })

  return updated
}

export function FiltersSheet({ initialFilters, onClose, onReset, onApply }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [customStart, setCustomStart] = useState(initialFilters.periodeRange?.start || '')
  const [customEnd, setCustomEnd] = useState(initialFilters.periodeRange?.end || '')
  const isCustomRangeOpen = filters.periode === 'personnalise'
  const isApplyDisabled = isCustomRangeOpen && (!customStart || !customEnd)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const toggleOption = (group, optionId) => {
    setFilters(prev => {
      const current = prev[group.id]
      const next = group.multi
        ? current.includes(optionId)
          ? current.filter(id => id !== optionId)
          : [...current, optionId]
        : current === optionId
          ? null
          : optionId

      return applyFilterRules({ ...prev, [group.id]: next }, group.id)
    })
  }

  const renderChip = (group, option) => {
    const isSelected = group.multi ? filters[group.id].includes(option.id) : filters[group.id] === option.id
    const isDisabled = isOptionDisabled(group.id, option.id, filters)
    const icon = option.icon ? (isSelected ? option.icon : option.iconMuted || option.icon) : null
    return (
      <button
        key={option.id}
        type="button"
        className={`filters-sheet__chip${isSelected ? ' filters-sheet__chip--selected' : ''}`}
        onClick={() => toggleOption(group, option.id)}
        disabled={isDisabled}
      >
        {icon && <img src={icon} alt="" className="filters-sheet__chip-icon" />}
        {option.label}
      </button>
    )
  }

  const closeCustomRange = () => {
    setFilters(prev => ({ ...prev, periode: null }))
    setCustomStart('')
    setCustomEnd('')
  }

  const handleReset = () => {
    setFilters(EMPTY_FILTERS)
    setCustomStart('')
    setCustomEnd('')
    // Also clear the filters actually applied to the review list right
    // away, so reset takes effect immediately instead of silently
    // requiring a follow-up tap on "Appliquer les filtres" to stick.
    onReset?.()
  }

  const handleApply = () => {
    const finalFilters = { ...filters, periodeRange: { start: customStart, end: customEnd } }
    closeWithAnimation(() => onApply(finalFilters))
  }

  return (
    <div className={`filters-sheet-overlay${isClosing ? ' filters-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="filters-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`filters-sheet${isClosing && !isDragClosing ? ' filters-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Filtres"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="filters-sheet__handle-row" {...dragHandlers}>
          <span className="filters-sheet__handle" />
        </div>

        <div className="filters-sheet__appbar">
          <div className="filters-sheet__title-row">
            <p className="filters-sheet__title">Filtres</p>
            <button type="button" className="filters-sheet__reset" onClick={handleReset}>
              <img src={iconFilterReset} alt="" />
              Réinitialiser
            </button>
          </div>
          <button
            type="button"
            className="filters-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconFilterClose} alt="" />
          </button>
        </div>

        <div className="filters-sheet__content">
          {FILTER_GROUPS.filter(
            group => !group.hidden && !(group.hiddenWhenPending && filters.etat.includes('en-attente')),
          ).map(group => (
            <div className="filters-sheet__group" key={group.id}>
              <p className="filters-sheet__group-label">{group.label}</p>
              <div className="filters-sheet__chips">{group.options.map(option => renderChip(group, option))}</div>

              {group.id === 'periode' && isCustomRangeOpen && (
                <div className="filters-sheet__custom-range">
                  <div className="filters-sheet__custom-range-header">
                    <span>Période personnalisée</span>
                    <button
                      type="button"
                      className="filters-sheet__custom-range-close"
                      onClick={closeCustomRange}
                      aria-label="Fermer la sélection de dates"
                    >
                      <img src={iconFilterClose} alt="" />
                    </button>
                  </div>
                  <div className="filters-sheet__custom-range-fields">
                    <label className="filters-sheet__custom-range-field">
                      <span>Du</span>
                      <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                    </label>
                    <label className="filters-sheet__custom-range-field">
                      <span>Au</span>
                      <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="filters-sheet__footer">
          <button
            type="button"
            className={`filters-sheet__apply-btn${isApplyDisabled ? ' filters-sheet__apply-btn--disabled' : ''}`}
            onClick={handleApply}
            disabled={isApplyDisabled}
          >
            Appliquer les filtres
          </button>
          <div className="filters-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
