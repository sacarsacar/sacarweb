import { lazy, Suspense, useState } from 'react'
import { useTheme, useReducedMotion } from './useTheme'
import { useScrollRail } from './useScrollRail'
import { orderedProjects, profile } from './data'
import { WorkPanel, StatusPill } from './sections/Work'
import { CaseStudy } from './sections/CaseStudy'
import { Stack, Archive, Contact } from './sections/Rest'

// three.js is ~1MB. Split it out so text paints without waiting on WebGL.
const Scene = lazy(() => import('./three/Scene').then((m) => ({ default: m.Scene })))

const has3D = (() => {
  try {
    return !!document.createElement('canvas').getContext('webgl2')
  } catch { return false }
})()

export default function App() {
  const { toggle, isDark } = useTheme()
  const reduced = useReducedMotion()
  const showRail = has3D && !reduced
  const [open, setOpen] = useState(null)
  const { ref, railPos, engage, index } = useScrollRail(orderedProjects.length, showRail)
  const active = orderedProjects[index]

  return (
    <>
      <a className="skip-link" href="#work">Skip to work</a>

      {showRail && (
        <Suspense fallback={null}>
          <Scene
            items={orderedProjects}
            railPos={railPos}
            engage={engage}
            isDark={isDark}
            reduced={reduced}
            onSelect={(i) => setOpen(orderedProjects[i])}
          />
        </Suspense>
      )}

      {showRail && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[1]
                     bg-gradient-to-t from-bg via-bg/70 to-transparent
                     md:bg-gradient-to-r md:from-bg md:via-bg/55 md:to-transparent"
        />
      )}

      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between
                         border-b border-line/60 bg-bg/70 px-6 py-4 backdrop-blur-md md:px-14">
        <span className="label text-fg">SC</span>
        <nav className="flex items-center gap-5">
          <a href="#archive" className="label hover:text-accent">Archive</a>
          <a href="#contact" className="label hover:text-accent">Contact</a>
          <button
            onClick={toggle}
            className="label hover:text-accent"
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
          >
            {isDark ? 'Light' : 'Dark'}
          </button>
        </nav>
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
           screen so reduced-motion visitors don't traverse ten empty ones. */
        style={{ height: showRail ? `${orderedProjects.length * 100}dvh` : '100dvh' }}
      >
        <div className="pointer-events-none sticky top-0 z-20 flex h-dvh flex-col justify-end px-6 pb-16 md:px-14 md:pb-20">
          <div
            inert={engage > 0.5}
            className="pointer-events-none relative z-10 transition-opacity duration-500"
            style={{ opacity: 1 - Math.min(engage, 1) }}
          >
            <p className="label">{profile.place} · {profile.role}</p>
            <h1 className="mt-3 font-display text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.82] tracking-tight">
              SAKAR<br />CHAULAGAIN
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted">{profile.thesis}</p>
            <div className="pointer-events-auto mt-7 flex gap-3">
              <a href={profile.cv} className="label rounded-full border border-line px-4 py-2 hover:border-accent hover:text-accent">Résumé</a>
              <a href="#contact" className="label rounded-full bg-accent px-4 py-2 text-bg hover:opacity-80">Hire me</a>
            </div>
          </div>

          <div
            inert={engage < 0.5}
            className="pointer-events-none absolute inset-x-6 bottom-16 z-10 transition-opacity duration-300 md:inset-x-14 md:bottom-20"
            style={{ opacity: engage }}
          >
            <WorkPanel
              project={active}
              index={index}
              total={orderedProjects.length}
              onOpen={() => setOpen(active)}
            />
          </div>
        </div>
      </section>

      {/* Always present, not just as a no-WebGL fallback: the rail reaches one project
          at a time, so this is the only route that reaches all ten by keyboard. */}
      <section id="index" className="relative z-10 border-t border-line bg-bg px-6 py-24 md:px-14">
        <p className="label">All work</p>
        <h2 className="mt-3 font-display text-4xl leading-[0.95] md:text-6xl">
          Ten projects
        </h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {orderedProjects.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setOpen(p)}
                  aria-label={`Read the ${p.title} case study`}
                  className="group w-full text-left"
                >
                  {/* Portrait phone shots are ~9:19.5 — at full column width they render
                      almost a metre tall. Crop to a card and keep the app's header visible. */}
                  <img
                    src={p.texture}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/5] w-full rounded-xl border border-line bg-raised
                               object-cover object-top transition-colors group-hover:border-accent"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <StatusPill shipped={p.shipped} />
                  </div>
                  <h3 className="mt-1 font-display text-2xl">{p.title}</h3>
                  <p className="label mt-1">{p.category}</p>
                </button>
              </li>
            ))}
        </ul>
      </section>

      <Stack />
      <Archive />
      </main>
      <Contact />

      <CaseStudy project={open} onClose={() => setOpen(null)} />
    </>
  )
}
