import { useState } from 'react'

// In an installed iOS PWA, the layout viewport is under-measured right when
// a screen first mounts (confirmed on-device on Login) -- window.innerHeight
// is exposed to that bug too, since it reads the same under-measured layout
// viewport, only via JS instead of CSS. window.screen.height is the hardware
// screen resolution instead, unaffected, so Math.max against it rescues an
// under-measured innerHeight.
//
// This rescue is specifically an iOS bug -- Android's innerHeight is
// reliable in both a browser tab AND installed/standalone mode, and Android
// keeps its own system nav bar space out of innerHeight but not out of
// screen.height, so Math.max there overshoots and pushes fixed-position
// elements (e.g. the bottom nav, confirmed on a teammate's Android device)
// below the real visible viewport. Gating on "standalone" alone isn't
// enough to exclude it either: an Android PWA added to the home screen is
// also standalone. So this checks for iOS specifically, not just
// standalone -- everywhere else (Android in any mode, desktop, iOS Safari
// tabs) uses plain innerHeight, which is already correct there.
export function useStandaloneScreenHeight() {
  const [height] = useState(() => {
    const isIOS = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
    return isIOS && isStandalone ? Math.max(window.screen.height, window.innerHeight) : window.innerHeight
  })
  return height
}
