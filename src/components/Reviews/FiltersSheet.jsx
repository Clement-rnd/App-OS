import { useState } from 'react'
import iconFilterReset from '../../assets/reviews/icon-filter-reset.svg'
import iconFilterClose from '../../assets/reviews/icon-filter-close.svg'
import iconFilterOsWhite from '../../assets/reviews/icon-filter-os-white.svg'
import iconFilterGoogleColor from '../../assets/reviews/icon-filter-google-color.svg'
import iconFilterOsCertifWhite from '../../assets/reviews/icon-filter-os-certif-white.svg'
import iconFilterOsDark from '../../assets/reviews/icon-filter-os-dark.svg'
import iconFilterGoogleCertif from '../../assets/reviews/icon-filter-google-certif.svg'
import iconFilterGoogleMuted from '../../assets/reviews/icon-filter-google-muted.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './FiltersSheet.css'

const CLOSE_ANIMATION_MS = 380

export const FILTER_GROUPS = [
  {
    id: 'source',
    label: 'Source',
    multi: true,
    options: [
      { id: 'opinion-system', label: 'Opinion System', icon: iconFilterOsWhite },
      { id: 'google', label: 'Google', icon: iconFilterGoogleColor },
    ],
  },
  {
    id: 'note',
    label: 'Note',
    multi: true,
    options: [
      { id: 'positif', label: 'Positif' },
      { id: 'neutre', label: 'Neutre' },
      { id: 'negatif', label: 'Négatif' },
    ],
  },
  {
    id: 'nps',
    label: 'Badge NPS',
    multi: true,
    muted: true,
    options: [
      { id: 'promoteur', label: 'Promoteur' },
      { id: 'passif', label: 'Passif' },
      { id: 'detracteur', label: 'Détracteur' },
    ],
  },
  {
    id: 'type',
    label: 'Type de Questionnaire',
    multi: true,
    options: [
      { id: 'certifie-os', label: 'Certifié OS', icon: iconFilterOsCertifWhite, iconMuted: iconFilterOsDark },
      { id: 'standard-os', label: 'Standard OS', icon: iconFilterOsCertifWhite, iconMuted: iconFilterOsDark },
      { id: 'google-partage', label: 'Google Partagé', icon: iconFilterGoogleCertif, iconMuted: iconFilterGoogleMuted },
      {
        id: 'google-non-partage',
        label: 'Google Non-Partagé',
        icon: iconFilterGoogleCertif,
        iconMuted: iconFilterGoogleMuted,
      },
    ],
  },
  {
    id: 'etat',
    label: 'Etat',
    multi: true,
    options: [
      { id: 'en-attente', label: 'En attente' },
      { id: 'sans-reponse', label: 'Sans réponse' },
      { id: 'expire', label: 'Expiré' },
      { id: 'archive', label: 'Archivé' },
    ],
  },
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
]

export const DEFAULT_FILTERS = {
  source: ['opinion-system'],
  note: ['positif'],
  nps: ['promoteur'],
  type: ['certifie-os', 'google-partage'],
  etat: [],
  periode: 'aujourdhui',
  periodeRange: { start: '', end: '' },
}

export const EMPTY_FILTERS = {
  source: [],
  note: [],
  nps: [],
  type: [],
  etat: [],
  periode: null,
  periodeRange: { start: '', end: '' },
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

export function FiltersSheet({ initialFilters, onClose, onApply }) {
  useLockBodyScroll()
  const [isClosing, setIsClosing] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [customStart, setCustomStart] = useState(initialFilters.periodeRange?.start || '')
  const [customEnd, setCustomEnd] = useState(initialFilters.periodeRange?.end || '')
  const isCustomRangeOpen = filters.periode === 'personnalise'

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
      if (group.multi) {
        const current = prev[group.id]
        const next = current.includes(optionId) ? current.filter(id => id !== optionId) : [...current, optionId]
        return { ...prev, [group.id]: next }
      }
      return { ...prev, [group.id]: prev[group.id] === optionId ? null : optionId }
    })
  }

  const closeCustomRange = () => {
    setFilters(prev => ({ ...prev, periode: null }))
    setCustomStart('')
    setCustomEnd('')
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setCustomStart('')
    setCustomEnd('')
  }

  const handleApply = () => {
    const finalFilters = { ...filters, periodeRange: { start: customStart, end: customEnd } }
    closeWithAnimation(() => onApply(finalFilters))
  }

  return (
    <div className={`filters-sheet-overlay${isClosing ? ' filters-sheet-overlay--closing' : ''}`}>
      <div className="filters-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`filters-sheet${isClosing && !isDragClosing ? ' filters-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Filtres"
        style={dragStyle}
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
          {FILTER_GROUPS.map(group => (
            <div className="filters-sheet__group" key={group.id}>
              <p className="filters-sheet__group-label">{group.label}</p>
              <div className="filters-sheet__chips">
                {group.options.map(option => {
                  const isSelected = group.multi
                    ? filters[group.id].includes(option.id)
                    : filters[group.id] === option.id
                  const icon = option.icon ? (isSelected ? option.icon : option.iconMuted || option.icon) : null
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={`filters-sheet__chip${isSelected ? ' filters-sheet__chip--selected' : ''}${
                        group.muted && !isSelected ? ' filters-sheet__chip--muted' : ''
                      }`}
                      onClick={() => toggleOption(group, option.id)}
                    >
                      {icon && <img src={icon} alt="" className="filters-sheet__chip-icon" />}
                      {option.label}
                    </button>
                  )
                })}
              </div>

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
          <button type="button" className="filters-sheet__apply-btn" onClick={handleApply}>
            Appliquer les filtres
          </button>
          <div className="filters-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
