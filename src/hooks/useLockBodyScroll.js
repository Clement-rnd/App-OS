import { useLayoutEffect } from 'react'

export function useLockBodyScroll() {
  // useLayoutEffect (not useEffect): the cleanup must run synchronously
  // before paint, in the same frame as whatever else reacts to the sheet
  // closing (e.g. a page switching a sticky header back from position:fixed).
  // With plain useEffect, React paints that DOM change first and only
  // restores the body afterwards -- for one frame, a now-sticky element
  // sits inside a still-locked (position:fixed, negative top offset) body,
  // which breaks its stickiness and makes it flash out of view.
  useLayoutEffect(() => {
    const scrollY = window.scrollY
    // The vertical scrollbar (when the page had one) disappears the instant
    // overflow is hidden below, so the viewport's usable width grows by its
    // width for as long as the lock is active -- anything spanning 100% of
    // that width (e.g. a sticky header) visibly shifts. Reserving the same
    // width back as padding keeps the page's content box the same size.
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    const { body } = document
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      body.style.overflow = previous.overflow
      body.style.paddingRight = previous.paddingRight
      window.scrollTo(0, scrollY)
    }
  }, [])
}
