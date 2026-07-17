import { useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconListBadge from '../../assets/questionnaire/icon-list-item-badge.svg'
import iconChevron from '../../assets/reviews/icon-chevron-big.svg'
import { useSheetDrag } from '../../hooks/useSheetDrag'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { useStandaloneScreenHeight } from '../../hooks/useStandaloneScreenHeight'
import './SurveySelectSheet.css'

const CLOSE_ANIMATION_MS = 380
const SHEET_ENTRANCE_MS = 380

const CERTIFIED_SURVEYS = [
  { id: 'transaction', title: 'Transaction immobilière', subtitle: '10 questions - 3 fois certifié' },
  { id: 'satisfaction', title: 'Satisfaction client', subtitle: '10 questions - 3x certifié' },
  { id: 'suivi', title: 'Suivi post-questionnaire', subtitle: '10 questions - 3x certifié' },
]

const SIMPLE_SURVEYS = [
  { id: 'equipe-1', title: 'Equipe Interne', subtitle: '10 questions' },
  { id: 'equipe-2', title: 'Equipe Interne', subtitle: '10 questions' },
]

const TYPE_INFO = {
  certified: 'Certifié AFNOR triple et authentifié par Opinion System. Ces avis peuvent être partagés sur Google.',
  simple: 'Questions ouvertes, sans vérification. Idéal pour les retours internes.',
}

// The Certifié/Simple choice is made once, up front (see
// QuestionnaireTypeChoice) -- this sheet no longer offers a tab to switch
// between them, it just lists whichever type was already chosen.
export function SurveySelectSheet({ type, onClose, onSelect }) {
  useLockBodyScroll()
  const screenHeight = useStandaloneScreenHeight()
  const [isClosing, setIsClosing] = useState(false)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const { dragHandlers, dragStyle, isDragClosing } = useSheetDrag({
    onRequestClose: () => closeWithAnimation(onClose),
    closeDurationMs: CLOSE_ANIMATION_MS,
  })

  const surveys = type === 'certified' ? CERTIFIED_SURVEYS : SIMPLE_SURVEYS

  return (
    <div
      className={`survey-sheet-overlay${isClosing ? ' survey-sheet-overlay--closing' : ''}`}
      style={{ height: screenHeight }}
    >
      <div className="survey-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div
        className={`survey-sheet${isClosing && !isDragClosing ? ' survey-sheet--closing' : ''}`}
        role="dialog"
        aria-label="Sélectionnez un questionnaire à envoyer"
        style={{ ...dragStyle, maxHeight: screenHeight === undefined ? undefined : screenHeight * 0.9 }}
      >
        <div className="survey-sheet__handle-row" {...dragHandlers}>
          <span className="survey-sheet__handle" />
        </div>

        <div className="survey-sheet__appbar">
          <p className="survey-sheet__title">Sélectionnez un questionnaire à envoyer</p>
          <button
            type="button"
            className="survey-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="survey-sheet__tab-content-frame">
          <div className="survey-sheet__tab-content">
            <div className="survey-sheet__banner-wrap" style={{ animationDelay: `${SHEET_ENTRANCE_MS}ms` }}>
              <p className="survey-sheet__banner">{TYPE_INFO[type]}</p>
            </div>

            <div className="survey-sheet__list">
              {surveys.map((survey, index) => (
                <button
                  key={survey.id}
                  type="button"
                  className="survey-sheet__item"
                  style={{ animationDelay: `${SHEET_ENTRANCE_MS + 60 + index * 50}ms` }}
                  onClick={() => closeWithAnimation(() => onSelect({ ...survey, type }))}
                >
                  <span className="survey-sheet__item-badge">
                    <img src={iconListBadge} alt="" />
                  </span>
                  <span className="survey-sheet__item-text">
                    <span className="survey-sheet__item-title">{survey.title}</span>
                    <span className="survey-sheet__item-subtitle">{survey.subtitle}</span>
                  </span>
                  <img src={iconChevron} alt="" className="survey-sheet__item-chevron" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
