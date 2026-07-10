import { useEffect, useState } from 'react'

const DEFAULT_DELAY_MS = 1000

// Module-level (not component state): survives a page unmounting and
// remounting -- e.g. navigating away and back via the bottom nav -- so the
// skeleton only ever plays once per page for the lifetime of the app,
// standing in for "this data has already been fetched" instead of replaying
// a fake fetch on every mount.
const hasLoadedByKey = new Set()

// Stands in for a real fetch's latency so a freshly-mounted page shows
// skeleton placeholders for a beat instead of a flicker -- see Skeleton.jsx
// for the shimmer bars that use this while true. `key` scopes that "once"
// tracking to a specific page/section (e.g. 'home', 'reviews') so unrelated
// pages don't share the same loaded flag.
export function useSimulatedLoading(key, delayMs = DEFAULT_DELAY_MS) {
  const [isLoading, setIsLoading] = useState(() => !hasLoadedByKey.has(key))

  useEffect(() => {
    if (hasLoadedByKey.has(key)) return
    const timeoutId = setTimeout(() => {
      hasLoadedByKey.add(key)
      setIsLoading(false)
    }, delayMs)
    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return isLoading
}
