import { useId } from 'react'
import './StarRating.css'

const STAR_PATH =
  'M7 10.3658L10.605 12.5417L9.64833 8.44083L12.8333 5.68167L8.63917 5.32583L7 1.45833L5.36083 5.32583L1.16667 5.68167L4.35167 8.44083L3.395 12.5417L7 10.3658Z'

// A full star is just the solid fill, same as before. A half/empty star
// additionally draws the outline first, so the *unfilled* portion reads as
// a clearly-bordered star shape instead of fading into the background --
// the previous approach (a grayscale+brightness CSS filter on the same
// solid icon) washed it out to a pale, edgeless blob with no defined shape.
function Star({ fillRatio, clipId }) {
  const isFull = fillRatio >= 1
  return (
    <svg viewBox="0 0 14 14" className="star-rating__star" aria-hidden="true">
      {!isFull && <path d={STAR_PATH} fill="none" stroke="#dfe9ef" strokeWidth="1" strokeLinejoin="round" />}
      {isFull ? (
        <path d={STAR_PATH} fill="#ffb400" />
      ) : (
        fillRatio > 0 && (
          <>
            <clipPath id={clipId}>
              <rect x="0" y="0" width={14 * fillRatio} height="14" />
            </clipPath>
            <path d={STAR_PATH} fill="#ffb400" clipPath={`url(#${clipId})`} />
          </>
        )
      )}
    </svg>
  )
}

export function StarRating({ rating }) {
  const halfClipId = useId()
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="star-rating">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} fillRatio={1} />
      ))}
      {hasHalfStar && <Star fillRatio={0.5} clipId={halfClipId} />}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} fillRatio={0} />
      ))}
    </div>
  )
}
