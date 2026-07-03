import iconClose from '../../assets/questionnaire/icon-close.svg'
import iconSendDisabled from '../../assets/questionnaire/icon-send-disabled.svg'
import iconChevron from '../../assets/questionnaire/icon-chevron.svg'
import './Questionnaire.css'

const steps = [
  {
    number: 1,
    active: true,
    title: 'Quel service avez-vous récemment fourni ?',
    description: 'Veuillez préciser le service que vous avez récemment fourni à votre client.',
  },
  {
    number: 2,
    title: 'Sélectionnez une enquête à envoyer',
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
    description: 'Envoyez facilement un sondage à une ou plusieurs personnes pour recueillir leurs retours',
  },
]

function StepCard({ step }) {
  return (
    <div className={`questionnaire__step${step.active ? ' questionnaire__step--active' : ''}`}>
      <div className="questionnaire__step-badge">{step.number}</div>
      <div className="questionnaire__step-text">
        <p className="questionnaire__step-title">{step.title}</p>
        <p className="questionnaire__step-desc">{step.description}</p>
      </div>
      <button type="button" className="questionnaire__step-chevron" aria-label="Continuer">
        <img src={iconChevron} alt="" />
      </button>
    </div>
  )
}

export function Questionnaire({ onNavigate }) {
  return (
    <div className="questionnaire">
      <header className="questionnaire__header">
        <div className="questionnaire__status-bar" />
        <div className="questionnaire__appbar">
          <h1 className="questionnaire__title">Boostez vos avis !</h1>
          <button
            type="button"
            className="questionnaire__close-btn"
            aria-label="Fermer"
            onClick={() => onNavigate?.('home')}
          >
            <img src={iconClose} alt="" />
          </button>
        </div>
        <div className="questionnaire__progress">
          <div className="questionnaire__progress-fill" />
        </div>
      </header>

      <div className="questionnaire__content">
        <p className="questionnaire__description">
          Envoyer une enquête est un moyen efficace de recueillir les avis des clients.
          <br />
          <br />
          Suivez les étapes ci-dessous pour distribuer rapidement des enquêtes et augmenter vos avis.
        </p>

        {steps.map(step => (
          <StepCard key={step.number} step={step} />
        ))}
      </div>

      <footer className="questionnaire__footer">
        <button type="button" className="questionnaire__submit-btn" disabled>
          Envoyer le sondage
          <img src={iconSendDisabled} alt="" />
        </button>
        <div className="questionnaire__home-indicator">
          <span />
        </div>
      </footer>
    </div>
  )
}
