import { useState } from 'react'
import { BottomNav } from '../BottomNav/BottomNav'
import iconBack from '../../assets/profile/icon-back-dark.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import iconAddCollaborator from '../../assets/questionnaire/icon-add-recipient.svg'
import { EditCollaboratorSheet } from './EditCollaboratorSheet'
import './CollaboratorsScreen.css'

function emptyCollaborator() {
  return { id: null, firstName: '', lastName: '', language: 'fr-FR', phone: '', email: '' }
}

export function CollaboratorsScreen({ collaborators, onChangeCollaborators, onBack, onNavigate }) {
  const [editingCollaborator, setEditingCollaborator] = useState(null)
  const [isAdding, setIsAdding] = useState(false)

  const handleSave = updated => {
    const record = updated.id ? updated : { ...updated, id: crypto.randomUUID() }
    onChangeCollaborators(list =>
      list.some(c => c.id === record.id) ? list.map(c => (c.id === record.id ? record : c)) : [...list, record]
    )
    setEditingCollaborator(null)
    setIsAdding(false)
  }

  const handleDelete = id => {
    onChangeCollaborators(list => list.filter(c => c.id !== id))
    setEditingCollaborator(null)
  }

  return (
    <div className="collaborators-screen">
      <header className="collaborators-screen__header">
        <div className="collaborators-screen__status-bar" />
        <div className="collaborators-screen__appbar">
          <button type="button" className="collaborators-screen__back-btn" aria-label="Retour" onClick={onBack}>
            <img src={iconBack} alt="" />
          </button>
          <h1 className="collaborators-screen__title">Mes collaborateurs</h1>
          <span className="collaborators-screen__spacer" />
        </div>
      </header>

      <div className="collaborators-screen__content">
        {collaborators.map(collaborator => (
          <div className="collaborators-screen__row" key={collaborator.id}>
            <span className="collaborators-screen__avatar">{collaborator.firstName[0]}</span>
            <div className="collaborators-screen__row-text">
              <p className="collaborators-screen__row-name">
                {collaborator.firstName} {collaborator.lastName}
              </p>
              <p className="collaborators-screen__row-email">{collaborator.email}</p>
            </div>
            <button
              type="button"
              className="collaborators-screen__edit-btn"
              aria-label="Modifier"
              onClick={() => setEditingCollaborator(collaborator)}
            >
              <img src={iconPencil} alt="" />
            </button>
          </div>
        ))}

        <button type="button" className="collaborators-screen__add-btn" onClick={() => setIsAdding(true)}>
          <img src={iconAddCollaborator} alt="" />
          Ajouter un collaborateur
        </button>
      </div>

      <BottomNav active="user" onNavigate={onNavigate} />

      {editingCollaborator && (
        <EditCollaboratorSheet
          collaborator={editingCollaborator}
          onClose={() => setEditingCollaborator(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {isAdding && (
        <EditCollaboratorSheet
          collaborator={emptyCollaborator()}
          isNew
          onClose={() => setIsAdding(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
