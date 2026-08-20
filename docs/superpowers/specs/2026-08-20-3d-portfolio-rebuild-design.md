# 3D Portfolio Rebuild — Design

**Date:** 2026-08-20 · **Revision 2**
**Repo:** `sacarsacar/sacarweb` → https://sakarchaulagain.com.np (GitHub Pages)
**Status:** Direction approved. Pending implementation plan.

> **Revision 2 supersedes revision 1** on two decisions, following explicit user choices:
> D1 no-build → **Vite + React Three Fiber**; D2 particle hero → **3D device showcase**.
> Education timeline is now **dropped** ("qualification and the skills percentage is not required
> .. cause they can't be measured"). **Dark and light mode are both required.** No backend of any
> kind. All research, extracted data, and the perf/a11y budget from revision 1 carry forward.

---

## 1. Positioning

Two sites, two jobs. Settled:

| Site | Role |
|---|---|
| **sakarc.com.np** (Next.js) | Clean, professional, recruiter-facing. Left alone. |
| **sakarchaulagain.com.np** (this repo) | **Experimental 3D showcase.** Same projects, maximal treatment. |

This site is allowed to be heavy and opinionated. It isn't the safe one — that already exists.

### The contradiction being fixed

The current site presents Sakar as a *student / gamer* with five project cards — two exact
duplicates, and two that say *"Frankly, I don't have any specific project for this"* and *"I don't
have any project using python."*

The other site presents him as a **Flutter developer with 10 apps, one shipped to the Play Store.**
That one is true. This rebuild adopts it wholesale; the old framing is deleted, not merged.

**Dropped deliberately**

- Typed loop `Student / Programmer / Web Developer / Web Designer / Gamer`
- **Qualification / education timeline** — user decision
- **Skill percentage bars** (HTML 90%, CSS 80%, Python 50%, "Other Languages 10%") and the
  "Professional Skills" donuts (Team Work 90%, Creativity 80%…) — user decision: self-assigned
  numbers with nothing behind them
- The five placeholder project cards
- Dead files: `projects.html`, `script.js`, `style.css`, `styless.css` (2 bytes each),
  `.DS_Store`, `assets/CNAME` (duplicate)

**Carried over**

- The **22 mini-projects archive** — all live on Netlify
- The **Google Apps Script contact endpoint** — works, needs no backend
- `assets/CV.pdf`, `assets/sakar.jpg`, socials, address

---

## 2. Concept — 3D device showcase

The hero is not decorative geometry. It is **the actual apps, running on 3D phones.**

```
┌──────────────────────────────────────────────┐
│  Hi, I am                                    │
│  SAKAR              ╭──────╮   ╭──────╮      │
│  CHAULAGAIN         │▓▓▓▓▓▓│   │░░░░░░│      │
│                     │  N9  │   │ Jhol │      │
│  Flutter Developer  │ Att. │   │ Momo │      │
│                     ╰──────╯   ╰──────╯      │
│  [Résumé] [Hire Me]      ↑ real screenshots  │
└──────────────────────────────────────────────┘
      scroll ↓
   phones orbit on a rail; the centred one
   steps forward and expands into a case study
```

Chosen over a generic scroll-world or shader field because it is **content-driven**. The 3D is
doing a job — showing shipped work — rather than proving WebGL exists. For a mobile developer with
ten real apps, the devices *are* the portfolio.

### Interaction model

| Trigger | Response |
|---|---|
| Idle | Devices float, slow orbit, subtle screen glow |
| Scroll | Rail rotates; centred device advances and grows |
| Hover device | Tilts toward cursor, screen brightens |
| Click device | Camera pushes in, device fills frame, case study overlays |
| Cursor move | Whole rig parallaxes a few degrees |

---

## 3. Stack

**Vite + React + React Three Fiber + drei + GSAP + Tailwind**

R3F earns its place: `<Float>`, `<Environment>`, `<ScrollControls>`, `<RoundedBox>`,
`<MeshTransmissionMaterial>` are one-liners in drei and 100+ lines each in raw Three.js. Smaller
total diff, not larger.

Cost: one edit to `.github/workflows/static.yml` — add Node setup, `npm ci`, `npm run build`, and
change `path: '.'` to `path: './dist'`.

### Key technical decisions

**No phone GLB model.** The device is a drei `<RoundedBox>` plus a plane carrying the screenshot
texture. A realistic phone model is 2–5 MB and indistinguishable at this scale.
> `ponytail:` procedural phone geometry. Swap in a GLB only if a close-up hero shot demands a
> camera bump and speaker grille.

**One `<Canvas>`, not one per section.** A single fixed canvas behind the DOM; sections scroll
normally on top and scroll progress drives the camera. Browsers cap WebGL contexts around 8–16, so
per-section canvases break outright — Safari is strictest.

**Screenshots are the payload, so they get budgeted.** 76 source images are available
(~400 KB average ≈ 30 MB raw). Downscaled to 512×1109 WebP q80 they land near 40 KB each. Ten hero
textures load eagerly, one per project; the rest load when a case study opens.

**Graceful degradation is mandatory, not polish.** `prefers-reduced-motion`, no-WebGL, and low-end
devices all get a static image grid carrying the same content and links. A large share of the
audience is on mid-range Android — the site must work there.

**Dark and light are both first-class — and that reaches into the 3D.** CSS tokens are the easy
half. The scene also swaps: `Environment` preset (`night` → `city`), light intensities, and the
device body colour (graphite `#1B1D24` → silver `#C9CBD2`). Screens get a slight brightness boost in
light mode so they still read as emissive against a pale ground. Theme is set on `<html data-theme>`
by a pre-paint inline script (no flash), persisted to `localStorage`, and follows `prefers-color-scheme`
only until the visitor chooses explicitly.

**No backend, by design.** All content is static JSON in the repo. Nothing to deploy, nothing to
page, and the infinite-spinner failure mode on `sakarc.com.np` is structurally impossible here. The
contact form posts to the existing Google Apps Script endpoint — not a server anyone maintains.

**CNAME must survive the build.** It moves to `public/CNAME` so Vite copies it into `dist/`. Lose
it and the custom domain breaks.

---

## 4. Content model

All content is **already extracted and verified** into `docs/data/` — stack-independent, reusable
as-is:

| File | Contents |
|---|---|
| `docs/data/projects.json` | 10 projects — id, title, category, status, image, github/live, `frontend[]`, `backend[]`, summary, multi-paragraph `details[]` |
| `docs/data/skills.json` | 29 skills — name, tagline, brand colour |
| `src/data/mini-projects.json` | 15 mini projects — title, category (`games`/`tools`/`others`), live URL, local screenshot |

### The 10 projects

| Project | Category | Status | Frontend | Backend | Links |
|---|---|---|---|---|---|
| N9 Attendance System | Attendance Platform | ✅ | Flutter, Dart, SQLite | Node, Express, Postgres, Docker | Play Store · GitHub |
| Jhol Momo | Food Delivery | ✅ | Flutter, Dart, Figma | Node, TS, Express, Postgres | — |
| Dairy Management System | Dairy Management | ✅ | Flutter, Dart, SQLite, Figma | Firebase | GitHub |
| Verify Skills | Verification & AI | ✅ | React, TS, Vite, Tailwind | Python, Django, OpenAI, Postgres | — |
| Quick DO | Todo Application | ✅ | Flutter, Dart, Hive | Dart | GitHub |
| My Portfolio | Portfolio | ✅ | TS, Next.js, Tailwind, Spline | — | — |
| Multi Cloud | Cloud Management | 🚧 | Flutter, Dart, Hive, Auth0 | Node, Go, Postgres, Docker | — |
| Sperium Lounge | Food Ordering | 🚧 | Flutter, Dart, Hive, Socket.io | Dart | GitHub |
| Fire Alert App | Disaster Management | 🚧 | Flutter, Dart, Hive | Python, FastAPI, Postgres | GitHub |
| LMS App | E-learning | 🚧 | Flutter, Dart, SQLite | Node, Express, Mongo | — |

### Stack section — no numbers

29 real technologies with taglines, **no percentages**. Hover reveals the name and tagline
("Flutter — Build once. Run everywhere."), nothing more. This is the honest replacement for the
fake bars: it shows *what* he works with, not an invented score for how well.

> Flutter · Dart · React · Next.js · TypeScript · JavaScript · Python · Django · FastAPI · Go ·
> Node.js · Express · PostgreSQL · MongoDB · SQLite · Hive · Firebase · Supabase · Docker · Auth0 ·
> Socket.io · OpenAI · Tailwind · Vite · Figma · Vue.js · Chakra UI · React Query · Spline

### Archive — 15 mini-projects

Framed as **early work / playground**, visually separate from the shipped apps and deliberately
understated — a footnote to the real work, not a rival to it. Games / tools / others filter carried
over. Each links to its live Netlify URL; `Projects/Html_Css&JS/` moves to `public/legacy/`
untouched. It works; rewriting it buys nothing.

### Bio — rewritten

The current bio is a school-by-school recitation. Replacement, factual, every claim traceable to a
project in the table above:

> I'm Sakar Chaulagain — a Flutter developer from Kathmandu, Nepal.
>
> I build cross-platform apps that ship: an attendance platform live on the Play Store, a
> local-first restaurant ordering system that runs entirely without internet, an offline-first task
> manager, a dairy management suite spanning Windows and Android. Mostly Flutter on the front, with
> Node, Django, FastAPI, or Go behind it.
>
> I care about apps that stay fast and keep working when the network doesn't.

### Contact

Existing Google Apps Script endpoint reused verbatim, with two bugs fixed:

1. The mandatory **date field** ("Please add today's date") — removed
2. The email `pattern` `[a-zA-Z0-9._%+-]+@gmail.com$` — **rejects every non-Gmail address**,
   including recruiters. Replaced with standard validation.

---

## 5. Structure

```
sacarweb/
├── index.html                    # Vite entry
├── package.json
├── vite.config.js
├── public/
│   ├── CNAME                     # ← must not be lost
│   ├── shots/<project>/*.webp    # optimised screenshots
│   ├── cv.pdf
│   └── legacy/                   # 22-project archive, untouched
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── data/                     # generated from docs/data/*.json
│   ├── three/
│   │   ├── Scene.jsx             # canvas, lighting, rail, camera rig
│   │   └── Device.jsx            # phone mesh + screen texture
│   ├── sections/
│   │   ├── Hero.jsx   Work.jsx   CaseStudy.jsx
│   │   └── Stack.jsx  Archive.jsx  Contact.jsx
│   └── index.css
└── .github/workflows/static.yml  # + node, npm ci, npm run build, path: ./dist
```

---

## 6. Build order

Each phase ends with something viewable.

| # | Phase | Output | Why here |
|---|---|---|---|
| **0** | **Assets** | All 76 screenshots downloaded + converted to WebP into `public/shots/` | Longest pole, everything depends on it, and they live on a site that could change. Grab them all now. |
| **1** | **Scaffold + prove deploy** | Vite + R3F app with one spinning box, **live on the custom domain** | Prove Pages, the build step, and the CNAME work *before* building anything worth losing. |
| **2** | **Data + Device** | `src/data` wired from `docs/data/*.json`; one convincing 3D phone rendering a real screenshot | The core unit. If a textured device doesn't look good the concept needs rethinking — find out early, not in week two. |
| **3** | **Hero + Work** | Device rail, scroll-driven camera, hover/click states. Visual direction locked here. | The showcase itself. |
| **4** | **Remaining sections** | Case study overlay (`<dialog>` — native focus trap, native Esc), Stack, Archive, Contact | Mostly DOM, low risk. |
| **5** | **Perf + a11y + verify** | Fallbacks, keyboard pass, Lighthouse, texture budget audit | Non-negotiable, cheaper once the surface is stable. |

Phases 1–2 alone already beat the current site. 3–4 are what make it *3D*. Every phase is
independently shippable — this can stop anywhere and leave the site in a good state.

---

## 7. Performance & accessibility budget

Non-negotiable, not polish:

- Lighthouse Performance ≥ 90 on mobile; LCP < 2.5 s
- Total transferred on first paint < 500 KB
- `prefers-reduced-motion: reduce` disables every scroll animation and RAF loop; site stays fully usable
- Full keyboard navigation, visible focus rings, skip-to-content link
- Semantic landmarks, alt text on every screenshot, AA contrast
- **WebGL failure never blocks content** — every section renders and reads without it
- Three.js resources disposed when scrolled out of view (mobile context loss)

## 8. Verification

No test framework — static site, no business logic. What gets checked instead:

- **Content parity check** (`scripts/verify-content.mjs`, node, zero deps): asserts the built data
  contains all 10 projects and all 22 mini projects, and that no live URL 404s. This is the one
  piece of real logic worth guarding — the whole point of the rebuild is that nothing gets lost.
- Manual: Lighthouse, keyboard-only, reduced-motion, WebGL-disabled, 360 px → 2560 px, real device.
  Safari specifically — strictest on WebGL context limits.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Screenshots vanish if `sakarc.com.np` changes | Download all 76 in Phase 0, commit them |
| WebGL too slow on mid-range Android | Static-grid fallback, tested throttled in Phase 5 |
| Custom domain breaks on first deploy | `public/CNAME`, deploy proven in Phase 1 with throwaway content |
| 3D reads as gimmick | Devices show real screenshots; every effect tied to content |
| Texture memory blowout | 512 px WebP, 10 eager + rest lazy, audited in Phase 5 |

---

## 10. Open questions

1. ~~**Visual direction**~~ — **settled, see §12.** The near-black-plus-one-accent lean was itself a
   generic default; replaced with a direction derived from the work.
2. **The dead backend.** `sakar-backend-purple-bird-6999.fly.dev` returns **HTTP 500** on
   `/api/v1/{projects,skills,about,portfolio}/`, which is why `sakarc.com.np` shows visitors an
   infinite *"Loading Projects…"* spinner where its projects should be. Out of scope here, but it is
   actively costing him. This site being static and data-in-repo means it can never fail that way.
3. **Résumé source** — Google Drive link, or the committed `assets/CV.pdf`? They may differ.
4. **Live links** — only N9 Attendance has a confirmed public URL. If others are live they should be
   surfaced on the cards.


---

## 11. Status log

**2026-08-20 — Phase 0 complete.** All 80 screenshots pulled from `sakarc.com.np` and converted to
WebP at two sizes: `public/shots/tex/` (512 px, GPU textures) and `public/shots/full/` (900 px,
case-study lightbox). **30 MB → 4.3 MB, zero failures.** Two sizes rather than one because a 900 px
RGBA texture costs ~4.5 MB of GPU memory each, and ten eager ones would be borderline on mobile.

**2026-08-20 — Phase 1 complete.** Vite 8 + React 19 + R3F 9 + drei 10 + three 0.185 + Tailwind 4.
- Bundle split: three.js is lazy-loaded, so **first paint is 62 KB gzip**; the 266 KB 3D chunk
  follows. Without the split it was a single 327 KB blocking bundle, over the budget in §7.
- `.github/workflows/static.yml` upgraded (checkout v4, Node 22, `npm ci`, build, verify,
  upload-pages-artifact v3, deploy-pages v4) and `path` changed from `'.'` to `'./dist'`.
- `CNAME` moved to `public/` and **confirmed present in `dist/`**.
- 22-project archive moved to `public/legacy/mini-projects/`, confirmed serving.
- `scripts/verify-content.mjs` added and wired into CI — asserts 10 projects, 22 mini, 29 skills,
  every project texture exists on disk, `CNAME` present, archive present. Passing.
- Data moved `docs/data/` → `src/data/` (single home; the app consumes it directly).
- Superseded files moved out of the repo root, recoverable at commit `2e34a19`.

**Not done:** not committed, not pushed. Verified by local build only — deploying a scaffold to the
live domain was deliberately avoided.


---

## 12. Visual direction — "Local network"

The first pass (near-black ground, single saturated accent) was rejected on review: it is one of the
three looks that show up regardless of subject. Replaced with a direction that comes out of the work
itself.

**The thesis.** The through-line across the portfolio is not "Flutter" — it is that the apps keep
running when the network doesn't. Sperium Lounge has no cloud at all; N9 punches in only on the
office network; Quick DO and Fire Alert are offline-first on Hive. Sakar's own bio already says it:
*"I care about apps that stay fast and keep working when the network doesn't."* That is the hero
thesis and the source of every visual decision below.

**Colour — the palette is the status system.** Ground is deep slate-teal (`#0D1214` / `#ECEFEE`),
instrument-panel rather than void-black. Only two colours carry meaning, and nothing is decorative:

| Token | Dark | Light | Means |
|---|---|---|---|
| `--live` | `#35D08A` | `#128A56` | shipped · connected |
| `--signal` | `#FFB454` | `#9A5B00` | in progress · local-only |

There is no third accent. Light-mode values are darkened for AA contrast on a pale ground rather
than reused from dark.

**Type.** Display **Bricolage Grotesque** — characterful and slightly irregular, deliberately not
the Archivo Black of `sakarc.com.np` and not the Space Grotesk every developer portfolio reaches
for. Body **Inter Tight**. Utility **Martian Mono**, used only for the `.label` element — the one
recurring structural device, which reads as instrument-panel labelling.

**Signature — the rail is a mesh.** The ten devices are joined by faint link lines that fade with
distance from the centred device. They are connected, not floating in a void, which is the literal
subject of the work. This is the one place boldness is spent; everything around it stays quiet.

**Motion.** Hero and rail share one continuous scroll — the first project is already on screen, so
there is no hand-off between a "hero section" and a "work section". Scroll drives a continuous rail
index (devices travel rather than snap); the camera eases in as the hero copy fades out.

## 13. Status log — Phases 2 & 3

**2026-08-20 — Phases 2 & 3 complete.**
- `src/data/index.js` normalises the raw JSON: label aliases for the 15 short keys with no
  `skills.json` entry (including the source typo `sockerio` → Socket.io), texture/gallery path
  resolution, and a heading/paragraph split over `details[]`.
- `src/data/shots.json` generated from disk — 80 screenshots across 10 folders.
- Full ten-device rail, scroll-driven, with hover lift, cull beyond ±4.5 slots, and click-to-open.
- Case study is a native `<dialog>` — focus trap, Esc-to-close and inertness for free, no library.
- Stack, Archive (22 mini projects by category) and Contact sections built. Contact posts to the
  existing Apps Script endpoint with the Gmail-only pattern and mandatory date field both gone.
- **Bug found and fixed at source:** Sperium Lounge and Quick DO list `dart` in both `frontend` and
  `backend`, producing duplicate React keys wherever the combined stack was rendered. Deduped in
  `src/data/index.js` so no consumer has to.
- `scripts/verify-content.mjs` extended: manifest total, and both size variants on disk for all 80.
- First paint **76 KB gzip**; 3D chunk 260 KB, lazy.

**Still open:** not committed, not pushed. No automated screenshot — the devtools integration
requires Chrome and this machine has Brave, so rendering is verified by "no console errors, all
assets 200" plus eyes on the page. Phase 5 (perf/a11y audit) not started.


## 14. Status log — Phase 5

**2026-08-20 — Phase 5 mostly complete.** Four real bugs found while auditing, all fixed at source:

| Bug | Effect | Fix |
|---|---|---|
| `#work` sat above the canvas with default pointer events | **Devices were not clickable or hoverable at all** — the entire 3D interaction was dead | `pointer-events-none` on the overlay layer; controls opt back in |
| Rail pitch `1.32` hard-coded in both `Device.jsx` and `Scene.jsx` | Mesh link lines would silently detach from the devices on any change | Hoisted to an exported `SPACING` constant |
| `#work` stayed `1000dvh` when the rail was absent | Reduced-motion and no-WebGL visitors scrolled **ten empty screens** | Height collapses to `100dvh` unless the rail renders |
| Hero controls stayed clickable at `opacity: 0` | Invisible focusable targets; screen readers read hidden copy | `inert` on whichever layer is faded out (boolean — React 19) |

Also in this pass:
- The project index is now **always rendered**, not only as a no-WebGL fallback. The rail reaches
  one project at a time, so this is the only route that reaches all ten by keyboard.
- `<main>` landmark added; grid buttons carry explicit `aria-label`s and their images are `alt=""`
  (decorative — the button already names the project).
- Header dropped `mix-blend-difference` for theme tokens plus a blurred backdrop: focus rings were
  unpredictable over the blend, and over device screenshots it was illegible.
- Camera pulls back to `z 7.6` under 768 px so ten devices still fit on a phone.
- Scroll math extracted to a pure `railFrom()` and covered by `scripts/rail.test.mjs` (10
  assertions: clamping both directions, hero hand-off, zero-travel and single-slot degenerate
  cases). Wired into `npm run verify`, so CI runs it before every deploy.

**Measured:** first paint **78.2 KB gzip** against the 500 KB budget. Production build serves
correctly under `vite preview` — `/`, textures, legacy archive, CV and CNAME all 200.

**Still outstanding:** Lighthouse and the throttled-mobile pass need Chrome (this machine has
Brave), so the perf number is a bundle measurement, not a field one. Keyboard, reduced-motion and
no-WebGL paths are verified by code and unit test, **not** by running them in a browser. Nothing is
committed or pushed — the live site is still the old one.


## 15. Status log — visual QA & delivery

**2026-08-20 — complete, on branch `rebuild/3d-portfolio`.**

Automated browser verification was unblocked by driving Brave through
`puppeteer-core` (`scripts/shoot.mjs`, `scripts/a11y-check.mjs`) rather than waiting on Chrome.
Screenshots across desktop/mobile × dark/light × four scroll positions, plus the reduced-motion and
no-WebGL paths, surfaced five more real bugs:

| Bug | Effect | Fix |
|---|---|---|
| Rail centred at the origin | **Headline and body copy sat on top of lit phone screens** — both unreadable, desktop and mobile | Responsive rail transform: pushed right ≥1024 px, lifted above the copy below 768 px |
| No separation between canvas and copy | Text competed with whatever screenshot was behind it | Gradient scrim at `z-[1]`, direction switching with breakpoint |
| Scrim first added at `z-[5]` | Dimmed the copy it was meant to protect | Moved to `z-[1]`; sticky copy raised to `z-20` explicitly |
| `.label` defined outside any layer | Beat Tailwind's `text-*` utilities — "Hire me" rendered green-on-green | Moved into `@layer components` so utilities win |
| Index grid used raw portrait textures | 9:19.5 shots at full column width rendered ~930 px tall each | `aspect-[4/5] object-cover object-top` |

Also: mesh moved below the devices (it was crossing the screens as a stray hairline) and given
per-project status nodes coloured by shipped/in-progress; light-mode device bodies darkened to
`#AAB2B4` because they were washing into the background; sitemap namespace typo
(`sitemap.org` → `sitemaps.org`) corrected; SEO/OG/Twitter metadata, `robots.txt` and `sitemap.xml`
added.

**Verified green:** dialog opens, focus trapped inside, Escape closes, skip link present, single
`h1`, `main` landmark, every image has `alt`, no page errors in any configuration. `npm ci &&
npm run build && npm run verify` passes from a clean install — the exact CI sequence.

**Delivered:** committed as `d16b8fb` and pushed to `rebuild/3d-portfolio`. **Not merged to `main`,
so the live site is untouched** — the Pages workflow only fires on `main`. Merging that branch is
what deploys.

**Genuinely still open:** Lighthouse field metrics (the 78 KB is a bundle measurement); a real
low-end Android check; and Sakar's own judgement on the visual direction, which has had no human
review yet.


## 16. Change log — archive trimmed

**2026-08-20.** The archive's `others` category removed on request: Clock, Filterable Gallery, Login
Form, Calendar, Card Hover, Hover Effect, Skill Bar. Deleted from `src/data/mini-projects.json`
rather than filtered at render, so nothing downstream can surface them; `scripts/verify-content.mjs`
now expects 15 and asserts no entry carries `category: "others"`. Archive is Tools (10) and Games
(5). Section copy updated from "Twenty-two" to "Fifteen".


## 17. Change log — About, platform categories, responsive pass

**2026-08-20.**

**Photo + About.** New `#about` section: portrait (3:4, intrinsic size declared so there's no layout
shift), an "Available" node echoing the rail, the rewritten bio, and a stat row of things that are
actually countable — 10 projects, 6 shipped, 29 technologies, 1 on the Play Store. No invented
scores, consistent with §12.

**Platform categories.** Added a `platforms` field to every project, derived from what the project
copy actually claims rather than inferred from the stack (N9 names Web/Android/iOS/Windows/macOS;
Dairy names Windows + Android; Sperium has a Flutter admin app plus a customer web app). Counts:
mobile 8, web 7, desktop 2. CI now fails if a project has no platform or an unknown one — an
unclassified project would be invisible under a filter.

**Projects redesigned as a catalogue.** The card grid became a dense filterable index: one scannable
row per project carrying index number, thumbnail, title, status, platform chips and full stack,
collapsing to a stacked card under 768 px. Filter chips carry live counts and an `aria-live` result
count. This replaces the old grid entirely and remains the only route that reaches all ten by
keyboard.

**Responsive pass.** Screenshot sweep widened to six breakpoints — 360, 390, 768, 1024, 1440,
2560 — with an automated horizontal-overflow assertion at each. Two fixes: the About stat row
collided at 768 px (4 narrow columns; now 2-up until `lg`), and the photo carried a wrong intrinsic
height (`640×640` for a `640×853` image), which would have caused layout shift.

**Checks added.** `scripts/a11y-check.mjs` now also asserts the platform filter narrows the list
across a re-render and marks exactly one chip `aria-pressed`. Nine assertions, all green.
