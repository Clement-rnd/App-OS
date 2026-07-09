import { useEffect, useState } from 'react'
import { BottomNav } from '../BottomNav/BottomNav'
import iconBuilding from '../../assets/profile/icon-building.svg'
import iconEditPencil from '../../assets/profile/icon-edit-pencil.svg'
import iconAddPlus from '../../assets/profile/icon-add-plus.svg'
import iconUserAvatar from '../../assets/profile/icon-user-avatar.svg'
import iconChipBuilding from '../../assets/profile/icon-chip-building.svg'
import iconLogout from '../../assets/profile/icon-logout.svg'
import { EditProfileSheet } from './EditProfileSheet'
import { EditCompanySheet } from './EditCompanySheet'
import { EditCollaboratorSheet } from './EditCollaboratorSheet'
import { CollaboratorsListSheet } from './CollaboratorsListSheet'
import { languageLabel } from './languages'
import './Profile.css'

const initialManager = {
  id: 'u-1',
  firstName: 'Olivier',
  lastName: 'Dubois',
  role: 'Manager',
  language: 'fr-FR',
  phone: '+33 6 12 34 56 78',
  email: 'olivier.dubois@lbi.fr',
}

const initialCompany = {
  name: 'La Boite Immobilier',
  logoUrl: null,
  coverUrl: null,
  brandColors: ['#2c95ff', '#1cb68d'],
}

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

const COLLABORATOR_TITLES = ['Conseiller', 'Négociateur', 'Assistant', 'Chargé de clientèle', 'Agent commercial', 'Gestionnaire']
const COLLABORATOR_LANGUAGES = ['fr-FR', 'en-CA']

const generatedCollaborators = Array.from({ length: 47 }, (_, i) => {
  const firstName = COLLABORATOR_FIRST_NAMES[i % COLLABORATOR_FIRST_NAMES.length]
  const lastName = COLLABORATOR_LAST_NAMES[i % COLLABORATOR_LAST_NAMES.length]
  return {
    id: `c-${i + 4}`,
    firstName,
    lastName,
    title: COLLABORATOR_TITLES[i % COLLABORATOR_TITLES.length],
    language: COLLABORATOR_LANGUAGES[i % COLLABORATOR_LANGUAGES.length],
    phone: `+33 6 ${String(10 + i).padStart(2, '0')} ${String(20 + i).padStart(2, '0')} ${String(30 + i).padStart(2, '0')} ${String(40 + i).padStart(2, '0')}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@lbi.fr`,
  }
})

const initialCollaborators = [
  {
    id: 'c-1',
    firstName: 'Marie',
    lastName: 'Dupont',
    title: 'Conseiller',
    language: 'fr-FR',
    phone: '+33 6 11 22 33 44',
    email: 'marie.dupont@lbi.fr',
  },
  {
    id: 'c-2',
    firstName: 'Thomas',
    lastName: 'Martin',
    title: 'Négociateur',
    language: 'fr-FR',
    phone: '+33 6 22 33 44 55',
    email: 'thomas.martin@lbi.fr',
  },
  {
    id: 'c-3',
    firstName: 'Sophie',
    lastName: 'Bernard',
    title: 'Assistant',
    language: 'en-CA',
    phone: '+33 6 33 44 55 66',
    email: 'sophie.bernard@lbi.fr',
  },
  ...generatedCollaborators,
]

function emptyCollaborator() {
  return { id: null, firstName: '', lastName: '', language: 'fr-FR', phone: '', email: '' }
}

function InfoRow({ label, value }) {
  return (
    <div className="profile__field-row">
      <p className="profile__field-label">{label}</p>
      <p className="profile__field-value">{value}</p>
    </div>
  )
}

export function Profile({ onNavigate, onLogout }) {
  const [currentUser, setCurrentUser] = useState(initialManager)
  const [company, setCompany] = useState(initialCompany)
  const [collaborators, setCollaborators] = useState(initialCollaborators)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [isCollaboratorsListOpen, setIsCollaboratorsListOpen] = useState(false)
  const [collaboratorSheetTarget, setCollaboratorSheetTarget] = useState(null)
  const [reopenListAfterCollaboratorEdit, setReopenListAfterCollaboratorEdit] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSaveProfile = updated => {
    setCurrentUser(updated)
    setIsEditingProfile(false)
  }

  const handleSaveCompany = updated => {
    setCompany(updated)
    setIsEditingCompany(false)
  }

  const openEditCollaborator = (collaborator, fromList) => {
    setReopenListAfterCollaboratorEdit(fromList)
    setIsCollaboratorsListOpen(false)
    setCollaboratorSheetTarget(collaborator)
  }

  const openAddCollaborator = fromList => {
    openEditCollaborator(emptyCollaborator(), fromList)
  }

  const closeCollaboratorSheet = () => {
    setCollaboratorSheetTarget(null)
    if (reopenListAfterCollaboratorEdit) setIsCollaboratorsListOpen(true)
  }

  const handleSaveCollaborator = updated => {
    const record = updated.id ? updated : { ...updated, id: crypto.randomUUID() }
    setCollaborators(list =>
      list.some(c => c.id === record.id) ? list.map(c => (c.id === record.id ? record : c)) : [...list, record]
    )
    closeCollaboratorSheet()
  }

  const handleDeleteCollaborator = id => {
    setCollaborators(list => list.filter(c => c.id !== id))
    closeCollaboratorSheet()
  }

  return (
    <div className="profile">
      <div className={`profile__sticky-top${isScrolled ? ' profile__sticky-top--scrolled' : ''}`}>
        <header className="profile__header">
          <div className="profile__status-bar" />
          <div className="profile__appbar">
            <h1 className="profile__title">Mon Compte</h1>
          </div>
        </header>

        <div className="profile__hero">
          <div className="profile__user-card">
            <span className="profile__user-card-avatar">
              <img src={iconUserAvatar} alt="" />
            </span>
            <div className="profile__user-card-text">
              <p className="profile__user-card-name">
                {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="profile__user-card-role">{currentUser.role}</p>
              <span className="profile__user-card-chip">
                <img src={iconChipBuilding} alt="" />
                {company.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile__panel">
        <div className="profile__content">
          <section className="profile__section">
            <p className="profile__section-title">Informations personnelles</p>
            <div className="profile__card">
              <div className="profile__card-body">
                <div className="profile__field-list">
                  <InfoRow label="Prénom" value={currentUser.firstName} />
                  <InfoRow label="Nom" value={currentUser.lastName} />
                  <InfoRow label="Langue" value={languageLabel(currentUser.language)} />
                  <InfoRow label="Téléphone" value={currentUser.phone} />
                  <InfoRow label="Mail" value={currentUser.email} />
                </div>

                <button type="button" className="profile__save-btn" onClick={() => setIsEditingProfile(true)}>
                  Modifier mon profil
                  <img src={iconEditPencil} alt="" />
                </button>
              </div>
            </div>
          </section>

          <section className="profile__section">
            <p className="profile__section-title">Informations Enreprises</p>
            <div
              className="profile__card profile__card--button"
              role="button"
              tabIndex={0}
              onClick={() => setIsEditingCompany(true)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setIsEditingCompany(true)
                }
              }}
            >
              <div className="profile__enterprise-row">
                <span className="profile__enterprise-icon-box">
                  <img src={iconBuilding} alt="" />
                </span>
                <div className="profile__enterprise-text">
                  <p className="profile__field-label-upper">Entreprise</p>
                  <p className="profile__enterprise-name">{company.name}</p>
                </div>
              </div>

              <div className="profile__cover-row">
                <p className="profile__field-label-upper">Image de couverture</p>
                <div className="profile__cover-box">
                  {company.coverUrl ? (
                    <img src={company.coverUrl} alt="Image de couverture" />
                  ) : (
                    <span className="profile__cover-placeholder">Non définie</span>
                  )}
                </div>
              </div>

              <div className="profile__colors-row">
                <p className="profile__field-label-upper">Couleurs de la marque</p>
                <div className="profile__colors-list">
                  {company.brandColors.map((color, index) => (
                    <span className="profile__color-chip" key={index}>
                      <span className="profile__color-swatch" style={{ backgroundColor: color }} />
                      <span className="profile__color-hex">{color.toUpperCase()}</span>
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="profile__save-btn profile__save-btn--company"
                onClick={e => {
                  e.stopPropagation()
                  setIsEditingCompany(true)
                }}
              >
                Modifier mon profil entreprise
                <img src={iconEditPencil} alt="" />
              </button>
            </div>
          </section>

          <section className="profile__section">
            <div className="profile__section-title-row">
              <p className="profile__section-title">
                Mes Collaborateurs <span className="profile__section-title-count">({collaborators.length})</span>
              </p>
            </div>
            <div className="profile__card">
              {collaborators.slice(0, 3).map((collaborator, index, arr) => (
                <div
                  className={`profile__collab-row${index === arr.length - 1 ? ' profile__collab-row--last' : ''}`}
                  key={collaborator.id}
                >
                  <span className="profile__collab-avatar">
                    {(collaborator.firstName[0] + collaborator.lastName[0]).toUpperCase()}
                  </span>
                  <div className="profile__collab-text">
                    <p className="profile__collab-name">
                      {collaborator.firstName} {collaborator.lastName}
                    </p>
                    <p className="profile__collab-title">{collaborator.title}</p>
                  </div>
                </div>
              ))}

              <div className="profile__see-all-row">
                <button type="button" className="profile__see-all-btn" onClick={() => setIsCollaboratorsListOpen(true)}>
                  Voir tout
                </button>
              </div>

              <button type="button" className="profile__add-collaborator-btn" onClick={() => openAddCollaborator(false)}>
                <img src={iconAddPlus} alt="" />
                Ajouter un collaborateur
              </button>
            </div>
          </section>

          <button type="button" className="profile__logout-btn" onClick={onLogout}>
            Déconnexion du compte
            <img src={iconLogout} alt="" />
          </button>
        </div>
      </div>

      <BottomNav active="user" onNavigate={onNavigate} />

      {isEditingProfile && (
        <EditProfileSheet user={currentUser} onClose={() => setIsEditingProfile(false)} onSave={handleSaveProfile} />
      )}

      {isEditingCompany && (
        <EditCompanySheet company={company} onClose={() => setIsEditingCompany(false)} onSave={handleSaveCompany} />
      )}

      {isCollaboratorsListOpen && (
        <CollaboratorsListSheet
          collaborators={collaborators}
          onClose={() => setIsCollaboratorsListOpen(false)}
          onEditCollaborator={collaborator => openEditCollaborator(collaborator, true)}
          onAddCollaborator={() => openAddCollaborator(true)}
        />
      )}

      {collaboratorSheetTarget && (
        <EditCollaboratorSheet
          collaborator={collaboratorSheetTarget}
          isNew={!collaboratorSheetTarget.id}
          onClose={closeCollaboratorSheet}
          onSave={handleSaveCollaborator}
          onDelete={handleDeleteCollaborator}
        />
      )}
    </div>
  )
}
