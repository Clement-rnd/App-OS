import { useState } from 'react'

// In an installed iOS PWA, the layout viewport is under-measured right when
// a screen first mounts (confirmed on-device on Login) -- window.innerHeight
// is exposed to that bug too, since it reads the same under-measured layout
// viewport, only via JS instead of CSS. window.screen.height is the hardware
// screen resolution instead, unaffected, so Math.max against it rescues an
// under-measured innerHeight.
//
// That rescue is WRONG outside of standalone mode: in a normal browser tab
// (confirmed on Android Chrome), screen.height is the full device screen
// including the address bar and system nav bar, always bigger than
// innerHeight -- Math.max would then override an already-correct, smaller
// innerHeight with that inflated value, pushing fixed-position elements
// (e.g. the bottom nav) below the real visible viewport entirely. So this
// only trusts screen.height while actually running standalone; everywhere
// else it's plain innerHeight, which is already correct there.
export function useStandaloneScreenHeight() {
  const [height] = useState(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    return isStandalone ? Math.max(window.screen.height, window.innerHeight) : window.innerHeight
  })
  return height
}
