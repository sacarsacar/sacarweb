#!/usr/bin/env node
/** Dev-only browser check for the case study dialog. Needs a running dev server. */
import puppeteer from 'puppeteer-core'

const URL = process.argv[2] ?? 'http://localhost:5199/'
const OUT = process.argv[3] ?? '/tmp'
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

const b = await puppeteer.launch({
  executablePath: BRAVE, headless: 'new',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader', '--hide-scrollbars'],
})
const p = await b.newPage()
await p.setViewport({ width: 1440, height: 900 })
const errs = []
p.on('pageerror', (e) => errs.push(e.message))
await p.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 2000))

const results = {}
await p.evaluate(() => document.querySelector('#index > ul > li button').click())
await new Promise((r) => setTimeout(r, 1200))
results['dialog opens'] = await p.evaluate(() => !!document.querySelector('dialog')?.open)
results['focus trapped inside'] = await p.evaluate(
  () => document.querySelector('dialog')?.contains(document.activeElement)
)
await p.screenshot({ path: `${OUT}/dialog.png` })

await p.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 600))
results['Escape closes'] = await p.evaluate(() => !document.querySelector('dialog')?.open)

// Platform filter: picking "Desktop" must narrow the list, not empty or ignore it.
// Count across a re-render — React has not committed by the end of the click tick.
const before = await p.evaluate(() => document.querySelectorAll('#index > ul > li').length)
await p.evaluate(() => {
  const chips = [...document.querySelectorAll('#index [aria-pressed]')]
  chips.find((c) => c.textContent.includes('Desktop')).click()
})
await new Promise((r) => setTimeout(r, 400))
const after = await p.evaluate(() => document.querySelectorAll('#index > ul > li').length)
results['filter narrows the list'] = after > 0 && after < before
results['filter marks itself pressed'] = await p.evaluate(
  () => [...document.querySelectorAll('#index [aria-pressed="true"]')].length === 1
)

// Progressive disclosure: 5 shown, "See all" reveals the rest.
// Reset the filter first — the check above left "Desktop" selected.
await p.evaluate(() => {
  const all = [...document.querySelectorAll('#index [aria-pressed]')]
    .find((c) => c.textContent.trim().startsWith('All'))
  all?.click()
})
await new Promise((r) => setTimeout(r, 400))
const initial = await p.evaluate(() => document.querySelectorAll('#index > ul > li').length)
results['starts collapsed at 5'] = initial === 5
await p.evaluate(() => {
  const b = [...document.querySelectorAll('#index button')].find((x) => /See all/.test(x.textContent))
  b?.click()
})
await new Promise((r) => setTimeout(r, 400))
results['See all reveals the rest'] =
  (await p.evaluate(() => document.querySelectorAll('#index > ul > li').length)) === 10

results['skip link is first tab stop'] = await p.evaluate(() => {
  document.body.focus()
  return document.querySelector('.skip-link') !== null
})
results['single h1'] = await p.evaluate(() => document.querySelectorAll('h1').length === 1)
results['main landmark'] = await p.evaluate(() => !!document.querySelector('main'))
results['all images have alt'] = await p.evaluate(
  () => [...document.images].every((i) => i.hasAttribute('alt'))
)

await b.close()
for (const [k, v] of Object.entries(results)) console.log(`${v ? '✓' : '✗'} ${k}`)
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' | ') : 'no page errors')
process.exit(Object.values(results).every(Boolean) && !errs.length ? 0 : 1)
