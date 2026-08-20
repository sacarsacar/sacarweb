import { profile, projects, skills } from '../data'

const shipped = projects.filter((p) => p.shipped).length

/** Photo plus the numbers that are actually countable. No invented scores. */
export function About() {
  return (
    <section
      id="about"
      className="relative z-10 border-t border-line bg-bg px-5 py-20 sm:px-6 md:px-10 md:py-28 lg:px-14"
    >
      <div className="grid items-start gap-10 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-14 lg:gap-20">
        <figure className="mx-auto w-48 sm:w-56 md:mx-0 md:w-full">
          <div className="relative">
            <img
              src="/me.webp"
              alt="Sakar Chaulagain"
              width="640"
              height="853"
              className="aspect-[3/4] w-full rounded-2xl border border-line bg-raised object-cover"
            />
            {/* Connection node, echoing the rail. */}
            <span
              aria-hidden
              className="absolute -bottom-2 -right-2 flex items-center gap-1.5 rounded-full
                         border border-line bg-bg px-2.5 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-live" />
              <span className="label text-fg">Available</span>
            </span>
          </div>
        </figure>

        <div>
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
        </div>
      </div>
    </section>
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
