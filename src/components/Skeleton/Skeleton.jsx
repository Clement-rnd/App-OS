import './Skeleton.css'

export function Skeleton({ width = '100%', height = 12, radius = 4, className = '', style }) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton-bar${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}
