import { useState } from 'react'
import logo from '../../assets/opinion-system-logo.svg'
import './Login.css'

export function Login({ onLogin, onSkip }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isValid = email.includes('@') && password.length >= 8

  return (
    <div className="login">
      <div className="login__header">
        <div className="login__status-bar" />
        <button className="login__skip-btn" type="button" onClick={onSkip}>
          Skip
        </button>
      </div>

      <div className="login__logo-section">
        <img className="login__logo" src={logo} alt="Opinion System" />
        <p className="login__tagline">Leurs recommandations, Votre réputation.</p>
      </div>

      <div className="login__content">
        <div className="login__text">
          <h1 className="login__heading">Connectez-vous à votre compte</h1>
          <p className="login__subtext">
            {'Bon retour parmi nous !\nVeuillez saisir vos coordonnées.'}
          </p>
        </div>

        <div className="login__form">
          <div className="login__input-wrapper">
            <input
              className="login__input"
              type="email"
              placeholder="Votre identifiant"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="login__input-wrapper">
            <input
              className="login__input"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              className="login__eye-btn"
              onClick={() => setShowPassword(v => !v)}
              type="button"
              aria-label="Afficher le mot de passe"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#8ea1b2" width="20" height="20">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </button>
          </div>

          <div className="login__btn-wrapper">
            <button
              className={`login__btn${isValid ? ' login__btn--enabled' : ''}`}
              type="button"
              disabled={!isValid}
              onClick={onLogin}
            >
              Se connecter
            </button>
          </div>

          <div className="login__footer">
            <p className="login__footer-text">Vous n'avez pas de compte OS ?</p>
            <button className="login__register-btn" type="button">
              Inscrivez Vous
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
