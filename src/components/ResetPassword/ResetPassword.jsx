import { useState } from 'react'
import logo from '../../assets/opinion-system-logo.svg'
import { StatusBar } from '../StatusBar/StatusBar'
import './ResetPassword.css'

const REQUIREMENTS = [
  { key: 'lowercase', label: 'Un caractère minuscule', test: value => /[a-z]/.test(value) },
  { key: 'uppercase', label: 'Un caractère majuscule', test: value => /[A-Z]/.test(value) },
  {
    key: 'special',
    label: 'Un chiffre ou un caractère spécial',
    test: value => /[0-9!@#$%^&*(),.?":{}|<>_\-+=~`[\]/\\;']/.test(value),
  },
  { key: 'length', label: 'Minimum 8 caractères', test: value => value.length >= 8 },
]

function RequirementIcon({ satisfied }) {
  if (!satisfied) {
    return <span className="reset-password__hints-bullet" />
  }

  return (
    <svg
      className="reset-password__hints-check"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="none"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.8536 4.14645C14.0488 4.34171 14.0488 4.65829 13.8536 4.85355L6.85355 11.8536C6.65829 12.0488 6.34171 12.0488 6.14645 11.8536L2.64645 8.35355C2.45118 8.15829 2.45118 7.84171 2.64645 7.64645C2.84171 7.45118 3.15829 7.45118 3.35355 7.64645L6.5 10.7929L13.1464 4.14645C13.3417 3.95118 13.6583 3.95118 13.8536 4.14645Z"
        fill="#43b6a3"
      />
    </svg>
  )
}

function EyeToggleButton({ visible, onToggle }) {
  return (
    <button
      className="reset-password__eye-btn"
      onClick={onToggle}
      type="button"
      aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8ea1b2" width="20" height="20">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    </button>
  )
}

export function ResetPassword({ onBack, onResetPassword }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [confirmTouched, setConfirmTouched] = useState(false)

  const meetsRequirements = REQUIREMENTS.every(req => req.test(newPassword))
  const passwordsMatch = newPassword === confirmPassword
  const isValid = meetsRequirements && passwordsMatch && confirmPassword.length > 0
  const confirmError = confirmTouched && confirmPassword.length > 0 && !passwordsMatch

  return (
    <div className="reset-password">
      <div className="reset-password__header">
        <StatusBar />
      </div>

      <div className="reset-password__logo-section">
        <img className="reset-password__logo" src={logo} alt="Opinion System" />
      </div>

      <div className="reset-password__content">
        <div className="reset-password__text">
          <h1 className="reset-password__heading">Réinitialiser votre mot de passe</h1>
          <p className="reset-password__subtext">
            Saisissez et confirmez votre noveau mot de passe ci-dessous.
          </p>
        </div>

        <div className="reset-password__form">
          <div className="reset-password__fields">
            <div className="reset-password__input-wrapper">
              <input
                className="reset-password__input"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <EyeToggleButton
                visible={showNewPassword}
                onToggle={() => setShowNewPassword(v => !v)}
              />
            </div>

            <div className="reset-password__field">
              <div
                className={`reset-password__input-wrapper${confirmError ? ' reset-password__input-wrapper--error' : ''}`}
              >
                <input
                  className="reset-password__input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmez le mot de passe"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onBlur={() => setConfirmTouched(true)}
                />
                <EyeToggleButton
                  visible={showConfirmPassword}
                  onToggle={() => setShowConfirmPassword(v => !v)}
                />
              </div>
              {confirmError && (
                <p className="reset-password__error-text">
                  Les mots de passe ne correspondent pas
                </p>
              )}
            </div>
          </div>

          <div className="reset-password__hints">
            <p className="reset-password__hints-title">
              Votre mot de passe doit contenir au moins les éléments suivants :
            </p>
            <ul className="reset-password__hints-list">
              {REQUIREMENTS.map(req => {
                const satisfied = req.test(newPassword)
                return (
                  <li
                    key={req.key}
                    className={`reset-password__hints-item${satisfied ? ' reset-password__hints-item--satisfied' : ''}`}
                  >
                    <RequirementIcon satisfied={satisfied} />
                    {req.label}
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="reset-password__actions">
            <button className="reset-password__back-btn" type="button" onClick={onBack}>
              Retour a la connexion
            </button>

            <button
              className={`reset-password__submit-btn${isValid ? ' reset-password__submit-btn--enabled' : ''}`}
              type="button"
              disabled={!isValid}
              onClick={() => onResetPassword?.(newPassword)}
            >
              Réinitialiser le mot de passe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
