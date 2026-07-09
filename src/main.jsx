import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './styles/reset.css'
import App from './App.jsx'

// iOS Safari in standalone/PWA mode has a long-standing bug where elements
// sized via `100dvh`/`inset: 0` on `position: fixed` can end up taller than
// what's actually visible, leaving the page's own white background showing
// through as a gap under anything anchored to the bottom (our full-screen
// sheet overlays). Measuring the *visual* viewport directly and exposing it
// as a CSS variable is the standard workaround -- overlays fall back to
// 100dvh (see `var(--app-height, 100dvh)`) until this has run once.
const setAppHeight = () => {
  const height = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}
setAppHeight()
window.addEventListener('resize', setAppHeight)
window.visualViewport?.addEventListener('resize', setAppHeight)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
