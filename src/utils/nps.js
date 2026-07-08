export function getNpsCategory(rating) {
  if (rating <= 2.5) return 'Détracteur'
  if (rating < 4) return 'Passif'
  return 'Promoteur'
}

// Reviews only carry a 0-5 star rating in the mock data; scale it to the
// conventional 0-10 NPS score shown in the review details sheet.
export function getNpsScore(rating) {
  return Math.min(10, Math.round(rating * 2))
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

// The mock data has no per-criteria (Réception/Qualité/Communication/Délais)
// ratings, only an overall score. Derive plausible, deterministic sub-scores
// clustered around that overall rating so the same review always shows the
// same breakdown instead of a different one on every render.
export function getRatingBreakdown(review) {
  const base = Math.min(5, Math.max(1, Math.round(parseFloat(review.rating))))
  const hash = hashString(review.id)
  const criteria = ['reception', 'qualite', 'communication', 'delais']
  return criteria.reduce((breakdown, key, index) => {
    const variation = ((hash >> (index * 4)) % 3) - 1 // -1, 0, or 1
    breakdown[key] = Math.min(5, Math.max(1, base + variation))
    return breakdown
  }, {})
}
