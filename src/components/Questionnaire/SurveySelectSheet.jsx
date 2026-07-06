import { useLayoutEffect, useRef, useState } from 'react'
import iconClose from '../../assets/questionnaire/icon-sheet-close.svg'
import iconTabBadge from '../../assets/questionnaire/icon-tab-badge.svg'
import iconListBadge from '../../assets/questionnaire/icon-list-item-badge.svg'
import iconChevron from '../../assets/reviews/icon-chevron-big.svg'
import './SurveySelectSheet.css'

const CLOSE_ANIMATION_MS = 220

const CERTIFIED_SURVEYS = [
  { id: 'transaction', title: 'Transaction immobilière', subtitle: '10 questions - 3 fois certifié' },
  { id: 'satisfaction', title: 'Satisfaction client', subtitle: '10 questions - 3x certifié' },
  { id: 'suivi', title: 'Suivi post-enquête', subtitle: '10 questions - 3x certifié' },
]

const STANDARD_SURVEYS = [
  { id: 'equipe-1', title: 'Equipe Interne', subtitle: '10 questions - 3x certifié' },
  { id: 'equipe-2', title: 'Equipe Interne', subtitle: '10 questions - 3x certifié' },
]

const TAB_INFO = {
  certified: 'Certifié AFNOR triple et authentifié par Opinion System. Ces avis peuvent être partagés sur Google.',
  standard: 'Questions ouvertes, sans vérification. Idéal pour les retours internes.',
}

export function SurveySelectSheet({ onClose, onSelect }) {
  const [tab, setTab] = useState('certified')
  const [isClosing, setIsClosing] = useState(false)
  const [frameHeight, setFrameHeight] = useState(null)
  const contentRef = useRef(null)

  const closeWithAnimation = callback => {
    if (isClosing) return
    setIsClosing(true)
    setTimeout(callback, CLOSE_ANIMATION_MS)
  }

  const changeTab = nextTab => {
    if (nextTab === tab) return
    if (contentRef.current) {
      setFrameHeight(contentRef.current.scrollHeight)
    }
    setTab(nextTab)
  }

  useLayoutEffect(() => {
    if (frameHeight === null || !contentRef.current) return
    const newHeight = contentRef.current.scrollHeight
    const raf = requestAnimationFrame(() => setFrameHeight(newHeight))
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const surveys = tab === 'certified' ? CERTIFIED_SURVEYS : STANDARD_SURVEYS

  return (
    <div className={`survey-sheet-overlay${isClosing ? ' survey-sheet-overlay--closing' : ''}`}>
      <div className="survey-sheet-backdrop" onClick={() => closeWithAnimation(onClose)} />
      <div className="survey-sheet" role="dialog" aria-label="Sélectionnez une enquête à envoyer">
        <div className="survey-sheet__handle-row">
          <span className="survey-sheet__handle" />
        </div>

        <div className="survey-sheet__appbar">
          <p className="survey-sheet__title">Sélectionnez une enquête à envoyer</p>
          <button
            type="button"
            className="survey-sheet__close"
            onClick={() => closeWithAnimation(onClose)}
            aria-label="Fermer"
          >
            <img src={iconClose} alt="" />
          </button>
        </div>

        <div className="survey-sheet__tabs-wrap">
          <div className="survey-sheet__tabs">
            <div
              className="survey-sheet__tab-indicator"
              style={{ transform: tab === 'standard' ? 'translateX(100%)' : 'translateX(0%)' }}
            />
            <button
              type="button"
              className={`survey-sheet__tab${tab === 'certified' ? ' survey-sheet__tab--active' : ''}`}
              onClick={() => changeTab('certified')}
            >
              <img src={iconTabBadge} alt="" className="survey-sheet__tab-icon" />
              Certifié
            </button>
            <button
              type="button"
              className={`survey-sheet__tab${tab === 'standard' ? ' survey-sheet__tab--active' : ''}`}
              onClick={() => changeTab('standard')}
            >
              Standard
            </button>
          </div>
        </div>

        <div
          className="survey-sheet__tab-content-frame"
          style={frameHeight !== null ? { height: frameHeight } : undefined}
          onTransitionEnd={e => {
            if (e.target === e.currentTarget && e.propertyName === 'height') setFrameHeight(null)
          }}
        >
          <div className="survey-sheet__tab-content" key={tab} ref={contentRef}>
            <div className="survey-sheet__banner-wrap">
              <p className="survey-sheet__banner">{TAB_INFO[tab]}</p>
            </div>

            <div className="survey-sheet__list">
              {surveys.map(survey => (
                <button
                  key={survey.id}
                  type="button"
                  className="survey-sheet__item"
                  onClick={() => closeWithAnimation(() => onSelect(survey))}
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
