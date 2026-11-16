import { mapUrl } from '../data'
import { TechChip } from './Rest'

/** The panel beside the rail. Reads out whichever device is currently centred. */
export function WorkPanel({ project, index, total, onOpen }) {
  if (!project) return null
  return (
    // Keyed so each newly centred project slides in rather than swapping text in place.
    <div key={project.id} className="swap-in pointer-events-none max-w-md">
      <div className="flex items-center gap-3">
        <span className="label">{String(index + 1).padStart(2, '0')} / {total}</span>
        <StatusPill shipped={project.shipped} />
      </div>

      <h2 className="mt-4 font-display text-4xl leading-[0.95] md:text-6xl">
        {project.title}
      </h2>
      <p className="label mt-2">{project.category}</p>

      <p className="panel-extra mt-5 text-[0.95rem] leading-relaxed text-muted">
        {project.summary || project.body[0]?.text}
      </p>

      <ul className="panel-extra mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => <TechChip key={s} name={s} />)}
      </ul>

      {project.org && <OrgLine org={project.org} className="pointer-events-auto mt-4" />}

      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          onClick={onOpen}
          className="pointer-events-auto border-b-2 border-accent pb-1 font-display text-lg
                     text-fg transition-opacity hover:opacity-60"
        >
          Read the case study →
        </button>
        <LinkChips links={project.links} className="pointer-events-auto" />
      </div>
    </div>
  )
}

/** Outbound links as small chips: open the app, the store page, or the code directly. */
export function LinkChips({ links, className = '' }) {
  if (!links?.length) return null
  return (
    <ul className={`flex flex-wrap gap-1.5 ${className}`}>
      {links.map((l) => (
        <li key={l.href}>
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line bg-bg/60 px-3 py-2
                       text-xs font-medium text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {l.label}
            <span aria-hidden className="opacity-60">↗</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

/**
 * "At Nnine Solution, Kathmandu" — the company (linked to its site when known)
 * and its location as a Maps link, so a visitor never has to look either up.
 */
export function OrgLine({ org, className = '' }) {
  if (!org?.company) return null
  const name = org.website ? (
    <a href={org.website} target="_blank" rel="noopener noreferrer" className="underline decoration-line underline-offset-4 hover:text-accent">
      {org.company}
    </a>
  ) : org.company
  return (
    <p className={`text-sm text-muted ${className}`}>
      At <span className="text-fg">{name}</span>
      {org.location && (
        <>
          {', '}
          <a
            href={mapUrl(org.address ?? org.location)}
            title={org.address ?? org.location}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${org.location}, open in Google Maps`}
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            {org.location}
          </a>
        </>
      )}
    </p>
  )
}

export function StatusPill({ shipped }) {
  return (
    <span
      className="label inline-flex items-center gap-1.5"
      style={{ color: shipped ? 'var(--live)' : 'var(--signal)' }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: shipped ? 'var(--live)' : 'var(--signal)' }}
      />
      {shipped ? 'Shipped' : 'In progress'}
    </span>
  )
}
