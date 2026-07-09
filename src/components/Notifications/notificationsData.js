import iconStarBadge from '../../assets/notifications/icon-badge-check.svg'
import iconWarningBadge from '../../assets/notifications/icon-badge-warning.svg'
import iconFlagBadge from '../../assets/notifications/icon-badge-flag.svg'
import iconClockAvatar from '../../assets/notifications/icon-avatar-clock.svg'
import iconRocketAvatar from '../../assets/notifications/icon-avatar-rocket.svg'
import { COMPANY_REVIEWS_DATA } from '../Reviews/mockReviewsData'

export const NOTIFICATION_TYPES = {
  newReview: {
    badgeIcon: iconStarBadge,
    badgeColor: '#2c95ff',
  },
  negativeReview: {
    badgeIcon: iconWarningBadge,
    badgeColor: '#fc6530',
    actionType: 'respond',
  },
  avisARecuperer: {
    badgeIcon: iconFlagBadge,
    badgeColor: '#f7b600',
  },
  expiringDate: {
    avatarIcon: iconClockAvatar,
    avatarBg: 'rgba(247, 182, 0, 0.15)',
  },
  boostReviews: {
    avatarIcon: iconRocketAvatar,
    avatarBg: 'rgba(44, 149, 255, 0.15)',
    actionType: 'boost',
  },
  googleShareConfirmed: {
    badgeIcon: iconStarBadge,
    badgeColor: '#00d492',
  },
}

const TYPE_ORDER = ['newReview', 'negativeReview', 'avisARecuperer', 'expiringDate', 'boostReviews']

// Notifications about a review point at an *actual* review from "Mes Avis"
// (the default company's list, which is also Reviews.jsx's own default
// `selectedCompany`) instead of inventing separate, disconnected review
// data -- opening one for details, or responding to it, then acts on a
// review that genuinely exists in the list instead of a phantom entity
// with no reason to be there.
const DEFAULT_COMPANY_REVIEWS = COMPANY_REVIEWS_DATA['bastien-arfi'].reviews
const reviewById = id => DEFAULT_COMPANY_REVIEWS.find(review => review.id === id)

function starsLabel(rating) {
  const stars = Math.round(parseFloat(rating))
  return `${stars} étoile${stars > 1 ? 's' : ''}`
}

// Promoter reviews, still "sans réponse" -- freshly-arrived-and-unanswered
// is what makes a "new review" notification worth surfacing.
const NEW_REVIEW_IDS = ['bastien-arfi-1', 'bastien-arfi-9', 'bastien-arfi-37']
const NEW_REVIEW_MESSAGES = [
  review => `${review.author} a laissé un nouvel avis ${starsLabel(review.rating)} sur ${review.service}`,
  review => `${review.author} a laissé un nouvel avis sur ${review.service}`,
  review => `${review.author} a laissé un nouvel avis ${starsLabel(review.rating)} sur ${review.service}`,
]

// Détracteur reviews, still "sans réponse" -- these are the ones actually
// needing a reply.
const NEGATIVE_REVIEW_IDS = ['bastien-arfi-6', 'bastien-arfi-7', 'bastien-arfi-36']
const NEGATIVE_REVIEW_MESSAGES = [
  review => `${review.author} a laissé un avis négatif sur ${review.service}`,
  review => `${review.author} a laissé un avis négatif — répondez rapidement`,
  review => `${review.author} a laissé un avis négatif — une réponse est attendue`,
]

const AVIS_A_RECUPERER_TEMPLATES = [
  { actorInitial: 'A', message: 'Amélie Rousseau n’a pas encore laissé son avis — pensez à la relancer' },
  { actorInitial: 'L', message: 'Lucas Dumal n’a pas encore répondu à votre demande d’avis' },
  { actorInitial: 'É', message: 'Éric Fontaine n’a pas encore laissé d’avis sur son dossier' },
]

const EXPIRING_DATE_MESSAGES = [
  'Votre certification Google arrive à expiration dans 5 jours',
  "L'attestation électronique de votre entreprise expire dans 7 jours",
  'Votre abonnement Opinion System expire bientôt — pensez à le renouveler',
]

const BOOST_REVIEWS_DAY_COUNTS = [7, 10, 14, 21, 30]

function buildActorInitialItem(template, group, time, unread) {
  return { actorInitial: template.actorInitial, message: template.message, group, time, unread }
}

function buildNotificationForType(type, index, group, time, unread) {
  switch (type) {
    case 'newReview': {
      const review = reviewById(NEW_REVIEW_IDS[index % NEW_REVIEW_IDS.length])
      const message = NEW_REVIEW_MESSAGES[index % NEW_REVIEW_MESSAGES.length](review)
      return {
        type,
        actorInitial: review.author.charAt(0).toUpperCase(),
        message,
        group,
        time,
        unread,
        actionable: false,
        actionCompleted: true,
        review,
      }
    }
    case 'negativeReview': {
      const review = reviewById(NEGATIVE_REVIEW_IDS[index % NEGATIVE_REVIEW_IDS.length])
      const message = NEGATIVE_REVIEW_MESSAGES[index % NEGATIVE_REVIEW_MESSAGES.length](review)
      return {
        type,
        actorInitial: review.author.charAt(0).toUpperCase(),
        message,
        group,
        time,
        unread,
        actionable: true,
        actionCompleted: false,
        review,
      }
    }
    case 'avisARecuperer': {
      const template = AVIS_A_RECUPERER_TEMPLATES[index % AVIS_A_RECUPERER_TEMPLATES.length]
      return { type, ...buildActorInitialItem(template, group, time, unread), actionable: false, actionCompleted: true, review: null }
    }
    case 'expiringDate': {
      const message = EXPIRING_DATE_MESSAGES[index % EXPIRING_DATE_MESSAGES.length]
      return { type, actorInitial: null, message, group, time, unread, actionable: false, actionCompleted: true, review: null }
    }
    case 'boostReviews': {
      const days = BOOST_REVIEWS_DAY_COUNTS[index % BOOST_REVIEWS_DAY_COUNTS.length]
      const message = `Cela fait ${days} jours depuis votre dernière demande d'avis — boostez votre visibilité`
      return { type, actorInitial: null, message, group, time, unread, actionable: true, actionCompleted: false, review: null }
    }
    default:
      throw new Error(`Unknown notification type: ${type}`)
  }
}

const GROUP_DEFS = [
  { key: 'today', label: "Aujourd'hui", count: 2, times: ['il y a 2h', 'il y a 5h'], unreadCount: 2 },
  { key: 'yesterday', label: 'Hier', count: 3, times: ['Hier, 20:10', 'Hier, 14:30', 'Hier, 9:00'], unreadCount: 1 },
  {
    key: 'monday',
    label: 'Lundi',
    count: 5,
    times: ['Lundi, 17:40', 'Lundi, 15:10', 'Lundi, 12:05', 'Lundi, 10:30', 'Lundi, 8:45'],
    unreadCount: 0,
  },
  {
    key: 'lastWeek',
    label: 'La semaine dernière',
    count: 6,
    times: [
      'La semaine dernière',
      'La semaine dernière',
      'La semaine dernière',
      'La semaine dernière',
      'La semaine dernière',
      'La semaine dernière',
    ],
    unreadCount: 0,
  },
  {
    key: 'lastMonth',
    label: 'Le mois dernier',
    count: 5,
    times: ['Le mois dernier', 'Le mois dernier', 'Le mois dernier', 'Le mois dernier', 'Le mois dernier'],
    unreadCount: 0,
  },
]

function buildNotifications() {
  const list = []
  let counter = 0

  GROUP_DEFS.forEach(groupDef => {
    for (let i = 0; i < groupDef.count; i += 1) {
      counter += 1
      const type = TYPE_ORDER[counter % TYPE_ORDER.length]
      const time = groupDef.times[i % groupDef.times.length]
      const unread = i < groupDef.unreadCount
      list.push({
        id: `not-${counter}`,
        ...buildNotificationForType(type, counter, groupDef.key, time, unread),
      })
    }
  })

  return list
}

export const GROUP_LABELS = GROUP_DEFS.reduce((labels, groupDef) => {
  labels[groupDef.key] = groupDef.label
  return labels
}, {})

export const GROUP_ORDER = GROUP_DEFS.map(groupDef => groupDef.key)

export const initialNotifications = buildNotifications()

// Created live (not part of the seeded list above) once a Google-boost
// reminder the owner sent gets confirmed -- see Reviews.jsx's
// handleSendGoogleBoost / App.jsx's onAddNotification.
export function buildGoogleShareConfirmedNotification(review) {
  return {
    id: `not-google-share-${review.id}-${Date.now()}`,
    type: 'googleShareConfirmed',
    actorInitial: review.author.charAt(0).toUpperCase(),
    message: `${review.author} a accepté de partager son avis sur Google`,
    group: 'today',
    time: "À l'instant",
    unread: true,
    actionable: false,
    actionCompleted: true,
    review,
  }
}
