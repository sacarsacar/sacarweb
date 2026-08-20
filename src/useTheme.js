import { useCallback, useEffect, useState } from 'react'

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

  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggle, isDark: theme === 'dark' }
}

/** True when the visitor asked for less motion. Drives every animation opt-out. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches
  )
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return reduced
}
