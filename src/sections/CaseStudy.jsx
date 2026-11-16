import { useEffect, useRef, useState } from 'react'
import { StatusPill, OrgLine } from './Work'
import { Sky, ThemeSwitch } from '../Sky'
import { TechChip } from './Rest'

/** Native <dialog>: focus trap, Esc-to-close and inertness come free. */
export function CaseStudy({ project, onClose, isDark, onToggleTheme }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (project && !d.open) {
      d.showModal()
      d.querySelector('[data-close]')?.focus() // first in the bar is the theme switch
    }
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
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ShareLink project={project} />
              <ThemeSwitch isDark={isDark} onToggle={onToggleTheme} />
              <button
                onClick={onClose}
                data-close
                className="label rounded-full border border-line px-4 py-2
                           hover:border-accent hover:text-accent"
              >
                Close ✕
              </button>
            </div>
          </div>

          {/* The same sky as the home page, as a strip: sun or moon, mountains, birds. */}
          <div className="relative h-36 overflow-hidden border-b border-line sm:h-52">
            <Sky band />
          </div>

          <div className="mx-auto w-full max-w-[110rem] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
            <h2 className="font-display text-[clamp(2.25rem,6vw,5.5rem)] leading-[0.92]">
              {project.title}
            </h2>

            <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
              {/* Meta stays in view while the write-up scrolls past it. */}
              <aside className="lg:sticky lg:top-24 lg:self-start">
                <div className="space-y-6 border-t border-line pt-6">
                  {project.org?.company && (
                    <div>
                      <p className="label">Built at</p>
                      <OrgLine org={project.org} className="mt-1.5" />
                    </div>
                  )}
                  <Meta label="Platforms" value={project.platformLabels.join(' · ')} />
                  <TechList label="Frontend" items={project.frontendLabels} />
                  <TechList label="Backend" items={project.backendLabels} />
                </div>

                {project.links.length > 0 && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {project.links.map((l) => <LinkBtn key={l.href} href={l.href}>{l.label}</LinkBtn>)}
                  </div>
                )}
              </aside>

              <div className="min-w-0">
                {project.placeholder && (
                  <p className="max-w-3xl font-display text-xl leading-snug text-muted sm:text-2xl">
                    The case study for this project is being written. Check back soon.
                  </p>
                )}
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

function TechList({ label, items }) {
  if (!items?.length) return null
  return (
    <div>
      <p className="label">{label}</p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((name) => <TechChip key={name} name={name} />)}
      </ul>
    </div>
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

/**
 * Link straight to this case study (#project/<id>). Phones get the native
 * share sheet; elsewhere the link is copied, with a visible confirmation.
 */
function ShareLink({ project }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const url = `${location.origin}${location.pathname}#project/${project.id}`
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: `${project.title} — Sakar Chaulagain`, url }) } catch { /* dismissed */ }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link', url) // clipboard blocked
    }
  }
  return (
    <button
      onClick={share}
      aria-label={copied ? 'Link copied' : `Share a link to ${project.title}`}
      className="label flex h-9 items-center gap-2 rounded-full border border-line px-3 hover:border-accent hover:text-accent"
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
        {copied
          ? <path d="M5 12.5l4.5 4.5L19 7.5" />
          : <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />}
      </svg>
      <span aria-live="polite" className="hidden sm:inline">{copied ? 'Link copied' : 'Share'}</span>
    </button>
  )
}

