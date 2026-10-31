# KROJ: menswear storefront prototype (BiH, 2027)

A runnable, frontend-first e-commerce prototype for a men's clothing brand in Bosnia and Herzegovina.
Prices are in KM (BAM), and payment is cash on delivery (*pouzeće*). **KROJ** is a temporary brand name.

> **Prototype status.** All products, prices, stock and policies are sample data. Product images are *illustrative
> renders* from a procedural virtual studio, not photographs of inventory. Orders are **not** sent: the mock API
> validates and re-prices the order, then returns a demo number. See [docs/BACKEND_INTEGRATION.md](docs/BACKEND_INTEGRATION.md).

## Run it

Requirements: Node 22+ (tested on 22.23).

```bash
npm install
npm run build && npm run start      # production server at http://localhost:3000 (recommended)
# or
npm run dev                         # development server
```

| Script | What it does |
|---|---|
| `npm run build` / `start` | Production build (77 prerendered pages) and server |
| `npm run test:e2e` | Playwright end-to-end, route and axe accessibility tests, desktop and mobile (starts a server on :3100 if none is running) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run assets` | Re-renders product imagery (`-- --force` to overwrite, `-- --only <slug>`) |

QA helpers live in `scripts/qa/`, for example `scripts/qa/serve.sh` (restart the production server on :3100),
`scrollshots.mjs` (scroll-through screenshots), `flow.mjs` (purchase smoke test) and `vt.mjs` (view-transition check).

To test the checkout **error state**, enter a name containing `#greska`; the mock API then returns 503.

## What's inside

- **Creative direction**: [docs/DESIGN.md](docs/DESIGN.md). Three explored directions, the chosen *"Ormar"* (wardrobe)
  concept, the design system and motion principles.
- **Signature interaction: the Rail.** The homepage opens on a clothes rail. It uses native horizontal scroll (no
  hijacking), and every garment is a damped pendulum driven by scroll velocity and pointer movement. Category tabs
  re-hang the rail with a view transition, and selecting a garment morphs it into the product page (React
  `<ViewTransition>`).
- **Složi look**: an outfit composer that cycles layers, shows a running total, and adds the whole look in one step
  (sizes required). It is reused as *Upotpuni look* on product pages.
- **Tkanina izbliza**: a roughly 2 KB WebGL shader that relights the fabric under your finger or cursor, using
  per-fabric normal and material maps tinted to the selected colourway. A static image is the fallback.
- **Commerce**: category pages with URL-synced filters (size/colour/cut/material/price) and sorting. The product page
  has a gallery, zoom, colourways, size and stock states, a size guide with fit estimator, a delivery window and a
  sticky mobile buy bar. Also: search (diacritic-insensitive, *dzemper* finds *Džemper*), wishlist, cart drawer and
  page, guest COD checkout with inline validation, a recoverable error state, and an order confirmation that
  separates *submitted* from *confirmed* and *delivered*.
- **Supporting pages**: about (including a prototype disclosure), contact, shipping, returns, size guide, FAQ
  (with FAQPage JSON-LD), privacy, terms, cookies, and a designed 404.
- **Analytics**: consent-gated, GA4-compatible events. See [docs/ANALYTICS.md](docs/ANALYTICS.md).

## Stack and why

| Choice | Reason |
|---|---|
| **Next.js 16.4** (App Router, Cache Components, Partial Prefetching) | Static prerendering of every product and category page, file-based routing, image optimisation, and React's `<ViewTransition>` integration for shared-element morphs without an animation library |
| **React 19.3, TypeScript** | Type-safe catalogue, stores and components |
| **Tailwind CSS 4** | Design tokens in `@theme` (`app/globals.css`), no runtime CSS |
| **No animation or 3D library** | Motion comes from CSS (including scroll-driven `animation-timeline: view()` as progressive enhancement), the View Transitions API, a small rAF spring for the rail, and raw WebGL for the fabric viewer. Three.js or GSAP would add 60–150 KB for effects this small. |
| **No state library** | Cart, wishlist and consent use `useSyncExternalStore` over localStorage (`lib/store/persisted.ts`) |
| **Playwright + axe-core** | E2E, route and WCAG 2.1 AA checks on desktop and mobile |

Fonts: **Archivo**, self-hosted as one variable woff2 (weight and width axes) subset to the glyphs Bosnian needs:
72 KB instead of about 172 KB. Rebuild with `scripts/fonts/subset-archivo.py`. **Newsreader** italic and
**IBM Plex Mono** come via `next/font/google` without preload.

## Project structure

```
app/                     routes (bs-BA URLs: /kolekcija/[kategorija], /proizvod/[slug], /korpa, /naplata, …)
  api/narudzbe/          MOCK order endpoint (validates + re-prices; nothing stored)
components/
  home/                  Rail (signature), LookBuilder
  product/               ProductCard, CategoryBrowser, ProductView, FabricViewer, SizeGuide
  checkout/, commerce/   checkout form, cart, confirmation, wishlist, search
  layout/                header, footer, search dialog, cart drawer, consent banner
  ui/                    icons, sheet (native <dialog>), class recipes
lib/
  catalog/data.ts        SAMPLE catalogue (44 products, 95 colourways): single source for site + asset pipeline
  catalog/filters.ts     facets, filtering, sorting
  checkout.ts            shared validation, phone normalisation, server-side re-pricing
  commerce.ts            shipping/returns rules (sample values)
  store/                 cart, wishlist, demo orders
  analytics.ts           consent-gated event tracking
scripts/assets/          virtual-studio renderer (Chromium canvas → WebP)
public/media/            rendered product images, fabric macros, normal/material maps
tests/e2e/               Playwright specs
docs/                    DESIGN, BACKEND_INTEGRATION, ANALYTICS, PHOTOGRAPHY, QA
```

## Replacing the placeholder imagery

The UI reads images by convention: `/media/p/{slug}/{colour}-front.webp`, `-back.webp` and `-detail.webp`
(see `media` in `lib/catalog/data.ts`). Drop real photographs in with the same names, ideally transparent
ghost-mannequin cut-outs at 4:5 (see [docs/PHOTOGRAPHY.md](docs/PHOTOGRAPHY.md)), and set each product's
`art.anchorY` (the neck or waistband height as a fraction of image height) so garments hang correctly on the rail.
Then delete the `art` fields and `scripts/assets/`.

## Measured quality (lab, not field data)

See [docs/QA.md](docs/QA.md). In summary: 102/102 Playwright tests pass (desktop and mobile), with zero axe WCAG
2.1 AA violations on the tested pages. Lighthouse desktop performance is 99–100 (LCP 0.2–0.9 s, CLS ≤ 0.011).
Lighthouse mobile (simulated slow 4G and a 4× CPU slowdown) scores 88–94, with LCP 3.0–3.8 s and CLS 0. Lab numbers
are not real-user Core Web Vitals; collect field data with RUM after launch.
