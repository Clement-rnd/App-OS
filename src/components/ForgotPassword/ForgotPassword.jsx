import { useEffect, useState } from 'react'
import logo from '../../assets/opinion-system-logo.svg'
import illustration from '../../assets/forgot-password-illustration.svg'
import { StatusBar } from '../StatusBar/StatusBar'
import './ForgotPassword.css'

export function ForgotPassword({ onBack, onSendLink, onResetPassword }) {
  const [identifiant, setIdentifiant] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [sent, setSent] = useState(false)

  const isValid = identifiant.trim().length > 0 && !sent

  useEffect(() => {
    if (!showSuccess) return
    const dismissTimer = setTimeout(() => setShowSuccess(false), 4000)
    return () => clearTimeout(dismissTimer)
  }, [showSuccess])

  useEffect(() => {
    if (!sent) return
    // Simulates the user following the reset link sent by email.
    const redirectTimer = setTimeout(() => onResetPassword?.(), 5000)
    return () => clearTimeout(redirectTimer)
  }, [sent, onResetPassword])

  const handleSendLink = () => {
    setShowSuccess(true)
    setSent(true)
    onSendLink?.(identifiant)
  }

  return (
    <div className="forgot-password">
      <div className="forgot-password__header">
        <StatusBar />
      </div>

      <div className="forgot-password__logo-section">
        <img className="forgot-password__logo" src={logo} alt="Opinion System" />
        <img className="forgot-password__illustration" src={illustration} alt="" />
      </div>

      <div className="forgot-password__content">
        <div className="forgot-password__text">
          <h1 className="forgot-password__heading">Mot de passe oublié</h1>
          <p className="forgot-password__subtext">
            Utilisez le formulaire ci-dessous afin de recevoir un lien pour changer votre mot de
            passe.
          </p>
        </div>

        <div className="forgot-password__form">
          <div className="forgot-password__input-wrapper">
            <input
              className="forgot-password__input"
              type="text"
              placeholder="Identifiant"
              value={identifiant}
              onChange={e => setIdentifiant(e.target.value)}
            />
          </div>

          <div className="forgot-password__actions">
            <button className="forgot-password__back-btn" type="button" onClick={onBack}>
              Retour a la connexion
            </button>

            <button
              className={`forgot-password__send-btn${isValid ? ' forgot-password__send-btn--enabled' : ''}`}
              type="button"
              disabled={!isValid}
              onClick={handleSendLink}
            >
              Envoyer le lien
              <svg
                className="forgot-password__send-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                width="18"
                height="18"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.8393 5.38072L11.996 7.22408C11.7031 7.51697 11.2282 7.51697 10.9353 7.22408C10.6424 6.93119 10.6424 6.45631 10.9353 6.16342L12.7915 4.30717C12.7997 4.29899 12.8081 4.29099 12.8167 4.2832C13.7451 3.43693 14.964 2.98096 16.2199 3.01004C17.4759 3.03911 18.6723 3.551 19.5607 4.43933C20.449 5.32765 20.9609 6.52411 20.99 7.78005C21.019 9.036 20.5631 10.2549 19.7168 11.1833C19.7087 11.1922 19.7004 11.2009 19.6919 11.2094L17.0407 13.8512C17.0404 13.8515 17.04 13.8519 17.0397 13.8522C16.5879 14.3055 16.051 14.6652 15.4599 14.9106C14.8684 15.1563 14.2342 15.2828 13.5938 15.2828C12.9533 15.2828 12.3191 15.1563 11.7276 14.9106C11.136 14.665 10.5989 14.305 10.1468 13.8512C9.85446 13.5578 9.85535 13.0829 10.1488 12.7906C10.4422 12.4982 10.9171 12.4991 11.2094 12.7925C11.5221 13.1064 11.8937 13.3554 12.3029 13.5254C12.712 13.6953 13.1507 13.7828 13.5938 13.7828C14.0368 13.7828 14.4755 13.6953 14.8846 13.5254C15.2938 13.3554 15.6654 13.1064 15.9781 12.7925L15.98 12.7906L18.6197 10.1602C19.1987 9.51847 19.5104 8.6793 19.4904 7.81477C19.4702 6.94453 19.1155 6.11551 18.5 5.49999C17.8845 4.88447 17.0555 4.52978 16.1852 4.50963C15.3205 4.48961 14.4811 4.80145 13.8393 5.38072Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.4062 10.2172C9.96321 10.2172 9.52453 10.3047 9.11537 10.4746C8.70622 10.6446 8.33464 10.8936 8.02195 11.2075L8.02002 11.2094L8.02002 11.2094L5.38029 13.8398C4.8013 14.4815 4.48962 15.3207 4.50963 16.1852C4.52978 17.0555 4.88447 17.8845 5.49999 18.5C6.11551 19.1155 6.94453 19.4702 7.81477 19.4904C8.67951 19.5104 9.51888 19.1986 10.1607 18.6193L12.004 16.7759C12.2969 16.483 12.7718 16.483 13.0647 16.7759C13.3576 17.0688 13.3576 17.5437 13.0647 17.8366L11.2085 19.6928C11.2003 19.701 11.1919 19.709 11.1833 19.7168C10.2549 20.5631 9.036 21.019 7.78005 20.99C6.52411 20.9609 5.32765 20.449 4.43933 19.5607C3.551 18.6723 3.03911 17.4759 3.01004 16.2199C2.98096 14.964 3.43693 13.7451 4.2832 12.8167C4.29129 12.8078 4.2996 12.7991 4.30811 12.7906L6.9593 10.1488C6.95964 10.1484 6.95998 10.1481 6.96032 10.1478C7.41216 9.69451 7.94898 9.33483 8.54005 9.08935C9.13156 8.84369 9.76575 8.71724 10.4062 8.71724C11.0467 8.71724 11.6809 8.84369 12.2724 9.08935C12.864 9.33501 13.4011 9.69504 13.8532 10.1488C14.1455 10.4422 14.1447 10.9171 13.8512 11.2094C13.5578 11.5018 13.0829 11.5009 12.7906 11.2075C12.4779 10.8936 12.1063 10.6446 11.6971 10.4746C11.288 10.3047 10.8493 10.2172 10.4062 10.2172Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="forgot-password__alert" role="status">
          <svg
            className="forgot-password__alert-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 22 22"
            fill="none"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              d="M15.2075 6.94833L9.16667 12.9892L5.87583 9.7075L4.58333 11L9.16667 15.5833L16.5 8.25L15.2075 6.94833ZM11 1.83333C5.94 1.83333 1.83333 5.94 1.83333 11C1.83333 16.06 5.94 20.1667 11 20.1667C16.06 20.1667 20.1667 16.06 20.1667 11C20.1667 5.94 16.06 1.83333 11 1.83333ZM11 18.3333C6.94833 18.3333 3.66667 15.0517 3.66667 11C3.66667 6.94833 6.94833 3.66667 11 3.66667C15.0517 3.66667 18.3333 6.94833 18.3333 11C18.3333 15.0517 15.0517 18.3333 11 18.3333Z"
              fill="#43b6a3"
            />
          </svg>
          <p className="forgot-password__alert-text">
            Un lien de réinitialisation de mot de passe a été envoyé à votre adresse e-mail.
          </p>
        </div>
      )}
    </div>
  )
}
