import { useEffect, useState } from 'react'

const DEFAULT_DELAY_MS = 1000

// Stands in for a real fetch's latency so a freshly-mounted page shows
// skeleton placeholders for a beat instead of a flicker -- see Skeleton.jsx
// for the shimmer bars that use this while true.
export function useSimulatedLoading(delayMs = DEFAULT_DELAY_MS) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeoutId = setTimeout(() => setIsLoading(false), delayMs)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return isLoading
}
