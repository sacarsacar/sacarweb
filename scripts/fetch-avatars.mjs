#!/usr/bin/env node
/**
 * Refresh the profile photos that are publicly fetchable without auth.
 *
 * Only GitHub qualifies. Instagram's Basic Display API was shut down and the
 * old ?__a=1 endpoint now returns an empty login wall; the Graph API needs a
 * Business account, app review, and a token refreshed every 60 days — none of
 * which a static site with no backend can hold. Facebook, X and LinkedIn are
 * paid or partner-gated. Those photos are curated by hand into public/photos/.
 *
 * Usage: node scripts/fetch-avatars.mjs
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'public/photos')
mkdirSync(out, { recursive: true })

const GITHUB_USER = 'sacarsacar'
const url = `https://github.com/${GITHUB_USER}.png?size=600`

const res = await fetch(url)
if (!res.ok) {
  console.error(`✗ GitHub avatar fetch failed: ${res.status}`)
  process.exit(1)
}
const tmp = join(out, '.github.jpg')
writeFileSync(tmp, Buffer.from(await res.arrayBuffer()))

try {
  execFileSync('cwebp', ['-quiet', '-q', '82', '-resize', '480', '0', tmp, '-o', join(out, 'github.webp')])
  console.log('✓ public/photos/github.webp updated')
} catch {
  console.error('✗ cwebp not found — install webp (brew install webp) or convert by hand')
  process.exit(1)
}
if (existsSync(tmp)) execFileSync('rm', [tmp])
