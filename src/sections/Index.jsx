import { useEffect, useMemo, useState } from 'react'
import { orderedProjects, PLATFORMS, platformCounts } from '../data'
import { StatusPill } from './Work'

/**
 * Dense catalogue rather than a card grid: every project is one scannable row
 * carrying platform, status and stack at a glance. Collapses to a stacked card
 * under 768px. This is also the only route that reaches all ten by keyboard.
 */
const INITIAL = 5

export function ProjectIndex({ onOpen }) {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)

  const matching = useMemo(
    () => (filter === 'all' ? orderedProjects : orderedProjects.filter((p) => p.platforms.includes(filter))),
    [filter]
  )

  // Changing the filter starts a new list — carrying "expanded" across would
  // silently show everything again.
  useEffect(() => setExpanded(false), [filter])

  const shown = expanded ? matching : matching.slice(0, INITIAL)
  const hidden = matching.length - shown.length

  return (
    <section id="index" className="relative z-10 border-t border-line bg-bg px-5 py-20 sm:px-6 md:px-10 lg:px-14 md:py-28">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="label">All work</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95]">
            Ten projects
          </h2>
        </div>

        <div role="group" aria-label="Filter projects by platform" className="flex flex-wrap gap-2">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')} count={orderedProjects.length}>
            All
          </Chip>
          {PLATFORMS.map((p) => (
            <Chip key={p.id} active={filter === p.id} onClick={() => setFilter(p.id)} count={platformCounts[p.id]}>
              {p.label}
            </Chip>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="label mt-6">
        Showing {shown.length} of {matching.length}
        {filter !== 'all' && ` · filtered from ${orderedProjects.length}`}
      </p>

      <ul className="mt-4 border-t border-line">
        {shown.map((p, i) => (
          <li key={p.id}>
            <button
              onClick={() => onOpen(p)}
              aria-label={`Read the ${p.title} case study`}
              className="group flex w-full items-start gap-4 border-b border-line py-5 text-left
                         transition-colors hover:bg-raised sm:gap-6 sm:py-6"
            >
              <span className="label hidden w-8 shrink-0 pt-1 sm:block">
                {String(i + 1).padStart(2, '0')}
              </span>

              <img
                src={p.texture}
                alt=""
                loading="lazy"
                className="aspect-[4/5] w-16 shrink-0 rounded-md border border-line bg-raised
                           object-cover object-top transition-colors group-hover:border-accent
                           sm:w-20 md:w-24"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="font-display text-xl leading-tight sm:text-2xl md:text-3xl">
                    {p.title}
                  </h3>
                  <StatusPill shipped={p.shipped} />
                </div>

                <p className="label mt-1.5">{p.category}</p>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.platformLabels.map((l) => (
                    <li key={l} className="label rounded border border-line px-1.5 py-0.5 text-fg">
                      {l}
                    </li>
                  ))}
                </ul>

                <p className="mt-3 hidden truncate font-mono text-[0.65rem] text-muted md:block">
                  {p.stack.join(' · ')}
                </p>
              </div>

              <span
                aria-hidden
                className="label hidden shrink-0 self-center transition-transform group-hover:translate-x-1
                           group-hover:text-accent lg:block"
              >
                Read →
              </span>
            </button>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="label mt-8 rounded-full border border-line px-5 py-3
                     hover:border-accent hover:text-accent"
        >
          See all {matching.length} projects
          <span className="ml-2 opacity-50">+{hidden}</span>
        </button>
      )}
      {expanded && matching.length > INITIAL && (
        <button
          onClick={() => setExpanded(false)}
          className="label mt-8 rounded-full border border-line px-5 py-3
                     hover:border-accent hover:text-accent"
        >
          Show fewer
        </button>
      )}
    </section>
  )
}

function Chip({ active, onClick, count, children }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`label flex items-center gap-1.5 rounded-full border px-3 py-2 transition-colors ${
        active ? 'border-accent text-accent' : 'border-line hover:border-accent hover:text-accent'
      }`}
    >
      {children}
      <span className="opacity-50">{count}</span>
    </button>
  )
}
