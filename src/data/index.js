import rawProjects from './projects.json'
import rawMini from './mini-projects.json'
import rawSkills from './skills.json'
import shots from './shots.json'

/** Source data uses short keys; a few have no skills.json entry (and one is misspelled). */
const LABEL = {
  sqlite: 'SQLite', node: 'Node.js', postgres: 'PostgreSQL', hive: 'Hive',
  auth0: 'Auth0', go: 'Go', sockerio: 'Socket.io', js: 'JavaScript',
  ts: 'TypeScript', next: 'Next.js', tailwind: 'Tailwind', spline: 'Spline',
  mongo: 'MongoDB', vite: 'Vite', openai: 'OpenAI', css: 'CSS', html: 'HTML',
  flutter: 'Flutter', dart: 'Dart', react: 'React', python: 'Python',
  django: 'Django', docker: 'Docker', express: 'Express', fastapi: 'FastAPI',
  figma: 'Figma', firebase: 'Firebase',
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

export const PLATFORMS = [
  { id: 'mobile', label: 'Mobile app' },
  { id: 'web', label: 'Web app' },
  { id: 'desktop', label: 'Desktop' },
]

export const projects = rawProjects.map((p) => {
  const folder = folderOf(p.image)
  const gallery = folder ? (shots[folder] ?? []) : []
  const cover = folder && p.image
    ? p.image.split('/').pop().replace(/\.(png|jpe?g)$/i, '')
    : null

  return {
    ...p,
    folder,
    shipped: p.status === 'completed',
    platforms: p.platforms ?? [],
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

/** How many projects sit in each platform bucket — drives the filter counts. */
export const platformCounts = PLATFORMS.reduce((acc, { id }) => {
  acc[id] = projects.filter((p) => p.platforms.includes(id)).length
  return acc
}, {})

export const skills = rawSkills
export const miniProjects = rawMini

export const miniByCategory = miniProjects.reduce((acc, m) => {
  ;(acc[m.category] ??= []).push(m)
  return acc
}, {})

export const profile = {
  name: 'Sakar Chaulagain',
  role: 'Flutter Developer',
  place: 'Kathmandu, Nepal',
  email: 'sakarchaulagain1@gmail.com',
  thesis: 'Apps that keep working when the network doesn’t.',
  cv: '/cv.pdf',
  formAction:
    'https://script.google.com/macros/s/AKfycbyj8StS-F7MFYo9xdxvJ1VP0ryEWxSMwd-Nh9pbQXeJFXuM-a9hKoROcWaD8aRPb8nZ/exec',
  socials: {
    github: 'https://github.com/sacarsacar',
    linkedin: 'https://np.linkedin.com/in/sakar-chaulagain',
    x: 'https://x.com/SacarSakar',
    instagram: 'https://www.instagram.com/sakarchaulagain',
  },
}
