import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-close.svg'
import iconSendDisabled from '../../assets/questionnaire/icon-send-disabled.svg'
import iconChevron from '../../assets/questionnaire/icon-chevron.svg'
import iconCheckFilled from '../../assets/questionnaire/icon-check-filled.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import iconSurveyBadge from '../../assets/questionnaire/icon-survey-badge.svg'
import iconSurveySwap from '../../assets/questionnaire/icon-survey-swap.svg'
import iconDropdownChevron from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import iconFlagFrance from '../../assets/questionnaire/icon-flag-france.svg'
import iconFlagCanada from '../../assets/questionnaire/icon-flag-canada.svg'
import iconFlagNetherlands from '../../assets/questionnaire/icon-flag-netherlands.svg'
import iconFlagItaly from '../../assets/questionnaire/icon-flag-italy.svg'
import { ServiceInputSheet } from './ServiceInputSheet'
import { SurveySelectSheet } from './SurveySelectSheet'
import { RecipientSelectSheet } from './RecipientSelectSheet'
import { ConfirmLeaveModal } from './ConfirmLeaveModal'
import { ContactsPermissionModal } from './ContactsPermissionModal'
import './Questionnaire.css'

const steps = [
  {
    number: 1,
    title: 'Quel service avez-vous récemment fourni ?',
    completedTitle: 'Détails du service',
    description: 'Veuillez préciser le service que vous avez récemment fourni à votre client.',
  },
  {
    number: 2,
    title: 'Sélectionnez une enquête à envoyer',
    completedTitle: "Sélection d'enquête",
    description: (
      <>
        Les avis recueillis à partir de ces enquêtes peuvent également être partagés sur{' '}
        <span className="questionnaire__google-g">G</span>
        <span className="questionnaire__google-o1">o</span>
        <span className="questionnaire__google-o2">o</span>
        <span className="questionnaire__google-g2">g</span>
        <span className="questionnaire__google-l">l</span>
        <span className="questionnaire__google-e">e</span>.
      </>
    ),
  },
  {
    number: 3,
    title: 'Sélectionnez votre(s) destinataire(s)',
    completedTitle: 'Sélectionnez votre(s) destinataire(s)',
    description: 'Envoyez facilement un sondage à une ou plusieurs personnes pour recueillir leurs retours',
  },
]

const LANGUAGES = [
  { code: 'fr-FR', label: 'Français (France)', flag: iconFlagFrance },
  { code: 'en-CA', label: 'Anglais (Canada)', flag: iconFlagCanada },
  { code: 'nl-NL', label: 'Néerlandais (Pays-Bas)', flag: iconFlagNetherlands },
  { code: 'it-IT', label: 'Italien (Italie)', flag: iconFlagItaly },
]

const DROPDOWN_CLOSE_ANIMATION_MS = 200

function SurveyDetails({ survey, onChangeSurvey }) {
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [isLanguageOpen, setLanguageOpen] = useState(false)
  const [isDropdownClosing, setDropdownClosing] = useState(false)
  const fieldRef = useRef(null)

  const closeDropdown = () => {
    if (isDropdownClosing) return
    setDropdownClosing(true)
    setTimeout(() => {
      setLanguageOpen(false)
      setDropdownClosing(false)
    }, DROPDOWN_CLOSE_ANIMATION_MS)
  }

  const toggleDropdown = () => {
    if (isLanguageOpen) {
      closeDropdown()
    } else {
      setLanguageOpen(true)
    }
  }

  useEffect(() => {
    if (!isLanguageOpen) return

    const handlePointerDown = event => {
      if (fieldRef.current && !fieldRef.current.contains(event.target)) {
        closeDropdown()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLanguageOpen])

  return (
    <div className="questionnaire__survey-card">
      <div
        className="questionnaire__survey-selected questionnaire__survey-selected--clickable"
        onClick={onChangeSurvey}
        role="button"
        tabIndex={0}
        aria-label="Changer d'enquête"
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onChangeSurvey()
          }
        }}
      >
        <span className="questionnaire__survey-selected-badge">
          <img src={iconSurveyBadge} alt="" />
        </span>
        <span className="questionnaire__survey-selected-text">
          <span className="questionnaire__survey-selected-title">{survey.title}</span>
          <span className="questionnaire__survey-selected-subtitle">{survey.subtitle}</span>
        </span>
        <span className="questionnaire__survey-swap" aria-hidden="true">
          <img src={iconSurveySwap} alt="" />
        </span>
      </div>

      <div ref={fieldRef} className={`questionnaire__field${isLanguageOpen ? ' questionnaire__field--focused' : ''}`}>
        <span className="questionnaire__field-label">Langue</span>
        <div
          className="questionnaire__field-row questionnaire__field-row--clickable"
          onClick={toggleDropdown}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleDropdown()
            }
          }}
        >
          <img src={language.flag} alt="" className="questionnaire__field-flag" />
          <span className="questionnaire__field-value">{language.label}</span>
          <span className="questionnaire__field-chevron" aria-hidden="true">
            <img src={iconDropdownChevron} alt="" />
          </span>
        </div>
        {isLanguageOpen && (
          <div className={`questionnaire__dropdown${isDropdownClosing ? ' questionnaire__dropdown--closing' : ''}`}>
            {LANGUAGES.map((lang, index) => (
              <button
                key={lang.code}
                type="button"
                className={`questionnaire__dropdown-item${
                  lang.code === language.code ? ' questionnaire__dropdown-item--selected' : ''
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => {
                  setLanguage(lang)
                  closeDropdown()
                }}
              >
                <img src={lang.flag} alt="" />
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="questionnaire__field">
        <span className="questionnaire__field-label">Catégorie</span>
        <div className="questionnaire__field-row">
          <span className="questionnaire__field-value">Logement</span>
          <span className="questionnaire__field-chevron questionnaire__field-chevron--static">
            <img src={iconDropdownChevron} alt="" />
          </span>
        </div>
      </div>
    </div>
  )
}

function RecipientList({ recipients, onEdit }) {
  return (
    <div className="questionnaire__recipients">
      {recipients.map(recipient => (
        <div key={recipient.id} className="questionnaire__recipient-row">
          <span className="questionnaire__recipient-avatar">{recipient.name[0]}</span>
          <span className="questionnaire__recipient-text">
            <span className="questionnaire__recipient-name">{recipient.name}</span>
            <span className="questionnaire__recipient-phone">{recipient.phone}</span>
          </span>
          <button type="button" className="questionnaire__recipient-edit" aria-label="Modifier" onClick={onEdit}>
            <img src={iconPencil} alt="" />
          </button>
        </div>
      ))}
    </div>
  )
}

function StepCard({ step, isCompleted, isActive, completedAction, onOpen, children, cardRef }) {
  if (isCompleted) {
    return (
      <div ref={cardRef} className="questionnaire__step questionnaire__step--completed">
        <div className="questionnaire__step-row">
          <div className="questionnaire__step-badge questionnaire__step-badge--done">
            <img src={iconCheckFilled} alt="" />
          </div>
          <p className="questionnaire__step-title">{step.completedTitle}</p>
          {completedAction}
        </div>
        {children}
      </div>
    )
  }

  return (
    <div
      ref={cardRef}
      className={`questionnaire__step${isActive ? ' questionnaire__step--active' : ''}${
        onOpen ? ' questionnaire__step--clickable' : ''
      }`}
      onClick={onOpen}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onKeyDown={
        onOpen
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen()
              }
            }
          : undefined
      }
    >
      <div className="questionnaire__step-badge">{step.number}</div>
      <div className="questionnaire__step-text">
        <p className="questionnaire__step-title">{step.title}</p>
        <p className="questionnaire__step-desc">{step.description}</p>
      </div>
      {onOpen && (
        <span className="questionnaire__step-chevron" aria-hidden="true">
          <img src={iconChevron} alt="" />
        </span>
      )}
    </div>
  )
}

export function Questionnaire({ onNavigate }) {
  const [serviceAnswer, setServiceAnswer] = useState('')
  const [isServiceSheetOpen, setServiceSheetOpen] = useState(false)
  const [surveyAnswer, setSurveyAnswer] = useState(null)
  const [isSurveySheetOpen, setSurveySheetOpen] = useState(false)
  const [recipients, setRecipients] = useState([])
  const [isRecipientSheetOpen, setRecipientSheetOpen] = useState(false)
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [isContactsPermissionOpen, setContactsPermissionOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const hasAskedContactsPermissionRef = useRef(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isComplete = Boolean(serviceAnswer) && Boolean(surveyAnswer) && recipients.length > 0
  const hasProgress = Boolean(serviceAnswer) || Boolean(surveyAnswer) || recipients.length > 0
  const activeStepNumber = !serviceAnswer ? 1 : !surveyAnswer ? 2 : 3

  const handleClose = () => {
    if (hasProgress) {
      setLeaveConfirmOpen(true)
    } else {
      onNavigate?.('home')
    }
  }

  const openRecipientSheet = () => {
    if (!hasAskedContactsPermissionRef.current) {
      setContactsPermissionOpen(true)
    }
    setRecipientSheetOpen(true)
  }

  const handleAllowContacts = () => {
    hasAskedContactsPermissionRef.current = true
    setContactsPermissionOpen(false)
  }

  const handleDenyContacts = () => {
    hasAskedContactsPermissionRef.current = true
    setContactsPermissionOpen(false)
    setRecipientSheetOpen(false)
  }

  const stepRefs = useRef([null, null, null])
  const prevStepRectsRef = useRef(null)

  const captureStepRects = () => {
    prevStepRectsRef.current = stepRefs.current.map(el => el?.getBoundingClientRect() ?? null)
  }

  useLayoutEffect(() => {
    const prevRects = prevStepRectsRef.current
    prevStepRectsRef.current = null
    if (!prevRects) return

    stepRefs.current.forEach((el, index) => {
      const prevRect = prevRects[index]
      if (!el || !prevRect) return
      const newRect = el.getBoundingClientRect()
      const deltaY = prevRect.top - newRect.top
      if (Math.abs(deltaY) < 1) return
      el.style.transition = 'none'
      el.style.transform = `translateY(${deltaY}px)`
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)'
          el.style.transform = ''
        })
      })
    })
  }, [serviceAnswer, surveyAnswer, recipients])

  return (
    <div className="questionnaire">
      <header className={`questionnaire__header${isScrolled ? ' questionnaire__header--scrolled' : ''}`}>
        <div className="questionnaire__status-bar" />
        <div className="questionnaire__appbar">
          <h1 className="questionnaire__title">Boostez vos avis !</h1>
          <button
            type="button"
            className="questionnaire__close-btn"
            aria-label="Fermer"
            onClick={handleClose}
          >
            <img src={iconClose} alt="" />
          </button>
        </div>
        <div className="questionnaire__progress">
          <div className="questionnaire__progress-fill" />
        </div>
      </header>

      <div
        className="questionnaire__content"
        onAnimationEnd={e => {
          if (e.animationName === 'questionnaire-fade-up') {
            e.target.style.animation = 'none'
          }
        }}
      >
        <p className="questionnaire__description">
          Envoyer une enquête est un moyen efficace de recueillir les avis des clients.
          <br />
          <br />
          Suivez les étapes ci-dessous pour distribuer rapidement des enquêtes et augmenter vos avis.
        </p>

        <StepCard
          key={serviceAnswer ? 'service-done' : 'service-pending'}
          cardRef={el => (stepRefs.current[0] = el)}
          step={steps[0]}
          isCompleted={Boolean(serviceAnswer)}
          isActive={activeStepNumber === 1}
          onOpen={() => setServiceSheetOpen(true)}
          completedAction={
            <button
              type="button"
              className="questionnaire__step-edit"
              aria-label="Modifier"
              onClick={() => setServiceSheetOpen(true)}
            >
              <img src={iconPencil} alt="" />
            </button>
          }
        >
          <p className="questionnaire__step-answer">{serviceAnswer}</p>
        </StepCard>

        <StepCard
          key={surveyAnswer ? 'survey-done' : 'survey-pending'}
          cardRef={el => (stepRefs.current[1] = el)}
          step={steps[1]}
          isCompleted={Boolean(surveyAnswer)}
          isActive={activeStepNumber === 2}
          onOpen={() => setSurveySheetOpen(true)}
        >
          {surveyAnswer && <SurveyDetails survey={surveyAnswer} onChangeSurvey={() => setSurveySheetOpen(true)} />}
        </StepCard>

        <StepCard
          key={recipients.length > 0 ? 'recipients-done' : 'recipients-pending'}
          cardRef={el => (stepRefs.current[2] = el)}
          step={steps[2]}
          isCompleted={recipients.length > 0}
          isActive={activeStepNumber === 3}
          onOpen={openRecipientSheet}
        >
          {recipients.length > 0 && <RecipientList recipients={recipients} onEdit={openRecipientSheet} />}
        </StepCard>
      </div>

      <footer className="questionnaire__footer">
        <button type="button" className="questionnaire__submit-btn" disabled={!isComplete}>
          Envoyer le sondage
          <img src={iconSendDisabled} alt="" />
        </button>
        <div className="questionnaire__home-indicator" />
      </footer>

      {isServiceSheetOpen && (
        <ServiceInputSheet
          initialValue={serviceAnswer}
          onClose={() => setServiceSheetOpen(false)}
          onSubmit={value => {
            captureStepRects()
            setServiceAnswer(value)
            setServiceSheetOpen(false)
          }}
        />
      )}

      {isSurveySheetOpen && (
        <SurveySelectSheet
          onClose={() => setSurveySheetOpen(false)}
          onSelect={survey => {
            captureStepRects()
            setSurveyAnswer(survey)
            setSurveySheetOpen(false)
          }}
        />
      )}

      {isRecipientSheetOpen && (
        <RecipientSelectSheet
          initialSelected={recipients}
          onClose={() => setRecipientSheetOpen(false)}
          onConfirm={selected => {
            captureStepRects()
            setRecipients(selected)
            setRecipientSheetOpen(false)
          }}
        />
      )}

      {isLeaveConfirmOpen && (
        <ConfirmLeaveModal
          onStay={() => setLeaveConfirmOpen(false)}
          onLeave={() => onNavigate?.('home')}
        />
      )}

      {isContactsPermissionOpen && (
        <ContactsPermissionModal onAllow={handleAllowContacts} onDeny={handleDenyContacts} />
      )}
    </div>
  )
}
