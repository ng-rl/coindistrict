# CoinDistrict

> A horizontal crypto district you cruise: plots are projects, left = biggest market cap, tower height = on-chain volume (log), weekly rent keeps the lights on, every 7th plot is a paid ad.

Live: https://coindistrict.netlify.app · Drive space: `Spaces/coin-district` (THESIS, SPEC, HEIGHT, CREATIVE FRAME, CRAFT REFS)

## What this build is

Per the CREATIVE FRAME pivot: **one continuous WebGL night city is the whole stage**, product chrome is a HUD on top. No CSS boxes, no DOM card strip, no per-plot canvases, no screenshot-as-UI.

- **Stage** — React Three Fiber scene: ranked towers on the rank axis (+X), a procedural backdrop city behind them, wet-street reflection, street lamps, horizon haze, stars, fog, bloom.
- **Facades** — one custom shader draws windows procedurally on a world-unit grid, so density is constant across any tower size. Lit windows are emissive and bloom. Per-instance attributes carry tint, lit ratio, glow, breathing phase, and dim.
- **Rank axis** — L→R by market cap. Camera only moves along X. Drag with inertia + snap-to-plot, trackpad/wheel, arrow keys. Tap a tower to open its sheet.
- **Height** — `log10(volume24h)` normalised across the street and lerped into `[H_MIN, H_MAX]` (HEIGHT doc). Ads use a fixed rate-card height.
- **Life signals** — PAID: mint-leaning windows that breathe (2.4 s, staggered by plot index × 120 ms) plus a mint crown light. DUE: cold grey glass, 16 % lit, dimmed facade, no breath. AD: gold windows + gold storefront billboard. Backdrop city is quiet pale glass so mint stays the one accent.
- **HUD** — Header + LegendBar float over the stage; crown ticker badges (mint / gold) track each tower; FocusCard shows the plot under the thumb; RankRail is a transit-map strip of the whole street (tap to jump); TabBar; PlotSheet.
- **ShareCard** — composes the live WebGL frame into a 1080×1350 PNG with brand, legend, and the focused plot. Uses the Web Share API when available, otherwise downloads.
- `prefers-reduced-motion` disables breathing and the intro dolly.

## Design tokens (locked)

```css
--cd-bg: #0B0B0C   --cd-surface: #141416   --cd-line: #222226
--cd-text: #F4F4F5 --cd-muted: #8B8B93
--cd-mint: #3DFF9A (paid / active / brand — the ONE accent)
--cd-ad: #E8C36A   (sponsored plots only)
--cd-due: #FF6B6B  (rent due)
```

## Tuning knobs

| What | Where |
| --- | --- |
| Plot spacing, height range, ad height, camera framing, fog | `src/city/constants.ts` |
| Height curve, massing / setbacks, masts | `src/city/layout.ts` |
| Window size, facade brightness, breathing, reflection fade | `src/city/shaders.ts`, `src/city/FacadeMaterial.ts` |
| Per-kind window treatment (PAID / DUE / AD) | `kindStyle()` in `src/city/Towers.tsx` |
| Backdrop rows (depth, height, density) | `generateBlocks()` in `src/city/Backdrop.tsx` |
| Bloom / vignette | `EffectComposer` in `src/city/CityStage.tsx` |
| Swipe physics, snap, wheel, keys | `src/city/StreetController.ts` |

## Project structure

```
src/
├── city/
│   ├── CityStage.tsx        # Canvas, scene, post-processing, tap picking, crown labels
│   ├── Towers.tsx           # ranked towers (instanced), reflection pass, masts, crown lights, billboards, focus outline
│   ├── Backdrop.tsx         # filler city, lamps, stars, haze, rank curb line
│   ├── Ground.tsx           # street shader
│   ├── CameraRig.tsx        # camera on the rank axis + intro dolly
│   ├── StreetController.ts  # drag / inertia / snap / wheel / keyboard
│   ├── FacadeMaterial.ts    # shader material + instanced attribute helpers
│   ├── shaders.ts           # facade / ground / haze GLSL
│   ├── layout.ts            # log height, massing, tower specs
│   └── constants.ts         # world layout, camera, palette (linear)
├── components/              # Header, LegendBar, TabBar, FocusCard, RankRail, PlotSheet, ShareCard, ...
├── data/mockData.ts         # 20 coins + ad inventory (live mcap/volume later)
└── types.ts
scripts/shots.mjs            # headless visual QA (phone + iPad, swipe, ad, sheet)
```

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # tsc -b && vite build → dist/
npm run preview
```

Visual QA (what Fran gates): build, `npx vite preview --port 4173`, then
`CHROME_PATH=/path/to/chrome node scripts/shots.mjs ./shots` (needs `playwright`).
In the browser console `__coindistrict.goTo(i, 0)` jumps the street to plot `i`.

## Deploy

Netlify static site (`netlify.toml`): build `npm run build`, publish `dist/`, SPA redirect.
