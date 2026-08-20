import { useEffect, useRef, useState } from 'react'

/**
 * Pure scroll mapping, extracted so it can be checked without a browser.
 * @param top      section's bounding-rect top (negative once scrolled past)
 * @param height   section height in px
 * @param viewport window.innerHeight
 * @param count    number of rail slots
 * @returns {{railPos:number, engage:number}} continuous index, and hero->work blend
 */
export function railFrom(top, height, viewport, count) {
  const travel = height - viewport
  if (travel <= 0 || count < 2) return { railPos: 0, engage: 0 }
  const p = Math.min(Math.max(-top / travel, 0), 1)
  return {
    railPos: p * (count - 1),
    // engage ramps over the first screen so the hero isn't crowded by the panel.
    engage: Math.min(Math.max(-top / viewport, 0), 1),
  }
}

/** Maps scroll over the work section onto a continuous rail index. */
export function useScrollRail(count, enabled = true) {
  const ref = useRef(null)
  const [state, setState] = useState({ railPos: 0, engage: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) { setState({ railPos: 0, engage: 0 }); return }
    let frame = 0

    const read = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      setState(railFrom(r.top, r.height, window.innerHeight, count))
    }

    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [count, enabled])

  return { ref, ...state, index: Math.round(state.railPos) }
}
