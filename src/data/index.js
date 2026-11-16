import rawProjects from './projects.json'
import rawMini from './mini-projects.json'
import rawSkills from './skills.json'
import shots from './shots.json'
import rawExperience from './experience.json'
import rawSocials from './socials.json'
import { HEX } from './icons'

/** Source data uses short keys; a few have no skills.json entry (and one is misspelled). */
const LABEL = {
  sqlite: 'SQLite', node: 'Node.js', postgres: 'PostgreSQL', hive: 'Hive',
  auth0: 'Auth0', go: 'Go', sockerio: 'Socket.io', js: 'JavaScript',
  ts: 'TypeScript', next: 'Next.js', tailwind: 'Tailwind CSS', spline: 'Spline',
  mongo: 'MongoDB', vite: 'Vite', openai: 'OpenAI', css: 'CSS', html: 'HTML',
  flutter: 'Flutter', dart: 'Dart', react: 'React', python: 'Python',
  django: 'Django', docker: 'Docker', express: 'Express', fastapi: 'FastAPI',
  figma: 'Figma', firebase: 'Firebase',
  bloc: 'BLoC', provider: 'Provider', justaudio: 'just_audio', kotlin: 'Kotlin',
  isar: 'Isar', ffmpeg: 'FFmpeg', flame: 'Flame', forge2d: 'Forge2D (Box2D)',
  openrouter: 'OpenRouter', cloudflare: 'Cloudflare', compose: 'Jetpack Compose',
  indexeddb: 'IndexedDB', onesignal: 'OneSignal', drift: 'Drift',
  swift: 'Swift', webrtc: 'WebRTC', s3: 'AWS S3', fastlane: 'fastlane',
  gitlab: 'GitLab CI', riverpod: 'Riverpod',
}
const label = (k) => LABEL[k] ?? k.charAt(0).toUpperCase() + k.slice(1)

/** "/assets/projects-screenshots/x/y.png" -> folder "x". */
const folderOf = (image) => image?.split('/').filter(Boolean)[2] ?? null

const tex = (folder, name) => `/shots/tex/${folder}/${name}.webp`
const full = (folder, name) => `/shots/full/${folder}/${name}.webp`

/**
 * details[] interleaves headings and paragraphs — headings came from separate
 * JSX elements in the source bundle and lost their tagging on extraction.
 * ponytail: heuristic split (short, no terminal punctuation = heading).
 * Retag by hand only if a real heading starts getting rendered as body text.
 */
const isHeading = (s) => s.length < 44 && !/[.!?:]$/.test(s.trim())

/** "Work" = built at a job (Nnine Solution, and the current office projects). */
export const CONTEXTS = [
  { id: 'work', label: 'Work' },
  { id: 'personal', label: 'Personal' },
]

export const PLATFORMS = [
  { id: 'mobile', label: 'Mobile app' },
  { id: 'web', label: 'Web app' },
  { id: 'desktop', label: 'Desktop' },
]

/** What the thing is — the primary filter. Projects without `kind` are apps. */
export const KINDS = [
  { id: 'app', label: 'Apps' },
  { id: 'game', label: 'Games' },
  { id: 'package', label: 'Packages' },
]

/** Search link, not an embed: no API key, and it opens the visitor's own Maps app. */
export const mapUrl = (place) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`

/** The employer a work project was built at, from experience.json — one source of truth. */
const orgOf = (id) => rawExperience.find((e) => e.projects?.includes(id)) ?? null

export const projects = rawProjects.map((p) => {
  const folder = folderOf(p.image)
  const gallery = folder ? (shots[folder] ?? []) : []
  const cover = folder && p.image
    ? p.image.split('/').pop().replace(/\.(png|jpe?g|webp)$/i, '')
    : null

  return {
    ...p,
    folder,
    shipped: p.status === 'completed',
    kind: p.kind ?? 'app',
    org: orgOf(p.id),
    links: [
      p.live && { label: p.kind === 'game' ? 'Play in browser' : 'Open site', href: p.live },
      p.play && { label: 'Google Play', href: p.play },
      p.appStore && { label: 'App Store', href: p.appStore },
      p.pub && { label: 'pub.dev', href: p.pub },
      p.github && { label: 'Source code', href: p.github },
    ].filter(Boolean),
    platforms: p.platforms ?? [],
    context: p.context ?? 'personal',
    contextLabel: CONTEXTS.find((c) => c.id === p.context)?.label ?? 'Personal',
    platformLabels: (p.platforms ?? []).map(
      (id) => PLATFORMS.find((x) => x.id === id)?.label ?? id
    ),
    // Dart (and others) can appear on both sides — Sperium Lounge and Quick DO
    // use a Dart server. Dedupe here so no consumer has to.
    stack: [...new Set([...(p.frontend ?? []), ...(p.backend ?? [])].map(label))],
    frontendLabels: (p.frontend ?? []).map(label),
    backendLabels: (p.backend ?? []).map(label),
    texture: folder && cover ? tex(folder, cover) : null,
    gallery: gallery.map((n) => ({ tex: tex(folder, n), full: full(folder, n), name: n })),
    body: (p.details ?? []).map((t) => ({ heading: isHeading(t), text: t })),
  }
})

/** Shipped work leads. Within each group, keep the authored order. */
export const orderedProjects = [
  ...projects.filter((p) => p.shipped),
  ...projects.filter((p) => !p.shipped),
]

/**
 * The 3D rail gives each project a full screen of scroll, so it carries a
 * curated set (`featured` in projects.json); the index lists everything.
 * Featured projects must have a texture — verify-content enforces it.
 */
export const railProjects = orderedProjects.filter((p) => p.featured && p.texture)

/** Everything you can open in a browser right now. Screenshots: scripts/shoot-sites.mjs. */
export const liveSites = orderedProjects
  .filter((p) => p.live)
  .map((p) => ({
    ...p,
    host: new URL(p.live).host,
    shot: `/sites/${p.id}.webp`,
    thumb: `/sites/${p.id}-sm.webp`,
  }))

export const playCount = projects.filter((p) => p.play).length

export const kindCounts = KINDS.reduce((acc, { id }) => {
  acc[id] = projects.filter((p) => p.kind === id).length
  return acc
}, {})

/** How many projects sit in each platform bucket — drives the filter counts. */
export const platformCounts = PLATFORMS.reduce((acc, { id }) => {
  acc[id] = projects.filter((p) => p.platforms.includes(id)).length
  return acc
}, {})

/**
 * Work history. Entries flagged `placeholder: true` are sample data — the
 * section renders a visible notice and CI warns until they're replaced.
 * Fabricated employment history must never ship silently.
 */
export const experience = rawExperience.map((e) => ({
  ...e,
  // Evidence over claims: without an explicit stack, show what the linked projects used.
  stackLabels: e.stack
    ? e.stack.map(label)
    : [...new Set((e.projects ?? []).flatMap((id) => projects.find((p) => p.id === id)?.stack ?? []))],
  // Enriched projects, not raw JSON — CaseStudy needs links, body and labels.
  linkedProjects: (e.projects ?? [])
    .map((id) => projects.find((p) => p.id === id))
    .filter(Boolean),
}))

export const hasPlaceholderExperience = experience.some((e) => e.placeholder)

export const contextCounts = CONTEXTS.reduce((acc, { id }) => {
  acc[id] = projects.filter((p) => p.context === id).length
  return acc
}, {})

/**
 * Profile nodes. `photo` is a file in public/photos/, not a live API pull:
 * Instagram's Basic Display API is gone and the Graph API needs a Business
 * account plus a token refreshed every 60 days, which a static site can't hold.
 * Only GitHub exposes an avatar publicly — see scripts/fetch-avatars.mjs.
 */
export const socials = rawSocials
export const socialsMissingPhotos = socials.filter((s) => !s.photo).map((s) => s.id)

export const skills = rawSkills

/** Icon slug per technology label (src/data/icons.js). Unlisted → monogram. */
const TECH_ICON = {
  Flutter: 'flutter', Dart: 'dart', BLoC: 'bloc', Hive: 'hive', 'Node.js': 'nodedotjs',
  PostgreSQL: 'postgresql', TypeScript: 'typescript', Kotlin: 'kotlin', SQLite: 'sqlite',
  Express: 'express', Vite: 'vite', 'Socket.io': 'socketdotio', Docker: 'docker',
  Python: 'python', Django: 'django', Figma: 'figma', Firebase: 'firebase',
  'Tailwind CSS': 'tailwindcss', HTML: 'html5', CSS: 'css3', JavaScript: 'javascript',
  Swift: 'swift', WebRTC: 'webrtc', FFmpeg: 'ffmpeg', Cloudflare: 'cloudflare',
  'Jetpack Compose': 'jetpackcompose', React: 'react', 'Next.js': 'nextdotjs', Auth0: 'auth0',
  Go: 'go', MongoDB: 'mongodb', FastAPI: 'fastapi', OpenAI: 'openai', Git: 'git',
  GitHub: 'github', 'GitLab CI/CD': 'gitlab', fastlane: 'fastlane', AWS: 'aws',
  macOS: 'macos', Xcode: 'xcode', 'Android Studio': 'androidstudio',
  'VS Code': 'visualstudiocode', Vercel: 'vercel', Terminal: 'terminal',
  'GitLab CI': 'gitlab', 'AWS S3': 'amazons3',
}

/** Icon slug for any technology label (null → the UI draws a monogram). */
export const techIcon = (name) => TECH_ICON[name] ?? null

const luminance = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Everything in the stack: what the projects were actually built with, plus the
 * curated skills.json tools. `projects` is a real count — the evidence.
 * Brand colour shows on hover only where it reads on that theme's ground.
 */
export const technologies = (() => {
  const curated = new Map(rawSkills.map((s) => [s.name, s]))
  const names = [...new Set([...projects.flatMap((p) => p.stack), ...curated.keys()])]
  return names
    .map((name) => {
      const icon = TECH_ICON[name] ?? null
      const hex = icon && HEX[icon]
      return {
        name,
        icon,
        tagline: curated.get(name)?.tagline ?? null,
        projects: projects.filter((p) => p.stack.includes(name)).length,
        colorDark: hex && luminance(hex) > 0.1 ? `#${hex}` : null,
        colorLight: hex && luminance(hex) < 0.3 ? `#${hex}` : null,
      }
    })
    .sort((a, b) => b.projects - a.projects)
})()
export const miniProjects = rawMini

export const miniByCategory = miniProjects.reduce((acc, m) => {
  ;(acc[m.category] ??= []).push(m)
  return acc
}, {})

/** Page sections, in order — the header, the phone menu and the footer all read this. */
export const NAV = [
  { href: '#index', label: 'Work' },
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#stack', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
]

export const profile = {
  name: 'Sakar Chaulagain',
  role: 'Flutter Developer',
  place: 'Kathmandu, Nepal',
  email: 'sakarchaulagain1@gmail.com',
  thesis: 'Apps that keep working when the network doesn’t.',
  cv: '/cv.pdf',
}
