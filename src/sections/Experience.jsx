import { useState } from 'react'
import { experience, hasPlaceholderExperience, mapUrl } from '../data'
import { Reveal } from '../Reveal'
import { TechChip } from './Rest'

const MONTH = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 }

/** "Nov 2024 — Feb 2026" → "1 yr 4 mos" (inclusive, as LinkedIn counts). Present = today. */
function duration(period) {
  const m = period?.match(/(\w{3})\w* (\d{4})\s*[—–-]\s*(?:(\w{3})\w* (\d{4})|present)/i)
  if (!m) return null
  const start = new Date(+m[2], MONTH[m[1].toLowerCase()])
  const end = m[3] ? new Date(+m[4], MONTH[m[3].toLowerCase()]) : new Date()
  const months = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() + 1
  const y = Math.floor(months / 12)
  const mo = months % 12
  return [y && `${y} yr${y > 1 ? 's' : ''}`, mo && `${mo} mo${mo > 1 ? 's' : ''}`].filter(Boolean).join(' ')
}

const SHOW = 3 // highlights visible on phones before "Show all"

/** Work history as a timeline: when on the left, what was done on the right. */
export function Experience({ onOpenProject }) {
  if (!experience.length) return null

  return (
    <section id="experience" className="wrap relative z-10 border-t border-line bg-bg py-20 md:py-28">
      <Reveal>
        <p className="label">Experience</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95]">
          Where I&rsquo;ve worked
        </h2>
      </Reveal>

      {hasPlaceholderExperience && (
        <Reveal role="note" className="mt-8 flex items-start gap-3 rounded-lg border px-4 py-3" style={{ borderColor: 'var(--signal)' }}>
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--signal)' }} />
          <p className="text-sm leading-relaxed text-muted">
            <strong className="text-fg">Details pending.</strong> Fill them in{' '}
            <code className="font-mono text-xs">src/data/experience.json</code> and remove the{' '}
            <code className="font-mono text-xs">placeholder</code> flag before publishing.
          </p>
        </Reveal>
      )}

      <ol className="relative mt-12 md:mt-16">
        {/* The rail: same local-network idea as the project rail, nodes on a line. */}
        <span aria-hidden className="absolute bottom-0 left-[7px] top-2 w-px bg-line md:left-[calc(11rem+2.5rem+7px)]" />
        {experience.map((e, i) => (
          <Role key={e.id} e={e} delay={Math.min(i, 3) * 100} onOpenProject={onOpenProject} />
        ))}
      </ol>
    </section>
  )
}

function Role({ e, delay, onOpenProject }) {
  const [open, setOpen] = useState(false)
  const current = /present/i.test(e.period ?? '')
  const span = duration(e.period)
  const highlights = e.highlights ?? []

  return (
    <Reveal
      as="li"
      delay={delay}
      className="relative grid grid-cols-1 gap-4 pb-14 pl-9 last:pb-0 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-x-20 md:pl-0"
    >
      {/* Node on the rail — the current role pings. */}
      <span aria-hidden className="absolute left-0 top-1.5 flex h-[15px] w-[15px] items-center justify-center md:left-[calc(11rem+2.5rem)]">
        {current && <span className="ping ping-1" />}
        <span className={`tl-node relative h-[15px] w-[15px] rounded-full border-2 ${current ? 'border-live bg-live' : 'border-line bg-bg'}`} />
      </span>

      <div className="md:pt-0.5 md:text-right">
        <p className="label text-fg">{e.period ?? 'Dates pending'}</p>
        {span && <p className="label mt-1">{span}</p>}
      </div>

      <article className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="font-display text-3xl leading-tight md:text-4xl">{e.company ?? 'Current company'}</h3>
          {current && (
            <span className="label rounded-full border border-live/50 px-2.5 py-1 text-live">Current</span>
          )}
        </div>
        <p className="mt-1 text-[0.98rem] text-accent">{e.role ?? 'Role pending'}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {e.website && (
            <a href={e.website} target="_blank" rel="noopener noreferrer" className="chip">
              <Glyph d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
              {e.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')} ↗
            </a>
          )}
          {e.location && (
            <a
              href={mapUrl(e.address ?? e.location)}
              target="_blank"
              rel="noopener noreferrer"
              title={e.address ?? e.location}
              aria-label={`${e.location}, open in Google Maps`}
              className="chip"
            >
              <Glyph d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
              {e.location} ↗
            </a>
          )}
        </div>

        {e.summary && <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-muted">{e.summary}</p>}

        {highlights.length > 0 && (
          <>
            <ul className="mt-5 max-w-2xl space-y-2.5">
              {highlights.map((h, i) => (
                <li
                  key={h}
                  className={`gap-3 text-[0.95rem] leading-relaxed text-muted ${!open && i >= SHOW ? 'hidden md:flex' : 'flex'}`}
                >
                  <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
            {highlights.length > SHOW && (
              <button
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="label mt-3 rounded-full border border-line px-3.5 py-2.5 hover:border-accent hover:text-accent md:hidden"
              >
                {open ? 'Show less' : `Show all ${highlights.length}`}
              </button>
            )}
          </>
        )}

        {e.stackLabels?.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {e.stackLabels.map((name) => <TechChip key={name} name={name} />)}
          </ul>
        )}

        {e.linkedProjects?.length > 0 && (
          <div className="mt-8">
            <p className="label">Projects from this role</p>
            <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {e.linkedProjects.map((p) => (
                <li key={p.id}>
                  <button
                    onClick={() => onOpenProject(p)}
                    className="group flex w-full items-center gap-3 rounded-xl border border-line bg-raised/40 p-2 pr-3 text-left
                               transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent"
                  >
                    <span className="grid h-14 w-11 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-bg">
                      {p.texture ? (
                        <img src={p.texture} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                      ) : (
                        <span className="font-display text-lg text-muted">{p.title.charAt(0)}</span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-display text-base leading-tight">{p.title}</span>
                      <span className="label mt-1 block truncate">{p.category}</span>
                    </span>
                    <span aria-hidden className="text-muted transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">→</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </Reveal>
  )
}

function Glyph({ d }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 shrink-0">
      <path d={d} />
    </svg>
  )
}
