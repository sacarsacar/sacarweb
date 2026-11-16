#!/usr/bin/env node
/**
 * Renders the share image and app icons from the site's own design:
 *   public/og.jpg              1200×630 — LinkedIn, WhatsApp, X, Slack previews
 *   public/favicon.png         64×64   — fallback for browsers without SVG favicons
 *   public/apple-touch-icon.png 180×180 — iOS home screen
 * Counts come from src/data/projects.json, the ridgelines from src/Sky.jsx, so
 * re-run this after adding projects:  node scripts/brand-assets.mjs
 * Needs Brave (or CHROME=/path/to/chrome) and network for Google Fonts.
 */
import puppeteer from 'puppeteer-core'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const read = (p) => readFileSync(join(root, p))
const projects = JSON.parse(read('src/data/projects.json'))

const counts = {
  projects: projects.length,
  play: projects.filter((p) => p.play).length,
  live: projects.filter((p) => p.live).length,
}

// One source for the mountains: pull the path strings out of Sky.jsx.
const sky = read('src/Sky.jsx').toString()
const path = (name) => sky.match(new RegExp(`const ${name} =\\s*'([^']+)'`))[1]
const [FAR, SNOW, MID, NEAR] = ['FAR', 'SNOW', 'MID', 'NEAR'].map(path)

// Three app screens, inlined so the template needs no server.
const tex = (id) => {
  const p = projects.find((x) => x.id === id)
  const [, , , folder, file] = p.image.split('/')
  return `data:image/webp;base64,${read(`public/shots/tex/${folder}/${file.replace(/\.\w+$/, '.webp')}`).toString('base64')}`
}
const screens = ['global-equalizer', 'drop', 'gridverse'].map(tex)

const og = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Inter+Tight:wght@500&family=Martian+Mono:wght@500&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; overflow: hidden; background: #0D1214; color: #E8EDEA; font-family: 'Inter Tight'; position: relative; }
  .stars { position: absolute; inset: 0; background-image:
      radial-gradient(circle at 24px 38px, #E8EDEA 0 1px, transparent 1.6px),
      radial-gradient(circle at 142px 18px, #E8EDEA 0 .8px, transparent 1.4px),
      radial-gradient(circle at 210px 96px, #E8EDEA 0 1.2px, transparent 1.8px),
      radial-gradient(circle at 86px 150px, #E8EDEA 0 .8px, transparent 1.4px),
      radial-gradient(circle at 268px 170px, #E8EDEA 0 1px, transparent 1.6px);
    background-size: 300px 210px; opacity: .55; mask-image: linear-gradient(#000 30%, transparent 70%); }
  .moon { position: absolute; top: 58px; right: 92px; width: 70px; height: 70px; border-radius: 50%;
    box-shadow: inset -17px 7px 0 0 #E8EDEA, 0 0 70px 6px rgb(232 237 234 / .12); transform: rotate(-20deg); }
  svg.mtn { position: absolute; left: 0; bottom: 0; width: 1200px; height: 260px; }
  .copy { position: absolute; left: 76px; top: 70px; width: 640px; }
  .mark { display: flex; align-items: center; gap: 14px; font: 500 15px 'Martian Mono'; letter-spacing: .2em; color: #7E8B8C; }
  .eyes { display: flex; gap: 4px; }
  .eye { width: 26px; height: 29px; border-radius: 50%; background: #F4F7F6; display: grid; place-items: center; }
  .eye i { width: 11px; height: 11px; border-radius: 50%; background: #0D1214; transform: translate(2px, 2px); }
  h1 { margin-top: 34px; font: 800 92px/0.9 'Bricolage Grotesque'; letter-spacing: -.02em; }
  .role { margin-top: 18px; font-size: 30px; color: #9AA6A7; }
  .thesis { margin-top: 26px; font-size: 27px; color: #35D08A; }
  .stats { margin-top: 34px; display: flex; gap: 12px; }
  .stat { border: 1px solid #2A3538; border-radius: 16px; padding: 12px 18px; background: rgb(21 28 31 / .8); }
  .stat b { display: block; font: 800 34px/1 'Bricolage Grotesque'; }
  .stat span { display: block; margin-top: 6px; font: 500 12px 'Martian Mono'; letter-spacing: .16em; text-transform: uppercase; color: #7E8B8C; }
  .domain { position: absolute; left: 76px; bottom: 34px; font: 500 15px 'Martian Mono'; letter-spacing: .14em; color: #9AA6A7; }
  .phones { position: absolute; right: 70px; top: 120px; width: 420px; height: 470px; perspective: 1400px; }
  .phone { position: absolute; width: 190px; height: 400px; border-radius: 26px; overflow: hidden;
    border: 7px solid #171F22; background: #171F22; box-shadow: 0 40px 70px -30px rgb(0 0 0 / .9); }
  .phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; border-radius: 19px; }
  .p1 { left: 0; top: 50px; transform: rotateY(28deg) translateZ(-120px); opacity: .8; }
  .p3 { right: 0; top: 50px; transform: rotateY(-28deg) translateZ(-120px); opacity: .8; }
  .p2 { left: 115px; top: 0; transform: translateZ(40px); border-color: #22302F; box-shadow: 0 0 0 1px #35D08A55, 0 50px 80px -30px rgb(0 0 0 / .95); }
</style></head><body>
  <div class="stars"></div><div class="moon"></div>
  <svg class="mtn" viewBox="0 0 1440 320" preserveAspectRatio="xMidYMax slice">
    <path d="${FAR}" fill="#182326"/><path d="${SNOW}" fill="#5F7271"/>
    <path d="${MID}" fill="#141D20"/><path d="${NEAR}" fill="#10181A"/>
  </svg>
  <div class="phones">
    <div class="phone p1"><img src="${screens[0]}"></div>
    <div class="phone p3"><img src="${screens[2]}"></div>
    <div class="phone p2"><img src="${screens[1]}"></div>
  </div>
  <div class="copy">
    <div class="mark"><div class="eyes"><div class="eye"><i></i></div><div class="eye"><i></i></div></div>SC</div>
    <h1>Sakar<br>Chaulagain</h1>
    <p class="role">Flutter developer · Kathmandu, Nepal</p>
    <p class="thesis">Apps that keep working when the network doesn’t.</p>
    <div class="stats">
      <div class="stat"><b>${counts.projects}</b><span>Projects</span></div>
      <div class="stat"><b>${counts.play}</b><span>On Google Play</span></div>
      <div class="stat"><b>${counts.live}</b><span>Live websites</span></div>
    </div>
  </div>
  <div class="domain">sakarchaulagain.com.np</div>
</body></html>`

const icon = (size) => `<!doctype html><html><body style="margin:0;background:transparent">
  <img src="data:image/svg+xml;base64,${read('public/favicon.svg').toString('base64')}" width="${size}" height="${size}" style="display:block">
</body></html>`

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME ?? '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  headless: 'new',
})
const page = await browser.newPage()

await page.setViewport({ width: 1200, height: 630 })
await page.setContent(og, { waitUntil: 'networkidle0' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: join(root, 'public/og.jpg'), type: 'jpeg', quality: 86 })
console.log(`✓ public/og.jpg (${counts.projects} projects, ${counts.play} on Play, ${counts.live} live)`)

for (const [file, size] of [['favicon.png', 64], ['apple-touch-icon.png', 180]]) {
  await page.setViewport({ width: size, height: size })
  await page.setContent(icon(size))
  await page.screenshot({ path: join(root, 'public', file), omitBackground: true })
  console.log(`✓ public/${file}`)
}
await browser.close()
