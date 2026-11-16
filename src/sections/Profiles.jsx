import { socials } from '../data'
import { ICONS } from '../data/icons'
import { Reveal } from '../Reveal'

/** The platform's own mark — stands in wherever there's no profile photo. */
export function BrandIcon({ id, className = '' }) {
  const d = ICONS[id]
  if (!d) return null
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={d} />
    </svg>
  )
}

/**
 * Profile nodes wired into one strip — the same mesh idea as the device rail,
 * applied to where he exists online. Photos are local files (see
 * scripts/fetch-avatars.mjs for why none of this is a live API pull).
 */
export function Profiles() {
  return (
    <Reveal className="profiles mt-12">
      <p className="label">Find me</p>

      <ul className="relative mt-5 flex w-fit max-w-full flex-wrap items-start gap-x-5 gap-y-6 sm:gap-x-7">
        {/* The connecting hairline — profiles as a network, not a button row. */}
        <span
          aria-hidden
          className="profiles-line pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-line sm:block"
        />

        {socials.map((s, i) => (
          <li key={s.id} className="profile-node relative" style={{ '--i': i }}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-16 flex-col items-center gap-2 text-center sm:w-[4.5rem]"
            >
              <span
                className="relative grid h-14 w-14 place-items-center overflow-hidden rounded-full
                           border border-line bg-bg transition-[transform,border-color] duration-400
                           group-hover:-translate-y-1 group-hover:border-accent"
              >
                {s.photo ? (
                  <img
                    src={s.photo}
                    alt=""
                    width="480"
                    height="480"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500
                               group-hover:scale-110"
                  />
                ) : (
                  <BrandIcon
                    id={s.id}
                    className="h-6 w-6 text-fg transition-[transform,color] duration-500
                               group-hover:scale-110 group-hover:text-accent"
                  />
                )}
              </span>

              <span className="label leading-tight transition-colors group-hover:text-accent">
                {s.label}
              </span>
              <span className="sr-only">— {s.handle}</span>
            </a>
          </li>
        ))}
      </ul>
    </Reveal>
  )
}
