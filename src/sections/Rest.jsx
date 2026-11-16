import { useState } from 'react'
import { technologies, miniByCategory, profile, socials, NAV, techIcon } from '../data'
import { ICONS } from '../data/icons'
import { Reveal } from '../Reveal'
import { BrandIcon } from './Profiles'

const FIRST = 16 // most-used technologies shown before "Show all"

export function Stack() {
  const [all, setAll] = useState(false)
  const used = technologies.filter((t) => t.projects > 0)
  const daily = technologies.filter((t) => !t.projects)
  return (
    <section id="stack" className="wrap relative z-10 border-t border-line bg-bg py-20 md:py-28">
      <Reveal>
        <p className="label">What I build with</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95]">
          No proficiency scores. Just what shipped, and what it was built with.
        </h2>
      </Reveal>
      <TechGrid items={all ? used : used.slice(0, FIRST)} />
      {used.length > FIRST && (
        <button
          onClick={() => setAll((v) => !v)}
          aria-expanded={all}
          className="chip mt-4"
        >
          {all ? 'Show fewer' : `Show all ${used.length}`}
        </button>
      )}
      {daily.length > 0 && (
        <>
          <p className="label mt-14">Everyday tools</p>
          <TechGrid items={daily} />
        </>
      )}
    </section>
  )
}

function TechGrid({ items }) {
  return (
    <ul className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8">
      {items.map((t, i) => (
        <Reveal as="li" key={t.name} delay={Math.min(i, 16) * 30} className="group relative">
          <div
            className="tech flex h-full flex-col items-center gap-2 rounded-xl border border-line
                       bg-raised/40 px-2 py-4 text-center"
            style={{ '--brand-d': t.colorDark ?? undefined, '--brand-l': t.colorLight ?? undefined }}
          >
            <TechIcon t={t} />
            <span className="text-[0.8rem] leading-tight text-fg">{t.name}</span>
            {t.projects > 0 && (
              <span className="label tracking-[.1em]">{t.projects} {t.projects === 1 ? 'project' : 'projects'}</span>
            )}
          </div>
          {t.tagline && (
            <span
              role="tooltip"
              className="tech-tip pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[15rem]
                         -translate-x-1/2 rounded-md border border-line bg-raised px-3 py-1.5
                         text-xs text-muted opacity-0 transition-opacity group-hover:opacity-100"
            >
              {t.tagline}
            </span>
          )}
        </Reveal>
      ))}
    </ul>
  )
}

/** A technology as a chip — its logo (or monogram) and name. Used by the rail panel, Experience and case studies. */
export function TechChip({ name }) {
  return (
    <li className="label flex items-center gap-1.5 rounded-full border border-line bg-bg/60 py-1.5 pl-2 pr-2.5 text-fg">
      <TechIcon t={{ name, icon: techIcon(name) }} small />
      {name}
    </li>
  )
}

/** Brand mark, or a monogram for libraries without one (Provider, Isar, Drift…). */
export function TechIcon({ t, small = false }) {
  const d = t.icon && ICONS[t.icon]
  if (d) {
    return (
      <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={small ? 'h-3.5 w-3.5 shrink-0' : 'tech-icon h-7 w-7'}
        fillRule={t.icon === 'hive' || t.icon === 'terminal' ? 'evenodd' : undefined}>
        <path d={d} />
      </svg>
    )
  }
  const bare = t.name.replace(/\(.*\)/, '')
  const caps = bare.slice(1).match(/[A-Z0-9]/g) ?? []
  const mono = caps.length
    ? bare[0] + caps[0]
    : bare.split(/[^A-Za-z0-9]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('')
  return (
    <span
      aria-hidden
      className={small
        ? 'grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[3px] border border-current font-mono text-[0.4rem] uppercase'
        : 'tech-icon tech-mono grid h-7 w-7 place-items-center rounded-md border border-current font-mono text-[0.6rem] uppercase'}
    >
      {mono}
    </span>
  )
}

export function Archive() {
  const order = ['tools', 'games']
  return (
    <section id="archive" className="wrap relative z-10 border-t border-line bg-bg py-20 md:py-28">
      <Reveal>
        <p className="label">Playground · 2022—2023</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2rem,5.5vw,3.75rem)] leading-[0.95]">
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
                             py-3 transition-[border-color,color,padding] duration-300
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

/** Copies the address; if the clipboard is blocked, opens the mail app instead. */
export function CopyEmail({ className = 'chip' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = `mailto:${profile.email}`
    }
  }
  return (
    <button type="button" onClick={copy} className={className}>
      <span aria-live="polite">{copied ? 'Email copied ✓' : 'Copy email'}</span>
    </button>
  )
}

export function Contact() {
  return (
    <section id="contact" className="wrap relative z-10 border-t border-line bg-bg pb-10 pt-20 md:pt-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] xl:gap-20">
        <div className="min-w-0">
          <Reveal>
            <p className="label">Contact</p>
            <h2 className="mt-3 max-w-xl font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.95]">
              Let&rsquo;s build something that keeps working.
            </h2>
            <p className="mt-5 max-w-md leading-relaxed text-muted">
              Based in {profile.place}. Send a message here, or reach me directly.
            </p>
          </Reveal>

          <Reveal delay={100} className="mt-8 rounded-2xl border border-line bg-raised/40 p-5">
            <p className="label">Email</p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-2 block font-display text-xl leading-snug [overflow-wrap:anywhere] hover:text-accent xl:text-2xl"
            >
              {profile.email}
            </a>
            <div className="mt-4 flex flex-wrap gap-2">
              <CopyEmail />
              <a href={`mailto:${profile.email}`} className="chip">Open mail app ↗</a>
            </div>
          </Reveal>

          <Reveal delay={160} className="mt-8">
            <p className="label">Elsewhere</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="chip">
                    <BrandIcon id={s.id} className="h-3.5 w-3.5" />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={120} className="rounded-3xl border border-line bg-raised/40 p-5 sm:p-7">
          <ContactForm />
        </Reveal>
      </div>

      <footer className="mt-20 grid gap-5 border-t border-line pt-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="label py-2.5 hover:text-accent">{n.label}</a>
          ))}
        </nav>
        <a href="#work" className="chip justify-self-start sm:justify-self-end">Back to top ↑</a>
        <p className="label flex flex-wrap items-center gap-x-4 gap-y-1 sm:col-span-2">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <a href="https://sakarc.com.np" target="_blank" rel="noopener noreferrer" className="py-2 hover:text-accent">
            sakarc.com.np ↗
          </a>
        </p>
      </footer>
    </section>
  )
}

/**
 * Messages are emailed to him through FormSubmit (formsubmit.co) — no backend,
 * no account. The AJAX endpoint answers with JSON, so success and failure are
 * real, not guessed. One-time setup: the first message sent to a new address
 * triggers an "Activate form" email; until that link is clicked nothing is
 * forwarded. Without JS the plain form POST still reaches the same inbox.
 */
const MAIL_TO = `https://formsubmit.co/${profile.email}`
const MAIL_TO_AJAX = `https://formsubmit.co/ajax/${profile.email}`

function ContactForm() {
  const [state, setState] = useState('idle') // idle | sending | sent | error

  const onSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.reportValidity()) return
    const data = Object.fromEntries(new FormData(form))
    if (data._honey) return setState('sent') // a bot filled the hidden field — drop it quietly
    setState('sending')
    try {
      const res = await fetch(MAIL_TO_AJAX, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email, // FormSubmit sets this as Reply-To, so replying goes to the visitor
          message: data.message,
          _subject: `Portfolio: ${data._subject}`,
          _template: 'table',
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || String(json.success) !== 'true') throw new Error(json.message || res.statusText)
      form.reset()
      setState('sent')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div role="status" className="grid min-h-[22rem] place-content-center text-center">
        <span className="sent-check mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent text-bg">
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
            strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="mt-5 font-display text-2xl">Message sent</p>
        <p className="mt-2 text-muted">Thanks — I&rsquo;ll reply to the email you gave.</p>
        <button onClick={() => setState('idle')} className="chip mx-auto mt-6">Send another</button>
      </div>
    )
  }

  return (
    <form action={MAIL_TO} method="post" onSubmit={onSubmit} className="grid gap-4">
      <p className="font-display text-2xl leading-tight">Send a message</p>
      {/* Honeypot: invisible to people, irresistible to bots. */}
      <input type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Your name" autoComplete="name" required />
        <Field name="email" label="Your email" type="email" autoComplete="email" required />
      </div>
      <Field name="_subject" label="Subject" placeholder="A Flutter app, a backend, a question…" required />
      <label className="grid gap-1.5">
        <span className="label">Message</span>
        <textarea
          name="message"
          rows={6}
          required
          minLength={10}
          placeholder="What are you building?"
          className="field resize-y rounded-xl border border-line bg-bg px-3.5 py-3 text-fg placeholder:text-muted/60"
        />
      </label>
      {state === 'error' && (
        <p role="alert" className="text-sm leading-relaxed text-signal">
          Couldn&rsquo;t send — try again, or email me directly at{' '}
          <a href={`mailto:${profile.email}`} className="underline underline-offset-4">{profile.email}</a>.
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="group mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5
                   font-display text-lg text-bg transition-opacity hover:opacity-85 disabled:opacity-60 sm:justify-self-start"
      >
        {state === 'sending' ? 'Sending…' : 'Send message'}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </button>
    </form>
  )
}

function Field({ name, label, type = 'text', required, autoComplete, placeholder }) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="label">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="field w-full min-w-0 rounded-xl border border-line bg-bg px-3.5 py-3 text-fg placeholder:text-muted/60"
      />
    </label>
  )
}
