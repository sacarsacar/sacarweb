import { useCallback, useEffect, useState } from 'react'
import { flushSync } from 'react-dom'

/** Theme lives on <html data-theme>. The pre-paint script in index.html sets it first. */
export function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'dark'
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('theme', theme) } catch { /* private mode */ }
  }, [theme])

  // Follow the OS only while the user has made no explicit choice.
  useEffect(() => {
    let stored
    try { stored = localStorage.getItem('theme') } catch { /* private mode */ }
    if (stored) return
    const mq = matchMedia('(prefers-color-scheme: light)')
    const sync = () => setTheme(mq.matches ? 'light' : 'dark')
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /**
   * The switch is a light bulb: switching on floods the light theme out from the
   * button with a filament flicker; switching off collapses it back into the
   * button. View Transitions snapshot old/new, so nothing re-renders mid-animation.
   * No API or reduced motion → instant swap.
   */
  const toggle = useCallback((e) => {
    const html = document.documentElement
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark'
    const apply = () => {
      html.dataset.theme = next
      flushSync(() => setTheme(next))
    }
    if (!document.startViewTransition || motionOff()) {
      return apply()
    }
    const r = e?.currentTarget?.getBoundingClientRect?.()
    const x = r ? r.left + r.width / 2 : innerWidth - 40
    const y = r ? r.top + r.height / 2 : 32
    html.style.setProperty('--vt-x', `${x}px`)
    html.style.setProperty('--vt-y', `${y}px`)
    html.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`)
    html.dataset.switch = next === 'light' ? 'on' : 'off'
    document.startViewTransition(apply).finished.finally(() => delete html.dataset.switch)
  }, [])
  return { theme, toggle, isDark: theme === 'dark' }
}

/** Animations off? One check for every component; <html data-motion> is the source of truth. */
export const motionOff = () => document.documentElement.dataset.motion === 'off'

/**
 * Animations on/off. The header switch wins once used (saved in localStorage);
 * until then the OS "reduce motion" setting decides. index.html applies the
 * same rule before first paint, so nothing animates before React loads.
 */
export function useMotion() {
  const [os, setOs] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [pref, setPref] = useState(() => {
    try { return localStorage.getItem('motion') } catch { return null }
  })

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setOs(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const reduced = pref ? pref === 'off' : os
  // Set during render, not in an effect, so children reading motionOff() on this pass agree.
  document.documentElement.dataset.motion = reduced ? 'off' : 'on'

  const toggleMotion = useCallback(() => {
    const next = document.documentElement.dataset.motion === 'off' ? 'on' : 'off'
    try { localStorage.setItem('motion', next) } catch { /* private mode */ }
    setPref(next)
  }, [])

  return { reduced, toggleMotion }
}
