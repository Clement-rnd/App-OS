import { useEffect, useState } from 'react'

// Unlike useStandaloneScreenHeight (a one-time hardware measurement, chosen
// specifically because it's immune to iOS's viewport quirks), this tracks
// window.visualViewport continuously -- for a sheet with a text input that
// can raise the keyboard, that immunity is the wrong property to want: the
// soft keyboard shrinks the real visible area, and a height that refuses to
// shrink with it just overflows past the keyboard instead of resizing above
// it. visualViewport.height is the one measurement that already reflects
// the keyboard being up. Falls back to innerHeight where visualViewport
// isn't supported.
export function useVisualViewportHeight() {
  const [height, setHeight] = useState(() => window.visualViewport?.height ?? window.innerHeight)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setHeight(vv.height)
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return height
}
