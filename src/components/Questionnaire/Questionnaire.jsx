import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-close.svg'
import iconBack from '../../assets/questionnaire/icon-back.svg'
import iconSendDisabled from '../../assets/questionnaire/icon-send-disabled.svg'
import iconChevron from '../../assets/questionnaire/icon-chevron.svg'
import iconCheckFilled from '../../assets/questionnaire/icon-check-filled.svg'
import iconPencil from '../../assets/home/icon-pencil.svg'
import iconSurveyBadge from '../../assets/questionnaire/icon-survey-badge.svg'
import iconClipboardSimple from '../../assets/questionnaire/icon-clipboard-simple.svg'
import iconBenefitCheck from '../../assets/questionnaire/icon-benefit-check.svg'
import iconSurveySwap from '../../assets/questionnaire/icon-survey-swap.svg'
import iconDropdownChevron from '../../assets/questionnaire/icon-dropdown-chevron.svg'
import iconFlagFrance from '../../assets/questionnaire/icon-flag-france.svg'
import iconFlagCanada from '../../assets/questionnaire/icon-flag-canada.svg'
import iconFlagNetherlands from '../../assets/questionnaire/icon-flag-netherlands.svg'
import iconFlagItaly from '../../assets/questionnaire/icon-flag-italy.svg'
import iconAddRecipient from '../../assets/questionnaire/icon-add-recipient.svg'
import iconMinusCircle from '../../assets/questionnaire/icon-minus-circle.svg'
import { ServiceInputSheet } from './ServiceInputSheet'
import { SurveySelectSheet } from './SurveySelectSheet'
import { RecipientSelectSheet } from './RecipientSelectSheet'
import { EditRecipientSheet } from './EditRecipientSheet'
import { SendQuestionnaireSheet } from './SendQuestionnaireSheet'
import { ConfirmLeaveModal } from './ConfirmLeaveModal'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import { ContactsPermissionModal } from './ContactsPermissionModal'
import { ResponseAlert } from '../ResponseAlert/ResponseAlert'
import './Questionnaire.css'

// Matches RecipientSelectSheet's own MAX_RECIPIENTS -- once this many are
// added, "Ajouter un autre destinataire" has nothing left to add towards.
const MAX_RECIPIENTS = 5

const steps = [
  {
    number: 2,
    title: 'Quel service avez-vous récemment fourni ?',
    completedTitle: 'Détails du service',
    description: 'Veuillez préciser le service que vous avez récemment fourni à votre client.',
  },
  {
    number: 1,
    title: 'Sélectionnez un questionnaire à envoyer',
    completedTitle: 'Sélection de questionnaire',
    description: (
      <>
        Les avis recueillis à partir de ces questionnaires peuvent également être partagés sur{' '}
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
    description: 'Envoyez facilement un questionnaire à une ou plusieurs personnes pour recueillir leurs retours',
  },
]

// Chosen once, up front (see QuestionnaireTypeChoice) -- everything after
// this follows from it (which surveys show up in step 1, whether the
// resulting reviews can be shared to Google) instead of a tab the user
// could flip mid-flow.
const QUESTIONNAIRE_TYPES = [
  {
    id: 'certified',
    title: 'Questionnaire Certifié',
    icon: iconSurveyBadge,
    benefits: [
      'Certifié AFNOR triple et authentifié par Opinion System',
      'Une demande de partage de l’avis sur Google My Business sera faite à la fin du questionnaire, si la note globale est supérieure à 75% de satisfaction',
      'Renforce la crédibilité auprès de vos clients',
    ],
  },
  {
    id: 'simple',
    title: 'Questionnaire Simple',
    icon: iconClipboardSimple,
    benefits: [
      'Questions ouvertes, sans vérification',
      'Idéal pour les retours internes',
      'Mise en place rapide, sans certification',
      'Une demande de partage de l’avis sur Google My Business sera faite à la fin du questionnaire, si la note globale est supérieure à 75% de satisfaction',
    ],
  },
]

function QuestionnaireTypeChoice({ onSelect }) {
  return (
    <>
      <p className="questionnaire__description">
        Quel type de questionnaire souhaitez-vous envoyer&nbsp;? Ce choix déterminera les questionnaires disponibles
        à l&rsquo;étape suivante.
      </p>

      <div className="questionnaire__type-cards">
      {QUESTIONNAIRE_TYPES.map(type => (
        <button key={type.id} type="button" className="questionnaire__type-card" onClick={() => onSelect(type.id)}>
          <span className="questionnaire__type-card-header">
            <span className="questionnaire__type-card-badge">
              <img src={type.icon} alt="" />
            </span>
            <span className="questionnaire__type-card-title">{type.title}</span>
            <span className="questionnaire__type-card-chevron" aria-hidden="true">
              <img src={iconChevron} alt="" />
            </span>
          </span>
          <ul className="questionnaire__type-card-benefits">
            {type.benefits.map(benefit => (
              <li key={benefit}>
                <img src={iconBenefitCheck} alt="" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </button>
      ))}
      </div>
    </>
  )
}

const LANGUAGES = [
  { code: 'fr-FR', label: 'Français (France)', flag: iconFlagFrance },
  { code: 'en-CA', label: 'Anglais (Canada)', flag: iconFlagCanada },
  { code: 'nl-NL', label: 'Néerlandais (Pays-Bas)', flag: iconFlagNetherlands },
  { code: 'it-IT', label: 'Italien (Italie)', flag: iconFlagItaly },
]

const CATEGORIES = [
  { code: 'logement', label: 'Logement' },
  { code: 'auto-ecole', label: 'Auto-école' },
  { code: 'assurance', label: 'Assurance' },
  { code: 'aide-personne', label: 'Aide à la personne' },
]

const DROPDOWN_CLOSE_ANIMATION_MS = 200

function SurveyDetails({ survey, onChangeSurvey, language, onLanguageChange, category, onCategoryChange }) {
  const [isLanguageOpen, setLanguageOpen] = useState(false)
  const [isLanguageDropdownClosing, setLanguageDropdownClosing] = useState(false)
  const languageFieldRef = useRef(null)

  const [isCategoryOpen, setCategoryOpen] = useState(false)
  const [isCategoryDropdownClosing, setCategoryDropdownClosing] = useState(false)
  const categoryFieldRef = useRef(null)

  const closeLanguageDropdown = () => {
    if (isLanguageDropdownClosing) return
    setLanguageDropdownClosing(true)
    setTimeout(() => {
      setLanguageOpen(false)
      setLanguageDropdownClosing(false)
    }, DROPDOWN_CLOSE_ANIMATION_MS)
  }

  const toggleLanguageDropdown = () => {
    if (isLanguageOpen) {
      closeLanguageDropdown()
    } else {
      setCategoryOpen(false)
      setLanguageOpen(true)
    }
  }

  const closeCategoryDropdown = () => {
    if (isCategoryDropdownClosing) return
    setCategoryDropdownClosing(true)
    setTimeout(() => {
      setCategoryOpen(false)
      setCategoryDropdownClosing(false)
    }, DROPDOWN_CLOSE_ANIMATION_MS)
  }

  const toggleCategoryDropdown = () => {
    if (isCategoryOpen) {
      closeCategoryDropdown()
    } else {
      setLanguageOpen(false)
      setCategoryOpen(true)
    }
  }

  useEffect(() => {
    if (!isLanguageOpen) return

    const handlePointerDown = event => {
      if (languageFieldRef.current && !languageFieldRef.current.contains(event.target)) {
        closeLanguageDropdown()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLanguageOpen])

  useEffect(() => {
    if (!isCategoryOpen) return

    const handlePointerDown = event => {
      if (categoryFieldRef.current && !categoryFieldRef.current.contains(event.target)) {
        closeCategoryDropdown()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCategoryOpen])

  return (
    <div className="questionnaire__survey-card">
      <div className="questionnaire__field">
        <span className="questionnaire__field-label">Questionnaire</span>
        <div
          className="questionnaire__survey-selected questionnaire__survey-selected--clickable"
          onClick={onChangeSurvey}
          role="button"
          tabIndex={0}
          aria-label="Changer de questionnaire"
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
      </div>

      <div ref={languageFieldRef} className="questionnaire__field">
        <span className="questionnaire__field-label">Langue</span>
        <div
          className="questionnaire__field-row questionnaire__field-row--clickable"
          onClick={toggleLanguageDropdown}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleLanguageDropdown()
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
          <div
            className={`questionnaire__dropdown${isLanguageDropdownClosing ? ' questionnaire__dropdown--closing' : ''}`}
          >
            {LANGUAGES.map((lang, index) => (
              <button
                key={lang.code}
                type="button"
                className={`questionnaire__dropdown-item${
                  lang.code === language.code ? ' questionnaire__dropdown-item--selected' : ''
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => {
                  onLanguageChange(lang)
                  closeLanguageDropdown()
                }}
              >
                <img src={lang.flag} alt="" />
                {lang.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={categoryFieldRef} className="questionnaire__field">
        <span className="questionnaire__field-label">Catégorie</span>
        <div
          className="questionnaire__field-row questionnaire__field-row--clickable"
          onClick={toggleCategoryDropdown}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggleCategoryDropdown()
            }
          }}
        >
          <span className="questionnaire__field-value">{category.label}</span>
          <span className="questionnaire__field-chevron" aria-hidden="true">
            <img src={iconDropdownChevron} alt="" />
          </span>
        </div>
        {isCategoryOpen && (
          <div
            className={`questionnaire__dropdown${isCategoryDropdownClosing ? ' questionnaire__dropdown--closing' : ''}`}
          >
            {CATEGORIES.map((cat, index) => (
              <button
                key={cat.code}
                type="button"
                className={`questionnaire__dropdown-item${
                  cat.code === category.code ? ' questionnaire__dropdown-item--selected' : ''
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
                onClick={() => {
                  onCategoryChange(cat)
                  closeCategoryDropdown()
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function RecipientList({ recipients, onEditRecipient, onRemoveRecipient, onAddMore }) {
  return (
    <div className="questionnaire__recipients">
      {recipients.map(recipient => (
        <div key={recipient.id} className="questionnaire__recipient-row">
          <span className="questionnaire__recipient-avatar">{recipient.name[0]}</span>
          <span className="questionnaire__recipient-text">
            <span className="questionnaire__recipient-name">{recipient.name}</span>
            <span className="questionnaire__recipient-phone">{recipient.phone}</span>
          </span>
          <button
            type="button"
            className="questionnaire__recipient-edit"
            aria-label="Modifier"
            onClick={() => onEditRecipient(recipient)}
          >
            <img src={iconPencil} alt="" />
          </button>
          <button
            type="button"
            className="questionnaire__recipient-remove"
            aria-label="Retirer ce destinataire"
            onClick={() => onRemoveRecipient(recipient.id)}
          >
            <img src={iconMinusCircle} alt="" />
          </button>
        </div>
      ))}
      {recipients.length < MAX_RECIPIENTS && (
        <button type="button" className="questionnaire__recipient-add-btn" onClick={onAddMore}>
          <img src={iconAddRecipient} alt="" />
          Ajouter un autre destinataire
        </button>
      )}
    </div>
  )
}

function SendPlaneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" width="18" height="18">
      <path
        d="M13.557 1.25573C14.3301 0.998052 15.0853 1.72885 14.8245 2.51598L14.825 2.51647L10.9447 14.2816L10.9442 14.2831C10.6654 15.1195 9.52524 15.2129 9.11361 14.4398L6.51595 9.5609L1.71224 7.03258C0.933117 6.62295 1.02313 5.48021 1.86166 5.20055L13.555 1.25622L13.557 1.25573ZM2.1805 6.14831L7.118 8.74743L7.18148 8.78698C7.24153 8.83115 7.29117 8.88859 7.3265 8.95495L9.99496 13.9672L9.99545 13.9667L13.8748 2.20446L13.8739 2.20397L2.1805 6.14831Z"
        fill="#041b44"
      />
      <path
        d="M9.39619 6.04697C9.59126 5.85156 9.90778 5.85098 10.1032 6.046C10.2986 6.24108 10.2988 6.55759 10.1037 6.75303L7.279 9.58311C7.08399 9.77847 6.76742 9.77896 6.57197 9.58408C6.37654 9.38899 6.37591 9.072 6.571 8.87656L9.39619 6.04697Z"
        fill="#041b44"
      />
    </svg>
  )
}

// Same label-left/value-right divider row Profile's own InfoRow uses for
// "Informations personnelles" -- this summary is read-only in exactly the
// same way, so it reads as the same kind of information instead of
// inventing a new layout for it.
function SuccessFieldRow({ label, value }) {
  return (
    <div className="questionnaire__success-field-row">
      <p className="questionnaire__success-field-label">{label}</p>
      <p className="questionnaire__success-field-value">{value}</p>
    </div>
  )
}

function SuccessContent({ result }) {
  return (
    <>
      <p className="questionnaire__success-desc">Votre questionnaire a été envoyé avec succès&nbsp;!</p>

      <div className="questionnaire__success-card">
        <div className="questionnaire__success-sent-header">
          <span className="questionnaire__step-badge questionnaire__step-badge--done">
            <img src={iconCheckFilled} alt="" />
          </span>
          <p className="questionnaire__success-sent-title">Envoyé à :</p>
        </div>

        {result.recipients.map(recipient => (
          <div key={recipient.id} className="questionnaire__success-recipient">
            <span className="questionnaire__recipient-avatar">{recipient.name[0]}</span>
            <span className="questionnaire__recipient-text">
              <span className="questionnaire__recipient-name">{recipient.name}</span>
              <span className="questionnaire__recipient-phone">{recipient.phone}</span>
            </span>
            <span className="questionnaire__success-sent-status">
              <img src={iconSendDisabled} alt="" />
              <span className="questionnaire__success-sent-badge">
                <img src={iconCheckFilled} alt="" />
              </span>
            </span>
          </div>
        ))}

        <div className="questionnaire__success-details">
          <SuccessFieldRow label="Questionnaire" value={result.survey?.title} />
          <SuccessFieldRow label="Langue" value={result.language.label} />
          <SuccessFieldRow label="Catégorie" value={result.category.label} />
          <SuccessFieldRow label="Service" value={result.service} />
        </div>
      </div>
    </>
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
  // Asked once, up front, before any of the 3 steps below (see
  // QuestionnaireTypeChoice) -- 'certified' | 'simple' | null.
  const [questionnaireType, setQuestionnaireType] = useState(null)
  const [serviceAnswer, setServiceAnswer] = useState('')
  const [isServiceSheetOpen, setServiceSheetOpen] = useState(false)
  const [surveyAnswer, setSurveyAnswer] = useState(null)
  const [isSurveySheetOpen, setSurveySheetOpen] = useState(false)
  const [recipients, setRecipients] = useState([])
  const [isRecipientSheetOpen, setRecipientSheetOpen] = useState(false)
  const [isLeaveConfirmOpen, setLeaveConfirmOpen] = useState(false)
  const [isContactsPermissionOpen, setContactsPermissionOpen] = useState(false)
  const [editingRecipient, setEditingRecipient] = useState(null)
  const [isSendSheetOpen, setSendSheetOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  // Lifted out of SurveyDetails (rather than kept local to it) so the
  // success screen below can still read the final choice after the survey
  // step's own card has been replaced by that screen.
  const [language, setLanguage] = useState(LANGUAGES[0])
  const [category, setCategory] = useState(CATEGORIES[0])
  // Snapshot taken the moment sending completes (see handleQuestionnaireSent)
  // -- holds its own copy of everything the success screen shows, so it
  // keeps displaying "what was sent" even after handleSendAnother resets
  // the fields above for the next questionnaire.
  const [sentResult, setSentResult] = useState(null)
  const [sentAlert, setSentAlert] = useState(null)
  const hasContactsAccessRef = useRef(false)
  const screenHeight = useStandaloneScreenHeight()
  // Same iOS PWA viewport under-measurement as BottomNav/the sheet overlays:
  // `bottom: 0` (in Questionnaire.css) anchors to the mismeasured layout
  // viewport, leaving a gap below this footer down to the real screen
  // bottom. Anchoring from `top` at the hardware screen height and pulling
  // the footer up by its own (auto) height sidesteps the bad `bottom` math.
  const footerStandaloneStyle =
    screenHeight !== undefined ? { bottom: 'auto', top: screenHeight, transform: 'translateY(-100%)' } : undefined

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isComplete = Boolean(serviceAnswer) && Boolean(surveyAnswer) && recipients.length > 0
  const hasProgress =
    Boolean(questionnaireType) || Boolean(serviceAnswer) || Boolean(surveyAnswer) || recipients.length > 0
  const activeStepNumber = !surveyAnswer ? 1 : !serviceAnswer ? 2 : 3
  const completedStepsCount = [Boolean(serviceAnswer), Boolean(surveyAnswer), recipients.length > 0].filter(
    Boolean
  ).length
  const progressPercent = (completedStepsCount / steps.length) * 100

  const handleClose = () => {
    // Nothing left to lose once it's already sent -- leave straight away
    // instead of asking to confirm abandoning progress that no longer exists.
    if (hasProgress && !sentResult) {
      setLeaveConfirmOpen(true)
    } else {
      onNavigate?.('home')
    }
  }

  // A survey answer only makes sense for the type it was picked under --
  // switching type after already picking one clears it so step 1 doesn't
  // keep showing a certified survey while the flow is now "simple" (or
  // vice versa). Re-picking the same type leaves it untouched.
  const handleSelectQuestionnaireType = nextType => {
    if (surveyAnswer && surveyAnswer.type !== nextType) {
      setSurveyAnswer(null)
    }
    setQuestionnaireType(nextType)
  }

  const handleBackToTypeChoice = () => setQuestionnaireType(null)

  const handleQuestionnaireSent = () => {
    setSendSheetOpen(false)
    setSentResult({ recipients, service: serviceAnswer, survey: surveyAnswer, language, category })
    setSentAlert('Le questionnaire a été envoyé')
  }

  // Clears every field, including sentResult -- back to the step list for a
  // fresh questionnaire instead of staying on the success screen.
  const handleSendAnother = () => {
    setQuestionnaireType(null)
    setServiceAnswer('')
    setSurveyAnswer(null)
    setRecipients([])
    setLanguage(LANGUAGES[0])
    setCategory(CATEGORIES[0])
    setSentResult(null)
  }

  const openRecipientSheet = () => {
    if (hasContactsAccessRef.current) {
      setRecipientSheetOpen(true)
    } else {
      setContactsPermissionOpen(true)
    }
  }

  const handleAllowContacts = () => {
    hasContactsAccessRef.current = true
    setContactsPermissionOpen(false)
    setRecipientSheetOpen(true)
  }

  const handleDenyContacts = () => {
    setContactsPermissionOpen(false)
  }

  const handleSaveRecipient = updatedRecipient => {
    setRecipients(prev => prev.map(r => (r.id === updatedRecipient.id ? updatedRecipient : r)))
    setEditingRecipient(null)
  }

  const handleDeleteRecipient = recipientId => {
    setRecipients(prev => prev.filter(r => r.id !== recipientId))
    setEditingRecipient(null)
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
          {questionnaireType && !sentResult && (
            <button
              type="button"
              className="questionnaire__back-btn"
              aria-label="Retour"
              onClick={handleBackToTypeChoice}
            >
              <img src={iconBack} alt="" />
            </button>
          )}
          <h1 className="questionnaire__title">Récolter des avis</h1>
          <button
            type="button"
            className="questionnaire__close-btn"
            aria-label="Fermer"
            onClick={handleClose}
          >
            <img src={iconClose} alt="" />
          </button>
        </div>
        {questionnaireType && (
          <div className="questionnaire__progress">
            <div className="questionnaire__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </header>

      <div
        className="questionnaire__content"
        onAnimationEnd={e => {
          if (e.animationName === 'questionnaire-fade-up') {
            e.target.style.animation = 'none'
          }
        }}
      >
        {sentResult ? (
          <SuccessContent result={sentResult} />
        ) : !questionnaireType ? (
          <QuestionnaireTypeChoice onSelect={handleSelectQuestionnaireType} />
        ) : (
          <>
        <p className="questionnaire__description">
          Envoyer un questionnaire est un moyen efficace de recueillir les avis des clients.
          <br />
          <br />
          Suivez les étapes ci-dessous pour distribuer rapidement des questionnaires et augmenter vos avis.
        </p>

        <StepCard
          key={surveyAnswer ? 'survey-done' : 'survey-pending'}
          cardRef={el => (stepRefs.current[1] = el)}
          step={steps[1]}
          isCompleted={Boolean(surveyAnswer)}
          isActive={activeStepNumber === 1}
          onOpen={() => setSurveySheetOpen(true)}
        >
          {surveyAnswer && (
            <SurveyDetails
              survey={surveyAnswer}
              onChangeSurvey={() => setSurveySheetOpen(true)}
              language={language}
              onLanguageChange={setLanguage}
              category={category}
              onCategoryChange={setCategory}
            />
          )}
        </StepCard>

        <StepCard
          key={serviceAnswer ? 'service-done' : 'service-pending'}
          cardRef={el => (stepRefs.current[0] = el)}
          step={steps[0]}
          isCompleted={Boolean(serviceAnswer)}
          isActive={activeStepNumber === 2}
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
          key={recipients.length > 0 ? 'recipients-done' : 'recipients-pending'}
          cardRef={el => (stepRefs.current[2] = el)}
          step={steps[2]}
          isCompleted={recipients.length > 0}
          isActive={activeStepNumber === 3}
          onOpen={openRecipientSheet}
        >
          {recipients.length > 0 && (
            <RecipientList
              recipients={recipients}
              onEditRecipient={setEditingRecipient}
              onRemoveRecipient={handleDeleteRecipient}
              onAddMore={openRecipientSheet}
            />
          )}
        </StepCard>
          </>
        )}
      </div>

      <footer className="questionnaire__footer" style={footerStandaloneStyle}>
        {sentResult ? (
          <div className="questionnaire__success-footer-buttons">
            <button type="button" className="questionnaire__success-primary-btn" onClick={handleSendAnother}>
              Envoyer un autre questionnaire
              <SendPlaneIcon />
            </button>
            <button
              type="button"
              className="questionnaire__success-secondary-btn"
              onClick={() => onNavigate?.('home')}
            >
              Accueil
            </button>
          </div>
        ) : questionnaireType ? (
          <button
            type="button"
            className="questionnaire__submit-btn"
            disabled={!isComplete}
            onClick={() => setSendSheetOpen(true)}
          >
            Envoyer le questionnaire
            <img src={iconSendDisabled} alt="" />
          </button>
        ) : null}
        <div className="questionnaire__home-indicator" />
      </footer>

      {isServiceSheetOpen && (
        <ServiceInputSheet
          initialValue={serviceAnswer}
          categoryCode={category.code}
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
          type={questionnaireType}
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

      {editingRecipient && (
        <EditRecipientSheet
          recipient={editingRecipient}
          onClose={() => setEditingRecipient(null)}
          onSave={handleSaveRecipient}
        />
      )}

      {isSendSheetOpen && (
        <SendQuestionnaireSheet
          recipients={recipients}
          onClose={() => setSendSheetOpen(false)}
          onSent={handleQuestionnaireSent}
        />
      )}

      {sentAlert && (
        <ResponseAlert
          message={sentAlert}
          onClose={() => setSentAlert(null)}
          className="response-alert--above-success-footer"
        />
      )}
    </div>
  )
}
