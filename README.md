# sacarweb

The portfolio of **Sakar Chaulagain**, a Flutter developer in Kathmandu, Nepal.

- Live: **https://sakarchaulagain.com.np/** (this repo, hosted on GitHub Pages)
- Second site: **https://sakarc.com.np** is a separate Next.js site, not in this repo. It is linked from the footer and from the JSON-LD `sameAs`.
- Repo: `sacarsacar/sacarweb`. Pushing to `main` deploys.

It is a single-page Vite + React app. The projects ride a scroll-driven rail of 3D phones (React Three Fiber), each showing a real app screenshot. Below the rail are a filterable index of all projects, About, Experience, Skills, an archive of early web work, and a contact form. There's no backend: content lives in JSON files under `src/data/`, and the contact form posts to FormSubmit.

The design spec behind the rebuild is in `docs/superpowers/specs/2026-08-20-3d-portfolio-rebuild-design.md`.

---

## Contents

1. [Quick start](#quick-start)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [How it works](#how-it-works)
5. [Content model: editing projects and data](#content-model)
6. [Scripts](#scripts)
7. [Exporting project data](#exporting-project-data)
8. [SEO and sharing](#seo-and-sharing)
9. [Deployment (free options)](#deployment)
10. [Accessibility](#accessibility)
11. [Performance](#performance)
12. [Troubleshooting](#troubleshooting)
13. [Rules for anyone (or any AI) editing this repo](#rules-for-editors)

---

## Quick start

```bash
npm ci              # install exactly what package-lock.json pins
npm run dev         # dev server, http://localhost:5173
npm run verify      # content + rail checks (CI runs this before every deploy)
npm run build       # production build to dist/
npm run preview     # serve dist/ locally, http://localhost:4173
npm run export      # write portfolio-export/ (all project data and graphics)
```

Node: CI uses **Node 22**. Vite 8 requires Node `^20.19.0 || >=22.12.0`.

---

## Tech stack

Versions are from `package.json`. The lockfile currently resolves each one to exactly the version shown.

| Layer | Package | Version | Used for |
|---|---|---|---|
| UI | `react`, `react-dom` | ^19.2.8 | Components, `lazy`/`Suspense`, an error boundary |
| 3D | `three` | ^0.185.1 | Renderer, `PMREMGenerator`, `RoomEnvironment` |
| 3D | `@react-three/fiber` | ^9.7.0 | `<Canvas>`, `useFrame`, `useThree` |
| 3D | `@react-three/drei` | ^10.7.8 | `RoundedBox` (phone body) and `useTexture` only |
| Scroll | `lenis` | ^1.3.26 | Smooth scroll with inertia |
| Build | `vite` | ^8.2.2 | Dev server and bundler |
| Build | `@vitejs/plugin-react` | ^6.1.0 | JSX and fast refresh |
| CSS | `tailwindcss`, `@tailwindcss/vite` | ^4.3.3 | Tailwind v4, configured in CSS (no `tailwind.config.js`) |
| Tooling | `puppeteer-core` | ^25.8.0 | Dev-only browser scripts. It doesn't bundle a browser, so it uses your local Brave or Chrome |

Outside npm:

- **Fonts:** Google Fonts (Bricolage Grotesque, Inter Tight, Martian Mono), loaded from `index.html`.
- **Contact form:** [FormSubmit](https://formsubmit.co), which needs no account or key.
- **CI/CD:** GitHub Actions deploying to GitHub Pages.
- **DNS:** Cloudflare (see [Deployment](#deployment)).

The project deliberately has no router, state library, TypeScript, test framework, HDR or GLB files, or server.

---

## Project structure

`node_modules/` and `dist/` are omitted.

```
sacarweb/
├── .github/workflows/static.yml   CI: npm ci → build → verify → deploy dist/ to GitHub Pages (on push to main)
├── docs/superpowers/specs/        Design spec for the 3D rebuild (positioning and decisions)
├── index.html                     Meta/OG/Twitter/JSON-LD, pre-paint theme + motion script, <noscript> project list
├── package.json                   Scripts and dependencies
├── vite.config.js                 React + Tailwind plugins, base '/', target es2022, assetsInlineLimit 0
├── public/                        Copied verbatim into dist/
│   ├── CNAME                      sakarchaulagain.com.np
│   ├── robots.txt, sitemap.xml
│   ├── og.jpg                     1200×630 share image, rendered by scripts/brand-assets.mjs
│   ├── favicon.svg                Source icon
│   ├── favicon.png, apple-touch-icon.png   Rendered from favicon.svg by brand-assets.mjs
│   ├── me-avatar.webp             260×260 avatar (About card, JSON-LD image)
│   ├── me.webp                    Larger portrait. The site doesn't use it; npm run export ships it
│   ├── cv.pdf                     Résumé (linked from the hero and About)
│   ├── shots/
│   │   ├── tex/<folder>/<name>.webp    512 px wide: 3D phone textures, hero still, index cards
│   │   └── full/<folder>/<name>.webp   900 px wide (a few 1280): case-study gallery
│   ├── sites/<id>.webp, <id>-sm.webp   1280 / 480 px browser captures of projects with a live URL
│   ├── photos/                    Optional profile photos for socials.json (none are wired up now)
│   └── legacy/mini-projects/      The old static HTML/CSS/JS archive page, served as-is
├── scripts/                       Node scripts: see "Scripts"
└── src/
    ├── main.jsx                   React root (StrictMode)
    ├── App.jsx                    Page shell: header, hero + rail section, HeroStill, lazy Scene,
    │                              dialogs, #project/<id> hash routing, mobile menu
    ├── index.css                  Tailwind import, colour tokens, every custom style and animation
    ├── useScrollRail.js           railFrom() (pure, tested) + the scroll → rail hook
    ├── useSmoothScroll.js         Lenis setup and in-page anchor handling
    ├── useTheme.js                useTheme (view-transition toggle), useMotion, motionOff()
    ├── Reveal.jsx                 Reveal-on-scroll wrapper (IntersectionObserver)
    ├── Pointer.jsx                Cursor ring that trails the arrow; the header "eyes"
    ├── Sky.jsx                    CSS scenery (sun/moon, stars, ridgelines, birds), ThemeSwitch, MotionSwitch
    ├── three/
    │   ├── Scene.jsx              The one <Canvas>: lights, environment, rail, camera, keep-alive, first frame
    │   └── Device.jsx             Procedural phone with a screenshot texture and spring motion
    ├── sections/
    │   ├── Work.jsx               WorkPanel beside the rail; LinkChips, OrgLine, StatusPill
    │   ├── Index.jsx              #index: every project, three filters, "See all"
    │   ├── About.jsx              #about: profile card, counted stats, "What I do", live-sites tile
    │   ├── LiveSites.jsx          Live-sites tile and the coverflow dialog
    │   ├── Profiles.jsx           "Find me" profile nodes; BrandIcon
    │   ├── Experience.jsx         #experience timeline
    │   ├── CaseStudy.jsx          Case-study <dialog> and share button
    │   └── Rest.jsx               #stack, #archive, #contact (FormSubmit form, footer); TechChip/TechIcon
    ├── assets/pub-dev-logo.svg    Inlined (?raw) on package cards
    └── data/
        ├── projects.json          Every project (the main content)
        ├── shots.json             Gallery manifest: screenshot folder → ordered names
        ├── experience.json        Work history
        ├── skills.json            Curated tools with taglines
        ├── socials.json           Profile links
        ├── mini-projects.json     Early web projects (#archive)
        ├── icons.js               Brand SVG paths (Simple Icons, CC0) and brand HEX colours
        └── index.js               Normalises all of the above; profile, NAV, labels, derived lists
```

---

## How it works

### Page anatomy

In order: the hero and rail (`#work`), then `#index` (all projects), `#about`, `#experience`, `#stack` (Skills), `#archive` (early work) and `#contact` with the footer. Three native `<dialog>`s sit on top of the page: the case study, the live-sites coverflow, and the mobile menu. `NAV` in `src/data/index.js` drives the header, the phone menu and the footer.

### One canvas for the whole page

`src/three/Scene.jsx` renders a single `<Canvas>`, `position: fixed` behind the DOM. Browsers cap the number of live WebGL contexts, and Safari is the strictest, so one canvas per section would break. Everything 3D goes in this one canvas. Don't add a second.

The canvas stops drawing (`frameloop="never"`) whenever the rail has scrolled out of view or any dialog is open. `KeepAlive` calls `invalidate()` on un-pause, because the loop doesn't always restart on its own.

### The scroll-driven rail

- The `#work` section is `railProjects.length × 100dvh` tall, with a sticky inner frame.
- `railFrom(top, height, viewport, count)` in `src/useScrollRail.js` is a pure function. It maps the section's bounding rect to:
  - `railPos`: a continuous index from `0` to `count − 1` over the section's scroll travel, clamped at both ends.
  - `engage`: `0 → 1` over the first screen. The hero copy fades out, the WorkPanel fades in, and `inert` flips between them at 0.5.
- `scripts/rail.test.mjs` covers `railFrom()` with assertions: the endpoints, clamping on overscroll, halfway, and degenerate inputs (no travel, a single slot, no NaN).
- The scroll listener is rAF-throttled, and it returns the same state object when nothing changed so React skips the render. `inView` (section bottom > 0) pauses the canvas and the sky.
- `Math.round(railPos)` picks the project that the WorkPanel describes.
- Each `Device` is a spring on x. Phones farther from centre get softer springs, so they trail and overshoot slightly. A phone leans with its velocity, lifts on hover and bobs gently.
- The camera eases in as `engage` rises and drifts a little toward the pointer.
- Lines and nodes under the phones form the "local mesh". A node is green for shipped and amber for in progress.
- `useRailTransform` pushes the rail right on screens ≥1024 px and lifts and shrinks it above the copy on narrow screens.

### Loading: static first, 3D on idle

1. **HeroStill** (in `App.jsx`) renders the first three rail projects that have textures as plain `<img>` phones, tilted with CSS. It is the default state.
2. `three.js` is split into its own chunk with `React.lazy(() => import('./three/Scene'))`. That chunk is mounted only after `requestIdleCallback` fires (1200 ms timeout, with a 300 ms `setTimeout` fallback). The hero text paints first.
3. Inside the canvas, `FirstFrame` sits in the same `Suspense` as the phones, so it only mounts once every texture has loaded. Its first `useFrame` calls `onReady(true)`, and only then does HeroStill fade out (`data-hidden`).
4. If WebGL never draws, the still simply stays. This happens on some Safari setups.

The rail is shown only when **both** of these hold: a WebGL2 context can be created (`has3D`), and animations are on. Otherwise `#work` collapses to one screen with HeroStill, and the projects are still reachable through `#index`.

### Phones and lighting without downloads

- **Geometry:** a drei `RoundedBox` body plus a plane for the screen. A photoreal GLB would be 2–5 MB and look the same at this size.
- **Screenshot fit:** the texture is cover-fit and top-aligned (`repeat`/`offset`), so 9:16 Play Store shots aren't stretched onto the roughly 9:19.5 screen.
- **Reflections:** a PMREM of three's procedural `RoomEnvironment` (the `StudioEnv` component). It replaced drei's `<Environment preset>`, which downloaded a 1.7 MB HDR on every visit.
- **Draw calls:** devices more than 4.5 slots from centre aren't rendered at all. The link lines are built once in rail space, and their group slides, so scrolling never rebuilds a buffer.
- **Resolution:** `dpr={[1, 1.75]}`.

### Failure handling: context loss and errors

- `KeepAlive` listens for `webglcontextlost`. On a loss, `onReady(false)` brings the still back, and after 250 ms the `<Canvas>` remounts with a new `key`, which gives it a fresh context.
- After more than three rebuilds, `Scene` throws. `SceneBoundary` (an error boundary in `App.jsx`) catches it, logs `3D rail unavailable, showing the still:` and leaves HeroStill on screen.

### Safari WebGL note: don't remove `powerPreference: 'default'`

Safari 27 loses a WebGL context created with `powerPreference: 'high-performance'` immediately. That is R3F's default, and with it the rail never draws. `Scene.jsx` therefore passes:

```js
gl={{ antialias: true, powerPreference: 'default' }}
```

Keep it.

### Screenshot sizes: `shots/tex` vs `shots/full` vs `sites`

| Folder | Size | Used by |
|---|---|---|
| `public/shots/tex/<folder>/` | 512 px wide WebP | 3D textures, HeroStill, index cards, Experience thumbnails |
| `public/shots/full/<folder>/` | 900 px wide WebP (some landscape 1280) | Case-study gallery (lazy-loaded, each opens full size in a new tab) |
| `public/sites/` | `<id>.webp` 1280 px, `<id>-sm.webp` 480 px | Live-sites coverflow and the About tile |

`vite.config.js` sets `assetsInlineLimit: 0`, so Vite never inlines images as base64.

### Smooth scroll (Lenis)

`useSmoothScroll` runs Lenis (expo-out easing, 1.05 s). It is disabled entirely when animations are off. In-page anchors (`a[href^="#"]`) are routed through `lenis.scrollTo(el, { offset: -70 })` so they don't jump.

Lenis captures wheel events on the document. Any scrollable container inside a dialog therefore needs **`data-lenis-prevent`**, or it won't scroll with a wheel or trackpad. The case study and live-sites dialogs both have it.

### Theme and motion preferences, set before first paint

- An inline script in `index.html` sets `<html data-theme>` from `localStorage.theme`, falling back to `prefers-color-scheme`. It sets `<html data-motion>` from `localStorage.motion`, falling back to `prefers-reduced-motion`. Doing this before first paint avoids a flash of the wrong theme and any animation before React loads.
- `useMotion` keeps `data-motion` in sync. The header's sparkle button (on phones, the menu's "Animations" row) overrides the OS setting and is saved to `localStorage`. `motionOff()` is the single check the rest of the code uses.
- **Animations off** means:
  - no 3D rail, no Lenis, no cursor ring;
  - the eyes stop tracking and blinking;
  - reveals show immediately, and the count-ups and word reveal are skipped;
  - CSS cuts every animation and transition to 0.01 ms and hides the birds;
  - the theme switch swaps instantly.
- **Theme toggle:** a "light bulb" View Transition that floods out from, or collapses back into, the button. The swap is instant when the API is missing or motion is off.
- **Colours are a status system:** green `--live` means shipped and amber `--signal` means in progress. Tokens are defined per theme at the top of `src/index.css` and exposed to Tailwind through `@theme inline` (`bg-bg`, `text-muted`, `border-line`, `text-accent`, …).

### Shareable case studies: `#project/<id>`

`useProjectLink` in `App.jsx` handles the hash:

- Opening a project sets `#project/<id>` with `history.pushState`, so the browser's Back button (or Android's back gesture) closes the case study instead of leaving the site.
- A visitor who arrives on a shared link gets the hash cleared with `replaceState` on close.
- The id match is case-insensitive.
- The case study's **Share** button uses the native share sheet on touch devices. Elsewhere it copies the link, and falls back to `prompt()` if clipboard access is blocked.

All routing is hash-based, so **no host needs rewrite or SPA-fallback rules.**

### Contact form (FormSubmit)

`ContactForm` in `src/sections/Rest.jsx` posts JSON to `https://formsubmit.co/ajax/<profile.email>` and reports real success or failure.

- A hidden `_honey` field catches bots.
- Without JavaScript, the plain form POSTs to the non-AJAX endpoint.
- One-time setup: the first submission triggers an "Activate form" email to that address, and nothing is forwarded until the link in it is clicked.

### Smaller pieces

| Piece | Where | Behaviour |
|---|---|---|
| Arrow cursor | `index.css` | A CSS cursor (data-URI SVG), so it never lags. Applies only on `(hover: hover) and (pointer: fine)` |
| Cursor ring | `Pointer.jsx` | Trails the arrow on a spring and swells over links. It is a `popover="manual"` so it stays above modal dialogs, and it sleeps when settled. 3D devices set `body.dataset.cursor` because canvas meshes fire no DOM `pointerover` |
| Sky | `Sky.jsx` | Pure CSS (compositor transforms). `--p` slides the three ridgelines at different speeds as the rail scrolls. Paused off-screen and under dialogs |
| Kathmandu clock | About profile card | Uses `Intl.DateTimeFormat` with `Asia/Kathmandu` |

---

<a id="content-model"></a>
## Content model: editing projects and data

All content is JSON in `src/data/`. `src/data/index.js` normalises it, and the components only read from there.

### `projects.json`

An array of objects. Field order doesn't matter, and array order is the authored order.

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | Unique. Used in `#project/<id>`, `public/sites/<id>.webp` and `experience.json → projects` |
| `title`, `category` | yes | Name and short descriptor ("Music player") |
| `status` | yes | `completed` or `in-progress`. `completed` gives `shipped: true` and the green "Shipped" pill. Shipped projects are listed first |
| `context` | yes | `work` (built at a job) or `personal`. Drives the "Type" filter |
| `platforms` | yes, unless `kind: package` | Any of `mobile`, `web`, `desktop`. Drives the "Platform" filter |
| `kind` | no | `app` (default), `game` or `package`. The primary filter tabs. Packages without an image show a pub.dev card with `flutter pub add <title>` |
| `featured` | no | `true` puts the project on the **3D rail**. It must have an `image` whose texture exists (verify enforces this, and `useTexture` would throw otherwise). The first three featured projects with textures form HeroStill |
| `image` | no | Cover screenshot, in the legacy path format `/assets/projects-screenshots/<folder>/<file>.<ext>`. **`<folder>` (the third path segment) is the screenshot folder.** The texture used is `/shots/tex/<folder>/<file>.webp`, whatever extension is written here. With no image, the index shows a placeholder card |
| `frontend`, `backend` | `frontend` yes (unless `placeholder`) | Short tech keys (`flutter`, `bloc`, `sockerio`…). The `LABEL` map in `index.js` turns them into display names. An unknown key gets its first letter capitalised. The two lists are merged and deduped into `stack` |
| `summary` | `summary` or `details` | One paragraph: rail panel text and case-study lead |
| `details` | | Array of strings. Headings and paragraphs are interleaved, and a string is treated as a **heading** if it is under 44 characters and doesn't end in `. ! ? :` |
| `live` | no | Live web URL: an "Open site" (or, for games, "Play in browser") link, plus an entry in the live-sites coverflow. **Requires** `public/sites/<id>.webp` and `<id>-sm.webp` (run `scripts/shoot-sites.mjs <id>`) |
| `play`, `appStore`, `pub`, `github` | no | Store, pub.dev and source links, shown as chips in this order after `live` |
| `placeholder` | no | Shows "Case study soon" and relaxes the stack and content checks. Verify prints a warning |
| `contextAssumed` | no | Marks `context` as unconfirmed. Verify prints a warning |

Derived in `index.js` (not stored):

| Derived value | How it's computed |
|---|---|
| `folder`, `texture`, `gallery` | From `image` and `shots.json` |
| `shipped`, `stack`, `links` | From `status`, `frontend`/`backend`, and the link fields |
| `org` | The `experience.json` entry whose `projects` lists this id. Drives "Built at …" |
| `orderedProjects` | Shipped first, then in progress |
| `railProjects` | `orderedProjects` filtered to `featured && texture` |
| `liveSites` | Projects with `live` |

### How to add or edit a project

1. **Screenshots.** Pick a folder name and export each screen as WebP twice:
   - `public/shots/tex/<folder>/<name>.webp` at 512 px wide;
   - `public/shots/full/<folder>/<name>.webp` at 900 px wide.

   No script generates these. With `cwebp` installed (`brew install webp`), for example: `cwebp -q 80 -resize 512 0 in.png -o tex.webp` and `-resize 900 0` for the full size.
2. **`shots.json`.** Add `"<folder>": ["name1", "name2", …]`. The order is the gallery order, and a gallery only renders when there are at least two screens.
3. **`projects.json`.** Add the entry. Set `image` to `/assets/projects-screenshots/<folder>/<cover-name>.webp`, choose `status`, `context`, `platforms` and `kind`, and add `featured: true` if it belongs on the rail. Every featured project adds one full screen of scroll.
4. **New tech key?** If the auto-capitalised fallback is wrong, add it to `LABEL` in `src/data/index.js`, and to the copy of `LABEL` in `scripts/export-projects.mjs`. For a logo, add a `TECH_ICON` entry and an `ICONS`/`HEX` entry in `src/data/icons.js`. Otherwise a monogram is drawn.
5. **Live URL?** Run `node scripts/shoot-sites.mjs <id>`.
6. **Built at a job?** Add the id to that role's `projects` in `experience.json`.
7. **Bump the pinned totals** in `scripts/verify-content.mjs`. It asserts exact counts of projects, mini projects, skills and screenshots, so any addition fails verify until the numbers match.
8. If the project is featured and shipped, add it to the `<noscript>` list in `index.html`, which is maintained by hand.
9. Re-render the share image so its counts update: `node scripts/brand-assets.mjs`.
10. Run `npm run verify`, then `npm run dev` and check the rail, the index card and the case study.

### `shots.json`

`{ "<folder>": ["<name>", …] }`. Each name must exist as both `tex/<folder>/<name>.webp` and `full/<folder>/<name>.webp`. Verify checks every one.

### `experience.json`

One object per role, newest first.

| Field | Meaning |
|---|---|
| `id` | Unique |
| `company`, `role` | Shown in the timeline. The About card ("Right now") uses the part of `role` before the first comma |
| `period` | `"Mon YYYY — Mon YYYY"` or `"Mon YYYY — Present"`. The duration ("1 yr 4 mos", counted inclusively) is computed from it. `Present` marks the current role: a "Current" badge, a pinging node, and the About card |
| `location`, `address` | `location` is the visible text. `address` (or `location`) feeds a Google Maps search link, with no API key |
| `website` | Company link |
| `summary`, `highlights[]` | Body text. On phones the first 3 highlights show, followed by "Show all" |
| `stack` | Optional short tech keys. Without it, the stack is the union of the linked projects' stacks |
| `projects` | Project ids. These render as "Projects from this role" and set each project's `org` |
| `placeholder` | Optional. Renders a visible "Details pending" notice, and verify warns |

### `skills.json`, `socials.json`, `mini-projects.json`

- **`skills.json`**
  - Shape: `{ name, tagline, color }`.
  - The Skills section (`technologies` in `index.js`) is every tech used by a project, plus these curated names. Each one is shown with a **count of projects that use it**. That count is the only "level" on the site.
  - Names no project uses appear under "Everyday tools". `tagline` is the hover tooltip.
  - `color` is not read by the code: brand colours come from `HEX` in `icons.js`.
- **`socials.json`**
  - Shape: `{ id, label, handle, url, photo }`.
  - `id` must match a key in `ICONS` for the brand mark.
  - `photo` is a path under `public/` (for example `/photos/github.webp`), or `null` to use the brand mark. All are `null` today.
  - `scripts/fetch-avatars.mjs` explains why only GitHub can be fetched automatically.
- **`mini-projects.json`**
  - Shape: `{ title, category: "tools" | "games", url, image }`.
  - Rendered in `#archive`. `image` is used only by the export.

### Copy that lives in code, not JSON

| Copy | Location |
|---|---|
| Name, role, place, email, one-line thesis, CV path | `profile` in `src/data/index.js` |
| Hero | `App.jsx` |
| About paragraphs and the "What I do" cards | `src/sections/About.jsx`. The text is also copied into `scripts/export-projects.mjs`, so update both |
| Contact headline, footer | `src/sections/Rest.jsx` |
| `<noscript>` list and all meta tags | `index.html` |

---

## Scripts

| Command | What it does | Needs |
|---|---|---|
| `npm run dev` | Vite dev server (`http://localhost:5173` by default) | |
| `npm run build` | Production build into `dist/` (copies `public/` in) | |
| `npm run preview` | Serves `dist/` (`http://localhost:4173`) | A build |
| `npm run verify` | `verify-content.mjs`, then `rail.test.mjs`. Exits non-zero on failure | Node only |
| `npm run export` | `export-projects.mjs` writes `portfolio-export/` | Node only |
| `node scripts/brand-assets.mjs` | Renders `public/og.jpg`, `favicon.png` and `apple-touch-icon.png` | Brave at the default macOS path or `CHROME=/path/to/chrome`, plus network (Google Fonts) |
| `node scripts/shoot-sites.mjs [id …]` | Captures `public/sites/<id>.webp` + `-sm.webp` for live projects (all of them if no ids are given) | Brave or `CHROME=…`, `cwebp`, network |
| `node scripts/fetch-avatars.mjs` | Refreshes `public/photos/github.webp` from GitHub | Network, `cwebp` |
| `node scripts/a11y-check.mjs [url] [outdir]` | Browser checks against a running dev server (default `http://localhost:5199/`) | Brave at the hard-coded macOS path, and a running server |
| `node scripts/shoot.mjs [url] [outdir]` | Screenshot matrix (default output `/tmp/shots`) | Brave (hard-coded), a running server |

`puppeteer-core` doesn't download a browser. `brand-assets` and `shoot-sites` honour the `CHROME` environment variable. `a11y-check` and `shoot.mjs` hard-code the Brave path in a `BRAVE` constant, so edit that line to use Chrome (on macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`).

### What `verify-content.mjs` checks

It has no dependencies, and CI runs it after the build and before the upload, so a failure blocks the deploy.

**Pinned totals.** The number of projects, mini projects, skills, and screenshots in `shots.json` must equal hard-coded values. Bump them when adding content.

**Fatal per project.** Every project must have:

- `title` and `category`;
- a valid `status`, `kind` and `context`;
- known `platforms`, and at least one unless it's a package;
- a frontend stack and written content, unless it's a `placeholder`.

In addition:

- `featured` requires an `image`.
- An `image` requires its texture to exist in `shots/tex`.
- The image's folder must have a non-empty `shots.json` entry.
- `live` requires both `public/sites` captures.

**Fatal elsewhere.**

- Every `shots.json` name must exist in both `tex/` and `full/`.
- Mini projects need `http(s)` URLs and no `others` category.
- Experience entries need a company, role and period (unless `placeholder`), and only known project ids.
- Socials need `http(s)` URLs, and a `photo` file that exists if one is set.
- `public/CNAME` and `public/legacy/mini-projects/index.html` must exist.

**Warnings only.** Placeholder projects or roles, `contextAssumed` projects, and socials without photos.

### `rail.test.mjs`

This is a plain `node:assert` check of `railFrom()` (see [the rail](#the-scroll-driven-rail)). Change the mapping and this is what catches it.

### `a11y-check.mjs`

Start a server first, either `npx vite --port 5199` or `npm run dev`, and pass the URL. Then it checks that:

- the case study opens, traps focus, scrolls with a real wheel event, and uses more than 1000 px of width at 1440 px;
- Escape closes the dialog;
- the Desktop filter narrows the list, and each of the three filter groups has exactly one pressed chip;
- Type + Platform combine (it expects exactly one Work + Desktop project, so this check depends on the data);
- the index starts at 8 cards, and "See all" shows every project;
- the skip link exists, there is a single `h1`, there is a `main` landmark, and every image has `alt`;
- under emulated reduced motion, every `[data-reveal]` element is visible.

Any failure or page error exits 1. It also saves `dialog.png` to `[outdir]` (default `/tmp`).

### `shoot.mjs`

Renders 6 viewports (360 to 2560 px wide) × both themes × scroll positions. Override the defaults with `SCROLLS=0,0.5` and `THEMES=dark`. It reports horizontal overflow and console errors, and also renders a reduced-motion pass and a no-WebGL pass.

---

## Exporting project data

```bash
npm run export
```

`scripts/export-projects.mjs` writes **`portfolio-export/`** at the repo root. It is a self-contained kit for updating another portfolio, by hand or with an AI assistant:

| Output | Contents |
|---|---|
| `projects.json` | Every project, normalised, in display order (shipped first). Includes title, category, kind, status, context, employer, platforms, stack (frontend/backend), summary, the write-up as `sections[{heading, paragraphs}]`, links and image paths |
| `projects.md` | The same content as readable Markdown with image links |
| `projects/<id>/` | That project's graphics from `shots/full`. `01-…` is the cover, then the gallery in order, plus `live-site.webp` for live projects |
| `mini-projects.json`, `mini-projects/` | Early web projects with their PNG screenshots (from `public/legacy/mini-projects/assets/img/`) |
| `profile.json`, `profile/` | Profile, About text, focus areas, counted stats, experience, skills, technologies, socials; `me.webp`, `me-avatar.webp`, `cv.pdf` |
| `README.md` | Instructions for an AI on using the kit to update another portfolio, including the owner's content rules |

The script checks that every referenced file exists **before** deleting the previous export, then wipes and rewrites the folder. Don't edit the output: change `src/data/` and re-run.

The script mirrors parts of `src/data/index.js`, because that file is Vite-only and can't be imported from Node. Keep `LABEL`, the heading heuristic and the About text in sync between the two.

---

## SEO and sharing

**`index.html`**

- `<title>`, meta description, author, keywords, and `<link rel="canonical">` to `https://sakarchaulagain.com.np/`.
- Per-scheme `theme-color`.
- SVG and PNG favicons, and an Apple touch icon.

**Open Graph and Twitter**

- `og:*` and `twitter:card=summary_large_image`.
- All image URLs are absolute, because crawlers don't resolve relative ones.
- The image is a **JPEG** because LinkedIn ignores WebP. Its declared size is 1200×630.

**JSON-LD**

- An `@graph` with a `Person` (job title, Kathmandu address, `worksFor`, and `sameAs` links including sakarc.com.np and the social profiles) and a `WebSite`.

**`<noscript>`**

- A plain list of the featured, shipped apps with store links, plus links to the résumé, the legacy archive, GitHub, LinkedIn and sakarc.com.np, for crawlers that don't run JavaScript.
- It is maintained by hand and must be kept in step with `projects.json`.

**`public/robots.txt`**

- Allows everything and points to the sitemap.

**`public/sitemap.xml`**

- Lists `/` and `/legacy/mini-projects/` with `lastmod`. Update `lastmod` by hand when content changes.
- Case studies are `#project/<id>` URLs. Crawlers treat those as the same page, so they aren't listed.

**`og.jpg`**

- Rendered by `scripts/brand-assets.mjs` from an HTML template.
- It uses the site's palette and fonts, the ridgelines pulled out of `src/Sky.jsx`, three app screens (`global-equalizer`, `drop`, `gridverse`), and live counts from `projects.json` (projects, on Google Play, live websites).
- Re-run it after adding projects.
- Share previews are cached by the platforms, so use a tool such as LinkedIn's Post Inspector to force a refresh after changing it.

---

<a id="deployment"></a>
## Deployment (free options)

The build output is a static folder, so any static host works.

| Setting | Value |
|---|---|
| Build command | `npm run build`. To keep CI's content gate, use `npm run build && npm run verify` |
| Output directory | `dist` |
| Node version | 22 |
| Environment variables or secrets | None |
| Rewrites or redirects | None. Routing is hash-based, and `/legacy/mini-projects/` is a real folder with an `index.html` |

### How it is deployed today

- **GitHub Pages** serves the site. The repo is public, so Pages is free.
- **DNS:** the domain's nameservers are Cloudflare (`amanda.ns.cloudflare.com`, `zod.ns.cloudflare.com`), and the records are **proxied** through Cloudflare. Responses carry both `server: cloudflare` and `x-github-request-id`.
- **Registrar:** the `.np` registry only stores the nameservers, so every A or CNAME record is edited in the **Cloudflare dashboard → DNS → Records**, not at the registrar.

### (a) GitHub Pages: the existing workflow

`.github/workflows/static.yml` runs on every push to `main`, or manually from **Actions → "Deploy static content to Pages" → Run workflow**:

```
checkout → setup Node 22 (npm cache) → npm ci → npm run build → npm run verify
        → configure-pages → upload ./dist → deploy-pages
```

Only one deployment runs at a time, and a deployment in progress is never cancelled.

**One-time setup**

1. In the repo, go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Under **Settings → Pages → Custom domain**, enter `sakarchaulagain.com.np` and save. GitHub runs a DNS check.

   With a custom Actions workflow, GitHub takes the domain from this setting. `public/CNAME` still ships in `dist/`, and verify insists it exists, which keeps branch-based publishing working too. The setting is the one that counts.
3. Optional but recommended: verify the domain under **your GitHub profile → Settings → Pages → Add a domain**, which stops anyone else's repo from claiming it.
4. Merge this branch (`rebuild/3d-portfolio`) into `main`, or push to `main`. Watch the run in the **Actions** tab. Its summary links the deployed URL.

**DNS records for the `.com.np` domain (in Cloudflare)**

| Type | Name | Content |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA (optional) | `@` | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| CNAME | `www` | `sacarsacar.github.io` |

Use the apex A records, the `www` CNAME, or both. With both set, GitHub redirects `www` to the apex.

**HTTPS**

1. Tick **Settings → Pages → Enforce HTTPS** once GitHub has issued its certificate.
2. If the checkbox stays disabled or the certificate stays "pending", it is usually because the Cloudflare proxy hides the GitHub IPs. Set the records to **DNS only** (grey cloud), wait for the certificate, tick Enforce HTTPS, then turn the proxy back on if you want it.
3. With the proxy on, set Cloudflare **SSL/TLS → Full**. **Flexible** combined with Enforce HTTPS causes a redirect loop.

**Check DNS:** `dig +short sakarchaulagain.com.np` and `dig +short www.sakarchaulagain.com.np`. While proxied, these return Cloudflare IPs rather than GitHub's, which is expected.

### (b) Cloudflare Pages

1. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git**, authorise GitHub, and pick `sacarsacar/sacarweb`. If the dashboard offers a Worker instead, the same build settings apply, with `dist` as the static assets directory.
2. Configure the build:
   - Production branch: `main`
   - Framework preset: None (or Vite)
   - Build command: `npm run build` (or `npm run build && npm run verify`)
   - Build output directory: `dist`
3. Under **Environment variables**, add `NODE_VERSION` = `22`.
4. Click **Save and Deploy**. The site appears at `<project>.pages.dev`, and every push to `main` redeploys.
5. To attach the custom domain, open the project's **Custom domains → Set up a custom domain** and enter `sakarchaulagain.com.np` (and `www…` if wanted). The zone is already on Cloudflare, so Pages creates the DNS records itself. Remove the GitHub Pages A records first if Cloudflare reports a conflict.
6. Turn off GitHub Pages (Settings → Pages) or disable the workflow, so two hosts don't both claim the domain.

### (c) Netlify

1. Go to **app.netlify.com → Add new site → Import an existing project → GitHub** and pick the repo.
2. Configure the build:
   - Branch: `main`
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Under **Site configuration → Environment variables**, add `NODE_VERSION` = `22`, then deploy. The site appears at `<site>.netlify.app`.
4. To attach the custom domain, go to **Domain management → Add a domain**, enter `sakarchaulagain.com.np`, and keep DNS at Cloudflare:
   - `www` → CNAME `<site>.netlify.app`.
   - The apex → CNAME `<site>.netlify.app` (Cloudflare flattens apex CNAMEs), or the A record Netlify shows.
   - Leave both records **DNS only** so Netlify can issue its Let's Encrypt certificate.
5. Then go to **Domain management → HTTPS → Verify DNS configuration / Provision certificate**.

### (d) Vercel

1. Go to **vercel.com → Add New → Project** and import `sacarsacar/sacarweb`. The Vite preset is auto-detected. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
2. Under **Project Settings → Build and Deployment → Node.js Version**, choose `22.x`. Then deploy. The site appears at `<project>.vercel.app`.
3. To attach the custom domain, go to **Project Settings → Domains → Add** and enter `sakarchaulagain.com.np`. Create exactly the records Vercel then shows, in Cloudflare with **DNS only**. Typically that is an A record for the apex and a CNAME for `www`.
4. sakarc.com.np is a different project. Don't add this repo to it.

Whichever host you move to, point DNS at one host at a time, and switch off the old deployment once the new one serves the domain over HTTPS.

---

## Accessibility

What is actually implemented:

**Skipping and structure**

- A skip link ("Skip to work") is the first focusable element. The rail adds "Skip to all projects" so nobody has to scroll through a screen per project.
- There is one `<h1>` and a `<main>` landmark. The header nav, mobile nav and footer nav each have an `aria-label`.
- The header link for the section in view carries `aria-current`.

**The 3D canvas**

- The canvas is decorative. Every project is reachable as a real DOM control: the WorkPanel's "Read the case study" button, and the `#index` grid.
- HeroStill and the scenery are `aria-hidden`.
- The hero copy and the WorkPanel overlap. Whichever is faded out gets `inert`, so it can't be tabbed into.

**Dialogs**

- The case study, the live-sites coverflow and the mobile menu are native **`<dialog>`** elements opened with `showModal()`. That gives focus trapping, Esc to close and an inert background for free.
- Focus moves to the dialog's close button on open.
- Back closes an open case study.
- The live-sites coverflow is `aria-hidden` for pointer users, and the same controls are repeated below it as buttons (Previous/Next, a list of sites), with arrow-key support.

**Motion**

- Motion follows `prefers-reduced-motion` until the visitor picks something with the Animations switch (`aria-pressed`).
- Reduced motion removes the rail, smooth scrolling, the cursor ring and every CSS animation. It is applied before first paint.

**Controls and feedback**

- Filters are buttons with `aria-pressed`, and the result count is in an `aria-live` region.
- The "copied" confirmations for share and copy-email are `aria-live`.
- The form has real `<label>`s, `required` and `minLength`, `reportValidity()`, `role="alert"` on errors and `role="status"` on success.
- The word-by-word About headline also has the full sentence in an `sr-only` span.
- `:focus-visible` gets a 2 px accent outline.
- The light theme is a dimmed paper-grey, with text colours deepened to keep at least 4.5:1 contrast (per `index.css`).

`scripts/a11y-check.mjs` automates a subset of this (see [Scripts](#scripts)).

---

## Performance

What is actually implemented:

- **three.js is code-split**, in its own `Scene-*.js` chunk, and loaded on idle. In a build on 2026-11-16 the main JS was ~150 KB gzipped, the Scene chunk ~238 KB gzipped and the CSS ~13 KB gzipped. Vite warns that the Scene chunk is over 500 KB minified; that is expected.
- **Text paints before WebGL.** HeroStill uses `fetchpriority="high"` on the front image, and the 3D chunk waits for `requestIdleCallback`.
- **There are no large 3D assets.** The phones are procedural and the environment map is procedural, so there's no GLB or HDR.
- **Small textures.** The rail uses 512 px WebPs. Full-size screens load lazily, only inside the case study.
- **Rendering stops when unseen.** The canvas uses `frameloop="never"` when scrolled past or under a dialog, the CSS sky is paused in the same cases, and the cursor ring's rAF loop sleeps when idle.
- **Scroll is cheap.** It is rAF-throttled, and the state object is reused when unchanged. Everything below the fold is memoised in `App.jsx`, so rail frames don't re-render it. Far-off devices aren't drawn, link buffers are never rebuilt, and `dpr` is capped at 1.75.
- **Images:** `loading="lazy"` and `decoding="async"` throughout, with explicit `width`/`height` where known.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| **3D phones never appear; static phones stay** | This is the designed fallback, not a crash. Check the following, in order. (1) Are animations off? The header sparkle button, or `localStorage.motion === 'off'`, or the OS reduce-motion setting. (2) Does the browser support WebGL2? (3) Does the console show `3D rail unavailable, showing the still:`? That means the scene threw or lost its context more than three times. (4) Safari: confirm `powerPreference: 'default'` is still in `Scene.jsx` |
| Rail draws, then goes blank | A WebGL context loss. The canvas rebuilds itself and shows the still meanwhile. If it keeps happening, look for something else creating WebGL contexts (a second `<Canvas>`, or long hot-reload sessions) |
| A scrollable panel inside a dialog won't wheel-scroll | Add `data-lenis-prevent` to the scrolling element |
| In-page links jump instead of gliding | Expected when animations are off (Lenis is disabled). Otherwise, check that the target id exists |
| `npm run verify` fails with `expected N …, got M` | You added or removed content. Bump the pinned count in `scripts/verify-content.mjs` |
| `missing texture public/shots/tex/<folder>/<file>.webp` | `image`'s folder or file name doesn't match a file in `shots/tex`. The extension in `image` is ignored, and `.webp` is assumed |
| `featured on the rail but has no image` | Give it an `image`, or remove `featured` |
| `missing public/sites/<id>.webp` | The project has `live`. Run `node scripts/shoot-sites.mjs <id>` |
| `public/CNAME missing` | Restore it, with one line: `sakarchaulagain.com.np` |
| Puppeteer can't launch a browser | Install Brave, or set `CHROME=/path/to/chrome` (for `brand-assets` and `shoot-sites`), or edit the `BRAVE` constant (for `a11y-check` and `shoot`) |
| `a11y-check` can't connect | It defaults to port 5199. Run `npx vite --port 5199`, or pass `http://localhost:5173/` as the first argument |
| `cwebp: command not found` | `brew install webp` |
| Contact form says "Couldn't send" | FormSubmit hasn't been activated for the address (check the inbox for "Activate form"), or the visitor is offline |
| Push didn't deploy | Only pushes to `main` deploy. Check the Actions tab: a failing `verify` stops the deploy. Make sure every new file under `public/` and `src/` is committed, because verify checks the files on disk in CI |
| `npm ci` fails in CI | `package-lock.json` is out of sync with `package.json`. Run `npm install` locally and commit the lockfile |
| Custom domain shows a GitHub 404 or loses HTTPS | Re-enter the domain in Settings → Pages, and check the DNS records and the Cloudflare SSL mode (see [Deployment](#deployment)) |
| Theme doesn't follow the OS after the first visit | Known issue. `useTheme` writes `localStorage.theme` on mount, so its "follow the OS until the visitor chooses" listener never attaches, and the first visit's choice sticks. Clear the `theme` key to reset. Fixing it means writing to storage only in `toggle` |

---

<a id="rules-for-editors"></a>
## Rules for anyone (or any AI) editing this repo

**Content rules from the owner**

- No availability or solicitation phrasing anywhere: no "open to work", "hire me", "available for freelance" or similar.
- No self-assigned skill percentages, levels, bars or star ratings, and no unmeasurable metrics. Show evidence instead: shipped apps, store links, and per-technology project counts. The About stats are counts taken from the data, and each links to its evidence.
- Keep descriptions factual. Don't invent users, metrics or outcomes.
- NNine Solution is a prior employer (Nov 2024 — Feb 2026), and Drop is the current one. Work projects are linked to them through `experience.json → projects`.

**Technical invariants**

- One `<Canvas>` for the whole page.
- Keep `powerPreference: 'default'`.
- Keep HeroStill as the default state. The 3D rail replaces it only after a real first frame.
- Keep `data-lenis-prevent` on dialog scroll containers.
- Keep `railFrom()` pure, and keep `scripts/rail.test.mjs` passing.
- Keep the copied code in `scripts/export-projects.mjs` (`LABEL`, the heading heuristic, the About text) in sync with `src/data/index.js` and `About.jsx`.
- Run `npm run verify` before pushing. CI runs it too, and blocks the deploy on failure.
