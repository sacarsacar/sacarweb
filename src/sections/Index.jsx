import { useEffect, useMemo, useState } from 'react'
import pubLogo from '../assets/pub-dev-logo.svg?raw'
import {
  orderedProjects, KINDS, kindCounts, PLATFORMS, platformCounts, CONTEXTS, contextCounts,
} from '../data'
import { Reveal } from '../Reveal'
import { StatusPill, LinkChips, OrgLine } from './Work'

/**
 * A shelf of screens rather than a card grid: the screenshot is the object,
 * tilting toward the pointer like the phones on the rail. Links sit under each
 * one so a visitor can open the app, store page or code without a detour.
 */
const INITIAL = 8
const ALL = { id: 'all', label: 'All' }

export function ProjectIndex({ onOpen }) {
  const [kind, setKind] = useState('all')
  const [context, setContext] = useState('all')
  const [platform, setPlatform] = useState('all')
  const [expanded, setExpanded] = useState(false)

  // Three independent axes, combined with AND. Kind is primary (big tabs);
  // Type and Platform answer narrower questions and stay as small chips.
  const matching = useMemo(
    () =>
      orderedProjects
        .filter((p) => kind === 'all' || p.kind === kind)
        .filter((p) => context === 'all' || p.context === context)
        .filter((p) => platform === 'all' || p.platforms.includes(platform)),
    [kind, context, platform]
  )

  // Any filter starts a new list — carrying "expanded" across would
  // silently show everything again.
  useEffect(() => setExpanded(false), [kind, context, platform])

  const shown = expanded ? matching : matching.slice(0, INITIAL)
  const hidden = matching.length - shown.length
  const filtered = kind !== 'all' || context !== 'all' || platform !== 'all'
  const clear = () => { setKind('all'); setContext('all'); setPlatform('all') }

  return (
    <section id="index" className="wrap relative z-10 border-t border-line bg-bg py-20 md:py-28">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="label">All work</p>
          <h2 className="mt-3 font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95]">
            {orderedProjects.length} projects
          </h2>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <FilterGroup label="Type" options={CONTEXTS} counts={contextCounts}
            total={orderedProjects.length} value={context} onChange={setContext} />
          <FilterGroup label="Platform" options={PLATFORMS} counts={platformCounts}
            total={orderedProjects.length} value={platform} onChange={setPlatform} />
        </div>
      </div>

      <div role="group" aria-label="Filter projects by category"
        className="mt-10 flex flex-wrap gap-x-5 gap-y-2 border-b border-line sm:gap-x-7">
        {[ALL, ...KINDS].map((k) => {
          const active = kind === k.id
          return (
            <button
              key={k.id}
              onClick={() => setKind(k.id)}
              aria-pressed={active}
              className={`-mb-px border-b-2 pb-3 font-display text-xl transition-colors sm:text-3xl ${
                active ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {k.label}
              <span className="ml-1.5 align-top font-mono text-xs text-muted">
                {k.id === 'all' ? orderedProjects.length : kindCounts[k.id]}
              </span>
            </button>
          )
        })}
      </div>

      <p aria-live="polite" className="label mt-6">
        Showing {shown.length} of {matching.length}
        {filtered && ` · filtered from ${orderedProjects.length}`}
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((p, i) => (
          <Reveal as="li" key={p.id} delay={(i % 4) * 70}>
            <Shelf p={p} onOpen={onOpen} />
          </Reveal>
        ))}
      </ul>

      {matching.length === 0 && (
        <p className="mt-10 text-muted">
          No projects match that combination.{' '}
          <button onClick={clear} className="border-b border-accent text-fg hover:opacity-60">
            Clear filters
          </button>
        </p>
      )}

      {hidden > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="label mt-12 rounded-full border border-line px-5 py-3 hover:border-accent hover:text-accent"
        >
          See all {matching.length} projects
          <span className="ml-2 text-muted">+{hidden}</span>
        </button>
      )}
      {expanded && matching.length > INITIAL && (
        <button
          onClick={() => setExpanded(false)}
          className="label mt-12 rounded-full border border-line px-5 py-3 hover:border-accent hover:text-accent"
        >
          Show fewer
        </button>
      )}
    </section>
  )
}

/** Pointer position -> CSS vars; the transform itself lives in index.css. Mouse only. */
function tilt(e) {
  if (e.pointerType !== 'mouse') return
  const r = e.currentTarget.getBoundingClientRect()
  const x = (e.clientX - r.left) / r.width
  const y = (e.clientY - r.top) / r.height
  const s = e.currentTarget.style
  s.setProperty('--rx', `${(0.5 - y) * 12}deg`)
  s.setProperty('--ry', `${(x - 0.5) * 14}deg`)
  s.setProperty('--gx', `${x * 100}%`)
  s.setProperty('--gy', `${y * 100}%`)
}
function untilt(e) {
  e.currentTarget.style.setProperty('--rx', '0deg')
  e.currentTarget.style.setProperty('--ry', '0deg')
}

/** Landscape shots (web apps, PhysicsVerse) letterbox instead of cropping to a sliver. */
function fit(e) {
  const i = e.currentTarget
  if (i.naturalWidth > i.naturalHeight) {
    i.classList.replace('object-cover', 'object-contain')
    i.classList.replace('object-top', 'object-center')
  }
}

function Shelf({ p, onOpen }) {
  return (
    <article>
      <button
        onClick={() => onOpen(p)}
        onPointerMove={tilt}
        onPointerLeave={untilt}
        aria-label={`Read the ${p.title} case study`}
        className="tilt group block w-full text-left"
      >
        <span className="tilt-screen block aspect-[4/5] overflow-hidden rounded-[1.25rem] border border-line bg-raised">
          {p.texture ? (
            <img src={p.texture} alt="" loading="lazy" decoding="async" onLoad={fit}
              className="h-full w-full object-cover object-top" />
          ) : p.kind === 'package' ? (
            /* The install line is the most useful thing a package can show. */
            <span className="flex h-full flex-col p-4">
              <span
                className="pub-logo my-auto block w-4/5 max-w-[11rem] self-center text-fg"
                // Static file from pub.dev, wordmark recoloured to currentColor — trusted, not user input.
                dangerouslySetInnerHTML={{ __html: pubLogo }}
              />
              <code className="break-all font-mono text-[0.7rem] leading-relaxed text-fg">
                flutter pub add {p.title}
              </code>
            </span>
          ) : (
            /* Reserved slot (README pending): name the project, say what's coming. */
            <span className="flex h-full flex-col justify-between border border-dashed border-line/0 p-5
                             [background:repeating-linear-gradient(135deg,transparent_0_14px,var(--line)_14px_15px)]">
              <span className="label">{p.org?.company ?? 'Office project'}</span>
              <span>
                <span className="block font-display text-4xl leading-none sm:text-5xl">{p.title}</span>
                <span className="mt-2 block text-sm text-muted">Write-up on the way</span>
              </span>
            </span>
          )}
        </span>

        <span className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <StatusPill shipped={p.shipped} />
          {p.placeholder && (
            <span className="label rounded-full border border-dashed border-line px-2 py-0.5">
              Case study soon
            </span>
          )}
        </span>
        <span className="mt-1.5 block font-display text-xl leading-tight transition-colors group-hover:text-accent sm:text-2xl">
          {p.title}
        </span>
        <span className="mt-1 block text-sm text-muted">{p.category}</span>
      </button>

      <OrgLine org={p.org} className="mt-1" />
      <LinkChips links={p.links} className="mt-3" />
    </article>
  )
}

function FilterGroup({ label, options, counts, total, value, onChange }) {
  return (
    <div role="group" aria-label={`Filter projects by ${label.toLowerCase()}`} className="flex flex-wrap items-center gap-2">
      <span className="label mr-1 w-full shrink-0 sm:w-20 lg:text-right">{label}</span>
      <Chip active={value === 'all'} onClick={() => onChange('all')} count={total}>All</Chip>
      {options.map((o) => (
        <Chip key={o.id} active={value === o.id} onClick={() => onChange(o.id)} count={counts[o.id]}>
          {o.label}
        </Chip>
      ))}
    </div>
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
      <span className="text-muted">{count}</span>
    </button>
  )
}
