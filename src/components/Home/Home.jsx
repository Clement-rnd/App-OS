import logoCompact from '../../assets/home/logo-compact.svg'
import iconBell from '../../assets/home/icon-bell.svg'
import iconHouse from '../../assets/home/icon-house.svg'
import iconChat from '../../assets/home/icon-chat.svg'
import iconSend from '../../assets/home/icon-send.svg'
import iconUser from '../../assets/home/icon-user.svg'
import iconSwap from '../../assets/home/icon-swap.svg'
import iconStatNote from '../../assets/home/icon-stat-note.svg'
import iconStatReviews from '../../assets/home/icon-stat-reviews.svg'
import iconStatChevron from '../../assets/home/icon-stat-chevron.svg'
import phoneIllustration1 from '../../assets/home/phone-illustration-1.svg'
import phoneIllustration2 from '../../assets/home/phone-illustration-2.svg'
import phoneIllustration3 from '../../assets/home/phone-illustration-3.svg'
import backgroundStars from '../../assets/home/background-stars.svg'
import iconReviewRating from '../../assets/home/icon-review-rating.svg'
import iconStar from '../../assets/home/icon-star.svg'
import iconGoogle from '../../assets/home/icon-google.svg'
import iconArrowReply from '../../assets/home/icon-arrow-reply.svg'
import iconChevronRight from '../../assets/home/icon-chevron-right.svg'
import logoIconSmall from '../../assets/home/logo-icon-small.svg'
import './Home.css'

const reviews = [
  {
    id: 1,
    author: 'Jean David Lépineux',
    rating: '4.5',
    date: '06/09/2026',
    text: "Une expérience fantastique du début à la fin ! L'équipe était professionel et m'ont aider ...",
  },
  {
    id: 2,
    author: 'Jean David Lépineux',
    rating: '4.5',
    date: '06/09/2026',
    text: "Une expérience fantastique du début à la fin ! L'équipe était prof...",
  },
]

function ReviewCard({ review }) {
  return (
    <div className="home__review-card">
      <div className="home__review-title">
        <p className="home__review-author">{review.author}</p>
        <div className="home__review-score">
          <img src={iconReviewRating} alt="" />
          <span>{review.rating}</span>
        </div>
      </div>

      <div className="home__review-meta">
        <span className="home__review-date">{review.date}</span>
        <div className="home__review-stars">
          {Array.from({ length: 4 }).map((_, i) => (
            <img key={i} src={iconStar} alt="" className="home__review-star" />
          ))}
          <span className="home__review-star home__review-star--half">
            <img src={iconStar} alt="" className="home__review-star-bg" />
            <img src={iconStar} alt="" className="home__review-star-fg" />
          </span>
        </div>
      </div>

      <div className="home__review-chips">
        <span className="home__chip home__chip--promoter">Promoteur</span>
        <span className="home__chip home__chip--muted">
          <img src={logoIconSmall} alt="" />
          Certifié OS
        </span>
        <span className="home__chip home__chip--muted">
          <img src={iconGoogle} alt="" />
          Partagé
        </span>
      </div>

      <p className="home__review-text">{review.text}</p>

      <div className="home__review-actions">
        <button type="button" className="home__review-action">
          <img src={iconArrowReply} alt="" />
          Répondre
        </button>
        <button type="button" className="home__review-action home__review-action--end">
          Détails
          <img src={iconChevronRight} alt="" />
        </button>
      </div>
    </div>
  )
}

export function Home() {
  return (
    <div className="home">
      <header className="home__header">
        <div className="home__status-bar" />
        <div className="home__appbar">
          <img className="home__logo" src={logoCompact} alt="Opinion System" />
          <button className="home__notif-btn" type="button" aria-label="Notifications">
            <img src={iconBell} alt="" />
            <span className="home__notif-badge">1</span>
          </button>
        </div>
      </header>

      <div className="home__content">
        <div className="home__greeting">
          <div className="home__greeting-text">
            <p className="home__greeting-hello">Bonjour,</p>
            <p className="home__greeting-name">
              Annie Mation <span>👋</span>
            </p>
            <div className="home__greeting-company">
              <span>Bastien Arfi Immobilier</span>
              <button type="button" className="home__swap-btn" aria-label="Changer d'établissement">
                <img src={iconSwap} alt="" />
              </button>
            </div>
          </div>
          <div className="home__reputation">
            <span className="home__reputation-dot" />
            Réputation excellente
          </div>
        </div>

        <div className="home__dashboard">
          <div className="home__dashboard-col">
            <div className="home__stat home__stat--tint">
              <p className="home__stat-label">Ma note Opinion System</p>
              <div className="home__stat-value-row">
                <p className="home__stat-value">
                  4<span className="home__stat-value-sep">,</span>7<span className="home__stat-value-suffix">/5</span>
                </p>
                <img src={iconStatNote} alt="" className="home__stat-icon" />
              </div>
            </div>
            <div className="home__stat home__stat--tint">
              <p className="home__stat-label">Avis collectés</p>
              <div className="home__stat-value-row">
                <p className="home__stat-value home__stat-value--medium">527</p>
                <img src={iconStatReviews} alt="" className="home__stat-icon" />
              </div>
            </div>
          </div>
          <div className="home__dashboard-col">
            <div className="home__stat home__stat--light">
              <p className="home__stat-label home__stat-label--dark">Sans réponse</p>
              <div className="home__stat-value-row">
                <p className="home__stat-value home__stat-value--medium home__stat-value--dark">17</p>
                <img src={iconStatChevron} alt="" className="home__stat-icon home__stat-icon--dark" />
              </div>
            </div>
            <div className="home__stat home__stat--light">
              <p className="home__stat-label home__stat-label--dark">Relances à effectuer</p>
              <div className="home__stat-value-row">
                <p className="home__stat-value home__stat-value--medium home__stat-value--dark">06</p>
                <img src={iconStatChevron} alt="" className="home__stat-icon home__stat-icon--dark" />
              </div>
            </div>
          </div>
        </div>

        <div className="home__cta">
          <div className="home__cta-text">
            <h2 className="home__cta-heading">
              Améliorez
              <br />
              votre réputation
            </h2>
            <p className="home__cta-subtext">en envoyant des questionnaires</p>
            <button type="button" className="home__cta-btn">
              Récolter des avis
            </button>
          </div>
          <div className="home__cta-illustration">
            <img src={phoneIllustration1} alt="" className="home__cta-illustration-phone" />
            <img src={phoneIllustration2} alt="" className="home__cta-illustration-shadow" />
            <img src={phoneIllustration3} alt="" className="home__cta-illustration-star" />
            <img src={backgroundStars} alt="" className="home__cta-illustration-bg" />
          </div>
        </div>
      </div>

      <div className="home__reviews">
        <div className="home__reviews-header">
          <p className="home__reviews-title">Derniers avis reçus</p>
          <button type="button" className="home__reviews-see-all">
            Voir tout
          </button>
        </div>

        <div className="home__reviews-scroller">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        <div className="home__reviews-dots">
          <span className="home__dot home__dot--active" />
          <span className="home__dot" />
          <span className="home__dot" />
          <span className="home__dot" />
          <span className="home__dot" />
        </div>
      </div>

      <nav className="home__bottom-nav">
        <button type="button" className="home__nav-item home__nav-item--active">
          <span className="home__nav-icon-wrap">
            <img src={iconHouse} alt="" />
          </span>
          <span className="home__nav-label">Acceuil</span>
        </button>
        <button type="button" className="home__nav-item">
          <span className="home__nav-icon-wrap">
            <img src={iconChat} alt="" />
          </span>
        </button>
        <button type="button" className="home__nav-item">
          <span className="home__nav-icon-wrap">
            <img src={iconSend} alt="" />
          </span>
        </button>
        <button type="button" className="home__nav-item">
          <span className="home__nav-icon-wrap">
            <img src={iconUser} alt="" />
          </span>
        </button>
      </nav>
    </div>
  )
}
