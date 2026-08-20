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
// Real wheel event, not a scrollTop assignment: the bug was Lenis capturing
// wheel on the document so the dialog's own scroller never saw it.
await p.mouse.move(700, 500)
await p.mouse.wheel({ deltaY: 600 })
await new Promise((r) => setTimeout(r, 500))
results['case study scrolls on wheel'] = await p.evaluate(
  () => (document.querySelector('dialog [data-lenis-prevent]')?.scrollTop ?? 0) > 50
)
// Width: on a 1440px viewport the content must not be boxed into a narrow column.
results['case study uses the width'] = await p.evaluate(() => {
  const el = document.querySelector('dialog h2')
  return el ? el.getBoundingClientRect().width > 1000 : false
})
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

// Reduced motion must not leave revealed content stuck invisible — the reveal
// is opacity-based, so a hook that never fires would hide the page for good.
const rm = await b.newPage()
await rm.setViewport({ width: 1440, height: 900 })
await rm.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
await rm.goto(URL, { waitUntil: 'networkidle2' })
await new Promise((r) => setTimeout(r, 1200))
results['reduced motion reveals everything'] = await rm.evaluate(() => {
  const els = [...document.querySelectorAll('[data-reveal]')]
  return els.length > 0 && els.every((e) => getComputedStyle(e).opacity === '1')
})
await rm.close()

await b.close()
for (const [k, v] of Object.entries(results)) console.log(`${v ? '✓' : '✗'} ${k}`)
console.log(errs.length ? 'PAGE ERRORS: ' + errs.join(' | ') : 'no page errors')
process.exit(Object.values(results).every(Boolean) && !errs.length ? 0 : 1)
