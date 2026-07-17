import { useState } from 'react'
import iconSheetClose from '../../assets/reviews/icon-sheet-close.svg'
import iconCompanySearch from '../../assets/reviews/icon-company-search.svg'
import iconCompanyBuilding from '../../assets/reviews/icon-company-building.svg'
import iconCompanyCheck from '../../assets/reviews/icon-company-check.svg'
import iconClearX from '../../assets/recipients/icon-clear-x.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './CompanySelectSheet.css'

const CLOSE_ANIMATION_MS = 380

export const COMPANIES = [
  { id: 'bastien-arfi', name: 'La Boîte IMMO' },
  { id: 'sofa-kingdom', name: 'Cabinet Moreau Immobilier' },
  { id: 'tech-solutions', name: 'Agence Bellevue Immobilier' },
  { id: 'green-valley', name: 'Résidences du Vallon' },
  { id: 'urban-nest', name: 'Citadine Immobilier' },
]

export function CompanySelectSheet({ selectedId, onClose, onSelect }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [query, setQuery] = useState('')
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

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = COMPANIES.filter(company => company.name.toLowerCase().includes(normalizedQuery))

  const handleSelect = company => {
    closeWithAnimation(() => onSelect(company))
  }

  return (
    <div className={`company-sheet-overlay${isClosing ? ' company-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="company-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`company-sheet${isClosing && !isDragClosing ? ' company-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Sélectionner une entreprise"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="company-sheet__handle-row" {...dragHandlers}>
          <span className="company-sheet__handle" />
        </div>

        <div className="company-sheet__appbar">
          <p className="company-sheet__title">Sélectionner une entreprise</p>
          <button
            type="button"
            className="company-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconSheetClose} alt="" />
          </button>
        </div>

        <div className="company-sheet__content">
          <div className="company-sheet__search-wrap">
            <div className="company-sheet__search">
              <img src={iconCompanySearch} alt="" />
              <input
                type="text"
                className="company-sheet__search-input"
                placeholder="Entrez un nom d'entreprise"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="company-sheet__search-clear"
                  onClick={() => setQuery('')}
                  aria-label="Effacer la recherche"
                >
                  <img src={iconClearX} alt="" />
                </button>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="company-sheet__empty">Aucun résultat pour « {query.trim()} »</p>
          ) : (
            <div className="company-sheet__list">
              {filtered.map(company => {
                const isSelected = company.id === selectedId
                return (
                  <button
                    key={company.id}
                    type="button"
                    className={`company-sheet__item${isSelected ? ' company-sheet__item--selected' : ''}`}
                    onClick={() => handleSelect(company)}
                  >
                    <span className="company-sheet__icon">
                      <img src={iconCompanyBuilding} alt="" />
                    </span>
                    <span className="company-sheet__name">{company.name}</span>
                    {isSelected && <img src={iconCompanyCheck} alt="" className="company-sheet__check" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
