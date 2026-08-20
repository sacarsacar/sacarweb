import { socials } from '../data'

/**
 * Profile nodes wired into one strip — the same mesh idea as the device rail,
 * applied to where he exists online. Photos are local files (see
 * scripts/fetch-avatars.mjs for why none of this is a live API pull).
 */
export function Profiles() {
  return (
    <div className="mt-10">
      <p className="label">Find me</p>

      <ul className="relative mt-5 flex w-fit max-w-full flex-wrap items-start gap-x-5 gap-y-6 sm:gap-x-7">
        {/* The connecting hairline — profiles as a network, not a button row. */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-line sm:block"
        />

        {socials.map((s) => (
          <li key={s.id} className="relative">
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
                  <span aria-hidden className="font-display text-lg text-muted">
                    {s.label.charAt(0)}
                  </span>
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
    </div>
  )
}
