#!/usr/bin/env node
/**
 * Desktop screenshots of every project with a `live` URL, for the live-sites
 * showcase. Writes public/sites/<id>.webp (1280w) and <id>-sm.webp (480w).
 * Needs Brave (or set CHROME=/path/to/chrome) and cwebp (brew install webp).
 *
 * Usage: node scripts/shoot-sites.mjs [id ...]   — no ids = all live projects
 */
import puppeteer from 'puppeteer-core'
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const out = join(root, 'public/sites')
mkdirSync(out, { recursive: true })

const only = process.argv.slice(2)
const sites = JSON.parse(readFileSync(join(root, 'src/data/projects.json'), 'utf8'))
  .filter((p) => p.live && (!only.length || only.includes(p.id)))

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  headless: 'new',
  args: ['--hide-scrollbars'],
})

let failed = 0
for (const { id, live } of sites) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 900 })
  const png = join(out, `.${id}.png`)
  try {
    await page.goto(live, { waitUntil: 'networkidle2', timeout: 60000 })
    await new Promise((r) => setTimeout(r, 6000)) // Flutter web boots after networkidle
    await page.screenshot({ path: png })
    execFileSync('cwebp', ['-quiet', '-q', '74', '-m', '6', '-resize', '1280', '0', png, '-o', join(out, `${id}.webp`)])
    execFileSync('cwebp', ['-quiet', '-q', '70', '-m', '6', '-resize', '480', '0', png, '-o', join(out, `${id}-sm.webp`)])
    console.log(`✓ ${id}`)
  } catch (e) {
    failed++
    console.error(`✗ ${id}: ${e.message}`)
  }
  rmSync(png, { force: true })
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
