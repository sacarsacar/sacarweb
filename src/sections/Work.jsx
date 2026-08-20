/** The panel beside the rail. Reads out whichever device is currently centred. */
export function WorkPanel({ project, index, total, onOpen }) {
  if (!project) return null
  return (
    <div className="pointer-events-none max-w-md">
      <div className="flex items-center gap-3">
        <span className="label">{String(index + 1).padStart(2, '0')} / {total}</span>
        <StatusPill shipped={project.shipped} />
      </div>

      <h2 className="mt-4 font-display text-4xl leading-[0.95] md:text-6xl">
        {project.title}
      </h2>
      <p className="label mt-2">{project.category}</p>

      <p className="mt-5 text-[0.95rem] leading-relaxed text-muted">
        {project.summary || project.body[0]?.text}
      </p>

      <ul className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <li key={s} className="label rounded-full border border-line px-2.5 py-1 text-fg">
            {s}
          </li>
        ))}
      </ul>

      <button
        onClick={onOpen}
        className="pointer-events-auto mt-7 border-b-2 border-accent pb-1 font-display text-lg
                   text-fg transition-opacity hover:opacity-60"
      >
        Read the case study →
      </button>
    </div>
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
