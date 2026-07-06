export function getNpsCategory(rating) {
  if (rating <= 2.5) return 'Détracteur'
  if (rating < 4) return 'Passif'
  return 'Promoteur'
}
