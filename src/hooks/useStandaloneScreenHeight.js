import { useState } from 'react'

// iOS under-measures the layout viewport at points this app has hit
// repeatedly (cold PWA launch, sheets opened mid-session) -- and that bug
// isn't confined to CSS viewport units (dvh/lvh/vh): window.innerHeight is
// just as exposed, since it's reading the same under-measured layout
// viewport, only via JS instead of CSS. window.screen.height is different --
// it's the hardware screen resolution, orthogonal to any "viewport" concept,
// so it's unaffected. Applied unconditionally (not gated behind detecting
// standalone mode, which can silently fail to match): Math.max against
// innerHeight means a real, legitimately smaller innerHeight (e.g. a
// browser tab's on-screen keyboard or toolbar taking real space) still
// wins over a same-or-smaller screen.height, so this never shrinks a
// correctly-measured viewport, only rescues an under-measured one.
export function useStandaloneScreenHeight() {
  const [height] = useState(() => Math.max(window.screen.height, window.innerHeight))
  return height
}
