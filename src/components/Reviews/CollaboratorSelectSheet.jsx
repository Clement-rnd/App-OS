import { useState } from 'react'
import iconSheetClose from '../../assets/reviews/icon-sheet-close.svg'
import iconCompanySearch from '../../assets/reviews/icon-company-search.svg'
import iconCollaboratorAvatar from '../../assets/reviews/icon-collaborator-avatar.svg'
import iconCompanyCheck from '../../assets/reviews/icon-company-check.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './CollaboratorSelectSheet.css'

const CLOSE_ANIMATION_MS = 380

export const COLLABORATORS = [
  { id: 'all', name: 'Tous les collaborateurs', isAll: true },
  { id: 'angela-belle', name: 'Angela Belle' },
  { id: 'sue-fley', name: 'Sue Fley' },
  { id: 'lou-natic', name: 'Lou Natic' },
  { id: 'marcus-torres', name: 'Marcus Torres' },
  { id: 'elena-vasquez', name: 'Elena Vasquez' },
  { id: 'james-chen', name: 'James Chen' },
  { id: 'priya-sharma', name: 'Priya Sharma' },
  { id: 'alex-dupont', name: 'Alex Dupont' },
  { id: 'mia-johnson', name: 'Mia Johnson' },
]

export function CollaboratorSelectSheet({ selectedId, onClose, onSelect }) {
  useLockBodyScroll()
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
  const filtered = COLLABORATORS.filter(collaborator => collaborator.name.toLowerCase().includes(normalizedQuery))

  const handleSelect = collaborator => {
    closeWithAnimation(() => onSelect(collaborator))
  }

  return (
    <div className={`collaborator-sheet-overlay${isClosing ? ' collaborator-sheet-overlay--closing' : ''}`}>
      <div className="collaborator-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`collaborator-sheet${isClosing && !isDragClosing ? ' collaborator-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Sélectionner un collaborateur"
        style={dragStyle}
      >
        <div className="collaborator-sheet__handle-row" {...dragHandlers}>
          <span className="collaborator-sheet__handle" />
        </div>

        <div className="collaborator-sheet__appbar">
          <p className="collaborator-sheet__title">Sélectionner un collaborateur</p>
          <button
            type="button"
            className="collaborator-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconSheetClose} alt="" />
          </button>
        </div>

        <div className="collaborator-sheet__content">
          <div className="collaborator-sheet__search-wrap">
            <div className="collaborator-sheet__search">
              <img src={iconCompanySearch} alt="" />
              <input
                type="text"
                className="collaborator-sheet__search-input"
                placeholder="Entrez un nom d'un collaborateur"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="collaborator-sheet__list">
            {filtered.map(collaborator => {
              const isSelected = collaborator.id === selectedId
              return (
                <button
                  key={collaborator.id}
                  type="button"
                  className={`collaborator-sheet__item${isSelected ? ' collaborator-sheet__item--selected' : ''}`}
                  onClick={() => handleSelect(collaborator)}
                >
                  {!collaborator.isAll && (
                    <span className="collaborator-sheet__icon">
                      <img src={iconCollaboratorAvatar} alt="" />
                    </span>
                  )}
                  <span className="collaborator-sheet__name">{collaborator.name}</span>
                  {isSelected && <img src={iconCompanyCheck} alt="" className="collaborator-sheet__check" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
