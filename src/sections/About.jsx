import { useRef, useState } from 'react'
import { profile, projects, skills } from '../data'
import { Reveal } from '../Reveal'
import { Profiles } from './Profiles'

const shipped = projects.filter((p) => p.shipped).length

/** Photo plus the numbers that are actually countable. No invented scores. */
export function About() {
  return (
    <section
      id="about"
      className="relative z-10 border-t border-line bg-bg px-5 py-20 sm:px-6 md:px-10 md:py-28 lg:px-14"
    >
      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-14 lg:gap-20">
        <Reveal as="figure" className="mx-auto w-56 sm:w-64 md:mx-0 md:w-full">
          <Portrait />
        </Reveal>

        <Reveal delay={120}>
          <p className="label">About</p>
          <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.05]">
            {profile.thesis}
          </h2>

          <div className="mt-6 max-w-xl space-y-4 text-[0.95rem] leading-relaxed text-muted">
            <p>
              I&rsquo;m Sakar Chaulagain, a Flutter developer from {profile.place}. I build
              cross-platform apps that ship — an attendance platform live on the Play Store, a
              restaurant ordering system that runs with no cloud at all, an offline-first task
              manager, a dairy management suite spanning Windows and Android.
            </p>
            <p>
              Mostly Flutter on the front, with Node, Django, FastAPI or Go behind it. The
              through-line is reliability: the network is the first thing to fail, so it&rsquo;s the
              first thing I design around.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 lg:grid-cols-4">
            <Stat value={projects.length} label="Projects" />
            <Stat value={shipped} label="Shipped" />
            <Stat value={skills.length} label="Technologies" />
            <Stat value="1" label="On Play Store" />
          </dl>

          <Profiles />

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={profile.cv}
              className="label rounded-full border border-line px-4 py-2.5 hover:border-accent hover:text-accent"
            >
              Résumé
            </a>
            <a
              href="#contact"
              className="label rounded-full bg-accent px-4 py-2.5 text-bg hover:opacity-80"
            >
              Hire me
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Photo as a node on the mesh: arch mask, dot field, signal rings, cursor tilt. */
function Portrait() {
  const ref = useRef(null)
  const [tilt, setTilt] = useState(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    setTilt({ x, y })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setTilt(null)}
      className="relative [perspective:900px]"
    >
      {/* Dot field, echoing the rail's mesh. */}
      <div aria-hidden className="portrait-field pointer-events-none absolute -inset-6 md:-inset-8" />

      <div
        className="tilt relative"
        style={
          tilt
            ? { transform: `rotateX(${-tilt.y * 7}deg) rotateY(${tilt.x * 9}deg) translateZ(0)` }
            : undefined
        }
      >
        {/* Accent shadow-plate, offset so the portrait reads as lifted off the page. */}
        <div
          aria-hidden
          className="portrait absolute inset-0 translate-x-2 translate-y-2 border border-accent/35"
        />

        <img
          src="/me.webp"
          alt="Sakar Chaulagain"
          width="640"
          height="853"
          className="portrait relative aspect-[3/4] w-full border border-line bg-raised object-cover"
        />

        <span aria-hidden className="bracket absolute -left-2 -top-2 border-l border-t" />
        <span aria-hidden className="bracket absolute -right-2 -top-2 border-r border-t" />
        <span aria-hidden className="bracket absolute -bottom-2 -left-2 border-b border-l" />
        <span aria-hidden className="bracket absolute -bottom-2 -right-2 border-b border-r" />

        {/* Availability node — the rings are the same signal idea as the rail. */}
        <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2
                         rounded-full border border-line bg-bg px-3 py-1.5 md:left-auto md:right-2 md:translate-x-0">
          <span className="relative flex h-1.5 w-1.5">
            <span aria-hidden className="ping ping-1" />
            <span aria-hidden className="ping ping-2" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-live" />
          </span>
          <span className="label text-fg">Available</span>
        </span>
      </div>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="border-t border-line pt-3">
      <dd className="font-display text-3xl leading-none sm:text-4xl">{value}</dd>
      <dt className="label mt-1.5 leading-snug">{label}</dt>
    </div>
  )
}
