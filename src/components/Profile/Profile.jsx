import { useState } from 'react'
import { BottomNav } from '../BottomNav/BottomNav'
import iconBack from '../../assets/profile/icon-back.svg'
import iconBuildingWhite from '../../assets/profile/icon-building-white.svg'
import iconSwap from '../../assets/profile/icon-swap.svg'
import iconBuilding from '../../assets/profile/icon-building.svg'
import iconEditPencil from '../../assets/profile/icon-edit-pencil.svg'
import { EditProfileSheet } from './EditProfileSheet'
import { EditCompanySheet } from './EditCompanySheet'
import { CollaboratorsScreen } from './CollaboratorsScreen'
import { languageLabel } from './languages'
import { CompanySelectSheet } from '../SelectCompany/CompanySelectSheet'
import { COMPANIES } from '../SelectCompany/SelectCompany'
import './Profile.css'

const initialManager = {
  id: 'u-1',
  firstName: 'Camille',
  lastName: 'Dubois',
  language: 'fr-FR',
  phone: '+33 6 12 34 56 78',
  email: 'camille.dubois@lbi.fr',
}

const initialCollaboratorSelf = {
  id: 'u-2',
  firstName: 'Lucas',
  lastName: 'Bernard',
  language: 'fr-FR',
  phone: '+33 6 98 76 54 32',
  email: 'lucas.bernard@lbi.fr',
}

const initialCompany = {
  name: 'Bastien Arfi Immobilier',
  contactEmail: 'bastien.arfi@immobilier.fr',
  logoUrl: null,
  coverUrl: null,
  brandColors: ['#2c95ff', '#1cb68d'],
}

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
]

function InfoRow({ label, value }) {
  return (
    <div className="profile__field-row">
      <p className="profile__field-label">{label}</p>
      <p className="profile__field-value">{value}</p>
    </div>
  )
}

export function Profile({ onNavigate }) {
  const [role, setRole] = useState('manager')
  const [manager, setManager] = useState(initialManager)
  const [collaboratorSelf, setCollaboratorSelf] = useState(initialCollaboratorSelf)
  const [company, setCompany] = useState(initialCompany)
  const [collaborators, setCollaborators] = useState(initialCollaborators)
  const [screen, setScreen] = useState('main')
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [isSelectingCompany, setIsSelectingCompany] = useState(false)

  const isManager = role === 'manager'
  const currentUser = isManager ? manager : collaboratorSelf
  const setCurrentUser = isManager ? setManager : setCollaboratorSelf

  const handleSaveProfile = updated => {
    setCurrentUser(updated)
    setIsEditingProfile(false)
  }

  const handleSaveCompany = updated => {
    setCompany(updated)
    setIsEditingCompany(false)
  }

  const handleSelectCompany = name => {
    setCompany(prev => ({ ...prev, name }))
    setIsSelectingCompany(false)
  }

  if (screen === 'collaborators') {
    return (
      <CollaboratorsScreen
        collaborators={collaborators}
        onChangeCollaborators={setCollaborators}
        onBack={() => setScreen('main')}
        onNavigate={onNavigate}
      />
    )
  }

  return (
    <div className="profile">
      <header className="profile__header">
        <div className="profile__status-bar" />
        <div className="profile__appbar">
          <button
            type="button"
            className="profile__back-btn"
            aria-label="Retour"
            onClick={() => onNavigate?.('home')}
          >
            <img src={iconBack} alt="" />
          </button>
          <h1 className="profile__title">Mon Profil</h1>
          <div className="profile__role-toggle" role="group" aria-label="Rôle">
            <button
              type="button"
              className={`profile__role-btn${!isManager ? ' profile__role-btn--active' : ''}`}
              onClick={() => setRole('collaborator')}
            >
              Collab.
            </button>
            <button
              type="button"
              className={`profile__role-btn${isManager ? ' profile__role-btn--active' : ''}`}
              onClick={() => setRole('manager')}
            >
              Gestionnaire
            </button>
          </div>
        </div>
      </header>

      <div className="profile__company-banner-wrap">
        <div
          className="profile__company-banner"
          role="button"
          tabIndex={0}
          aria-label="Sélectionner une entreprise"
          onClick={() => setIsSelectingCompany(true)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setIsSelectingCompany(true)
            }
          }}
        >
          <span className="profile__company-banner-avatar">
            <img src={iconBuildingWhite} alt="" />
          </span>
          <div className="profile__company-banner-text">
            <p className="profile__company-banner-name">{company.name}</p>
            <p className="profile__company-banner-email">{company.contactEmail}</p>
          </div>
          <span className="profile__company-banner-swap" aria-hidden="true">
            <img src={iconSwap} alt="" />
          </span>
        </div>
      </div>

      <div className="profile__panel">
        <section className="profile__section">
          <p className="profile__section-title">Informations personnelles</p>
          <div className="profile__card">
            <div className="profile__card-body">
              <div className="profile__person-row">
                <span className="profile__avatar">{currentUser.firstName[0]}</span>
                <div className="profile__person-text">
                  <p className="profile__person-name">
                    {currentUser.firstName} {currentUser.lastName}
                  </p>
                  <p className="profile__person-role">{isManager ? 'Gestionnaire' : 'Collaborateur'}</p>
                </div>
              </div>

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

        {isManager && (
          <>
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
              </div>
            </section>

            <section className="profile__section">
              <p className="profile__section-title profile__section-title--sm">Collaborateurs</p>
              <div
                className="profile__card profile__card--button"
                role="button"
                tabIndex={0}
                onClick={() => setScreen('collaborators')}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setScreen('collaborators')
                  }
                }}
              >
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
              </div>
            </section>
          </>
        )}
      </div>

      <BottomNav active="user" onNavigate={onNavigate} />

      {isEditingProfile && (
        <EditProfileSheet user={currentUser} onClose={() => setIsEditingProfile(false)} onSave={handleSaveProfile} />
      )}

      {isEditingCompany && (
        <EditCompanySheet company={company} onClose={() => setIsEditingCompany(false)} onSave={handleSaveCompany} />
      )}

      {isSelectingCompany && (
        <CompanySelectSheet
          companies={COMPANIES}
          selected={company.name}
          onSelect={handleSelectCompany}
          onClose={() => setIsSelectingCompany(false)}
        />
      )}
    </div>
  )
}
