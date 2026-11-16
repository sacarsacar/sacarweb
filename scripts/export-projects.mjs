#!/usr/bin/env node
/**
 * Builds portfolio-export/: every project, its screenshots and the profile, as a
 * self-contained kit another portfolio (or an AI assistant) can be fed from.
 * Mirrors src/data/index.js (which is Vite-only, so it can't be imported here).
 * Re-runnable: validates every source file first, then wipes and rewrites the folder.
 *   npm run export
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, rmSync, statSync, readdirSync } from 'node:fs'
import { join, dirname, basename, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'portfolio-export')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const rawProjects = read('src/data/projects.json')
const rawMini = read('src/data/mini-projects.json')
const shots = read('src/data/shots.json')
const experience = read('src/data/experience.json')
const skills = read('src/data/skills.json')
const socials = read('src/data/socials.json')

// --- mirrored from src/data/index.js -------------------------------------------
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
const folderOf = (image) => image?.split('/').filter(Boolean)[2] ?? null
const isHeading = (s) => s.length < 44 && !/[.!?:]$/.test(s.trim())
const PLATFORM_LABEL = { mobile: 'Mobile app', web: 'Web app', desktop: 'Desktop' }
const KIND_LABEL = { app: 'App', game: 'Game', package: 'Package' }
const profile = {
  name: 'Sakar Chaulagain',
  role: 'Flutter Developer',
  place: 'Kathmandu, Nepal',
  email: 'sakarchaulagain1@gmail.com',
  thesis: 'Apps that keep working when the network doesn’t.',
}
// --------------------------------------------------------------------------------

const copies = [] // [src, dest relative to OUT]
const noGraphics = []

/** Heading/paragraph runs → [{heading, paragraphs}]. Leading text gets heading null. */
const sectionsOf = (details = []) =>
  details.reduce((acc, t) => {
    if (isHeading(t)) acc.push({ heading: t, paragraphs: [] })
    else (acc.at(-1) ?? acc[acc.push({ heading: null, paragraphs: [] }) - 1]).paragraphs.push(t)
    return acc
  }, [])

const projects = rawProjects.map((p) => {
  const folder = folderOf(p.image)
  const cover = p.image ? basename(p.image).replace(/\.(png|jpe?g|webp)$/i, '') : null
  const names = folder ? [cover, ...(shots[folder] ?? []).filter((n) => n !== cover)] : []
  const images = names.map((n, i) => {
    const dest = `projects/${p.id}/${String(i + 1).padStart(2, '0')}-${n}.webp`
    copies.push([`public/shots/full/${folder}/${n}.webp`, dest])
    return dest
  })
  // The site links a browser screenshot for every live project (scripts/shoot-sites.mjs).
  const siteShot = p.live ? `projects/${p.id}/live-site.webp` : null
  if (siteShot) {
    copies.push([`public/sites/${p.id}.webp`, siteShot])
    images.push(siteShot)
  }
  if (!images.length) noGraphics.push(p.id)
  const org = experience.find((e) => e.projects?.includes(p.id))

  return {
    id: p.id,
    title: p.title,
    category: p.category,
    kind: p.kind ?? 'app',
    status: p.status,
    shipped: p.status === 'completed',
    featured: p.featured === true,
    context: p.context ?? 'personal',
    org: org?.company ?? null,
    platforms: p.platforms ?? [],
    stack: [...new Set([...(p.frontend ?? []), ...(p.backend ?? [])].map(label))],
    frontend: (p.frontend ?? []).map(label),
    backend: (p.backend ?? []).map(label),
    summary: p.summary,
    sections: sectionsOf(p.details),
    links: [
      p.live && { label: p.kind === 'game' ? 'Play in browser' : 'Open site', url: p.live },
      p.play && { label: 'Google Play', url: p.play },
      p.appStore && { label: 'App Store', url: p.appStore },
      p.pub && { label: 'pub.dev', url: p.pub },
      p.github && { label: 'Source code', url: p.github },
    ].filter(Boolean),
    cover: images[0] ?? null,
    siteShot,
    images,
  }
})
const ordered = [...projects.filter((p) => p.shipped), ...projects.filter((p) => !p.shipped)]

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const mini = rawMini.map((m) => {
  const image = `mini-projects/${slug(m.title)}${extname(m.image)}`
  copies.push([`public/legacy/mini-projects/assets/img/${basename(m.image)}`, image])
  return { title: m.title.replace(/_/g, ' '), category: m.category, url: m.url, image }
})

copies.push(['public/me.webp', 'profile/me.webp'], ['public/me-avatar.webp', 'profile/me-avatar.webp'], ['public/cv.pdf', 'profile/cv.pdf'])

// Fail before touching the previous export.
const missing = copies.filter(([src]) => !existsSync(join(root, src))).map(([src]) => src)
if (missing.length) {
  console.error(`export-projects: ${missing.length} referenced file(s) missing:\n  ${missing.join('\n  ')}`)
  process.exit(1)
}

const playCount = rawProjects.filter((p) => p.play).length
const count = (pl) => projects.filter((p) => p.platforms.includes(pl)).length
const technologies = [...new Set([...projects.flatMap((p) => p.stack), ...skills.map((s) => s.name)])]
  .map((name) => ({ name, projects: projects.filter((p) => p.stack.includes(name)).length }))
  .sort((a, b) => b.projects - a.projects)

const profileOut = {
  ...profile,
  photo: 'profile/me.webp',
  avatar: 'profile/me-avatar.webp',
  cv: 'profile/cv.pdf',
  // Copy of the About section in src/sections/About.jsx — update both together.
  about: [
    `I’m ${profile.name}, a Flutter developer from ${profile.place}. I build cross-platform apps that ship — ${playCount} on Google Play, from a system-wide audio equalizer to a physics game running Box2D natively and in the browser, plus Flutter packages on pub.dev.`,
    'Right now I’m the sole mobile engineer at Drop, a real-time social platform on the App Store and Google Play; before that I was a Flutter developer at NNine Solution. Mostly Flutter on the front, with Node, Django, FastAPI or Go behind it — and the network is the first thing I design around, because it’s the first thing to fail.',
  ],
  focus: [
    { title: 'Cross-platform apps', text: `One Flutter codebase across Android, iOS, web and desktop — ${count('mobile')} mobile, ${count('web')} web and ${count('desktop')} desktop projects so far.` },
    { title: 'Offline-first, real-time', text: 'Local storage that keeps working without a signal and syncs when it comes back; Socket.IO, WebSockets and WebRTC for the live parts.' },
    { title: 'Release pipelines', text: 'GitLab CI/CD and fastlane: every merge goes to TestFlight and Play testing, with one-click releases to both stores.' },
  ],
  stats: {
    projects: projects.length,
    shipped: projects.filter((p) => p.shipped).length,
    onGooglePlay: playCount,
    technologies: technologies.length,
  },
  experience: experience.map(({ address, ...e }) => ({
    ...e,
    stack: e.stack
      ? e.stack.map(label)
      : [...new Set((e.projects ?? []).flatMap((id) => projects.find((p) => p.id === id)?.stack ?? []))],
  })),
  skills: skills.map(({ name, tagline }) => ({ name, tagline })),
  technologies,
  socials: socials.map(({ id, label, handle, url }) => ({ id, label, handle, url })),
}

// --- projects.md -----------------------------------------------------------------
const md = [`# Projects — ${profile.name}`, '', `${projects.length} projects (${profileOut.stats.shipped} shipped), shipped first. Generated by \`npm run export\` from the sacarweb repo; projects.json holds the same data.`, '']
for (const p of ordered) {
  md.push(`## ${p.title}`, '')
  md.push(`**${p.category}** · ${KIND_LABEL[p.kind]} · ${p.shipped ? 'Shipped' : 'In progress'} · ${p.context === 'work' ? `Work${p.org ? ` (${p.org})` : ''}` : 'Personal'}${p.featured ? ' · Featured' : ''}  `)
  if (p.platforms.length) md.push(`Platforms: ${p.platforms.map((x) => PLATFORM_LABEL[x] ?? x).join(', ')}  `)
  if (p.stack.length) md.push(`Stack: ${p.stack.join(', ')}  `)
  if (p.links.length) md.push(`Links: ${p.links.map((l) => `[${l.label}](${l.url})`).join(' · ')}  `)
  md.push(`id: \`${p.id}\``, '', p.summary, '')
  for (const s of p.sections) {
    if (s.heading) md.push(`### ${s.heading}`, '')
    for (const t of s.paragraphs) md.push(t, '')
  }
  if (p.images.length) md.push(p.images.map((src) => `![${p.title} — ${basename(src, '.webp')}](${src})`).join('\n'), '')
}
md.push('## Early work (2022–2023)', '', 'Small web projects built while learning. Full list in mini-projects.json.', '')
for (const m of mini) md.push(`- [${m.title}](${m.url}) — ${m.category} · ![${m.title}](${m.image})`)
md.push('')

// --- write -------------------------------------------------------------------------
rmSync(OUT, { recursive: true, force: true })
for (const [src, dest] of copies) {
  mkdirSync(dirname(join(OUT, dest)), { recursive: true })
  copyFileSync(join(root, src), join(OUT, dest))
}
const json = (v) => JSON.stringify(v, null, 2) + '\n'
writeFileSync(join(OUT, 'projects.json'), json(ordered))
writeFileSync(join(OUT, 'mini-projects.json'), json(mini))
writeFileSync(join(OUT, 'profile.json'), json(profileOut))
writeFileSync(join(OUT, 'projects.md'), md.join('\n'))
writeFileSync(join(OUT, 'README.md'), readme())

const bytes = readdirSync(OUT, { recursive: true })
  .map((f) => statSync(join(OUT, f)))
  .filter((s) => s.isFile())
  .reduce((n, s) => n + s.size, 0)
console.log(`portfolio-export/: ${projects.length} projects, ${mini.length} mini projects, ${copies.length} files copied, ${(bytes / 1e6).toFixed(1)} MB total`)
if (noGraphics.length) console.log(`no graphics in source data (text only): ${noGraphics.join(', ')}`)

function readme() {
  return `# Portfolio project kit — ${profile.name}

Everything shown on ${profile.name}'s portfolio site (sacarweb), exported so it can be
used to update another portfolio. Generated by \`npm run export\` in the sacarweb repo —
do not edit by hand; edit the source data there and re-run.

## Files

| Path | What it is |
|---|---|
| \`projects.json\` | All ${projects.length} projects, normalized, in display order (shipped first, then in progress; authored order within each). |
| \`projects.md\` | The same content as readable markdown with image links. |
| \`projects/<id>/\` | That project's images. \`01-…\` is the cover, then the rest of the gallery in order; \`live-site.webp\` is a browser screenshot of the live site (live projects only). |
| \`mini-projects.json\`, \`mini-projects/\` | ${mini.length} small early web projects (2022–2023) with a screenshot each. |
| \`profile.json\` | Name, role, location, email, one-line thesis, About text, focus areas, counted stats, experience, skills, technologies, social links. |
| \`profile/\` | \`me.webp\` (portrait), \`me-avatar.webp\` (square avatar), \`cv.pdf\`. |

All paths inside the JSON files are relative to this folder. Images are WebP (mini projects: PNG).

## projects.json fields

- \`id\` — stable identifier (also the image folder name).
- \`title\`, \`category\` — name and a short descriptor ("Music player", "Flutter package").
- \`kind\` — \`app\` | \`game\` | \`package\` (a Flutter package on pub.dev).
- \`status\` — \`completed\` | \`in-progress\`; \`shipped\` is \`status === "completed"\`.
- \`featured\` — highlighted on the source site; a good default set to lead with.
- \`context\` — \`work\` (built at a job) | \`personal\`. \`org\` names the employer for work projects (from profile.json experience), else null.
- \`platforms\` — any of \`mobile\`, \`web\`, \`desktop\` (packages have none).
- \`stack\` — deduplicated technology names; \`frontend\` / \`backend\` keep the split.
- \`summary\` — one-paragraph description. Use it as the card text.
- \`sections\` — the long write-up: \`[{ heading, paragraphs[] }]\`. Headings were recovered by a heuristic
  (short line without ending punctuation), so a short bullet-like line can appear as a heading with no
  paragraphs, and \`heading\` is null for text before the first heading. Treat it as prose, not a strict outline.
- \`links\` — \`[{ label, url }]\`: live site / browser game, Google Play, App Store, pub.dev, source code.
- \`cover\` — the main image (also \`images[0]\`), or null. \`siteShot\` — the live-site screenshot, or null.
- \`images\` — every image for the project, cover first.

Projects without images (text only in the source data): ${noGraphics.join(', ') || 'none'}.

## How to use this to update another portfolio

1. Read projects.json (or projects.md) and profile.json.
2. Match projects to the other portfolio's entries by \`id\` or \`title\`; add missing ones, update text,
   stack, links and images of existing ones. Copy images from \`projects/<id>/\` into that site's assets.
3. Map fields to that site's schema; keep the wording of \`summary\` and \`sections\` (trim for length if needed,
   but do not add claims).
4. Preserve the order here unless that site has its own ordering rule.

## Rules from the owner (must follow)

- No availability phrasing: no "open to work", "hire me", "available for freelance" or similar.
- No self-assigned skill percentages, levels, bars or star ratings, and no unmeasurable metrics.
  Show evidence instead: shipped apps, store links, the per-technology project counts in \`technologies\`.
- Descriptions are factual. Do not embellish, invent metrics, users or outcomes, or upgrade the wording.
- NNine Solution is a prior employer (Nov 2024 — Feb 2026). Projects built there have \`context: "work"\` and
  should be presented as work done at NNine Solution, not as personal projects. Drop is the current employer.
- If a fact you need is not in this kit, leave it out or ask — don't guess.
`
}
