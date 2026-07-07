import iconStarBadge from '../../assets/notifications/icon-badge-check.svg'
import iconWarningBadge from '../../assets/notifications/icon-badge-warning.svg'
import iconFlagBadge from '../../assets/notifications/icon-badge-flag.svg'
import iconClockAvatar from '../../assets/notifications/icon-avatar-clock.svg'
import iconRocketAvatar from '../../assets/notifications/icon-avatar-rocket.svg'

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
}

const TYPE_ORDER = ['newReview', 'negativeReview', 'avisARecuperer', 'expiringDate', 'boostReviews']

const NEW_REVIEW_TEMPLATES = [
  { actorInitial: 'J', message: 'Jean David Lépineux a laissé un nouvel avis 5 étoiles sur Vente de propriété' },
  { actorInitial: 'C', message: 'Claire Fontaine a laissé un nouvel avis sur Estimation immobilière' },
  { actorInitial: 'H', message: 'Hugo Girard a laissé un nouvel avis 4 étoiles sur Location de propriété' },
]

const NEGATIVE_REVIEW_TEMPLATES = [
  {
    actorInitial: 'C',
    author: 'Chris Bacon',
    message: 'Chris Bacon a laissé un avis négatif — répondez rapidement',
    rating: '1.5',
    text: "Une expérience très décevante, personne n'a répondu à mes messages pendant plusieurs jours.",
    npsScore: 1,
    service: 'Location de propriété',
    googleShared: false,
    ratings: { reception: 1, qualite: 2, communication: 1, delais: 1 },
  },
  {
    actorInitial: 'S',
    author: 'Sophie Marchand',
    message: 'Sophie Marchand a laissé un avis négatif sur Vente de propriété',
    rating: '2.0',
    text: "L'accompagnement était moyen, j'aimerais avoir un retour sur les points soulevés dans mon avis.",
    npsScore: 3,
    service: 'Vente de propriété',
    googleShared: false,
    ratings: { reception: 2, qualite: 2, communication: 2, delais: 2 },
  },
  {
    actorInitial: 'M',
    author: 'Marc Villeneuve',
    message: 'Marc Villeneuve a laissé un avis négatif — une réponse est attendue',
    rating: '1.0',
    text: 'Communication difficile tout au long du processus, je ne recommande pas.',
    npsScore: 0,
    service: 'Estimation immobilière',
    googleShared: false,
    ratings: { reception: 1, qualite: 1, communication: 1, delais: 1 },
  },
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
      const template = NEW_REVIEW_TEMPLATES[index % NEW_REVIEW_TEMPLATES.length]
      return { type, ...buildActorInitialItem(template, group, time, unread), actionable: false, actionCompleted: true, review: null }
    }
    case 'negativeReview': {
      const template = NEGATIVE_REVIEW_TEMPLATES[index % NEGATIVE_REVIEW_TEMPLATES.length]
      return {
        type,
        actorInitial: template.actorInitial,
        message: template.message,
        group,
        time,
        unread,
        actionable: true,
        actionCompleted: false,
        review: {
          id: `not-review-${type}-${index}`,
          author: template.author,
          rating: template.rating,
          date: time,
          text: template.text,
          npsScore: template.npsScore,
          service: template.service,
          googleShared: template.googleShared,
          ratings: template.ratings,
          response: null,
        },
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
