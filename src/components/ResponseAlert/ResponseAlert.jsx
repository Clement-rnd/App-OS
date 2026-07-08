import { useEffect } from 'react'
import './ResponseAlert.css'

const AUTO_DISMISS_MS = 4000

// Confirmation toast shown after submitting or editing a review response,
// shared by Home and Mes Avis so both give the same feedback.
export function ResponseAlert({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, AUTO_DISMISS_MS)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="response-alert" role="status">
      <p className="response-alert__text">{message}</p>
      <button type="button" className="response-alert__close" onClick={onClose} aria-label="Fermer">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
          <path
            d="M15.1828 3.93281C15.4268 3.68883 15.8225 3.68903 16.0666 3.93281C16.3107 4.17688 16.3107 4.57252 16.0666 4.8166L10.883 9.99921L16.0666 15.1828C16.3107 15.4269 16.3107 15.8225 16.0666 16.0666C15.8225 16.3107 15.4269 16.3107 15.1828 16.0666L9.99921 10.883L4.8166 16.0666C4.57252 16.3107 4.17688 16.3107 3.93281 16.0666C3.68903 15.8225 3.68883 15.4268 3.93281 15.1828L9.11542 9.99921L3.93281 4.8166C3.68912 4.57249 3.68886 4.17675 3.93281 3.93281C4.17675 3.68886 4.57249 3.68912 4.8166 3.93281L9.99921 9.11542L15.1828 3.93281Z"
            fill="#4294f7"
          />
        </svg>
      </button>
    </div>
  )
}
