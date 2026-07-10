import { useEffect, useState } from 'react'
import logo from '../../assets/opinion-system-logo.svg'
import { SignUpModal } from '../SignUpModal/SignUpModal'
import './Login.css'

export function Login({ onLogin, onSkip, onForgotPassword }) {
  const [identifiant, setIdentifiant] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState({ identifiant: false, password: false })
  const [showSignUpModal, setShowSignUpModal] = useState(false)

  // Installed-PWA cold launch: iOS under-measures the layout viewport, so
  // every viewport-derived length (the CSS dvh fallback, lvh, fixed inset:
  // 0...) leaves the page box short of the physical screen bottom, exposing
  // bare canvas below it until a scroll forces a remeasure. The hardware
  // screen height is the one measurement already correct at launch, so in
  // standalone mode the page box is sized in real pixels instead. In a
  // browser tab screen.height is the monitor, not the window, so there the
  // CSS dvh fallback stays in charge.
  const [minHeight] = useState(() =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
      ? Math.max(window.screen.height, window.innerHeight)
      : undefined
  )

  useEffect(() => {
    // Safety net behind the px-sized box: the canvas color is the one paint
    // that provably (tested on-device) reaches the physical screen edges no
    // matter how the viewport resolves. Any sliver the sizing might ever
    // miss shows the gradient's own bottom navy instead of white.
    const html = document.documentElement
    const previous = html.style.backgroundColor
    html.style.backgroundColor = '#041b44'
    return () => {
      html.style.backgroundColor = previous
    }
  }, [])

  const isIdentifiantValid = identifiant.trim().length > 0
  const isPasswordValid = password.length >= 8
  const isValid = isIdentifiantValid && isPasswordValid

  const identifiantError = touched.identifiant && !isIdentifiantValid
  const passwordError = touched.password && !isPasswordValid

  return (
    <div className="login" style={minHeight !== undefined ? { minHeight } : undefined}>
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
          <div className="login__field">
            <div className={`login__input-wrapper${identifiantError ? ' login__input-wrapper--error' : ''}`}>
              <input
                className="login__input"
                type="text"
                placeholder="Votre identifiant"
                value={identifiant}
                onChange={e => setIdentifiant(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, identifiant: true }))}
              />
            </div>
            {identifiantError && (
              <p className="login__error-text">Entrez un nom d'utilisateur valide</p>
            )}
          </div>

          <div className="login__field">
            <div className={`login__input-wrapper${passwordError ? ' login__input-wrapper--error' : ''}`}>
              <input
                className="login__input"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
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
            {passwordError && (
              <p className="login__error-text">Entrez un mot de passe valide</p>
            )}
          </div>

          <div className="login__forgot-wrapper">
            <button className="login__forgot-btn" type="button" onClick={onForgotPassword}>
              Mot de passe oublié?
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
            <button
              className="login__register-btn"
              type="button"
              onClick={() => setShowSignUpModal(true)}
            >
              Inscrivez-vous
            </button>
          </div>
        </div>
      </div>

      {showSignUpModal && <SignUpModal onClose={() => setShowSignUpModal(false)} />}
    </div>
  )
}
