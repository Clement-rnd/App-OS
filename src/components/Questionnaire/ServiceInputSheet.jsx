import { useState } from 'react'
import iconClose from '../../assets/home/icon-detail-close.svg'
import iconServiceTag from '../../assets/questionnaire/icon-service-tag.svg'
import iconServiceHouse from '../../assets/questionnaire/icon-service-house.svg'
import iconServiceKey from '../../assets/questionnaire/icon-service-key.svg'
import iconServiceMagnifier from '../../assets/questionnaire/icon-service-magnifier.svg'
import iconCheckSelected from '../../assets/recipients/icon-check-selected.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './ServiceInputSheet.css'

const MAX_LENGTH = 80
const PLACEHOLDER = 'Exemple : Annonce exclusive : appartement de 2 chambres à Bordeaux'
const CLOSE_ANIMATION_MS = 380
const TITLE = 'Quel service avez-vous récemment fourni ?'
const INFO_BANNER_INTRO =
  'Les informations saisies ici seront visibles dans votre avis public. Assurez-vous qu’elles reflètent bien votre expérience.'
const INFO_BANNER_HINT = 'Sélectionnez une option ci-dessous ou rédigez votre propre texte.'

// Capped at 4 -- the most common services, so the list stays a quick pick;
// anything else can be typed directly into the field below.
const SERVICES = [
  {
    id: 'vente',
    title: 'Vente d’un bien',
    subtitle: 'Accompagnement pour la vente d’une maison ou d’un appartement',
    icon: iconServiceTag,
  },
  {
    id: 'achat',
    title: 'Achat d’un bien',
    subtitle: 'Accompagnement pour l’achat d’une maison ou d’un appartement',
    icon: iconServiceHouse,
  },
  {
    id: 'location',
    title: 'Location d’un bien',
    subtitle: 'Mise en location d’un bien pour le compte du propriétaire',
    icon: iconServiceKey,
  },
  {
    id: 'estimation',
    title: 'Estimation immobilière',
    subtitle: 'Évaluation de la valeur d’un bien immobilier',
    icon: iconServiceMagnifier,
  },
]

export function ServiceInputSheet({ initialValue, onClose, onSubmit }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [value, setValue] = useState(initialValue || '')
  const [isClosing, setIsClosing] = useState(false)
  const isValid = value.trim().length > 0
  // Derived, not stored -- a preset is "selected" only while the field's
  // text exactly matches its title, so typing a single character away from
  // a pick clears its checkmark instead of leaving a stale one behind.
  const selectedService = SERVICES.find(service => service.title === value.trim())

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const handleClose = () => closeWithAnimation(onClose)
  // Fills the field rather than submitting -- the user can still edit,
  // clear, or pick a different preset before confirming.
  const handleSelectService = service => setValue(service.title)
  const handleSubmit = () => closeWithAnimation(() => onSubmit?.(value.trim()))

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: handleClose,
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  return (
    <div className={`service-sheet-overlay${isClosing ? ' service-sheet-overlay--closing' : ''}`} style={{ height: screenHeight }}>
      <div className="service-sheet-backdrop" onClick={handleClose} />
      <div
        className={`service-sheet${isClosing && !isDragClosing ? ' service-sheet--closing' : ''}`}
        role="dialog"
        aria-label={TITLE}
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="service-sheet__handle-row" {...dragHandlers}>
          <span className="service-sheet__handle" />
        </div>

        <div className="service-sheet__appbar">
          <div className="service-sheet__title-row">
            <p className="service-sheet__title">{TITLE}</p>
          </div>
          <button type="button" className="service-sheet__close" onClick={handleClose} aria-label="Fermer">
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="service-sheet__banner-wrap">
          <p className="service-sheet__banner">
            {INFO_BANNER_INTRO}
            <span className="service-sheet__banner-hint">{INFO_BANNER_HINT}</span>
          </p>
        </div>

        <div className="service-sheet__scroll">
          <div className="service-sheet__list">
            {SERVICES.map(service => {
              const isSelected = service.id === selectedService?.id
              return (
                <button
                  key={service.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`service-sheet__item${isSelected ? ' service-sheet__item--selected' : ''}`}
                  onClick={() => handleSelectService(service)}
                >
                  <span className="service-sheet__item-badge">
                    <img src={service.icon} alt="" />
                  </span>
                  <span className="service-sheet__item-text">
                    <span className="service-sheet__item-title">{service.title}</span>
                    <span className="service-sheet__item-subtitle">{service.subtitle}</span>
                  </span>
                  {isSelected && <img src={iconCheckSelected} alt="" className="service-sheet__item-check" />}
                </button>
              )
            })}
          </div>

          <div className="service-sheet__content">
            <p className="service-sheet__field-label">Votre réponse</p>
            <div className="service-sheet__field">
              <textarea
                className="service-sheet__textarea"
                placeholder={PLACEHOLDER}
                value={value}
                maxLength={MAX_LENGTH}
                onChange={e => setValue(e.target.value)}
              />
              <span className="service-sheet__counter">
                {value.length}/{MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>

        <div className="service-sheet__footer">
          <button
            type="button"
            className={`service-sheet__submit-btn${isValid ? ' service-sheet__submit-btn--enabled' : ''}`}
            disabled={!isValid}
            onClick={handleSubmit}
          >
            Confirmer
          </button>
          <div className="service-sheet__home-indicator-wrap" />
        </div>
      </div>
    </div>
  )
}
