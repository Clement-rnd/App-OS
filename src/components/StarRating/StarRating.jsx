import iconStar from '../../assets/home/icon-star.svg'
import './StarRating.css'

export function StarRating({ rating }) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="star-rating">
      {Array.from({ length: fullStars }).map((_, i) => (
        <img key={`full-${i}`} src={iconStar} alt="" className="star-rating__star" />
      ))}
      {hasHalfStar && (
        <span className="star-rating__star star-rating__star--half">
          <img src={iconStar} alt="" className="star-rating__star-bg" />
          <img src={iconStar} alt="" className="star-rating__star-fg" />
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <img key={`empty-${i}`} src={iconStar} alt="" className="star-rating__star star-rating__star--empty" />
      ))}
    </div>
  )
}
