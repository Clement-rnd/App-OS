import { useLayoutEffect, useRef, useState } from 'react'

const EXIT_DURATION_MS = 130
// Matches the CSS `transition: height 300ms ease` on .review-details__swap
// / .review-details-sheet__footer-frame (and their Home equivalents).
const HEIGHT_TRANSITION_MS = 300

// One independently-sized region: measures its current height before a
// swap and animates to the new one after, the same "lock -> remeasure a
// frame later -> release once settled" recipe as the content region below.
// A sheet's footer often changes its own button count between views too
// (e.g. an extra "Supprimer" button only in the "respond" view) -- without
// this, THAT height change snaps instantly the moment `view` flips, which
// reads as the whole sheet jumping even when the main content region
// resizes smoothly.
function useHeightFrame() {
  const [height, setHeight] = useState(null)
  const innerRef = useRef(null)
  const releaseTimeoutRef = useRef(null)

  const release = () => {
    clearTimeout(releaseTimeoutRef.current)
    setHeight(null)
  }

  const measure = () => {
    clearTimeout(releaseTimeoutRef.current)
    const el = innerRef.current
    if (el) setHeight(el.getBoundingClientRect().height)
  }

  const pushNextFrame = () => {
    const el = innerRef.current
    if (!el) return () => {}
    const newHeight = el.getBoundingClientRect().height
    const raf = requestAnimationFrame(() => {
      setHeight(newHeight)
      // `transitionend` (below) doesn't fire reliably on every mobile
      // browser -- a real device seen getting stuck here left the height
      // locked at a previous (taller) view's size forever, showing as a
      // permanent blank gap under the shorter view's content. This is the
      // fallback that guarantees release-to-auto happens regardless.
      clearTimeout(releaseTimeoutRef.current)
      releaseTimeoutRef.current = setTimeout(release, HEIGHT_TRANSITION_MS + 100)
    })
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(releaseTimeoutRef.current)
    }
  }

  const style = height !== null ? { height } : undefined
  const onTransitionEnd = e => {
    if (e.target === e.currentTarget && e.propertyName === 'height') release()
  }

  return { innerRef, style, onTransitionEnd, measure, pushNextFrame }
}

// Drives sheets that morph their own content between two "views" (e.g.
// review details <-> respond) instead of stacking a second sheet on top of
// themselves. Mirrors the content-swap recipe used across the app's other
// multi-step sheets (see SurveySelectSheet, EditProfileSheet, etc.):
//
// - The caller keys the swapped element(s) on `view` so React fully
//   remounts them on every switch; their children declare a
//   `*-content-fade-in` `animation` unconditionally in CSS, so a fresh
//   mount always plays the entrance for free (staggered per child via the
//   caller's nth-child rules). A `--exiting` modifier class (added for
//   EXIT_DURATION_MS before the swap) overrides `animation-name` to the
//   matching `*-content-fade-out` keyframe instead, so the outgoing
//   content fades/slides out in place first -- deliberately with NO
//   stagger and a short, fixed duration: the frames stay pinned to their
//   outgoing height for this whole window (see useHeightFrame above), so a
//   lingering/staggered exit reads as the sheet getting visibly "stuck"
//   before it resizes, not as a flourish.
// - The caller wraps each swapped region (main content, footer buttons) in
//   its own frame that gets that region's `*Style`/`on*TransitionEnd`, so
//   every part of the sheet whose height differs between views resizes in
//   step with the content instead of any one of them snapping.
export function useSheetViewTransition(view, setView) {
  const [isContentExiting, setContentExiting] = useState(false)
  const swap = useHeightFrame()
  const viewTimeoutRef = useRef(null)
  const hasMountedViewRef = useRef(false)

  const withViewTransition = nextView => {
    swap.measure()
    setContentExiting(true)
    clearTimeout(viewTimeoutRef.current)
    viewTimeoutRef.current = setTimeout(() => {
      setView(nextView)
      setContentExiting(false)
    }, EXIT_DURATION_MS)
  }

  // Runs right after `view` remounts the swapped content (still pinned to
  // the outgoing height): measure the new content's natural height and
  // push the frame to it a frame later, so the browser registers the
  // outgoing height as a real "before" value instead of collapsing both
  // writes into one and skipping the transition.
  useLayoutEffect(() => {
    if (!hasMountedViewRef.current) {
      hasMountedViewRef.current = true
      return
    }
    return swap.pushNextFrame()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  return {
    swapInnerRef: swap.innerRef,
    swapStyle: swap.style,
    onSwapTransitionEnd: swap.onTransitionEnd,
    isContentExiting,
    withViewTransition,
  }
}
