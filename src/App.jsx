import { Component, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme, useMotion } from './useTheme'
import { useSmoothScroll } from './useSmoothScroll'
import { useScrollRail } from './useScrollRail'
import { railProjects, projects, profile, NAV, socials } from './data'
import { WorkPanel } from './sections/Work'
import { CaseStudy } from './sections/CaseStudy'
import { Stack, Archive, Contact } from './sections/Rest'
import { ProjectIndex } from './sections/Index'
import { About } from './sections/About'
import { Experience } from './sections/Experience'
import { LiveSites } from './sections/LiveSites'
import { Cursor, Eyes } from './Pointer'
import { Sky, ThemeSwitch, MotionSwitch } from './Sky'
import { BrandIcon } from './sections/Profiles'

// three.js is ~1MB. Split it out so text paints without waiting on WebGL.
const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })))

const has3D = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch { return false }
})()

export default function App() {
  const { toggle, isDark } = useTheme()
  const { reduced, toggleMotion } = useMotion()
  const showRail = has3D && !reduced
  useSmoothScroll(!reduced)
  const { open, openProject, closeProject } = useProjectLink()
  const [sitesOpen, setSitesOpen] = useState(false)
  const { ref, railPos, engage, index, inView } = useScrollRail(railProjects.length, showRail)
  const active = railProjects[index]
  const section = useActiveSection()
  const sceneReady = useIdle()
  const [sceneDrawn, setSceneDrawn] = useState(false)

  const closeSites = useCallback(() => setSitesOpen(false), [])
  const openFromSites = useCallback((p) => { setSitesOpen(false); openProject(p) }, [openProject])

  // The rail re-renders App on every scroll frame; nothing below the fold
  // depends on it, so build that part once.
  const below = useMemo(() => (
    <>
      <ProjectIndex onOpen={openProject} />
      <About onOpenSites={() => setSitesOpen(true)} />
      <Experience onOpenProject={openProject} />
      <Stack />
      <Archive />
    </>
  ), [openProject])
  const contact = useMemo(() => <Contact />, [])

  return (
    <>
      <a className="skip-link" href="#work">Skip to work</a>
      <Cursor enabled={!reduced} />

      {/* Sun or moon, stars, mountains, birds — behind the canvas. The ridgelines
          drift at different speeds as the rail scrolls. */}
      <Sky
        paused={!inView || !!open || sitesOpen}
        style={{ '--p': railPos / Math.max(1, railProjects.length - 1) }}
      />

      {/* The still of the first three screens is the default. The 3D rail takes
          over only once it has actually drawn a frame — so if WebGL is off, slow,
          or silently fails (seen on Safari), the projects are still on screen. */}
      <HeroStill items={railProjects} hidden={showRail && sceneDrawn} />
      {showRail && sceneReady && (
        <SceneBoundary fallback={null}>
          <Suspense fallback={null}>
              <Scene
                items={railProjects}
                railPos={railPos}
                engage={engage}
                isDark={isDark}
                reduced={reduced}
                paused={!inView || !!open || sitesOpen}
                onSelect={(i) => openProject(railProjects[i])}
                onReady={setSceneDrawn}
              />
          </Suspense>
        </SceneBoundary>
      )}

      {showRail && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[1]
                     bg-gradient-to-t from-bg from-30% via-bg/85 via-55% to-transparent
                     md:bg-gradient-to-r md:from-bg md:via-bg/55 md:to-transparent"
        />
      )}

      <header className="wrap fixed inset-x-0 top-0 z-30 flex items-center justify-between
                         border-b border-line/60 bg-bg/70 py-2.5 backdrop-blur-md">
        <a href="#work" aria-label="SC — back to top" className="flex items-center gap-3 py-1.5">
          <Eyes still={reduced} />
          <span className="label text-fg">SC</span>
        </a>
        <div className="flex items-center gap-1 md:gap-2">
          <nav aria-label="Sections" className="hidden items-center md:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                aria-current={section === n.href.slice(1) ? 'true' : undefined}
                className="nav-link label px-3 py-3 hover:text-accent"
              >
                {n.label}
              </a>
            ))}
          </nav>
          <MotionSwitch reduced={reduced} onToggle={toggleMotion} className="hidden md:grid" />
          <ThemeSwitch isDark={isDark} onToggle={toggle} />
          <MobileMenu isDark={isDark} onToggle={toggle} section={section} reduced={reduced} onToggleMotion={toggleMotion} />
        </div>
      </header>

      <main>
      {/* Hero + rail share one continuous scroll: the first project is already
          on screen, so there is no jarring hand-off between sections. */}
      {/* pointer-events-none throughout: this layer sits above the canvas, so anything
          opaque to the pointer would make the devices unhoverable. Controls opt back in. */}
      <section
        ref={ref}
        id="work"
        className="pointer-events-none relative"
        /* Without the rail there is nothing to scroll through — collapse to one
           screen so reduced-motion visitors don't traverse a screen per project. */
        style={{ height: showRail ? `${railProjects.length * 100}dvh` : '100dvh' }}
      >
        <div className="pointer-events-none sticky top-0 z-20 wrap flex h-dvh flex-col justify-end pb-20 pt-16 md:justify-center md:pb-28">
          <div
            inert={engage > 0.5}
            className="pointer-events-none relative z-10 transition-opacity duration-500"
            style={{ opacity: 1 - Math.min(engage, 1) }}
          >
            <p className="hero-in label" style={{ '--d': '60ms' }}>{profile.place} · {profile.role}</p>
            <h1 style={{ '--d': '120ms' }} className="hero-in mt-3 font-display text-[clamp(2.5rem,min(9vw,12dvh),7.5rem)] leading-[0.82] tracking-tight">
              SAKAR<br />CHAULAGAIN
            </h1>
            <p style={{ '--d': '220ms' }} className="hero-in mt-5 max-w-md text-lg text-muted">{profile.thesis}</p>
            <div style={{ '--d': '300ms' }} className="hero-in pointer-events-auto mt-7 flex flex-wrap gap-3">
              <a href={profile.cv} className="label rounded-full border border-line px-4 py-2.5 hover:border-accent hover:text-accent">Résumé</a>
              <a href="#contact" className="label rounded-full bg-accent px-4 py-2.5 text-bg hover:opacity-80">Get in touch</a>
            </div>

            {/* The rail is scroll-driven, so say so — otherwise the projects sit
                behind an interaction nobody knows is there. */}
            {showRail && (
              <div style={{ '--d': '420ms' }} className="hero-in hero-cue mt-12 flex items-center gap-3">
                <span className="scroll-cue h-8 w-px bg-line" aria-hidden />
                <span className="label">Scroll · {railProjects.length} projects</span>
              </div>
            )}
          </div>

          <div
            inert={engage < 0.5}
            className="wrap pointer-events-none absolute inset-x-0 bottom-16 z-10 transition-opacity duration-300 md:bottom-20"
            style={{ opacity: engage }}
          >
            <WorkPanel
              project={active}
              index={index}
              total={railProjects.length}
              onOpen={() => openProject(active)}
            />
          </div>

          {/* Twelve screens of scrolling is a lot to ask — let people jump past it. */}
          {showRail && (
            <a
              href="#index"
              className="skip-rail edge-right pointer-events-auto absolute bottom-6 z-20 flex items-center gap-2.5
                         rounded-full border border-line bg-bg/70 py-1.5 pl-4 pr-1.5 backdrop-blur-md
                         transition-colors hover:border-accent md:bottom-8"
            >
              <span className="label text-fg">Skip to all projects</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-bg">
                <svg aria-hidden viewBox="0 0 16 16" className="skip-arrow h-3.5 w-3.5" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2.5v10.5M3.5 8.5 8 13l4.5-4.5" />
                </svg>
              </span>
            </a>
          )}
        </div>
      </section>

      {below}
      </main>
      {contact}

      <CaseStudy project={open} onClose={closeProject} isDark={isDark} onToggleTheme={toggle} />
      <LiveSites
        open={sitesOpen}
        onClose={closeSites}
        onOpenProject={openFromSites}
        isDark={isDark}
        onToggleTheme={toggle}
      />
    </>
  )
}

/** Which section is in the middle of the screen — drives the header highlight. */
function useActiveSection() {
  const [active, setActive] = useState(null)
  useEffect(() => {
    const els = ['work', ...NAV.map((n) => n.href.slice(1))].map((id) => document.getElementById(id)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return active
}

/** Phones and small tablets: the section links in a full-screen sheet. */
function MobileMenu({ isDark, onToggle, section, reduced, onToggleMotion }) {
  const ref = useRef(null)
  const close = () => ref.current?.close()
  return (
    <>
      <button
        onClick={() => { ref.current?.showModal(); ref.current?.querySelector('[data-close]')?.focus() }}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-accent md:hidden"
      >
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
          <path d="M4 8.5h16M4 15.5h16" />
        </svg>
      </button>
      {/* Clicking a link closes the sheet first; the smooth-scroll handler then takes the jump. */}
      <dialog
        ref={ref}
        aria-label="Menu"
        onClick={(e) => { if (e.target.closest('a[href^="#"]')) close() }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg"
      >
        <div className="wrap flex h-full flex-col overflow-y-auto py-2.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-3 py-1.5">
              <Eyes still={reduced} />
              <span className="label text-fg">SC</span>
            </span>
            <div className="flex items-center gap-1">
              <ThemeSwitch isDark={isDark} onToggle={onToggle} />
              <button
                data-close
                onClick={close}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-line hover:border-accent"
              >
                <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          </div>

          <nav aria-label="Sections" className="flex flex-1 flex-col justify-center py-8">
            {NAV.map((n, i) => (
              <a
                key={n.href}
                href={n.href}
                aria-current={section === n.href.slice(1) ? 'true' : undefined}
                style={{ '--i': i }}
                className="menu-link group flex items-center justify-between border-b border-line py-4
                           font-display text-[clamp(2rem,9vw,3rem)] leading-none aria-[current]:text-accent"
              >
                {n.label}
                <span aria-hidden className="text-2xl text-muted transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
            ))}
          </nav>

          <button
            onClick={onToggleMotion}
            aria-pressed={!reduced}
            style={{ '--i': NAV.length }}
            className="menu-link mb-5 flex items-center justify-between rounded-2xl border border-line px-4 py-3.5 text-left"
          >
            <span>
              <span className="block font-display text-lg leading-tight">Animations</span>
              <span className="label mt-1 block">{reduced ? 'Off — lighter and calmer' : 'On — 3D, cursor and scenery'}</span>
            </span>
            <span className={`relative h-7 w-12 rounded-full border border-line transition-colors ${reduced ? 'bg-bg' : 'bg-accent'}`}>
              <span className={`absolute top-0.5 h-5.5 w-5.5 rounded-full bg-fg transition-transform ${reduced ? 'left-0.5' : 'left-0.5 translate-x-5'}`} />
            </span>
          </button>

          <ul className="menu-link flex flex-wrap gap-2 pb-4" style={{ '--i': NAV.length + 1 }}>
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="chip">
                  <BrandIcon id={s.id} className="h-3.5 w-3.5" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  )
}

/**
 * True once the browser is idle after first paint. The 3D chunk (~250KB gz)
 * and WebGL start-up wait for it, so the hero text paints without competing.
 */
function useIdle() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const go = () => setReady(true)
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(go, { timeout: 1200 })
      return () => cancelIdleCallback(id)
    }
    const id = setTimeout(go, 300)
    return () => clearTimeout(id)
  }, [])
  return ready
}

/**
 * Shareable case studies: #project/<id> opens that project, and opening one
 * writes the hash. Opening pushes a history entry, so Back (or the Android
 * back gesture) closes the case study instead of leaving the site; a visitor
 * who arrived on a shared link just gets the hash cleared on close.
 */
function useProjectLink() {
  const [open, setOpen] = useState(null)
  const pushed = useRef(false) // did we add the current history entry?

  useEffect(() => {
    const sync = () => {
      const m = location.hash.match(/^#project\/([^/?#]+)/)
      const id = m && decodeURIComponent(m[1]).toLowerCase()
      pushed.current = false // the entry now showing isn't one we still owe a Back for
      setOpen(id ? projects.find((p) => p.id.toLowerCase() === id) ?? null : null)
    }
    sync()
    addEventListener('popstate', sync)
    addEventListener('hashchange', sync)
    return () => {
      removeEventListener('popstate', sync)
      removeEventListener('hashchange', sync)
    }
  }, [])

  const openProject = useCallback((p) => {
    if (!p) return
    setOpen(p)
    const hash = `#project/${p.id}`
    if (location.hash === hash) return
    history.pushState({ project: p.id }, '', hash)
    pushed.current = true
  }, [])

  // Idempotent: the dialog's own close event calls this again after the button did.
  const closeProject = useCallback(() => {
    setOpen(null)
    if (pushed.current) {
      pushed.current = false
      history.back()
    } else if (location.hash.startsWith('#project/')) {
      history.replaceState(history.state, '', location.pathname + location.search)
    }
  }, [])

  return { open, openProject, closeProject }
}

/** If the 3D scene throws (no GPU, WebGL blocked, context keeps dying), show the still instead. */
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.warn('3D rail unavailable, showing the still:', err?.message ?? err) }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

/** The rail's first three screens as a still — shown until the 3D rail has drawn, and whenever it can't. */
function HeroStill({ items, hidden = false }) {
  const [a, b, c] = items.filter((p) => p.texture)
  if (!a) return null
  return (
    <div aria-hidden data-hidden={hidden || undefined} className="hero-still pointer-events-none fixed inset-0 z-0">
      <div className="still-stage">
        {b && <img src={b.texture} alt="" decoding="async" className="still-phone still-side still-left" />}
        <img src={a.texture} alt="" fetchPriority="high" className="still-phone still-front" />
        {c && <img src={c.texture} alt="" decoding="async" className="still-phone still-side still-right" />}
      </div>
    </div>
  )
}

