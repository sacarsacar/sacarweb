import { useEffect, useRef } from 'react'
import { StatusPill } from './Work'

/** Native <dialog>: focus trap, Esc-to-close and inertness come free. */
export function CaseStudy({ project, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (project && !d.open) d.showModal()
    if (!project && d.open) d.close()
  }, [project])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg"
    >
      {project && (
        /* data-lenis-prevent: Lenis captures wheel events on the document, so
           without this the dialog's own scroll container never receives them. */
        <div data-lenis-prevent className="h-dvh overflow-y-auto overscroll-contain">
          <div className="sticky top-0 z-20 flex items-center justify-between gap-4
                          border-b border-line bg-bg/85 px-5 py-3 backdrop-blur-md sm:px-8 lg:px-12">
            <div className="flex min-w-0 items-center gap-3">
              <StatusPill shipped={project.shipped} />
              <span className="label truncate">{project.category}</span>
            </div>
            <button
              onClick={onClose}
              autoFocus
              className="label shrink-0 rounded-full border border-line px-4 py-2
                         hover:border-accent hover:text-accent"
            >
              Close ✕
            </button>
          </div>

          <div className="mx-auto w-full max-w-[110rem] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
            <h2 className="font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.92]">
              {project.title}
            </h2>

            <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
              {/* Meta stays in view while the write-up scrolls past it. */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="space-y-6 border-t border-line pt-6">
                  <Meta label="Platforms" value={project.platformLabels.join(' · ')} />
                  <Meta label="Frontend" value={project.frontendLabels.join(' · ')} />
                  <Meta label="Backend" value={project.backendLabels.join(' · ')} />
                </div>

                {(project.github || project.live) && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {project.live && <LinkBtn href={project.live}>View live</LinkBtn>}
                    {project.github && <LinkBtn href={project.github}>Source on GitHub</LinkBtn>}
                  </div>
                )}
              </aside>

              <div className="min-w-0">
                {project.summary && (
                  <p className="max-w-3xl font-display text-xl leading-snug sm:text-2xl">
                    {project.summary}
                  </p>
                )}

                <div className="mt-8 space-y-4">
                  {project.body.map((b, i) =>
                    b.heading ? (
                      <h3 key={i} className="pt-8 font-display text-2xl sm:text-3xl">{b.text}</h3>
                    ) : (
                      <p key={i} className="max-w-3xl leading-relaxed text-muted">{b.text}</p>
                    )
                  )}
                </div>

                {project.gallery.length > 1 && (
                  <>
                    <h3 className="label mt-16">Screens · {project.gallery.length}</h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 pb-20 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                      {project.gallery.map((g) => (
                        <a
                          key={g.name}
                          href={g.full}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block overflow-hidden rounded-lg border border-line
                                     bg-raised transition-colors hover:border-accent"
                        >
                          <img
                            src={g.full}
                            alt={`${project.title} — ${g.name.replace(/[_-]/g, ' ')}`}
                            loading="lazy"
                            className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </a>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  )
}

function Meta({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-1.5 text-sm">{value}</p>
    </div>
  )
}

function LinkBtn({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="label rounded-full border border-line px-4 py-2.5 hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  )
}
