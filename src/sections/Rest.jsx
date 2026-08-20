import { skills, miniByCategory, profile } from '../data'
import { Reveal } from '../Reveal'

export function Stack() {
  return (
    <section id="stack" className="relative z-10 border-t border-line bg-bg px-6 py-24 md:px-14">
      <Reveal>
        <p className="label">What I build with</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-[0.95] md:text-6xl">
          No proficiency scores. Just what shipped, and what it was built with.
        </h2>
      </Reveal>
      <ul className="mt-10 flex flex-wrap gap-2">
        {skills.map((s, i) => (
          <Reveal as="li" key={s.name} delay={Math.min(i, 14) * 35} className="group relative">
            <span
              className="label flex items-center gap-2 rounded-full border border-line px-3 py-2
                         text-fg transition-[border-color,transform,color] duration-300
                         hover:-translate-y-0.5 hover:border-accent"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
            {s.tagline && (
              <span
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[15rem]
                           -translate-x-1/2 rounded-md border border-line bg-raised px-3 py-1.5
                           text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100"
              >
                {s.tagline}
              </span>
            )}
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

export function Archive() {
  const order = ['tools', 'games']
  return (
    <section id="archive" className="relative z-10 border-t border-line bg-bg px-6 py-24 md:px-14">
      <Reveal>
        <p className="label">Playground · 2022—2023</p>
        <h2 className="mt-3 max-w-2xl font-display text-4xl leading-[0.95] md:text-6xl">
          Early work
        </h2>
        <p className="mt-4 max-w-lg text-muted">
          Fifteen small things built while learning the web. All still live.
        </p>
      </Reveal>

      {order.filter((c) => miniByCategory[c]).map((cat) => (
        <div key={cat} className="mt-10">
          <p className="label">{cat}</p>
          <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {miniByCategory[cat].map((m, i) => (
              <Reveal as="li" key={m.title} delay={Math.min(i, 8) * 45}>
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/row flex items-baseline justify-between gap-3 border-b border-line
                             py-2.5 transition-[border-color,color,padding] duration-300
                             hover:border-accent hover:pl-1.5 hover:text-accent"
                >
                  <span>{m.title.replace(/_/g, ' ')}</span>
                  <span className="label shrink-0 transition-transform duration-300
                                   group-hover/row:translate-x-0.5">↗</span>
                </a>
              </Reveal>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="relative z-10 border-t border-line bg-bg px-6 py-24 md:px-14">
      <div className="grid gap-14 lg:grid-cols-2">
        <Reveal>
          <p className="label">Contact</p>
          <h2 className="mt-3 font-display text-4xl leading-[0.95] md:text-6xl">
            Let’s build something
            <br />that keeps working.
          </h2>
          <p className="mt-5 max-w-sm text-muted">
            Based in {profile.place}. Open to Flutter and full-stack work.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="mt-6 inline-block border-b-2 border-accent pb-1 font-display text-xl hover:opacity-60"
          >
            {profile.email}
          </a>
          <ul className="mt-8 flex flex-wrap gap-2">
            {Object.entries(profile.socials).map(([k, href]) => (
              <li key={k}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="label rounded-full border border-line px-3 py-2 hover:border-accent hover:text-accent"
                >
                  {k}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Posts to the existing Google Apps Script endpoint — no backend to run. */}
        <Reveal as="form" delay={120} action={profile.formAction} method="post" className="grid gap-3 content-start">
          <Field name="Name" label="Your name" required />
          <Field name="Email" label="Email" type="email" required />
          <Field name="Subject" label="Subject" required />
          <label className="grid gap-1.5">
            <span className="label">Message</span>
            <textarea
              name="Message"
              rows={5}
              required
              className="rounded-lg border border-line bg-raised px-3 py-2.5 text-fg
                         focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            className="mt-2 justify-self-start rounded-full bg-accent px-6 py-3 font-display
                       text-lg text-bg transition-opacity hover:opacity-80"
          >
            Send message
          </button>
        </Reveal>
      </div>

      <footer className="label mt-24 flex flex-wrap justify-between gap-3 border-t border-line pt-6">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <a href="https://sakarc.com.np" target="_blank" rel="noopener noreferrer" className="hover:text-accent">
          sakarc.com.np ↗
        </a>
      </footer>
    </section>
  )
}

function Field({ name, label, type = 'text', required }) {
  return (
    <label className="grid gap-1.5">
      <span className="label">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        className="rounded-lg border border-line bg-raised px-3 py-2.5 text-fg
                   focus:border-accent focus:outline-none"
      />
    </label>
  )
}
