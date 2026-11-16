import { memo, useLayoutEffect, useRef, useState } from 'react'
import { liveSites } from '../data'
import { Sky, ThemeSwitch } from '../Sky'

const n = liveSites.length
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/** About-section entry point: the live sites as a fanned deck, with the count. */
export function LiveSitesTile({ onOpen }) {
  if (!n) return null
  return (
    <button
      onClick={onOpen}
      className="sites-tile group mt-10 flex w-full flex-col items-start gap-5 rounded-2xl border border-line
                 bg-raised/50 p-4 text-left transition-colors duration-300 hover:border-accent
                 @sm:flex-row @sm:items-center @md:gap-8 sm:p-5"
    >
      <span aria-hidden className="sites-deck relative h-24 w-36 shrink-0 sm:h-28 sm:w-52">
        {liveSites.slice(0, 4).map((s, i) => (
          <img
            key={s.id}
            src={s.thumb}
            alt=""
            width="480"
            height="300"
            loading="lazy"
            style={{ '--i': i }}
            className="sites-deck-card absolute inset-0 m-auto w-[78%] rounded-md border border-line bg-bg"
          />
        ))}
      </span>

      <span className="min-w-0">
        <span className="flex items-center gap-3">
          <span className="font-display text-4xl leading-none sm:text-5xl">{n}</span>
          <span className="label flex items-center gap-2 text-fg">
            <span className="relative flex h-1.5 w-1.5">
              <span aria-hidden className="ping ping-1" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-live" />
            </span>
            Live websites
          </span>
        </span>
        <span className="mt-2 block text-sm leading-snug text-muted">
          Games, tools and apps you can open in a browser right now.
        </span>
        <span className="label mt-3 inline-block text-accent">See them live →</span>
      </span>
    </button>
  )
}

/**
 * Every live site as a 3D coverflow. Drag, swipe, scroll or use the arrow keys;
 * the centred site tilts toward the pointer. The stage is a mouse/touch
 * convenience (aria-hidden) — the panel and site list below carry the same
 * controls for keyboard and screen-reader users.
 */
export const LiveSites = memo(function LiveSites({ open, onClose, onOpenProject, isDark, onToggleTheme }) {
  const ref = useRef(null)
  const stage = useRef(null)
  const gesture = useRef(null)
  const wheel = useRef({ acc: 0, until: 0 })
  const [active, setActive] = useState(0)
  const [drag, setDrag] = useState(null) // fractional position while a finger/mouse is pulling
  const [phase, setPhase] = useState('start') // start → enter (cards fly in) → idle

  // Layout effect: 'start' must be committed before the dialog first paints,
  // or the cards flash in place before flying in.
  useLayoutEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) {
      setPhase('start')
      d.showModal()
      d.querySelector('[data-close]')?.focus()
      let f = requestAnimationFrame(() => { f = requestAnimationFrame(() => setPhase('enter')) })
      const t = setTimeout(() => setPhase('idle'), 1400)
      return () => { cancelAnimationFrame(f); clearTimeout(t) }
    }
    if (!open && d.open) d.close()
  }, [open])

  if (!n) return null
  const cur = liveSites[active]
  const pos = drag ?? active
  const go = (i) => setActive(clamp(i, 0, n - 1))

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    const w = stage.current.querySelector('.site-card')?.offsetWidth ?? 600
    gesture.current = { x: e.clientX, start: active, w, moved: false }
  }
  const onPointerMove = (e) => {
    const s = stage.current
    const r = s.getBoundingClientRect()
    const fx = (e.clientX - r.left) / r.width
    const fy = (e.clientY - r.top) / r.height
    s.style.setProperty('--ry', `${(fx - 0.5) * 14}deg`)
    s.style.setProperty('--rx', `${(0.5 - fy) * 10}deg`)
    s.style.setProperty('--gx', `${fx * 100}%`)
    s.style.setProperty('--gy', `${fy * 100}%`)

    const g = gesture.current
    if (!g) return
    const dx = e.clientX - g.x
    if (!g.moved && Math.abs(dx) < 6) return
    if (!g.moved) { g.moved = true; s.setPointerCapture(e.pointerId) }
    g.dx = dx
    setDrag(clamp(g.start - dx / (g.w * 0.62), -0.45, n - 0.55))
  }
  const onPointerUp = () => {
    const g = gesture.current
    gesture.current = null
    if (!g?.moved) return
    // A short flick still moves one site; a long pull lands wherever it was let go.
    let to = Math.round(drag ?? g.start)
    if (to === g.start && Math.abs(g.dx) > 40) to -= Math.sign(g.dx)
    go(to)
    setDrag(null)
    stage.current.dataset.dragged = '' // swallow the click that follows the release
    setTimeout(() => { if (stage.current) delete stage.current.dataset.dragged }, 0)
  }
  const onWheel = (e) => {
    const w = wheel.current
    const now = performance.now()
    w.acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (now < w.until || Math.abs(w.acc) < 40) return
    go(active + Math.sign(w.acc))
    w.acc = 0
    w.until = now + 420
  }
  const onCard = (i) => {
    if (stage.current?.dataset.dragged !== undefined) return
    if (i === active) window.open(cur.live, '_blank', 'noopener')
    else go(i)
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) }
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) }
      }}
      aria-label="Live websites"
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg"
    >
      <div data-lenis-prevent className="sites-room flex h-dvh flex-col overflow-y-auto overflow-x-hidden">
        {/* The home page's sky behind the carousel; the ridgelines drift as you browse. */}
        <Sky style={{ '--p': active / Math.max(1, n - 1) }} />
        <div className="relative z-20 flex items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-12">
          <p className="label flex items-center gap-2 text-fg">
            <span className="h-1.5 w-1.5 rounded-full bg-live" />
            Live on the web · {n}
          </p>
          <div className="flex items-center gap-3">
            <ThemeSwitch isDark={isDark} onToggle={onToggleTheme} />
            <button
              onClick={onClose}
              data-close
              className="label rounded-full border border-line px-4 py-2 hover:border-accent hover:text-accent"
            >
              Close ✕
            </button>
          </div>
        </div>

        <div
          ref={stage}
          aria-hidden
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          className="sites-stage relative grid min-h-[16rem] flex-1 select-none place-items-center"
        >
          {liveSites.map((s, i) => {
            const o = i - pos
            const a = Math.abs(o)
            const sign = Math.sign(o)
            const isActive = a < 0.5
            // First neighbour sits most of a card away; the rest bunch up behind it.
            const x = sign * (Math.min(a, 1) * 62 + Math.max(a - 1, 0) * 24)
            const transform =
              phase === 'start'
                ? `translateX(${o * 30}%) translateZ(-1800px) rotateY(${-(sign || 1) * 70}deg)`
                : `translateX(${x}%) translateZ(${-a * 230 + (isActive ? 40 : 0)}px) rotateY(${-sign * Math.min(a, 1.4) * 36}deg)` +
                  (isActive ? ' rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' : '')
            return (
              <div
                key={s.id}
                onClick={() => onCard(i)}
                data-active={isActive || undefined}
                className="site-card"
                style={{
                  transform,
                  opacity: phase === 'start' || a > 3.6 ? 0 : 1,
                  zIndex: 100 - Math.round(a * 10),
                  visibility: a > 4 ? 'hidden' : undefined,
                  transition:
                    phase === 'start' ? 'none'
                    : drag != null ? 'transform .14s linear, opacity .3s'
                    : undefined,
                  transitionDelay: phase === 'enter' ? `${a * 90}ms` : undefined,
                }}
              >
                <div className="site-bar">
                  <span className="h-1.5 w-1.5 rounded-full bg-live" />
                  <span className="truncate">{s.host}</span>
                </div>
                <img
                  src={s.shot}
                  alt=""
                  width="1280"
                  height="800"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                  className="block aspect-[16/10] w-full object-cover object-top"
                />
                <div className="site-shade" style={{ opacity: Math.min(a * 0.24, 0.8) }} />
              </div>
            )
          })}
        </div>

        <div className="relative z-20 px-5 pb-6 pt-4 sm:px-8 lg:px-12">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div key={cur.id} aria-live="polite" className="swap-in min-w-0">
              <p className="label">
                {String(active + 1).padStart(2, '0')} / {n} · {cur.category}
              </p>
              <h3 className="mt-2 font-display text-3xl leading-none sm:text-5xl">{cur.title}</h3>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => go(active - 1)}
                disabled={active === 0}
                aria-label="Previous site"
                className="grid h-10 w-10 place-items-center rounded-full border border-line
                           hover:border-accent hover:text-accent disabled:opacity-30"
              >
                ←
              </button>
              <button
                onClick={() => go(active + 1)}
                disabled={active === n - 1}
                aria-label="Next site"
                className="grid h-10 w-10 place-items-center rounded-full border border-line
                           hover:border-accent hover:text-accent disabled:opacity-30"
              >
                →
              </button>
              <button
                onClick={() => onOpenProject(cur)}
                className="label rounded-full border border-line px-4 py-3 hover:border-accent hover:text-accent"
              >
                Case study
              </button>
              <a
                href={cur.live}
                target="_blank"
                rel="noopener noreferrer"
                className="label rounded-full bg-accent px-4 py-3 text-bg hover:opacity-80"
              >
                {cur.kind === 'game' ? 'Play' : 'Open'} {cur.host} ↗
              </a>
            </div>
          </div>

          <ol className="sites-list mt-5 flex gap-1.5 overflow-x-auto pb-1">
            {liveSites.map((s, i) => (
              <li key={s.id} className="shrink-0">
                <button
                  onClick={() => go(i)}
                  aria-current={i === active || undefined}
                  className="label rounded-full border border-line px-3 py-1.5 transition-colors
                             hover:border-accent hover:text-accent
                             aria-[current]:border-accent aria-[current]:text-fg"
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </dialog>
  )
})
