import { useEffect, useState } from 'react'
import { BottomNav } from '../BottomNav/BottomNav'
import iconEditPencil from '../../assets/profile/icon-edit-pencil.svg'
import iconUserAvatar from '../../assets/profile/icon-user-avatar.svg'
import iconChipBuilding from '../../assets/profile/icon-chip-building.svg'
import iconLogout from '../../assets/profile/icon-logout.svg'
import { EditProfileSheet } from './EditProfileSheet'
import { languageLabel } from './languages'
import './Profile.css'

const initialManager = {
  id: 'u-1',
  firstName: 'Marc',
  lastName: 'Delacroix',
  role: 'Gestionnaire',
  language: 'fr-FR',
  phone: '+33 6 12 34 56 78',
  email: 'marc.delacroix@lbi.fr',
}

const initialCompany = {
  name: 'La Boîte IMMO',
  logoUrl: null,
  coverUrl: null,
  brandColors: ['#2c95ff', '#1cb68d'],
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
  const [company] = useState(initialCompany)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
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
    </div>
  )
}
