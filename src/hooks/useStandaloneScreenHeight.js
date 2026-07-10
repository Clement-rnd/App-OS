import { useState } from 'react'

// In an installed iOS PWA, the layout viewport is under-measured right when
// a screen first mounts (confirmed on-device on Login) -- window.innerHeight
// is exposed to that bug too, since it reads the same under-measured layout
// viewport, only via JS instead of CSS. window.screen.height is the hardware
// screen resolution instead, unaffected, so it can stand in for the real
// height there.
//
// Everywhere else this returns undefined ON PURPOSE, and callers fall back
// to their plain CSS (bottom: 0, max-height in dvh, inset: 0...). Returning
// a JS-measured number outside iOS-standalone has broken twice now
// (Android browser tab, then installed Android PWA): a value captured once
// at mount goes stale the moment the window settles or resizes -- Android
// PWAs resize right after their splash screen, keyboards resize browsers,
// etc. -- while CSS keeps tracking the real viewport continuously. Only
// iOS-standalone needs the JS override, because there it's the CSS units
// themselves that measure wrong; everywhere else CSS is the more reliable
// source, not less.
export function useStandaloneScreenHeight() {
  const [height] = useState(() => {
    const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    return isIOS && isStandalone ? Math.max(window.screen.height, window.innerHeight) : undefined
  })
  return height
}
