#!/usr/bin/env node
/**
 * Content parity check. The whole point of the rebuild is that nothing gets lost,
 * so this guards exactly that — and the two things that silently break the deploy.
 * No dependencies; runs in CI before upload.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'))

const fail = []
const check = (cond, msg) => { if (!cond) fail.push(msg) }

const projects = read('src/data/projects.json')
const shots = read('src/data/shots.json')
const experience = read('src/data/experience.json')
const socials = read('src/data/socials.json')
const mini = read('src/data/mini-projects.json')
const skills = read('src/data/skills.json')

check(projects.length === 30, `expected 30 projects, got ${projects.length}`)
check(mini.length === 15, `expected 15 mini projects, got ${mini.length}`)
check(skills.length === 30, `expected 30 skills, got ${skills.length}`)

for (const p of projects) {
  check(p.title, `project ${p.id}: missing title`)
  check(p.category, `project ${p.id}: missing category`)
  check(['completed', 'in-progress'].includes(p.status), `project ${p.id}: bad status "${p.status}"`)
  // Platform drives the index filter — an unclassified project is unreachable there.
  // Packages are the exception: they run wherever Flutter does, so carry none.
  check(['app', 'game', 'package'].includes(p.kind ?? 'app'), `project ${p.id}: unknown kind "${p.kind}"`)
  check(p.kind === 'package' || p.platforms?.length > 0, `project ${p.id}: no platforms set`)
  check(['work', 'personal'].includes(p.context), `project ${p.id}: context must be work or personal`)
  for (const pl of p.platforms ?? []) {
    check(['mobile', 'web', 'desktop'].includes(pl), `project ${p.id}: unknown platform "${pl}"`)
  }
  // Placeholders hold a slot until their README arrives — warned about below.
  if (!p.placeholder) {
    check(p.frontend?.length > 0, `project ${p.id}: no frontend stack`)
    check(p.summary || p.details?.length, `project ${p.id}: no written content`)
  }

  // The rail renders a phone per featured project — useTexture throws without one.
  check(!p.featured || p.image, `project ${p.id}: featured on the rail but has no image`)

  // Every project with an image must have a texture that actually exists on disk.
  if (p.image) {
    const webp = p.image.replace('/assets/projects-screenshots', '').replace(/\.(png|jpe?g|webp)$/i, '.webp')
    check(existsSync(join(root, 'public/shots/tex', webp)), `project ${p.id}: missing texture public/shots/tex${webp}`)
  }
}

const pending = projects.filter((p) => p.placeholder)
if (pending.length) {
  console.warn(
    `\n⚠  ${pending.length} project${pending.length === 1 ? ' is a' : 's are'} placeholder${pending.length === 1 ? '' : 's'} ` +
    `(${pending.map((p) => p.id).join(', ')}) showing "case study soon".\n` +
    `   Fill in src/data/projects.json from the README and drop "placeholder".\n`
  )
}

// Source data legitimately repeats a tech across frontend/backend (Sperium Lounge
// and Quick DO both run a Dart server), so src/data/index.js dedupes the combined
// stack. What's checked here is that every project still resolves screenshots.
for (const p of projects) {
  const folder = p.image?.split('/').filter(Boolean)[2]
  if (folder) check(shots[folder]?.length > 0, `project ${p.id}: no screenshots under shots.json["${folder}"]`)
}

// Live-sites showcase: every project with a live URL needs its desktop capture.
for (const p of projects.filter((x) => x.live)) {
  for (const f of [`${p.id}.webp`, `${p.id}-sm.webp`]) {
    check(existsSync(join(root, 'public/sites', f)), `project ${p.id}: missing public/sites/${f} — run scripts/shoot-sites.mjs ${p.id}`)
  }
}

const shotTotal = Object.values(shots).flat().length
check(shotTotal === 168, `expected 168 screenshots in manifest, got ${shotTotal}`)
for (const [folder, names] of Object.entries(shots)) {
  for (const n of names) {
    check(existsSync(join(root, `public/shots/tex/${folder}/${n}.webp`)), `missing texture ${folder}/${n}.webp`)
    check(existsSync(join(root, `public/shots/full/${folder}/${n}.webp`)), `missing full ${folder}/${n}.webp`)
  }
}

for (const m of mini) {
  check(/^https?:\/\//.test(m.url), `mini "${m.title}": bad url ${m.url}`)
  check(m.category !== 'others', `mini "${m.title}": the "others" category was removed`)
}

for (const e of experience) {
  // Placeholders may have gaps (they render "pending" and are warned about below).
  if (!e.placeholder) check(e.company && e.role && e.period, `experience "${e.id}": missing company, role or period`)
  for (const id of e.projects ?? []) check(projects.some((p) => p.id === id), `experience "${e.id}": unknown project "${id}"`)
}

// Three projects have no repo and no in-app branding, so client-vs-personal
// was inferred rather than established. Surface them instead of asserting.
const assumed = projects.filter((p) => p.contextAssumed)
if (assumed.length) {
  console.warn(
    `\n⚠  ${assumed.length} project${assumed.length === 1 ? '' : 's'} have an ASSUMED work/personal ` +
    `classification (${assumed.map((p) => p.id).join(', ')}).\n` +
    `   No repo or in-app branding confirmed it. Set "context" in src/data/projects.json\n` +
    `   and remove "contextAssumed" once verified.\n`
  )
}

for (const s of socials) {
  check(/^https?:\/\//.test(s.url), `social "${s.id}": bad url ${s.url}`)
  if (s.photo) check(existsSync(join(root, 'public', s.photo)), `social "${s.id}": missing photo public${s.photo}`)
}

const noPhoto = socials.filter((s) => !s.photo)
if (noPhoto.length) {
  console.warn(
    `\nℹ  ${noPhoto.length} profile${noPhoto.length === 1 ? '' : 's'} have no photo ` +
    `(${noPhoto.map((s) => s.id).join(', ')}) and fall back to an initial.\n` +
    `   Only GitHub exposes an avatar without auth. Drop images into public/photos/\n` +
    `   and set "photo" in src/data/socials.json to use real ones.\n`
  )
}

// Warn, don't fail: Sakar asked for sample data so the layout could be reviewed.
// Failing would block deploying the rest of the site.
const placeholders = experience.filter((e) => e.placeholder)
if (placeholders.length) {
  console.warn(
    `\n⚠  ${placeholders.length} placeholder experience entr${placeholders.length === 1 ? 'y is' : 'ies are'} ` +
    `still present (${placeholders.map((e) => e.id).join(', ')}).\n` +
    `   These render a visible notice on the page. Replace them in src/data/experience.json\n` +
    `   and drop the "placeholder" flag before this is treated as a real work history.\n`
  )
}

// The <noscript> app list in index.html is hand-copied for crawlers; keep it in
// step with projects.json (no removed apps, every featured shipped app present).
const noscript = readFileSync(join(root, 'index.html'), 'utf8').match(/<noscript>[\s\S]*?<\/noscript>/)?.[0] ?? ''
const listed = new Set(noscript.match(/https:\/\/play\.google\.com\/[^"]+/g) ?? [])
const plays = new Set(projects.map((p) => p.play).filter(Boolean))
for (const url of listed) check(plays.has(url), `index.html <noscript> lists ${url}, not in projects.json`)
for (const p of projects.filter((p) => p.featured && p.status === 'completed' && p.play)) {
  check(listed.has(p.play), `index.html <noscript> is missing featured app "${p.title}"`)
}

// Deploy-critical: losing either of these breaks the live site silently.
check(existsSync(join(root, 'public/CNAME')), 'public/CNAME missing — custom domain would break')
check(
  existsSync(join(root, 'public/legacy/mini-projects/index.html')),
  'public/legacy/mini-projects/index.html missing — the 22-project archive would 404'
)

if (fail.length) {
  console.error(`\n✗ content verification failed (${fail.length}):`)
  for (const f of fail) console.error('  -', f)
  process.exit(1)
}
console.log(
  `✓ content verified — ${projects.length} projects, ${mini.length} mini, ` +
  `${skills.length} skills, ${shotTotal} screenshots (×2 sizes), ${experience.length} roles`
)
