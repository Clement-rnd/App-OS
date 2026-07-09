import { useState } from 'react'
import iconSheetClose from '../../assets/reviews/icon-sheet-close.svg'
import iconCompanySearch from '../../assets/reviews/icon-company-search.svg'
import iconCollaboratorAvatar from '../../assets/reviews/icon-collaborator-avatar.svg'
import iconCompanyCheck from '../../assets/reviews/icon-company-check.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './CollaboratorSelectSheet.css'

const CLOSE_ANIMATION_MS = 380

const COLLABORATOR_FIRST_NAMES = [
  'Angela', 'Sue', 'Lou', 'Marcus', 'Elena', 'James', 'Priya', 'Alex', 'Mia', 'Julien',
  'Claire', 'Antoine', 'Hugo', 'Léa', 'Nicolas', 'Emma', 'Paul', 'Chloé', 'Louis', 'Manon',
  'Arthur', 'Sarah', 'Maxime', 'Julie', 'Romain', 'Laura', 'Nathan', 'Inès', 'Charlotte', 'Adam',
  'Zoé', 'Théo', 'Anna', 'Baptiste', 'Léna', 'Gabriel', 'Eva', 'Simon', 'Alice', 'Victor',
  'Jade', 'Noah', 'Lola', 'Tom', 'Sofia', 'Ethan', 'Rose',
]

const COLLABORATOR_LAST_NAMES = [
  'Belle', 'Fley', 'Natic', 'Torres', 'Vasquez', 'Chen', 'Sharma', 'Dupont', 'Johnson', 'Moreau',
  'Girard', 'Lefevre', 'Roux', 'Fontaine', 'Chevalier', 'Bertrand', 'Robin', 'Morel', 'Vidal', 'Caron',
  'Faure', 'Fournier', 'Andre', 'Mercier', 'Blanc', 'Guerin', 'Boyer', 'Garnier', 'Francois', 'Legrand',
  'Gauthier', 'Perrin', 'Robert', 'Clement', 'Morin', 'Henry', 'Rousseau', 'Mathieu', 'Marchand', 'Duval',
  'Denis', 'Dumont', 'Lemoine', 'Meunier', 'Michel', 'Leroy', 'Laurent',
]

const COLLABORATOR_COUNT = 75

// The first 9 keep their original plain-slug id ("angela-belle", etc.) --
// mockReviewsData.js's collaboratorId fields reference those directly to
// filter Mes Avis by collaborator. Everything past that only exists to
// populate the list up to COLLABORATOR_COUNT, so it gets an
// index-suffixed id that can never collide with them.
function collaboratorId(firstName, lastName, index) {
  const slug = `${firstName}-${lastName}`.toLowerCase()
  return index < 9 ? slug : `${slug}-${index}`
}

export const COLLABORATORS = [
  { id: 'all', name: 'Tous les collaborateurs', isAll: true },
  ...Array.from({ length: COLLABORATOR_COUNT }, (_, i) => {
    const firstName = COLLABORATOR_FIRST_NAMES[i % COLLABORATOR_FIRST_NAMES.length]
    const lastName = COLLABORATOR_LAST_NAMES[i % COLLABORATOR_LAST_NAMES.length]
    return {
      id: collaboratorId(firstName, lastName, i),
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@lbi.fr`,
    }
  }),
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

        <div className="collaborator-sheet__content">
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
                  <span className="collaborator-sheet__text">
                    <span className="collaborator-sheet__name">{collaborator.name}</span>
                    {collaborator.email && <span className="collaborator-sheet__email">{collaborator.email}</span>}
                  </span>
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
