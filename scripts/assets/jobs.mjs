// Builds render jobs from the shared catalogue (lib/catalog/data.ts).
import { PRODUCTS, media } from '../../lib/catalog/data.ts';

// Macro field of view per fabric (mm per px at 900px → FOV = 900 × value)
const MACRO = {
  denim: 0.045, chino: 0.035, jersey: 0.028, heavyjersey: 0.032, melange: 0.03, fleece: 0.05, rib: 0.07,
  knit: 0.1, fineknit: 0.05, nylon: 0.06, puffer: 0.06, wool: 0.05, cord: 0.07, canvas: 0.04, leather: 0.06, webbing: 0.05,
};

export function buildJobs() {
  const jobs = [];
  PRODUCTS.forEach((p, pi) => {
    p.colorways.forEach((c, ci) => {
      const params = { ...(p.art.params || {}), ...(c.art || {}), color: c.hex };
      const seed = 11 + pi * 7 + ci;
      jobs.push({ garment: p.art.garment, view: 'front', params, seed, out: media.front(p, c).slice(1) });
      if (p.art.back) jobs.push({ garment: p.art.garment, view: 'back', params, seed, out: media.back(p, c).slice(1) });
      const fabric = params.fabric || p.fabric;
      jobs.push({
        kind: 'macro', fabric, color: c.hex, color2: params.color2 || (fabric === 'denim' ? '#dfe3e8' : undefined),
        mmPerPx: MACRO[fabric] * (params.scale ? 1 / params.scale : 1), w: 800, h: 800, seed, out: media.detail(p, c).slice(1),
        normals: false,
      });
    });
  });
  // per-fabric normal + material maps for the WebGL relighting viewer
  const fabrics = new Set();
  PRODUCTS.forEach((p) => p.colorways.forEach((c) => fabrics.add((c.art && c.art.fabric) || (p.art.params && p.art.params.fabric) || p.fabric)));
  fabrics.forEach((f) => jobs.push({ kind: 'macro', fabric: f, color: '#bbbbbb', color2: '#ffffff', mmPerPx: MACRO[f] * 1.2, w: 640, h: 640, seed: 5, normals: true, out: `media/fabric/${f}.webp` }));
  return jobs;
}
