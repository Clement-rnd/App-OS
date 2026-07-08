import { getNpsCategory } from '../../utils/nps'

// Anchor "today" to the most recent date in the mock review data (06/09/2026)
// instead of the real device clock, so période filters stay meaningful for this demo dataset.
const TODAY = new Date(2026, 8, 6)

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

export function reviewMatchesFilters(review, filters) {
  if (filters.source.length && !filters.source.includes(review.source)) return false
  if (filters.note.length && !filters.note.includes(getNoteCategory(review.rating))) return false
  if (filters.nps.length && !filters.nps.includes(getNpsFilterId(review.rating))) return false

  if (filters.type.length) {
    const matchesType = filters.type.includes(review.certification) || filters.type.includes(review.googleSharing)
    if (!matchesType) return false
  }

  if (filters.etat.length && !filters.etat.includes(review.status)) return false

  if (!matchesPeriode(review.date, filters.periode, filters.periodeRange)) return false

  return true
}
