# KROJ — Creative Direction & Design Rationale

> Working brand name: **KROJ** (Bosnian: *cut*, as in the cut of a garment, a tailoring pattern).
> It is a temporary concept. A trademark and domain check is required before it is used publicly.

## 1. What the reference teaches (and what we refuse to copy)

`references/inspiration.mp4` is a 19-second phone capture of a sneaker store. It shows a wall of shoes on acrylic shelves under warm light. Clicking one dollies the camera into that shelf, and the shoe becomes the hero. On the right sit a price, a size select and a pill-shaped "add to bag", and that is the whole interface.

What makes it memorable is not the 3D, it is **spatial continuity**:

1. **The store is a place, not a list of pages.** The product grid *is* a physical display. Selecting a product
   moves you *into* that space, and neighbouring products stay visible at the edges, so you never feel lost.
2. **Radical UI restraint.** The product gets about 80% of the pixels. Commerce controls are compact and always in
   the same position.
3. **Ruthless photographic consistency.** Same light, same angle, same plinth. Consistency reads as quality.

We take the three principles and leave the look behind: no dark taupe room, no acrylic shelves, no sneaker plinths,
no orange LED strip. Shoes live on shelves, but **menswear lives on a rail**. That is our starting point.

## 2. Three directions explored

### A — "Ormar" (The Wardrobe)
*Personality:* calm, tactile, quietly confident, like a well-kept wardrobe in a Sarajevo flat with good light.
*Art direction:* warm plaster walls, an oiled-brass hanging rail, garments on hangers shot as ghost-mannequin cut-outs.
*Type:* a variable grotesk that shifts from condensed (labels, like woven garment tags) to normal (reading), plus a
mono for measurements.
*Signature:* **The Rail.** The homepage opens on a real clothes rail you can drag or scroll natively. Garments sway on
their hooks with spring physics when touched. Selecting one lifts it off the rail and *morphs* it into the product page
(a shared-element view transition), with the rail's neighbours still in the frame.
*Mobile:* the rail is a native horizontal scroller with snap. Hanging garments are tall, which is already a phone
shape.
*Trade-offs:* the hanging metaphor needs very consistent cut-out imagery (a photography constraint, documented).
Low risk: native scroll, no hijacking, and products are reachable in one tap.

### B — "Krojačnica" (The Cutting Table)
*Personality:* precise, technical, workwear-intellectual. Tailor's chalk, pattern paper, tech-pack drawings.
*Signature:* an **outfit composer** as the hero. You build a look layer by layer on a cutting table.
*Trade-offs:* very conversion-friendly (it raises AOV), but as a *first* impression it asks for effort before
showing product. Chalk and pattern graphics risk tipping into theme-park craft.

### C — "Beton & Indigo"
*Personality:* bold, local, architectural. Yugoslav modernist poster typography, full-bleed fabric.
*Signature:* a WebGL fabric surface that relights under the cursor as the hero.
*Trade-offs:* highly distinctive, but product comes second, and a WebGL hero hurts LCP on the mid-range Android phones
that dominate the BiH market. Poster typography also ages quickly.

### Evaluation

| Criterion (1–5) | A Ormar | B Krojačnica | C Beton |
|---|---|---|---|
| Memorability | 5 | 4 | 5 |
| Originality for menswear | 5 | 4 | 3 |
| Product visibility | 5 | 3 | 2 |
| Mobile conversion | 5 | 4 | 3 |
| Performance risk (5 = low) | 5 | 5 | 2 |
| Longevity | 5 | 3 | 2 |

**Chosen: A — "Ormar".** We also absorb the best of B and C where they *serve shopping*:

- B's composer becomes **"Složi look" (Compose the look)**, a secondary homepage module and the source of
  *complete-the-look* on product pages. It raises AOV honestly, by showing real items that go together.
- C's relightable fabric becomes **"Tkanina izbliza" (Fabric up close)** on product pages: a tiny WebGL relighting
  viewer (no Three.js) that shows weave and texture, the thing online clothing shoppers miss most. A static image is
  the fallback.

## 3. Design system

### Colour: a wardrobe in daylight
| Token | Hex | Role |
|---|---|---|
| `plaster` | `#ECE7DE` | Page background: warm plaster wall |
| `paper` | `#F6F3EE` | Raised surfaces: cards, drawers, inputs |
| `stone` | `#D8D0C2` | Hairlines, dividers, disabled |
| `ink` | `#1C1A17` | Primary text, primary buttons |
| `ink-2` | `#4A453E` | Secondary text (≥ 7:1 on plaster) |
| `ink-3` | `#6B6358` | Tertiary text and meta (≥ 4.5:1 on plaster) |
| `brass` | `#A3864F` | The rail and small metal details only |
| `copper` | `#8E4A28` | Accent, focus and active states (*Kazandžiluk*, Sarajevo's coppersmiths' street) |
| `night` | `#1F2633` | Indigo-night sections (the denim chapter), used sparingly |

No gradients as decoration. The only gradients are physical: light falling on the wall behind the rail, and metal on
the rail itself.

### Typography
- **Archivo** (variable, `wdth` 62–125, `wght` 100–900). Condensed heavy caps for labels and display, like woven
  garment labels. Normal width for UI and body. One family with a real width axis gives range without visual noise.
- **Newsreader** (italic only) for short editorial lines: the human voice of the brand.
- **IBM Plex Mono** for measurements, sizes and reference codes. Tailoring is numbers, so numbers get their own voice.
- All three cover Latin Extended (č ć đ š ž).

Scale (fluid, `clamp()`): display 56→168px condensed 800; h1 40→88; h2 28→48; body 16/1.55; small 13; label 11–12
mono uppercase with +0.08em tracking.

### Space & layout
A 4px base and a 12-column grid with 20px (mobile) / 32px (desktop) gutters. Page margins use `clamp(20px, 4vw, 56px)`.
Hairline dividers (1px `stone`) instead of boxes and shadows. Cards have no borders: the garment *is* the card.

### Motion principles
1. **Garments have weight.** Physical objects (hangers, garments) move on springs and settle with one or two soft
   oscillations. They never snap.
2. **The interface is tailored.** UI state changes take 160–240ms with `cubic-bezier(.2,.7,.1,1)` ("tailor ease").
   Nothing bounces except cloth.
3. **Continuity over cuts.** A product keeps its identity across screens through shared-element morphs (rail → PDP,
   card → PDP).
4. **Reveal, don't perform.** Scroll reveals use CSS scroll-driven animation: they play once, are subtle (12–24px), and
   never hijack scrolling. Content is fully visible without them.
5. **Reduced motion.** With `prefers-reduced-motion`, sway, morphs and reveals are off and simple opacity fades
   remain. Every animated surface has a static equivalent.

### Signature interactions (summary)
1. **The Rail** (homepage hero): a native-scroll hanging rail with spring sway, category jump-tabs, and a
   lift-and-morph into the product page.
2. **Složi look**: compose an outfit by cycling layers, see the running total in KM, add the whole look in one tap.
3. **Tkanina izbliza**: relight the fabric under your finger or cursor.

## 4. Photography direction (for the real shoot)
See `docs/PHOTOGRAPHY.md`. Every placeholder image in this prototype was rendered procedurally from the same
"virtual studio" (same light and backdrop) so the interface could be designed for photographic consistency.
**They are illustrative renders, not photographs of inventory.** The UI labels them as such.

## 5. Language & market
UI copy is in Bosnian (Latin script), prices are in KM (BAM) with `bs-BA` formatting, and the only payment method is
pouzeće (cash on delivery). Code, docs and comments are in English.
