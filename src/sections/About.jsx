import { Fragment, useEffect, useId, useRef, useState } from 'react'
import { profile, projects, technologies, playCount, platformCounts, experience, mapUrl } from '../data'
import { Reveal } from '../Reveal'
import { motionOff } from '../useTheme'
import { Profiles } from './Profiles'
import { LiveSitesTile } from './LiveSites'
import { CopyEmail } from './Rest'

const shipped = projects.filter((p) => p.shipped).length
const current = experience.find((e) => /present/i.test(e.period ?? ''))
const calm = motionOff

/** Only numbers that can be counted — each one links to where the evidence is. */
const STATS = [
  { value: projects.length, label: 'Projects', href: '#index' },
  { value: shipped, label: 'Shipped', href: '#index' },
  { value: playCount, label: 'On Google Play', href: '#index' },
  { value: technologies.length, label: 'Technologies', href: '#stack' },
]

const CRAFT = [
  {
    icon: 'devices',
    title: 'Cross-platform apps',
    text: `One Flutter codebase across Android, iOS, web and desktop — ${platformCounts.mobile} mobile, ${platformCounts.web} web and ${platformCounts.desktop} desktop projects so far.`,
  },
  {
    icon: 'offline',
    title: 'Offline-first, real-time',
    text: 'Local storage that keeps working without a signal and syncs when it comes back; Socket.IO, WebSockets and WebRTC for the live parts.',
  },
  {
    icon: 'ship',
    title: 'Release pipelines',
    text: 'GitLab CI/CD and fastlane: every merge goes to TestFlight and Play testing, with one-click releases to both stores.',
  },
]

/** Who, where, what right now — then the evidence. */
export function About({ onOpenSites }) {
  return (
    <section
      id="about"
      className="wrap relative z-10 border-t border-line bg-bg py-20 md:py-28"
    >
      <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
        {/* Stays in view while the story scrolls past. */}
        <aside className="lg:sticky lg:top-24">
          <Reveal>
            <ProfileCard />
          </Reveal>
        </aside>

        <div className="min-w-0">
          <Reveal as="p" className="label">About</Reveal>
          <WordReveal
            text={profile.thesis}
            className="mt-3 max-w-2xl font-display text-[clamp(1.9rem,4.8vw,3.4rem)] leading-[1.02]"
          />

          <Reveal delay={220} className="mt-6 max-w-xl space-y-4 text-[0.98rem] leading-relaxed text-muted">
            <p>
              I&rsquo;m Sakar Chaulagain, a Flutter developer from {profile.place}. I build
              cross-platform apps that ship — {playCount} on Google Play, from a system-wide audio
              equalizer to a physics game running Box2D natively and in the browser, plus Flutter
              packages on pub.dev.
            </p>
            <p>
              Right now I&rsquo;m the sole mobile engineer at Drop, a real-time social platform on the
              App Store and Google Play; before that I was a Flutter developer at NNine Solution.
              Mostly Flutter on the front, with Node, Django, FastAPI or Go behind it — and the network
              is the first thing I design around, because it&rsquo;s the first thing to fail.
            </p>
          </Reveal>

          <ul className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal as="li" key={s.label} delay={i * 80}>
                <Stat {...s} delay={i * 120} />
              </Reveal>
            ))}
          </ul>

          <Reveal as="p" className="label mt-14">What I do</Reveal>
          <ul className="mt-4 grid gap-3 lg:grid-cols-3">
            {CRAFT.map((c, i) => (
              <Reveal as="li" key={c.title} delay={i * 110}>
                <div className="craft group h-full rounded-2xl border border-line bg-raised/40 p-5">
                  <CraftIcon name={c.icon} />
                  <h3 className="mt-4 font-display text-xl leading-tight">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{c.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>

          <Reveal className="@container">
            <LiveSitesTile onOpen={onOpenSites} />
          </Reveal>

          <Profiles />

          <Actions />
        </div>
      </div>
    </section>
  )
}

/** The headline arrives a word at a time — the section's one orchestrated moment. */
function WordReveal({ text, className }) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (calm()) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      setOn(true)
      io.disconnect()
    }, { rootMargin: '0px 0px -15% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <h2 ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      {text.split(' ').map((w, i) => (
        // The space sits outside the clipped word box, or it collapses away.
        <Fragment key={i}>
          <span aria-hidden className="word">
            <span data-on={on || undefined} style={{ transitionDelay: `${i * 60}ms` }}>{w}</span>
          </span>{' '}
        </Fragment>
      ))}
    </h2>
  )
}

/** Counts up from zero the first time it scrolls into view. */
function useCountUp(ref, target, delay) {
  const [n, setN] = useState(target)
  useEffect(() => {
    const el = ref.current
    if (!el || calm()) return
    setN(0)
    let frame = 0
    let timer = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      timer = setTimeout(() => {
        const t0 = performance.now()
        const tick = (t) => {
          const p = Math.min((t - t0) / 1100, 1)
          setN(Math.round(target * (1 - (1 - p) ** 3)))
          if (p < 1) frame = requestAnimationFrame(tick)
        }
        frame = requestAnimationFrame(tick)
      }, delay)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [ref, target, delay])
  return n
}

function Stat({ value, label, href, delay }) {
  const ref = useRef(null)
  const n = useCountUp(ref, value, delay)
  return (
    <a
      ref={ref}
      href={href}
      aria-label={`${value} ${label}`}
      className="stat group block h-full rounded-2xl border border-line bg-raised/40 p-4 transition-colors hover:border-accent"
    >
      <span className="block font-display text-4xl leading-none tabular-nums sm:text-5xl">{n}</span>
      <span className="label mt-2 flex items-center justify-between gap-2 leading-snug">
        {label}
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </span>
    </a>
  )
}

/** Kathmandu wall-clock time, so a visitor in another zone knows when they'd reach him. */
function useKathmanduTime() {
  const fmt = () =>
    Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kathmandu', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true,
      }).formatToParts(new Date()).map((p) => [p.type, p.value])
    )
  const [t, setT] = useState(fmt)
  useEffect(() => {
    // Only the profile card re-renders on each tick; nothing else reads this.
    const id = setInterval(() => setT(fmt()), 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function Actions() {
  return (
    <Reveal className="mt-10 flex flex-wrap gap-3">
      <a href="#contact" className="label rounded-full bg-accent px-5 py-3 text-bg hover:opacity-85">
        Get in touch
      </a>
      <a href={profile.cv} className="label rounded-full border border-line px-5 py-3 hover:border-accent hover:text-accent">
        Résumé
      </a>
      <CopyEmail className="label rounded-full border border-line px-5 py-3 hover:border-accent hover:text-accent" />
    </Reveal>
  )
}

/** Line icons for the "What I do" cards; each has a small hover motion in index.css. */
function CraftIcon({ name }) {
  const common = {
    viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6,
    strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
    className: `craft-icon craft-${name} h-8 w-8 text-accent`,
  }
  if (name === 'devices') {
    return (
      <svg {...common}>
        <rect x="2" y="5" width="13.5" height="10" rx="1.5" />
        <path d="M1 18.5h16" />
        <rect className="craft-phone" x="17" y="8.5" width="5.5" height="11" rx="1.2" />
      </svg>
    )
  }
  if (name === 'offline') {
    return (
      <svg {...common}>
        <path d="M4.5 10.5a11 11 0 0 1 15 0M7.5 13.5a6.5 6.5 0 0 1 9 0" />
        <path d="M12 17.5h.01" strokeWidth="2.4" />
        <path className="craft-slash" d="M4 4l16 16" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M4 14v4.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V14" />
      <g className="craft-arrow">
        <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8" />
      </g>
    </svg>
  )
}

/**
 * Profile card: a head-and-shoulders avatar in a ring with his title running
 * around it, then who he is, where, and what he's doing right now.
 */
function ProfileCard() {
  const t = useKathmanduTime()
  const ring = useId()
  const ref = useRef(null)
  const [tilt, setTilt] = useState(null)
  const onMove = (e) => {
    const el = ref.current
    if (!el || calm()) return
    const r = el.getBoundingClientRect()
    setTilt({ x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 })
  }

  return (
    <div className="mx-auto max-w-sm rounded-3xl border border-line bg-raised/40 p-5 sm:p-6">
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={() => setTilt(null)}
        className="avatar relative mx-auto h-44 w-44"
      >
        <div
          className="h-full w-full transition-transform duration-500"
          style={tilt ? { transform: `rotateX(${-tilt.y * 14}deg) rotateY(${tilt.x * 14}deg)` } : undefined}
        >
          <svg aria-hidden viewBox="0 0 200 200" className="avatar-ring absolute inset-0 h-full w-full">
            <defs>
              <path id={ring} d="M100 100m-89 0a89 89 0 1 1 178 0a89 89 0 1 1-178 0" />
            </defs>
            <text>
              <textPath href={`#${ring}`} textLength="555" lengthAdjust="spacing">
                Sakar Chaulagain • Flutter developer • Kathmandu, Nepal •
              </textPath>
            </text>
          </svg>
          <div className="avatar-photo absolute inset-[15%] rounded-full">
            <img
              src="/me-avatar.webp"
              alt="Sakar Chaulagain"
              width="260"
              height="260"
              loading="lazy"
              className="h-full w-full rounded-full bg-raised object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="font-display text-2xl leading-tight">{profile.name}</p>
        <p className="mt-1 text-sm text-muted">{profile.role} · {profile.place}</p>
      </div>

      {current && (
        <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm">
          <div>
            <dt className="label">Right now</dt>
            <dd className="mt-1 leading-snug">
              {current.role.split(',')[0]} at{' '}
              {current.website ? (
                <a href={current.website} target="_blank" rel="noopener noreferrer"
                  className="underline decoration-line underline-offset-4 hover:text-accent">
                  {current.company}
                </a>
              ) : current.company}
            </dd>
          </div>
          {current.location && (
            <div>
              <dt className="label">Office</dt>
              <dd className="mt-1">
                <a
                  href={mapUrl(current.address ?? current.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={current.address ?? current.location}
                  className="underline decoration-line underline-offset-4 hover:text-accent"
                >
                  {current.location} ↗
                </a>
              </dd>
            </div>
          )}
          <div>
            <dt className="label">Local time · Kathmandu</dt>
            <dd className="mt-1 whitespace-nowrap font-display text-3xl tabular-nums leading-none">
              {t.hour}:{t.minute}:
              {/* Keyed so each new second slides in. */}
              <span key={t.second} className="clock-tick inline-block">{t.second}</span>
              <span className="ml-1.5 text-base text-muted">{t.dayPeriod}</span>
            </dd>
          </div>
        </dl>
      )}
    </div>
  )
}
