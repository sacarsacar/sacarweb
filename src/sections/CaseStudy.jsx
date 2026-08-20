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
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      className="m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-fg backdrop:bg-black/70"
    >
      {project && (
        <div className="mx-auto h-dvh w-full max-w-3xl overflow-y-auto px-6 py-14 md:px-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <StatusPill shipped={project.shipped} />
              <h2 className="mt-3 font-display text-4xl leading-[0.95] md:text-6xl">
                {project.title}
              </h2>
              <p className="label mt-2">{project.category}</p>
            </div>
            <button
              onClick={onClose}
              autoFocus
              className="label shrink-0 rounded-full border border-line px-4 py-2
                         hover:border-accent hover:text-accent"
            >
              Close
            </button>
          </div>

          <div className="mt-8 grid gap-6 border-y border-line py-6 sm:grid-cols-2">
            <StackList label="Frontend" items={project.frontendLabels} />
            <StackList label="Backend" items={project.backendLabels} />
          </div>

          {(project.github || project.live) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.live && <LinkBtn href={project.live}>View live</LinkBtn>}
              {project.github && <LinkBtn href={project.github}>Source on GitHub</LinkBtn>}
            </div>
          )}

          <div className="mt-10 space-y-4">
            {project.body.map((b, i) =>
              b.heading ? (
                <h3 key={i} className="pt-6 font-display text-2xl">{b.text}</h3>
              ) : (
                <p key={i} className="leading-relaxed text-muted">{b.text}</p>
              )
            )}
          </div>

          {project.gallery.length > 1 && (
            <>
              <h3 className="label mt-12">Screens</h3>
              <div className="mt-4 grid grid-cols-2 gap-3 pb-16 sm:grid-cols-3">
                {project.gallery.map((g) => (
                  <img
                    key={g.name}
                    src={g.full}
                    alt={`${project.title} — ${g.name.replace(/[_-]/g, ' ')}`}
                    loading="lazy"
                    className="w-full rounded-lg border border-line bg-raised"
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </dialog>
  )
}

function StackList({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="label">{label}</p>
      <p className="mt-2 text-sm">{items.join(' · ')}</p>
    </div>
  )
}

function LinkBtn({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="label rounded-full border border-line px-4 py-2 hover:border-accent hover:text-accent"
    >
      {children}
    </a>
  )
}
