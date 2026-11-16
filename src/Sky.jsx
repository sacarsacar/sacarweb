import { useId } from 'react'

/* Himalaya-style ridgelines, three depths. Far range is tall and snow-capped,
   the near one is foothills. 1440×320, anchored bottom (slice). */
const FAR =
  'M0 320V210l60-30 50 16 60-56 45 28 45-48 40 30 50-54 45 40 45-18 60 42 60-50 50-40 45 42 45-14 60 52 60-30 50 16 60-52 45 36 55-12 60 42 60-38 50 16 60-38 50 36 60 14 70-20v200z'
const SNOW =
  'M590 88l20-18 22 20-12-4-9 8-10-9zM336 108l14-12 16 16-10-4-7 6zM914 98l16-14 18 16-11-4-8 7zM1246 102l14-12 16 14-10-4-7 6zM155 154l15-14 15 14-9-3-6 5z'
const MID =
  'M0 320v-80l80-26 70 22 80-44 70 30 80-22 70 32 70-36 80 30 90-40 70 34 80-16 80 32 80-38 80 30 80-22 80 32 80-28 120 20v90z'
const NEAR =
  'M0 320v-44c120-26 220-14 320 2s200-16 320-20 220 32 340 26 220-32 340-22c60 5 100 12 120 16v42z'

const BIRDS = [
  // Two loose flocks crossing at different heights and speeds.
  { y: '20%', s: 1, dur: 36, delay: -4, flap: 0.42 },
  { y: '23%', s: 0.8, dur: 36, delay: -5.3, flap: 0.37 },
  { y: '17%', s: 0.7, dur: 36, delay: -6.1, flap: 0.46 },
  { y: '33%', s: 0.85, dur: 48, delay: -24, flap: 0.4 },
  { y: '30%', s: 0.62, dur: 48, delay: -25.4, flap: 0.35 },
]

/**
 * The scenery: sun by day, moon and stars by night, mountains, birds.
 * `band` = a strip inside a dialog; otherwise fixed behind the 3D canvas.
 * Pure CSS motion (compositor-only transforms), paused when off-screen.
 * `--p` (0–1, set by the caller) slides the mountain layers at different
 * speeds — parallax as the project rail scrolls.
 */
export function Sky({ band = false, paused = false, style }) {
  // A strip is too short to crop-fit without losing the peaks — stretch it into a panorama instead.
  const fit = band ? 'none' : 'xMidYMax slice'
  return (
    <div
      aria-hidden
      className={band ? 'sky sky-band' : 'sky'}
      data-paused={paused || undefined}
      style={style}
    >
      <span className="sky-stars" />
      <span className="sun" />
      <span className="moon" />
      {BIRDS.slice(0, band ? 3 : 5).map((b, i) => (
        <span
          key={i}
          className="bird"
          style={{ '--y': b.y, '--s': b.s, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }}
        >
          <span className="bird-bob" style={{ animationDelay: `${-i * 0.7}s` }}>
            <svg viewBox="0 0 24 10" style={{ animationDuration: `${b.flap}s` }}>
              <path d="M1 7Q6.5 0 12 6.5 17.5 0 23 7" />
            </svg>
          </span>
        </span>
      ))}
      <span className="mountains">
        <svg className="mtn mtn-far" viewBox="0 0 1440 320" preserveAspectRatio={fit}>
          <path d={FAR} />
          <path className="snow" d={SNOW} />
        </svg>
        <svg className="mtn mtn-mid" viewBox="0 0 1440 320" preserveAspectRatio={fit}>
          <path d={MID} />
        </svg>
        <svg className="mtn mtn-near" viewBox="0 0 1440 320" preserveAspectRatio={fit}>
          <path d={NEAR} />
        </svg>
      </span>
    </div>
  )
}

/** Sun in light mode, moon and stars in dark. The bulb effect itself is in useTheme. */
export function ThemeSwitch({ isDark, onToggle, className = '' }) {
  const mask = useId() // one per instance — the switch appears in the header and in dialogs
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={`theme-switch grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line
                  hover:border-accent ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <mask id={mask}>
          <rect width="24" height="24" fill="#fff" />
          <circle className="ts-bite" cx="18" cy="6" r="6" fill="#000" />
        </mask>
        <circle className="ts-core" cx="12" cy="12" r="4.6" fill="currentColor" mask={`url(#${mask})`} />
        <g className="ts-rays" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="1.4" x2="12" y2="4.4" transform={`rotate(${a} 12 12)`} />
          ))}
        </g>
        <path className="ts-star" fill="currentColor" d="M19.5 2.5l.55 1.45 1.45.55-1.45.55-.55 1.45-.55-1.45-1.45-.55 1.45-.55z" />
        <path className="ts-star" fill="currentColor" d="M21.5 9.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z" />
      </svg>
    </button>
  )
}

/** Animations on/off — sparkles, crossed out when off. Covers the 3D rail, cursor ring, eyes, scenery and reveals. */
export function MotionSwitch({ reduced, onToggle, className = '' }) {
  const label = reduced ? 'Turn animations on' : 'Turn animations off'
  return (
    <button
      onClick={onToggle}
      aria-pressed={!reduced}
      aria-label={label}
      title={label}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-fg hover:border-accent hover:text-accent ${className}`}
    >
      <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
        <path d="M11 3.5l1.6 4.6 4.6 1.6-4.6 1.6L11 15.9l-1.6-4.6-4.6-1.6 4.6-1.6z" />
        <path d="M18 14.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
        {reduced && <path d="M3.5 3.5l17 17" strokeWidth="1.9" />}
      </svg>
    </button>
  )
}

