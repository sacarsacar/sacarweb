import { useEffect, useRef } from 'react'

const INTERACTIVE = 'a, button, [role="button"], summary, label, select'
const TEXT = 'input:not([type="checkbox"], [type="radio"], [type="submit"]), textarea, [contenteditable]'

/**
 * The arrow itself is a CSS cursor (index.css) — OS-drawn, so it never lags.
 * This adds a small ring that trails it on a spring, tilts in 3D toward its
 * velocity, and swells over anything clickable. Imperative (no React render
 * per frame) and the loop sleeps once the ring settles. Mouse/trackpad only;
 * reduced motion gets the arrow alone.
 *
 * The ring is a manual popover so it lives in the top layer — otherwise a
 * modal <dialog> would cover it.
 */
export function Cursor({ enabled = true }) {
  useEffect(() => {
    if (!enabled) return
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const root = document.documentElement
    const el = document.createElement('div')
    if (typeof el.showPopover !== 'function') return

    el.className = 'cursor-ring'
    el.popover = 'manual'
    el.setAttribute('aria-hidden', 'true')
    el.dataset.out = ''
    el.innerHTML = '<span></span>'
    const disc = el.firstChild
    document.body.append(el)
    el.showPopover()

    let mx = -100, my = -100, x = mx, y = my, vx = 0, vy = 0
    let frame = 0, last = 0, target = ''

    const setState = (state) => {
      if (el.dataset.state === state) return
      el.dataset.state = state
      // Not data-cursor: mid view-transition the pointer target is <html>.
      root.dataset.pointer = state // the header eyes dilate on this
    }
    // The 3D devices can't fire DOM pointerover, so they flag body instead.
    const apply = () => setState(document.body.dataset.cursor ? 'link' : target)

    const tick = (t) => {
      const dt = Math.min((t - (last || t)) / 1000 || 1 / 60, 1 / 30)
      last = t
      // Under-damped spring (ζ≈0.8): catches up fast, lands with a little give.
      vx += ((mx - x) * 380 - vx * 31) * dt
      vy += ((my - y) * 380 - vy * 31) * dt
      x += vx * dt
      y += vy * dt
      const rx = Math.max(-40, Math.min(40, -vy * 0.04))
      const ry = Math.max(-40, Math.min(40, vx * 0.04))
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`
      disc.style.transform = `perspective(120px) rotateX(${rx}deg) rotateY(${ry}deg)`
      if (Math.abs(mx - x) + Math.abs(my - y) < 0.2 && Math.abs(vx) + Math.abs(vy) < 2) {
        frame = 0
        last = 0
        return // asleep until the pointer moves again
      }
      frame = requestAnimationFrame(tick)
    }

    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      mx = e.clientX
      my = e.clientY
      delete el.dataset.out
      apply()
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onOver = (e) => {
      const t = e.target instanceof Element ? e.target : null
      target = t?.closest(TEXT) ? 'text' : t?.closest(INTERACTIVE) ? 'link' : ''
      apply()
    }
    const onOut = (e) => { if (!e.relatedTarget) el.dataset.out = '' }
    const onDown = () => { el.dataset.down = '' }
    const onUp = () => { delete el.dataset.down }

    // A newly opened modal dialog goes above us in the top layer — re-raise.
    const mo = new MutationObserver(() => { el.hidePopover(); el.showPopover() })
    mo.observe(document.body, { subtree: true, attributeFilter: ['open'] })

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    return () => {
      mo.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      cancelAnimationFrame(frame)
      el.remove()
      delete root.dataset.pointer
    }
  }, [enabled])

  return null
}

/**
 * Two eyes in the header that watch the pointer anywhere on the page (or the
 * last tap, on touch), and blink now and then. Pupils dilate over anything clickable.
 */
export function Eyes({ still = false }) {
  const ref = useRef(null)

  useEffect(() => {
    const host = ref.current
    const pupils = [...host.querySelectorAll('.pupil')]
    let frame = 0, px = innerWidth / 2, py = innerHeight

    const look = () => {
      frame = 0
      for (const p of pupils) {
        const r = p.parentElement.getBoundingClientRect()
        const dx = px - (r.left + r.width / 2)
        const dy = py - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const reach = Math.min(d / 8, r.width * 0.26) // close pointer → pupils centre, far → full travel
        p.style.transform = `translate(${(dx / d) * reach}px, ${(dy / d) * reach}px)`
      }
    }
    const onMove = (e) => {
      px = e.clientX
      py = e.clientY
      if (!frame) frame = requestAnimationFrame(look)
    }
    if (still) {
      // Animations off: eyes rest looking ahead, no tracking, no blinking.
      pupils.forEach((p) => { p.style.transform = '' })
      return
    }
    look()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onMove, { passive: true })

    let timer = 0
    const blink = () => {
      host.classList.add('blink')
      setTimeout(() => host.classList.remove('blink'), 140)
      timer = setTimeout(blink, 2600 + Math.random() * 4200)
    }
    timer = setTimeout(blink, 2200)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onMove)
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [still])

  return (
    <span ref={ref} aria-hidden className="eyes">
      <span className="eye"><span className="pupil" /></span>
      <span className="eye"><span className="pupil" /></span>
    </span>
  )
}
