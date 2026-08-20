#!/usr/bin/env node
/** Dev-only: drive Brave to screenshot the site. `node scripts/shoot.mjs [url] [outdir]` */
import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'

const URL = process.argv[2] ?? 'http://localhost:5199/'
const OUT = process.argv[3] ?? '/tmp/shots'
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
mkdirSync(OUT, { recursive: true })

const VIEWS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
]
const SCROLLS = [0, 0.10, 0.5, 0.97]

const browser = await puppeteer.launch({
  executablePath: BRAVE,
  headless: 'new',
  args: ['--no-sandbox', '--use-gl=angle', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})

const errors = []
for (const view of VIEWS) {
  for (const theme of ['dark', 'light']) {
    const page = await browser.newPage()
    await page.setViewport(view)
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${view.name}/${theme}] ${m.text()}`) })
    page.on('pageerror', (e) => errors.push(`[${view.name}/${theme}] PAGEERROR ${e.message}`))
    await page.evaluateOnNewDocument((t) => localStorage.setItem('theme', t), theme)
    await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
    await new Promise((r) => setTimeout(r, 2500)) // let textures land

    for (const s of SCROLLS) {
      await page.evaluate((frac) => {
        window.scrollTo(0, (document.body.scrollHeight - window.innerHeight) * frac)
      }, s)
      await new Promise((r) => setTimeout(r, 1400))
      await page.screenshot({ path: `${OUT}/${view.name}-${theme}-${Math.round(s * 100)}.png` })
    }
    await page.close()
  }
}

// Reduced motion + no-WebGL paths
for (const mode of ['reduced', 'nowebgl']) {
  const page = await browser.newPage()
  await page.setViewport(VIEWS[0])
  page.on('pageerror', (e) => errors.push(`[${mode}] PAGEERROR ${e.message}`))
  if (mode === 'reduced') await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  else await page.evaluateOnNewDocument(() => { HTMLCanvasElement.prototype.getContext = () => null })
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 })
  await new Promise((r) => setTimeout(r, 1500))
  await page.screenshot({ path: `${OUT}/${mode}.png` })
  const h = await page.evaluate(() => document.body.scrollHeight)
  console.log(`${mode}: page height ${h}px`)
  await page.close()
}

await browser.close()
console.log(errors.length ? '\nCONSOLE ERRORS:\n' + errors.join('\n') : '\nno console errors')
