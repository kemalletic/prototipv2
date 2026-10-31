# Photography direction & placeholder imagery

## What's in the prototype
No image-generation service or stock-photo host was reachable from the build environment, and inventing
"photos" of non-existent products would misrepresent inventory anyway. So every image was produced by a
**procedural virtual studio** (`scripts/assets/`), rendered in headless Chromium:

- Each garment template (tee, polo, crew knit, 5-pocket jeans/chinos/cargo, joggers, trucker/chore jacket, bomber,
  puffer and puffer vest, track top/hoodie, knit vest, belt, beanie, socks, scarf) is built from per-part height
  domes, fold and seam creases, and stitch and hardware detail.
- Procedural fabrics include denim twill with per-warp dye variation, jersey, rib, knit, fleece, nylon, wool,
  corduroy, canvas, leather and webbing.
- One soft-box lighting model gives every product the same light, which is the property real photography must keep.
- Outputs: 4:5 transparent cut-outs (front and back), 1:1 fabric macros, and per-fabric normal/material maps for
  the WebGL viewer. 272 images, about 16 MB of WebP.

The UI labels these as illustrative renders (PDP footnote, prototype notice and About page).

## Brief for the real shoot
**Product (ghost mannequin)**
- Front and back of every colourway, 4:5, garment centred, about 6–8% margin. The neck (tops) or waistband
  (bottoms) sits at a consistent height. Record it per product as `art.anchorY` so the garment hangs on the rail.
- Deliver as transparent cut-outs (WebP/AVIF with alpha, at least 2000 px tall) plus a soft natural contact shadow,
  or shoot on the plaster tone `#ECE7DE`.
- Light: large soft source from the upper left, gentle fill, no hard specular. Match across the whole catalogue.

**Fabric close-ups**
- 1:1 macro at about 40 mm field of view, raking light at about 30° to reveal weave, one per colourway.
- Optional: a normal map captured by photometric stereo (4 light directions) for the relighting viewer.

**Editorial and campaign**
- Sarajevo locations with quiet modernist architecture, Baščaršija copper workshops at off-hours, and Trebević and
  Igman at golden hour. Natural light, warm but not orange; real men of varied ages and builds; garments worn
  slightly lived-in.
- Outfit images that match the Složi look combinations (same SKUs).

**File naming**: `public/media/p/{slug}/{colour-id}-front.webp`, `-back.webp` and `-detail.webp` (or point the
`media` helpers in `lib/catalog/data.ts` at a CDN).
