import { getNpsCategory } from '../../utils/nps'

// Anchor "today" to the most recent date in the mock review data (06/09/2026)
// instead of the real device clock, so période filters stay meaningful for this demo dataset.
export const TODAY = new Date(2026, 8, 6)

const NPS_LABEL_TO_ID = {
  Promoteur: 'promoteur',
  Passif: 'passif',
  Détracteur: 'detracteur',
}

export function getNoteCategory(rating) {
  const value = parseFloat(rating)
  if (value >= 4) return 'positif'
  if (value >= 3) return 'neutre'
  return 'negatif'
}

export function getNpsFilterId(rating) {
  return NPS_LABEL_TO_ID[getNpsCategory(parseFloat(rating))]
}

export function parseReviewDate(dateStr) {
  const [day, month, year] = dateStr.split('/').map(Number)
  return new Date(year, month - 1, day)
}

export function getDaysUntil(dateStr) {
  const target = parseReviewDate(dateStr)
  return Math.round((target - TODAY) / (1000 * 60 * 60 * 24))
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function startOfWeek(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function matchesPeriode(dateStr, periode, periodeRange) {
  if (!periode) return true
  const date = parseReviewDate(dateStr)

  if (periode === 'aujourdhui') return isSameDay(date, TODAY)

  if (periode === 'semaine') {
    const weekStart = startOfWeek(TODAY)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    return date >= weekStart && date <= weekEnd
  }

  if (periode === 'mois') {
    return date.getFullYear() === TODAY.getFullYear() && date.getMonth() === TODAY.getMonth()
  }

  if (periode === 'annee') {
    return date.getFullYear() === TODAY.getFullYear()
  }

  if (periode === 'personnalise') {
    if (!periodeRange?.start || !periodeRange?.end) return true
    const start = new Date(periodeRange.start)
    const end = new Date(periodeRange.end)
    return date >= start && date <= end
  }

  return true
}

// "Réponse" (sans réponse / avis répondu) is a separate axis from "État"
// (en attente / expiré / archivé): a review's lifecycle status and whether
// it's actually been answered don't move together (e.g. an archived review
// can still have gone unanswered) -- keyed off the response text itself
// rather than status, so it stays accurate regardless of État.
export function matchesReponseFilter(review, reponse) {
  if (reponse === 'sans-reponse') return !review.response
  if (reponse === 'avis-repondu') return Boolean(review.response)
  return true
}

export function reviewMatchesFilters(review, filters) {
  if (filters.source.length && !filters.source.includes(review.source)) return false
  if (filters.note.length && !filters.note.includes(getNoteCategory(review.rating))) return false
  if (filters.nps.length && !filters.nps.includes(getNpsFilterId(review.rating))) return false

  if (filters.type.length && !filters.type.includes(review.certification)) return false

  if (filters.googleSharing.length && !filters.googleSharing.includes(review.googleSharing)) return false

  if (filters.etat.length && !filters.etat.includes(review.status)) return false

  if (filters.reponse && !matchesReponseFilter(review, filters.reponse)) return false

  if (!matchesPeriode(review.date, filters.periode, filters.periodeRange)) return false

  return true
}
