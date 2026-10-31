/* KROJ virtual studio — browser-side garment renderer.
 * Runs inside headless Chromium (see render.mjs). Produces consistent, clearly
 * illustrative product renders: per-part height domes + folds + seams, procedural
 * fabric micro-structure, and a single soft-box lighting model.
 * These are placeholders for real photography — never presented as photos. */
(function () {
  'use strict';

  // ---------- math / noise ----------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };
  let SEED = 1;
  function hash(ix, iy) {
    let h = (ix * 374761393 + iy * 668265263 + SEED * 1442695041) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h = h ^ (h >>> 16);
    return (h >>> 0) / 4294967295;
  }
  function vnoise(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
    return mix(mix(a, b, ux), mix(c, d, ux), uy);
  }
  function fbm(x, y, oct) {
    let s = 0, a = 0.5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { s += a * vnoise(x * f, y * f); n += a; a *= 0.5; f *= 2.03; }
    return s / n;
  }
  function cell(x, y) { // distance to nearest feature point (worley F1)
    const ix = Math.floor(x), iy = Math.floor(y);
    let md = 9;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const px = ix + i + hash(ix + i, iy + j), py = iy + j + hash(iy + j + 91, ix + i + 17);
      const d = (px - x) * (px - x) + (py - y) * (py - y);
      if (d < md) md = d;
    }
    return Math.sqrt(md);
  }
  function hex(c) {
    const n = parseInt(c.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.pow(v / 255, 2.2)); // linear
  }
  const toSRGB = (v) => Math.round(255 * Math.pow(clamp(v, 0, 1), 1 / 2.2));

  // ---------- fabrics ----------
  // Each fabric samples at (u,v) in millimetres with pxPerMm (for anti-aliasing).
  // Writes: F.h (micro height), F.m (brightness mult), F.w (0..1 mix towards secondary colour), F.spec, F.rough
  const F = { h: 0, m: 1, w: 0, spec: 0, gloss: 12 };
  const aa = (periodMm, ppm) => smooth(1.6, 4.5, periodMm * ppm);

  const FABRICS = {
    denim(u, v, ppm) {
      const p = 0.9; // twill wale spacing in mm (exaggerated slightly)
      const k = aa(p, ppm);
      const jit = (vnoise(u * 0.25, v * 0.25) - 0.5) * 0.12;
      const d = (u + v * 0.55) / p + jit;
      const tw = Math.sin(d * Math.PI * 2) * 0.5 + 0.5;
      const warp = hash(Math.floor(u / 0.24), 7); // per warp-thread dye variation (ring dyeing)
      const kk = smooth(2, 6, p * ppm);
      const slub = fbm(u * 0.9, v * 0.035, 3); // irregular warp yarn → vertical streaks
      const mott = fbm(u * 0.05, v * 0.05, 3);
      const thread = vnoise(u * 3.2, v * 0.25);
      F.h = (tw - 0.5) * 0.9 * k + (thread - 0.5) * 0.25;
      F.m = 0.9 + (slub - 0.5) * 0.16 + (mott - 0.5) * 0.1 + (warp - 0.5) * 0.22 * kk;
      F.w = clamp((1 - tw) * 0.28 * k + (slub > 0.66 ? (slub - 0.66) * 0.5 : 0) + (1 - k) * 0.05, 0, 1);
      F.spec = 0.02; F.gloss = 8;
    },
    chino(u, v, ppm) {
      const p = 0.6, k = aa(p, ppm);
      const tw = Math.sin(((u + v * 0.7) / p) * Math.PI * 2) * 0.5 + 0.5;
      const mott = fbm(u * 0.08, v * 0.08, 3);
      F.h = (tw - 0.5) * 0.5 * k + (vnoise(u * 2, v * 2) - 0.5) * 0.15;
      F.m = 0.95 + (mott - 0.5) * 0.08 + (tw - 0.5) * 0.05 * k;
      F.w = 0; F.spec = 0.03; F.gloss = 10;
    },
    jersey(u, v, ppm) {
      const pw = 0.7, pc = 0.55, k = aa(pc, ppm);
      const col = u / pw, row = v / pc;
      const fx = col - Math.floor(col) - 0.5;
      const fy = row - Math.floor(row);
      const vshape = Math.abs(fx) * 2 - (fy - 0.5) * 0.6; // V loops
      const loop = Math.sin(vshape * Math.PI) * 0.5 + 0.5;
      const mott = fbm(u * 0.06, v * 0.06, 3);
      F.h = (loop - 0.5) * 0.6 * k + (mott - 0.5) * 0.3;
      F.m = 0.96 + (mott - 0.5) * 0.08;
      F.w = 0; F.spec = 0.015; F.gloss = 6;
    },
    heavyjersey(u, v, ppm) {
      FABRICS.jersey(u * 0.8, v * 0.8, ppm);
      F.m += (fbm(u * 0.3, v * 0.3, 2) - 0.5) * 0.05;
    },
    melange(u, v, ppm) { // heathered jersey/fleece
      FABRICS.jersey(u, v, ppm);
      const fib = fbm(u * 1.6, v * 0.5, 3);
      F.w = clamp((fib - 0.42) * 2.6, 0, 1) * 0.55;
    },
    fleece(u, v, ppm) {
      const n = fbm(u * 0.9, v * 0.9, 4);
      const mott = fbm(u * 0.05, v * 0.05, 3);
      F.h = (n - 0.5) * 0.7;
      F.m = 0.94 + (n - 0.5) * 0.1 + (mott - 0.5) * 0.06;
      F.w = 0; F.spec = 0.01; F.gloss = 4;
    },
    rib(u, v, ppm) {
      const p = 2.2, k = aa(p, ppm);
      const r = Math.sin((u / p) * Math.PI * 2);
      const r2 = Math.pow(Math.abs(r), 0.6) * Math.sign(r);
      F.h = r2 * 1.2 * k + (vnoise(u * 1.3, v * 1.3) - 0.5) * 0.2;
      F.m = 0.92 + r2 * 0.07 * k;
      F.w = 0; F.spec = 0.01; F.gloss = 6;
    },
    knit(u, v, ppm) { // chunky stockinette: stacked chevrons
      const pw = 4.2, ph = 3.4, k = smooth(4, 10, ph * ppm);
      const col = u / pw, row = v / ph;
      const fx = col - Math.floor(col) - 0.5;
      const ci = Math.floor(col);
      const fy = row - Math.floor(row) + Math.abs(fx) * 0.9;
      const leg = Math.abs(fx) * 2; // two legs per stitch
      const st = Math.sin(clamp(leg, 0, 1) * Math.PI) * Math.sin(((fy % 1) + 1) % 1 * Math.PI);
      const yarn = fbm(u * 0.8 + ci * 7.1, v * 0.8, 2);
      const wale = Math.sin((u / pw) * Math.PI * 2) * (1 - k); // at distance, knit reads as soft wales
      F.h = (st - 0.35) * 1.8 * k + (yarn - 0.5) * 0.6 + wale * 0.35;
      F.m = 0.86 + st * 0.18 * k + (yarn - 0.5) * 0.1 + wale * 0.025 + (1 - k) * 0.06;
      F.w = 0; F.spec = 0.01; F.gloss = 5;
    },
    fineknit(u, v, ppm) { // merino gauge
      FABRICS.knit(u * 2.6, v * 2.6, ppm * 0.38);
      F.h *= 0.6;
      F.m = 0.92 + (F.m - 0.92) * 0.6;
    },
    cable(u, v, ppm) { // knit with vertical cable panels
      FABRICS.knit(u, v, ppm);
      const pan = ((u % 46) + 46) % 46;
      if (pan > 14 && pan < 32) {
        const cx = (pan - 23) / 9; // -1..1
        const tw = Math.sin((v / 34) * Math.PI * 2);
        const strand = Math.cos((cx - tw * 0.5) * Math.PI) * 0.5 + 0.5;
        const strand2 = Math.cos((cx + tw * 0.5) * Math.PI) * 0.5 + 0.5;
        const s = Math.max(strand, strand2);
        F.h = F.h * 0.4 + (s - 0.4) * 3.2;
        F.m = 0.82 + s * 0.22;
      } else if (Math.abs(pan - 12) < 1.4 || Math.abs(pan - 34) < 1.4) {
        F.h -= 1.4; F.m *= 0.85; // purl channels
      }
    },
    nylon(u, v, ppm) { // ripstop with sheen
      const p = 5, k = aa(p, ppm);
      const gx = Math.abs(((u / p) % 1 + 1) % 1 - 0.5), gy = Math.abs(((v / p) % 1 + 1) % 1 - 0.5);
      const grid = gx > 0.46 || gy > 0.46 ? 1 : 0;
      const km = smooth(10, 20, p * ppm); // ripstop grid only visible in macro
      F.h = grid * 0.35 * km + (vnoise(u * 0.6, v * 0.6) - 0.5) * 0.1;
      F.m = 0.98 - grid * 0.04 * km;
      F.w = 0; F.spec = 0.1; F.gloss = 16;
    },
    wool(u, v, ppm) { // flannel / melton
      const n = fbm(u * 1.4, v * 1.4, 4), m = fbm(u * 0.1, v * 0.1, 3);
      F.h = (n - 0.5) * 0.45;
      F.m = 0.93 + (n - 0.5) * 0.12 + (m - 0.5) * 0.06;
      F.w = clamp((fbm(u * 2.2, v * 2.2, 2) - 0.6) * 2, 0, 1) * 0.35;
      F.spec = 0.01; F.gloss = 4;
    },
    cord(u, v, ppm) { // corduroy, vertical wales
      const p = 2.8, k = aa(p, ppm);
      const r = Math.abs(Math.sin((u / p) * Math.PI));
      F.h = (Math.pow(r, 0.5) - 0.6) * 1.6 * k + (vnoise(u * 2, v * 0.3) - 0.5) * 0.15;
      F.m = 0.8 + Math.pow(r, 0.5) * 0.26 * k + (1 - k) * 0.12;
      F.w = 0; F.spec = 0.06; F.gloss = 9;
    },
    canvas(u, v, ppm) { // cotton duck / overshirt canvas
      const p = 0.8, k = aa(p, ppm);
      const a = Math.sin((u / p) * Math.PI * 2), b = Math.sin((v / p) * Math.PI * 2);
      const n = fbm(u * 0.4, v * 0.4, 3);
      F.h = a * b * 0.35 * k + (n - 0.5) * 0.35;
      F.m = 0.93 + (n - 0.5) * 0.12;
      F.w = 0; F.spec = 0.02; F.gloss = 8;
    },
    leather(u, v, ppm) {
      const c = cell(u * 0.9, v * 0.9);
      const c2 = cell(u * 2.7 + 13, v * 2.7);
      const n = fbm(u * 0.12, v * 0.12, 3);
      F.h = (c - 0.5) * 0.7 + (c2 - 0.5) * 0.3;
      F.m = 0.9 + (n - 0.5) * 0.18 + (c - 0.5) * 0.08;
      F.w = 0; F.spec = 0.32; F.gloss = 22;
    },
    webbing(u, v, ppm) {
      const p = 1.1, k = aa(p, ppm);
      const r = Math.sin(((u - v * 0.4) / p) * Math.PI * 2) * 0.5 + 0.5;
      F.h = (r - 0.5) * 0.8 * k;
      F.m = 0.93 + (r - 0.5) * 0.1 * k;
      F.w = 0; F.spec = 0.05; F.gloss = 10;
    },
    linen(u, v, ppm) {
      const sl = fbm(u * 0.6, v * 0.04, 3), sl2 = fbm(u * 0.04, v * 0.6, 3);
      const p = 0.9, k = aa(p, ppm);
      const a = Math.sin((u / p) * Math.PI * 2) * Math.sin((v / p) * Math.PI * 2);
      F.h = a * 0.3 * k + (sl - 0.5) * 0.5 + (sl2 - 0.5) * 0.4;
      F.m = 0.92 + (sl - 0.5) * 0.14 + (sl2 - 0.5) * 0.1;
      F.w = 0; F.spec = 0.02; F.gloss = 6;
    },
    puffer(u, v, ppm) { FABRICS.nylon(u, v, ppm); F.spec = 0.16; F.gloss = 20; },
    metal(u, v) { F.h = 0; F.m = 1; F.w = 0; F.spec = 0.9; F.gloss = 40; },
    flat(u, v) { F.h = 0; F.m = 1; F.w = 0; F.spec = 0.02; F.gloss = 8; },
  };

  // ---------- path helpers ----------
  // points: [x,y] smooth, [x,y,1] corner. Catmull-Rom → cubic Bézier.
  function curve(pts, closed, tension) {
    const t = tension == null ? 1 : tension;
    const n = pts.length;
    const P = (i) => (closed ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
      const c1 = p1[2] ? p1 : [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t];
      const c2 = p2[2] ? p2 : [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)},${c2[0].toFixed(1)},${c2[1].toFixed(1)},${p2[0]},${p2[1]}`;
    }
    return closed ? d + 'Z' : d;
  }
  // Right-half points from top axis → bottom axis; mirrored around cx.
  function sym(right, cx = 500, tension) {
    const left = right.slice(1, -1).reverse().map((p) => [2 * cx - p[0], p[1], p[2]]);
    return curve(right.concat(left), true, tension);
  }
  const mirrorPts = (pts, cx = 500) => pts.map((p) => [2 * cx - p[0], p[1], p[2]]);
  const line = (pts, t) => curve(pts, false, t);

  // ---------- renderer ----------
  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  /**
   * job: { garment, view, params, w, h, mode: 'product'|'macro'|'scene', seed }
   * Garment builders (window.GARMENTS[name](params, view, api)) return:
   * { parts: [{ d, dome, z, fabric, color, color2, scale, folds:[{d,w,depth,blur}], seams:[{d, stitch, inset}], clip }],
   *   details?: (ctx, layers) => void }
   */
  function renderGarment(job) {
    SEED = job.seed || 7;
    const W = job.w || 1000, H = job.h || 1250;
    const S = W / 1000; // builder space is 1000 wide
    const g = window.GARMENTS[job.garment](job.params || {}, job.view || 'front', API);
    const parts = g.parts;
    const off = g.offset || { dx: 0, dy: 0, s: 1 };
    const TS = S * (off.s || 1), TX = (off.dx || 0) * S, TY = (off.dy || 0) * S;
    const N = W * H;
    const height = new Float32Array(N);
    const partId = new Int16Array(N).fill(-1);
    const alpha = new Float32Array(N);
    const occl = new Float32Array(N); // cast shadow from upper parts

    const mc = makeCanvas(W, H), mx = mc.getContext('2d', { willReadFrequently: true });
    const bc = makeCanvas(W, H), bx = bc.getContext('2d', { willReadFrequently: true });

    function maskOf(d, blur, stroke) {
      mx.setTransform(1, 0, 0, 1, 0, 0);
      mx.filter = 'none';
      mx.clearRect(0, 0, W, H);
      mx.setTransform(TS, 0, 0, TS, TX, TY);
      mx.fillStyle = '#fff';
      const p = new Path2D(d);
      mx.fill(p);
      const sharp = mx.getImageData(0, 0, W, H).data;
      if (!blur) return { sharp };
      bx.setTransform(1, 0, 0, 1, 0, 0);
      bx.filter = 'none';
      bx.fillStyle = '#000';
      bx.fillRect(0, 0, W, H);
      bx.filter = `blur(${blur * S}px)`;
      bx.drawImage(mc, 0, 0);
      bx.filter = 'none';
      return { sharp, soft: bx.getImageData(0, 0, W, H).data };
    }

    // 1) domes + part ids (painter's order)
    parts.forEach((part, pi) => {
      const { sharp, soft } = maskOf(part.d, (part.dome == null ? 26 : part.dome) * 1.5);
      const z = part.z || 0;
      const amp = part.amp == null ? 1 : part.amp;
      const drape = part.drape == null ? 1 : part.drape;
      for (let i = 0, j = 3; i < N; i++, j += 4) {
        const a = sharp[j] / 255;
        if (a <= 0) continue;
        // dome: soft inside falloff; sqrt for rounder shoulders
        const s = soft ? soft[j - 3] / 255 : 1;
        const e = clamp((s - 0.5) * 2, 0, 1);
        const dome = e * (2 - e); // ease-out: soft roll at the edge, flat-ish top
        const px = (i % W) / S, py = ((i / W) | 0) / S;
        const dr = (fbm(px / 210 + pi * 3.1, py / 300, 3) - 0.5) * 22 * drape;
        const hv = z + dome * 22 * amp + dr * dome;
        if (a > 0.5) {
          height[i] = hv; partId[i] = pi;
        } else if (partId[i] < 0) {
          height[i] = hv * a; partId[i] = pi;
        }
        alpha[i] = Math.max(alpha[i], a);
      }
      // cast shadow of this part onto what's below it (offset down-right)
      if (pi > 0 && part.cast !== false) {
        bx.setTransform(1, 0, 0, 1, 0, 0);
        bx.clearRect(0, 0, W, H);
        bx.filter = `blur(${10 * S}px)`;
        bx.drawImage(mc, 6 * S, 10 * S);
        bx.filter = 'none';
        const sh = bx.getImageData(0, 0, W, H).data;
        for (let i = 0, j = 3; i < N; i++, j += 4) {
          if (sharp[j] < 128 && sh[j] > 0) occl[i] = Math.max(occl[i], (sh[j] / 255) * (part.castAmt || 0.35));
        }
      }
    });

    // 2) folds & seams into height (grey-coded canvas: 128 = neutral)
    const fc = makeCanvas(W, H), fx = fc.getContext('2d', { willReadFrequently: true });
    fx.fillStyle = 'rgb(128,128,128)';
    fx.fillRect(0, 0, W, H);
    fx.setTransform(TS, 0, 0, TS, TX, TY);
    fx.lineCap = 'round'; fx.lineJoin = 'round';
    parts.forEach((part) => {
      fx.save();
      fx.clip(new Path2D(part.d));
      (part.folds || []).forEach((f) => {
        const depth = f.depth == null ? -0.6 : f.depth;
        const v = Math.round(128 + clamp(depth, -1, 1) * 127);
        fx.filter = `blur(${(f.blur == null ? 7 : f.blur) * S}px)`;
        fx.strokeStyle = `rgb(${v},${v},${v})`;
        fx.lineWidth = f.w || 10;
        fx.stroke(new Path2D(f.d));
      });
      (part.seams || []).forEach((s) => {
        fx.filter = `blur(${1.6 * S}px)`;
        fx.strokeStyle = 'rgb(40,40,40)';
        fx.lineWidth = s.w || 3;
        fx.stroke(new Path2D(s.d));
      });
      fx.restore();
    });
    fx.filter = 'none';
    const fold = fx.getImageData(0, 0, W, H).data;

    // 3) albedo + micro height
    const ac = makeCanvas(W, H), ax = ac.getContext('2d', { willReadFrequently: true });
    const albedo = ax.createImageData(W, H);
    const A = albedo.data;
    const spec = new Float32Array(N), gloss = new Float32Array(N);
    const pdata = parts.map((p) => ({
      fab: FABRICS[p.fabric || 'jersey'],
      c1: hex(p.color || '#777777'),
      c2: hex(p.color2 || '#e9e5dc'),
      sc: p.scale || (job.params && job.params.scale) || 1,
      fold: p.foldAmt == null ? 22 : p.foldAmt,
      rot: p.rot || 0,
      fade: p.fade || 0,
    }));
    const mmPerPx = (job.mmPerPx || 0.72) / S; // product scale: ~720mm over 1000px
    for (let y = 0, i = 0; y < H; y++) {
      for (let x = 0; x < W; x++, i++) {
        const pi = partId[i];
        if (pi < 0) continue;
        const P = pdata[pi];
        let u = x * mmPerPx * P.sc, v = y * mmPerPx * P.sc;
        if (P.rot) { const c = Math.cos(P.rot), s = Math.sin(P.rot); const uu = u * c - v * s; v = u * s + v * c; u = uu; }
        P.fab(u, v, 1 / (mmPerPx * P.sc));
        const fv = (fold[i * 4] - 128) / 127;
        height[i] += F.h * 1.2 + fv * P.fold;
        // denim-style wear fading on ridges
        let w = F.w;
        if (P.fade) w = clamp(w + P.fade * (smooth(0.2, 0.9, fv) * 0.55 + smooth(18, 34, height[i]) * 0.22), 0, 1);
        const m = F.m;
        A[i * 4] = toSRGB(mix(P.c1[0], P.c2[0], w) * m);
        A[i * 4 + 1] = toSRGB(mix(P.c1[1], P.c2[1], w) * m);
        A[i * 4 + 2] = toSRGB(mix(P.c1[2], P.c2[2], w) * m);
        A[i * 4 + 3] = 255;
        spec[i] = F.spec; gloss[i] = F.gloss;
      }
    }
    ax.putImageData(albedo, 0, 0);

    // 4) details drawn onto albedo; heights onto detail-height canvas; metal mask
    const dc = makeCanvas(W, H), dx = dc.getContext('2d', { willReadFrequently: true });
    dx.fillStyle = 'rgb(128,128,128)'; dx.fillRect(0, 0, W, H);
    const sc = makeCanvas(W, H), sx = sc.getContext('2d', { willReadFrequently: true });
    [ax, dx, sx].forEach((c) => { c.setTransform(TS, 0, 0, TS, TX, TY); c.lineCap = 'round'; c.lineJoin = 'round'; });
    const layers = {
      albedo: ax, height: dx, metal: sx, S,
      stitch(d, color, opts = {}) {
        const p = new Path2D(d);
        ax.save();
        ax.setLineDash(opts.dash || [7, 5]);
        ax.lineWidth = opts.w || 2.2;
        ax.strokeStyle = color;
        ax.globalAlpha = opts.alpha == null ? 0.9 : opts.alpha;
        ax.stroke(p);
        ax.restore();
        dx.save();
        dx.setLineDash(opts.dash || [7, 5]);
        dx.lineWidth = (opts.w || 2.2) + 0.6;
        dx.strokeStyle = 'rgb(175,175,175)';
        dx.stroke(p);
        dx.restore();
      },
      raise(d, amt, blur, fill = true) {
        const v = Math.round(128 + clamp(amt, -1, 1) * 127);
        dx.save();
        dx.filter = `blur(${(blur || 2) * S}px)`;
        if (fill) { dx.fillStyle = `rgb(${v},${v},${v})`; dx.fill(new Path2D(d)); }
        else { dx.strokeStyle = `rgb(${v},${v},${v})`; dx.lineWidth = 3; dx.stroke(new Path2D(d)); }
        dx.restore();
      },
      paint(d, color, alpha = 1, stroke) {
        ax.save();
        ax.globalAlpha = alpha;
        if (stroke) { ax.strokeStyle = color; ax.lineWidth = stroke; ax.stroke(new Path2D(d)); }
        else { ax.fillStyle = color; ax.fill(new Path2D(d)); }
        ax.restore();
      },
      metal(d, color, amt = 1) {
        layers.paint(d, color);
        sx.fillStyle = `rgba(255,255,255,${amt})`;
        sx.fill(new Path2D(d));
      },
      button(cx, cy, r, color, kind) { // kind: 'shank' | 'sew' | 'rivet' | 'snap'
        const circ = `M${cx + r},${cy}A${r},${r},0,1,1,${cx - r},${cy}A${r},${r},0,1,1,${cx + r},${cy}Z`;
        if (kind === 'rivet' || kind === 'shank' || kind === 'snap') layers.metal(circ, color, 1);
        else layers.paint(circ, color);
        layers.raise(circ, 0.9, r * 0.35);
        if (kind === 'sew') {
          const o = r * 0.32;
          [[-o, -o], [o, -o], [-o, o], [o, o]].forEach(([a, b]) => {
            const hc = `M${cx + a + r * 0.12},${cy + b}A${r * 0.12},${r * 0.12},0,1,1,${cx + a - r * 0.12},${cy + b}A${r * 0.12},${r * 0.12},0,1,1,${cx + a + r * 0.12},${cy + b}Z`;
            layers.paint(hc, 'rgba(0,0,0,0.45)');
          });
        }
        if (kind === 'shank') {
          const inner = `M${cx + r * 0.62},${cy}A${r * 0.62},${r * 0.62},0,1,1,${cx - r * 0.62},${cy}A${r * 0.62},${r * 0.62},0,1,1,${cx + r * 0.62},${cy}Z`;
          layers.raise(inner, 0.2, 1, false);
        }
      },
    };
    if (g.details) g.details(layers, API);
    const det = dx.getImageData(0, 0, W, H).data;
    const met = sx.getImageData(0, 0, W, H).data;
    const alb = ax.getImageData(0, 0, W, H).data;

    for (let i = 0; i < N; i++) {
      if (partId[i] < 0) continue;
      height[i] += ((det[i * 4] - 128) / 127) * 10;
    }

    // 5) lighting
    const out = ax.createImageData(W, H);
    const O = out.data;
    // blurred height for AO
    const ao = boxBlur(height, W, H, Math.round(18 * S));
    const L = norm3(-0.45, -0.75, 0.9); // soft-box upper left, in front
    const Hh = norm3(L[0], L[1], L[2] + 1);
    const k = (job.relief || 1.15) / S;
    for (let y = 1; y < H - 1; y++) {
      for (let x = 1; x < W - 1; x++) {
        const i = y * W + x;
        const a = alpha[i];
        if (a <= 0) continue;
        const dhx = (height[i + 1] - height[i - 1]) * 0.5 * k;
        const dhy = (height[i + W] - height[i - W]) * 0.5 * k;
        let nx = -dhx, ny = -dhy, nz = 1;
        const il = 1 / Math.hypot(nx, ny, nz); nx *= il; ny *= il; nz *= il;
        const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
        const wrap = 0.5 + 0.5 * (nx * L[0] + ny * L[1] + nz * L[2]);
        const occ = clamp((ao[i] - height[i]) / 26, 0, 1);
        const metal = met[i * 4 + 3] / 255;
        const sp = mix(spec[i], 0.9, metal), gl = mix(gloss[i], 48, metal);
        const nh = Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]);
        const s = sp * Math.pow(nh, gl);
        const light = (0.38 + 0.52 * lam + 0.22 * wrap) * (1 - occ * 0.55) * (1 - occl[i]);
        for (let c = 0; c < 3; c++) {
          const base = Math.pow(alb[i * 4 + c] / 255, 2.2);
          O[i * 4 + c] = toSRGB(base * light * 1.02 + s * 0.85);
        }
        O[i * 4 + 3] = Math.round(a * 255);
      }
    }
    ax.setTransform(1, 0, 0, 1, 0, 0);
    ax.clearRect(0, 0, W, H);
    ax.putImageData(out, 0, 0);

    // 6) final composite with soft contact shadow
    const fin = makeCanvas(W, H), fn = fin.getContext('2d');
    if (job.background) { fn.fillStyle = job.background; fn.fillRect(0, 0, W, H); }
    if (job.shadow !== false) {
      fn.save();
      fn.filter = `blur(${16 * S}px)`;
      fn.globalAlpha = job.shadowAlpha || 0.2;
      // silhouette in shadow colour
      const tmp = makeCanvas(W, H), tx = tmp.getContext('2d');
      tx.drawImage(ac, 0, 0);
      tx.globalCompositeOperation = 'source-in';
      tx.fillStyle = '#2a2117';
      tx.fillRect(0, 0, W, H);
      fn.drawImage(tmp, 8 * S, 16 * S);
      fn.restore();
    }
    fn.drawImage(ac, 0, 0);
    return fin;
  }

  function norm3(x, y, z) { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; }
  function boxBlur(src, W, H, r) {
    const tmp = new Float32Array(W * H), out = new Float32Array(W * H);
    const pass = (a, b, horiz) => {
      const len = horiz ? W : H, lines = horiz ? H : W;
      for (let l = 0; l < lines; l++) {
        let acc = 0;
        const idx = (t) => (horiz ? l * W + t : t * W + l);
        for (let t = -r; t <= r; t++) acc += a[idx(clamp(t, 0, len - 1))];
        for (let t = 0; t < len; t++) {
          b[idx(t)] = acc / (2 * r + 1);
          acc += a[idx(clamp(t + r + 1, 0, len - 1))] - a[idx(clamp(t - r, 0, len - 1))];
        }
      }
    };
    pass(src, tmp, true); pass(tmp, out, false);
    pass(out, tmp, true); pass(tmp, out, false);
    return out;
  }

  /** Macro fabric close-up (square), same lighting model, plus optional normal map export. */
  function renderMacro(job) {
    SEED = job.seed || 3;
    const W = job.w || 900, H = job.h || 900;
    const fab = FABRICS[job.fabric];
    const c1 = hex(job.color), c2 = hex(job.color2 || '#e9e5dc');
    const mmPerPx = job.mmPerPx || 0.045; // ~40mm field of view
    const height = new Float32Array(W * H), A = new Float32Array(W * H * 3), sp = new Float32Array(W * H), gl = new Float32Array(W * H);
    const MW = new Float32Array(W * H * 2);
    for (let y = 0, i = 0; y < H; y++) for (let x = 0; x < W; x++, i++) {
      fab(x * mmPerPx, y * mmPerPx, 1 / mmPerPx);
      // gentle large-scale undulation so it reads as cloth, not a texture tile
      const und = fbm(x / W * 2.2, y / H * 2.2, 3);
      height[i] = F.h * 9 + und * 60;
      for (let c = 0; c < 3; c++) A[i * 3 + c] = mix(c1[c], c2[c], F.w) * F.m;
      if (job.normals) { MW[i * 2] = F.m; MW[i * 2 + 1] = F.w; }
      sp[i] = F.spec; gl[i] = F.gloss;
    }
    const cv = makeCanvas(W, H), cx = cv.getContext('2d');
    const img = cx.createImageData(W, H), O = img.data;
    const nimg = cx.createImageData(W, H), NO = nimg.data;
    const L = norm3(-0.55, -0.7, 0.75), Hh = norm3(L[0], L[1], L[2] + 1);
    const ao = boxBlur(height, W, H, 10);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      const xl = x > 0 ? i - 1 : i, xr = x < W - 1 ? i + 1 : i, yu = y > 0 ? i - W : i, yd = y < H - 1 ? i + W : i;
      let nx = -(height[xr] - height[xl]) * 0.5, ny = -(height[yd] - height[yu]) * 0.5, nz = 1;
      const il = 1 / Math.hypot(nx, ny, nz); nx *= il; ny *= il; nz *= il;
      const lam = Math.max(0, nx * L[0] + ny * L[1] + nz * L[2]);
      const occ = clamp((ao[i] - height[i]) / 10, 0, 1);
      const s = sp[i] * Math.pow(Math.max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), gl[i]);
      const vign = 1 - 0.18 * Math.pow(Math.hypot(x / W - 0.45, y / H - 0.4) * 1.4, 2);
      const light = (0.3 + 0.75 * lam) * (1 - occ * 0.5) * vign;
      for (let c = 0; c < 3; c++) O[i * 4 + c] = toSRGB(A[i * 3 + c] * light + s * 0.8);
      O[i * 4 + 3] = 255;
      if (job.normals) {
        NO[i * 4] = Math.round((nx * 0.5 + 0.5) * 255);
        NO[i * 4 + 1] = Math.round((ny * 0.5 + 0.5) * 255);
        NO[i * 4 + 2] = Math.round((nz * 0.5 + 0.5) * 255);
        NO[i * 4 + 3] = 255;
        // albedo in a second canvas
      }
    }
    cx.putImageData(img, 0, 0);
    const res = { lit: cv };
    if (job.normals) {
      const nc = makeCanvas(W, H); nc.getContext('2d').putImageData(nimg, 0, 0);
      const alc = makeCanvas(W, H), ac = alc.getContext('2d'), ai = ac.createImageData(W, H);
      // encoded material map: R = brightness (m / 1.25), G = mix towards secondary colour (w)
      for (let i = 0; i < W * H; i++) { ai.data[i * 4] = Math.round(clamp(MW[i * 2] / 1.25, 0, 1) * 255); ai.data[i * 4 + 1] = Math.round(clamp(MW[i * 2 + 1], 0, 1) * 255); ai.data[i * 4 + 2] = 0; ai.data[i * 4 + 3] = 255; }
      ac.putImageData(ai, 0, 0);
      res.normal = nc; res.albedo = alc;
    }
    return res;
  }

  const API = { curve, sym, line, mirrorPts, clamp, mix, fbm, vnoise, hash: (a, b) => hash(a, b) };
  window.KROJ = { renderGarment, renderMacro, API, FABRICS };
  window.GARMENTS = window.GARMENTS || {};
})();
