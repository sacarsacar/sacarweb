import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Scroll inertia. This is the one part of "smooth" that CSS can't do — native
 * scroll is instant per wheel tick; Lenis interpolates between them.
 * Disabled entirely under prefers-reduced-motion: for some people this is the
 * difference between usable and nauseating.
 */
export function useSmoothScroll(enabled) {
  useEffect(() => {
    if (!enabled) return
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
    })
    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    })

    // In-page anchors have to go through Lenis or they jump.
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const el = document.querySelector(a.getAttribute('href'))
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { offset: -70 })
    }
    document.addEventListener('click', onClick)

    return () => {
      document.removeEventListener('click', onClick)
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [enabled])
}
