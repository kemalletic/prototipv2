# Quality assurance report

Measured on the production build (`next build && next start`) in a cloud container with headless Chromium 1243.
These are **lab results, not field data**.

## Automated tests: `npm run test:e2e`
**102 / 102 passing** on two projects: Desktop Chrome at 1440×900, and Pixel 7 mobile emulation.

| Spec | Covers |
|---|---|
| `routes.spec.ts` | 28 routes: HTTP 200, an `<h1>`, **no console errors, no horizontal overflow**. Also a designed 404 and every internal link on the homepage resolving. |
| `shopping.spec.ts` | Size required on PDP; add to cart and drawer; colour change updates gallery and URL; cart quantity, free-shipping threshold and removal; full guest COD checkout (validation, focus on first error, city→ZIP autofill, submission, confirmation, analytics funnel, cart cleared); recoverable server error that keeps form data; empty checkout; API re-pricing and rejection of tampered lines (409) and invalid input (422). |
| `discovery.spec.ts` | URL-synced filters and clearing; price sort; diacritic-insensitive search and its empty state; wishlist persistence; rail category tabs; look composer cycling and size validation; size-guide estimate selecting a size; consent banner with equal choices. |
| `a11y.spec.ts` | axe-core WCAG 2.0/2.1 A + AA on home, category, PDP, checkout, FAQ and cart: **0 violations**. |

Issues these tests found and fixed during QA:
- The cart drawer reopened on every page load because its UI state was persisted. It is now in-memory.
- `bs-BA` currency formatting differed between runtimes (`BAM 249.00` vs `249,00 KM`) and broke hydration.
  It now uses a deterministic formatter.
- Horizontal overflow on mobile in the look composer and the info pages (missing `min-w-0`).
- Contrast of `ink-3` on `plaster-2` (4.2:1). The token was darkened to `#5F574D`.
- Label-in-name mismatches (logo, search, cart, card image links).
- CSS margin collapse that misaligned rail labels and hooks.
- CLS 0.115 on checkout and cart empty states (reserved height).

## Lighthouse 13 (single runs; mobile = simulated slow 4G + 4× CPU slowdown)
| Page | Mode | Perf | LCP | CLS | TBT | A11y | Best pr. | SEO |
|---|---|---|---|---|---|---|---|---|
| `/` | mobile | 93 | 3.2 s | 0 | 80 ms | 100 | 100 | 66 |
| `/` | desktop | 100 | 0.3 s | 0.002 | 10 ms | 100 | 100 | 66 |
| `/kolekcija/traperice` | mobile | 90 | 3.6 s | 0 | 110 ms | 99 | 100 | 69 |
| `/kolekcija/traperice` | desktop | 100 | 0.8 s | 0 | 0 ms | 100 | 100 | 69 |
| `/proizvod/neretva-ravne-traperice` | mobile | 88 | 3.8 s | 0 | 110 ms | 100 | 100 | 69 |
| `/proizvod/neretva-ravne-traperice` | desktop | 99 | 0.9 s | 0.011 | 0 ms | 100 | 100 | 69 |
| `/naplata` | mobile | 94 | 3.0 s | 0 | 140 ms | 100 | 100 | 63 |
| `/naplata` | desktop | 100 | 0.2 s | 0 | 0 ms | 100 | 100 | 63 |

**SEO 63–69 is intentional.** The only failing audit is `is-crawlable`, because the prototype sets `noindex` and
robots disallows all. Product JSON-LD, canonical URLs, metadata and a sitemap are in place for launch.

**Mobile LCP above 2.5 s in the lab.** The LCP element is a product image whose observed load is about 50 ms. The
simulated figure is dominated by throttled transfer of the CSS, fonts (≈129 KB) and framework JS (≈190 KB) on
1.6 Mbps. Optimisations already applied:
- Archivo self-hosted as one Bosnian-subset variable file (172 → 72 KB).
- Secondary fonts not preloaded.
- `fetchPriority="high"` only on the true LCP candidates.
- All product and category pages statically prerendered.
- Images served as resized WebP.
- No animation or 3D libraries.

Further options: real CDN/edge caching, AVIF for photography, trimming the editorial serif, and measuring real-user
LCP (expected to be considerably lower on typical BiH 4G and broadband) with `web-vitals` before optimising further.
INP was not measured in the lab. TBT stays at or below 140 ms, and interactions are cheap: the rail physics only
writes `transform`, and filters are memoised.

## Manual / visual review
Every key screen was reviewed by screenshot at 1440×900 and 390×844, scrolling through with lazy content triggered:
home, category, PDP, cart drawer, checkout (empty, error and filled states), confirmation, search, mobile menu,
filter sheet, size guide, zoom viewer and info pages. The View Transition from rail garment to PDP was verified to
start with the shared `garment-*` name (`scripts/qa/vt.mjs`).

## Known limitations
- The view-transition morph needs a browser with the View Transitions API. Other browsers navigate normally.
- CSS scroll-driven reveals need `animation-timeline` support. Without it, content is simply visible.
- Prefetched (`<Link prefetch>`) product pages give the smoothest morph. A cold navigation may cross-fade instead.
- The demo order confirmation only exists in the browser where it was placed.
- No real-device testing (iOS Safari, low-end Android) was possible in this environment. Do this before launch.
