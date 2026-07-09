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

  useEffect(() => {
    // iOS PWA cold-launch quirk, established on-device: the layout viewport
    // is under-measured at launch and NO in-page layer can paint below it --
    // a position: fixed layer stops at the mismeasured line whether sized
    // with inset: 0 or 100lvh (both were tried; the band below stayed
    // unpainted). The document canvas (<html>'s background) is the one
    // surface always painted to the physical screen edges: flooding it with
    // a flat color did reach the gap. So the page gradient lives here, on
    // the canvas itself, sized against window.screen.height -- the real
    // hardware screen height, which is correct even at cold launch --
    // rather than any viewport-derived unit. Scoped to Login (the only
    // screen reached at cold launch, and the only dark one over the gap);
    // light pages keep the default white canvas, which their gap blends into.
    const html = document.documentElement
    const { body } = document
    const previous = {
      color: html.style.backgroundColor,
      image: html.style.backgroundImage,
      size: html.style.backgroundSize,
      repeat: html.style.backgroundRepeat,
      position: html.style.backgroundPosition,
      body: body.style.backgroundColor,
    }

    const apply = () => {
      // innerHeight wins in desktop browsers, where screen.height is the
      // monitor, not the window; on the phone at launch screen.height is
      // the reliable one. The gradient must never be shorter than either.
      const height = Math.max(window.screen.height, window.innerHeight)
      html.style.backgroundColor = '#041b44'
      html.style.backgroundImage = [
        'radial-gradient(ellipse at 120% 65%, rgba(0, 212, 146, 0.6) 0%, transparent 50%)',
        'radial-gradient(ellipse at -2% 36%, rgba(44, 149, 255, 0.3) 0%, transparent 50%)',
        'radial-gradient(ellipse at 105% -3%, rgba(44, 149, 255, 0.6) 0%, transparent 40%)',
        'linear-gradient(180deg, #000000 0%, #010711 20%, #020e22 40%, #041b44 100%)',
      ].join(', ')
      html.style.backgroundSize = `100% ${height}px`
      html.style.backgroundRepeat = 'no-repeat'
      html.style.backgroundPosition = 'top left'
    }
    apply()
    window.addEventListener('resize', apply)

    // Body must be transparent while <html> paints: once html has its own
    // background, body's white stops propagating to the canvas and would
    // instead paint inside its own box, covering the gradient.
    body.style.backgroundColor = 'transparent'

    return () => {
      window.removeEventListener('resize', apply)
      html.style.backgroundColor = previous.color
      html.style.backgroundImage = previous.image
      html.style.backgroundSize = previous.size
      html.style.backgroundRepeat = previous.repeat
      html.style.backgroundPosition = previous.position
      body.style.backgroundColor = previous.body
    }
  }, [])

  const isIdentifiantValid = identifiant.trim().length > 0
  const isPasswordValid = password.length >= 8
  const isValid = isIdentifiantValid && isPasswordValid

  const identifiantError = touched.identifiant && !isIdentifiantValid
  const passwordError = touched.password && !isPasswordValid

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
