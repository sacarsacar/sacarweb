import { experience, hasPlaceholderExperience } from '../data'
import { Reveal } from '../Reveal'

/** Work history. Period on the left, what you actually did on the right. */
export function Experience({ onOpenProject }) {
  if (!experience.length) return null

  return (
    <section
      id="experience"
      className="relative z-10 border-t border-line bg-bg px-5 py-20 sm:px-6 md:px-10 md:py-28 lg:px-14"
    >
      <Reveal>
        <p className="label">Experience</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95]">
          Worked on
        </h2>
      </Reveal>

      {hasPlaceholderExperience && (
        <Reveal
          role="note"
          className="mt-8 flex items-start gap-3 rounded-lg border px-4 py-3"
          style={{ borderColor: 'var(--signal)' }}
        >
          <span
            aria-hidden
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: 'var(--signal)' }}
          />
          <p className="text-sm leading-relaxed text-muted">
            <strong className="text-fg">Placeholder content.</strong> These entries are sample data
            so the layout can be reviewed — they are not real roles. Replace them in{' '}
            <code className="font-mono text-xs">src/data/experience.json</code> and remove the{' '}
            <code className="font-mono text-xs">placeholder</code> flag before publishing.
          </p>
        </Reveal>
      )}

      <ol className="mt-10 border-t border-line">
        {experience.map((e, i) => (
          <Reveal as="li" key={e.id} delay={Math.min(i, 4) * 90}>
            <article
              className="grid gap-4 border-b border-line py-8
                         md:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] md:gap-10 md:py-10"
            >
              <div className="md:pt-1">
                <p className="label">{e.period}</p>
                {e.location && <p className="label mt-1 opacity-60">{e.location}</p>}
              </div>

              <div className="min-w-0">
                <h3 className="font-display text-2xl leading-tight sm:text-3xl md:text-4xl">
                  {e.company}
                </h3>
                <p className="mt-1 text-[0.95rem] text-accent">{e.role}</p>

                {e.summary && (
                  <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-muted">
                    {e.summary}
                  </p>
                )}

                {e.highlights?.length > 0 && (
                  <ul className="mt-5 space-y-2.5">
                    {e.highlights.map((h) => (
                      <li key={h} className="flex max-w-2xl gap-3 text-[0.95rem] leading-relaxed text-muted">
                        <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {e.stackLabels?.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {e.stackLabels.map((t) => (
                      <li key={t} className="label rounded border border-line px-1.5 py-0.5 text-fg">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}

                {e.linkedProjects?.length > 0 && (
                  <div className="mt-6">
                    <p className="label">Projects from this role</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {e.linkedProjects.map((p) => (
                        <li key={p.id}>
                          <button
                            onClick={() => onOpenProject(p)}
                            className="label rounded-full border border-line px-3 py-2
                                       transition-colors hover:border-accent hover:text-accent"
                          >
                            {p.title} →
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </section>
  )
}
