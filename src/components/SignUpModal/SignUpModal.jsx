import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import './SignUpModal.css'

export function SignUpModal({ onClose }) {
  useLockBodyScroll()
  return (
    <div className="sign-up-modal-overlay">
      <div className="sign-up-modal-backdrop" onClick={onClose} />
      <div className="sign-up-modal" role="dialog" aria-label="Inscrivez-vous avec Opinion System">
        <div className="sign-up-modal__header">
          <p className="sign-up-modal__title">
            Inscrivez-vous avec
            <br />
            Opinion System
          </p>
          <button
            type="button"
            className="sign-up-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none">
              <path
                d="M18.2198 4.71978C18.5127 4.42689 18.9874 4.42689 19.2803 4.71978C19.5732 5.01268 19.5732 5.48744 19.2803 5.78033L13.0606 12.0001L19.2803 18.2198C19.5732 18.5127 19.5732 18.9874 19.2803 19.2803C18.9874 19.5732 18.5127 19.5732 18.2198 19.2803L12.0001 13.0606L5.78033 19.2803C5.48744 19.5732 5.01268 19.5732 4.71978 19.2803C4.42689 18.9874 4.42689 18.5127 4.71978 18.2198L10.9395 12.0001L4.71978 5.78033C4.42689 5.48744 4.42689 5.01268 4.71978 4.71978C5.01268 4.42689 5.48744 4.42689 5.78033 4.71978L12.0001 10.9395L18.2198 4.71978Z"
                fill="#ffffff"
              />
            </svg>
          </button>
        </div>

        <div className="sign-up-modal__body">
          <p className="sign-up-modal__text">
            Valorisez votre expertise grâce à des avis contrôlés et une méthode certifiée
            <br />
            <br />
            Nos experts connaissent toutes les spécificités de votre secteur, quel qu'il soit. Ils
            vous guideront pour optimiser votre visibilité en ligne et construire une stratégie
            adaptée à vos objectifs.
            <br />
            <br />
            En choisissant de devenir membre du Système d'Opinion, vous optez pour la solution de
            référence en matière d'avis vérifiés.
            <br />
            <br />
            Prenez rendez-vous avec nous en remplissant le formulaire juste ci-dessous
          </p>

          <button type="button" className="sign-up-modal__form-btn">
            Remplissez le formulaire
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20" fill="none">
              <path
                d="M15.8333 15.8333H4.16667V4.16667H10V2.5H4.16667C3.24167 2.5 2.5 3.25 2.5 4.16667V15.8333C2.5 16.75 3.24167 17.5 4.16667 17.5H15.8333C16.75 17.5 17.5 16.75 17.5 15.8333V10H15.8333V15.8333ZM11.6667 2.5V4.16667H14.6583L6.46667 12.3583L7.64167 13.5333L15.8333 5.34167V8.33333H17.5V2.5H11.6667Z"
                fill="#2196f3"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
