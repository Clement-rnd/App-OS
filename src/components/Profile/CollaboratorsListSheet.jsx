import { useState } from 'react'
import iconClose from '../../assets/profile/icon-sheet-close.svg'
import iconSearch from '../../assets/profile/icon-search.svg'
import iconAvatarUser from '../../assets/profile/icon-avatar-user.svg'
import iconPencilBlue from '../../assets/profile/icon-pencil-blue.svg'
import iconAddPlusBlue from '../../assets/profile/icon-add-plus-blue.svg'
import iconClearX from '../../assets/recipients/icon-clear-x.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './CollaboratorsListSheet.css'

const CLOSE_ANIMATION_MS = 380

export function CollaboratorsListSheet({ collaborators, onClose, onEditCollaborator, onAddCollaborator }) {
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)
  const [search, setSearch] = useState('')

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const filteredCollaborators = collaborators.filter(collaborator =>
    `${collaborator.firstName} ${collaborator.lastName}`.toLowerCase().includes(search.trim().toLowerCase())
  )

  return (
    <div className={`collaborators-list-sheet-overlay${isClosing ? ' collaborators-list-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="collaborators-list-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`collaborators-list-sheet${isClosing && !isDragClosing ? ' collaborators-list-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Mes collaborateurs"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="collaborators-list-sheet__handle-row" {...dragHandlers}>
          <span className="collaborators-list-sheet__handle" />
        </div>

        <div className="collaborators-list-sheet__appbar">
          <p className="collaborators-list-sheet__title">Mes Collaborateurs</p>
          <button
            type="button"
            className="collaborators-list-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="collaborators-list-sheet__search-wrap">
          <div className="collaborators-list-sheet__search">
            <img src={iconSearch} alt="" />
            <input
              type="text"
              className="collaborators-list-sheet__search-input"
              placeholder="Entrez un nom d'un collaborateur"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="collaborators-list-sheet__search-clear"
                onClick={() => setSearch('')}
                aria-label="Effacer la recherche"
              >
                <img src={iconClearX} alt="" />
              </button>
            )}
          </div>
        </div>

        <div className="collaborators-list-sheet__content">
          <button type="button" className="collaborators-list-sheet__add-row" onClick={onAddCollaborator}>
            <img src={iconAddPlusBlue} alt="" />
            Ajouter un collaborateur
          </button>

          {filteredCollaborators.length === 0 ? (
            <p className="collaborators-list-sheet__empty">
              Aucun collaborateur ne correspond à « {search} »
            </p>
          ) : (
            filteredCollaborators.map(collaborator => (
              <div className="collaborators-list-sheet__row" key={collaborator.id}>
                <span className="collaborators-list-sheet__avatar">
                  <img src={iconAvatarUser} alt="" />
                </span>
                <span className="collaborators-list-sheet__row-text">
                  <p className="collaborators-list-sheet__row-name">
                    {collaborator.firstName} {collaborator.lastName}
                  </p>
                  <p className="collaborators-list-sheet__row-email">{collaborator.email}</p>
                </span>
                <button
                  type="button"
                  className="collaborators-list-sheet__edit-btn"
                  aria-label="Modifier"
                  onClick={() => onEditCollaborator(collaborator)}
                >
                  <img src={iconPencilBlue} alt="" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
