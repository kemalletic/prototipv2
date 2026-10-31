/* Outerwear, vests, tracksuit tops and accessories for the KROJ virtual studio. */
(function () {
  const G = window.GARMENTS;
  const { sym, curve, line, mirrorPts } = window.KROJ.API;
  const { shade, rect, circle, offset } = window.KROJ_GARMENT_HELPERS;
  const M = (pts) => mirrorPts(pts);
  const pair = (pts) => [pts, M(pts)];

  /**
   * Shared top-garment base.
   * o: { len, side, sleeves, collar: 'shirt'|'stand'|'rib'|'hood'|'crew'|'none', closure: 'zip'|'buttons'|'none',
   *      hem: 'rib'|'self'|'band', cuff: 'rib'|'self'|'band', quilt, fabric, color, armhole }
   */
  function top(p, view, o) {
    const fabric = p.fabric || o.fabric || 'canvas';
    const color = p.color;
    const len = o.len || 1000;
    const side = o.side || 820;
    const nsp = [596, 150, 1];
    const front = view !== 'back';
    const neckY = front ? (o.collar === 'stand' || o.collar === 'hood' ? 176 : 196) : 168;
    const bodyR = o.armhole
      ? [[500, o.vNeckY && front ? o.vNeckY : neckY], ...(o.vNeckY && front ? [] : [[552, neckY - 10]]), nsp, [744, 182, 1], [760, 260], [side - 14, 420, 1], [side, len - 40], [side, len, 1], [500, len + 6]]
      : [[500, neckY], [552, neckY - 10], nsp, [796, 206, 1], [side - 6, 330], [side, len, 1], [500, len + 6]];
    const parts = [];
    const quiltFolds = [];
    if (o.quilt) {
      for (let y = 300; y < len - 20; y += o.quilt) {
        quiltFolds.push({ d: `M150,${y}Q500,${y + 10},850,${y}`, w: 12, depth: -1, blur: 6 });
      }
    }
    const sleeveR = [[770, 204, 1], [810, 224], [856, 312], [906, 640], [926, 990, 1], [832, 1000, 1], [808, 640], [772, 330, 1]];
    if (!o.armhole) {
      pair(sleeveR).forEach((s, i) => {
        const f = (pts) => line(i ? M(pts) : pts);
        const sf = [];
        if (o.quilt) for (let y = 330; y < 990; y += o.quilt * 0.8) sf.push({ d: f([[800, y + 10], [930, y - 6]]), w: 10, depth: -1, blur: 5 });
        else sf.push(
          { d: f([[830, 560], [890, 600]]), w: 12, depth: -0.5, blur: 9 },
          { d: f([[836, 760], [900, 800]]), w: 12, depth: -0.5, blur: 9 },
          { d: f([[842, 900], [910, 930]]), w: 12, depth: -0.45, blur: 9 },
          { d: f([[858, 320], [880, 520]]), w: 20, depth: 0.4, blur: 14 },
        );
        parts.push({ d: curve(s, true), dome: o.quilt ? 30 : 24, amp: o.quilt ? 1.6 : 1, z: -4, fabric, color, color2: p.color2, cast: false, folds: sf });
      });
    }
    const bodyFolds = o.quilt ? quiltFolds : [
      { d: line([[650, 560], [628, 780], [646, 960]]), w: 30, depth: 0.3, blur: 20 },
      { d: line([[372, 520], [390, 760], [378, 960]]), w: 24, depth: -0.3, blur: 20 },
      { d: line([[770, 300], [620, 420]]), w: 18, depth: -0.3, blur: 14 },
    ];
    parts.push({ d: sym(bodyR), dome: o.quilt ? 36 : 32, amp: o.quilt ? 1.5 : 1, fabric, color, color2: p.color2, castAmt: 0.3, folds: bodyFolds, fade: fabric === 'denim' ? 0.25 : 0,
      seams: o.armhole ? [] : pair([[796, 206], [802, 300], [side - 6, 340]]).map((d) => ({ d: line(d), w: 2 })) });

    const cuffR = [[832, 994, 1], [926, 984, 1], [930, 1080, 1], [840, 1088, 1]];
    if (!o.armhole && o.cuff && o.cuff !== 'self') pair(cuffR).forEach((s) => parts.push({ d: curve(s, true), dome: 10, z: 8, fabric: o.cuff === 'rib' ? 'rib' : fabric, color: o.cuffColor || color, drape: 0.3 }));
    if (o.hem && o.hem !== 'self') {
      const hb = o.hem === 'rib' ? [[side - 10, len - 4], [side - 14, len + 84]] : [[side, len - 4], [side, len + 60]];
      parts.push({ d: curve([[1000 - hb[0][0], hb[0][1], 1], [hb[0][0], hb[0][1], 1], [hb[1][0], hb[1][1], 1], [1000 - hb[1][0], hb[1][1], 1]], true), dome: 10, z: 3, fabric: o.hem === 'rib' ? 'rib' : fabric, color: o.hemColor || color, drape: 0.3, fade: fabric === 'denim' ? 0.2 : 0 });
    }
    if (o.armhole) {
      pair([[744, 182], [762, 270], [side - 14, 420]]).forEach((s, i) => parts.push({ d: curve(s.concat(offset(s, i ? -16 : 16).reverse()), true), dome: 6, z: 6, fabric: o.armholeFabric || 'rib', color, cast: false, drape: 0 }));
    }
    // collars
    if (o.collar === 'stand' || o.collar === 'rib') {
      parts.push({ d: front ? 'M404,146Q500,118,596,146L606,214Q560,226,512,222L512,186H488L488,222Q440,226,394,214Z' : 'M404,146Q500,120,596,146L604,206Q500,190,396,206Z', dome: 12, z: 10, fabric: o.collar === 'rib' ? 'rib' : fabric, color: o.collarColor || color, drape: 0, amp: o.quilt ? 1.4 : 1 });
    } else if (o.collar === 'shirt') {
      if (front) {
        parts.push({ d: 'M404,150Q500,128,596,150L548,250L500,262L452,250Z', dome: 4, z: -12, fabric, color: shade(color, 0.5), cast: false, drape: 0, amp: 0.2 });
        parts.push({ d: 'M404,150Q500,128,596,150L600,172Q500,154,400,172Z', dome: 6, z: 0, fabric, color: shade(color, 0.8), cast: false, drape: 0 });
        pair([[598, 144, 1], [640, 200], [676, 288, 1], [600, 266, 1], [504, 210, 1]]).forEach((c) => parts.push({ d: curve(c, true), dome: 12, z: 14, fabric: o.collarFabric || fabric, color: o.collarColor || color, drape: 0, fade: fabric === 'denim' ? 0.3 : 0 }));
      } else {
        parts.push({ d: 'M396,130Q500,104,604,130L640,220Q500,196,360,220Z', dome: 12, z: 12, fabric: o.collarFabric || fabric, color: o.collarColor || color, drape: 0 });
      }
    } else if (o.collar === 'hood') {
      if (front) {
        parts.unshift({ d: curve([[500, 30], [640, 50], [700, 150], [660, 230, 1], [500, 210], [340, 230, 1], [300, 150], [360, 50]], true), dome: 30, z: -8, fabric, color, cast: false });
        parts.push({ d: curve([[596, 150], [560, 90], [500, 76], [440, 90], [404, 150], [452, 196], [500, 206], [548, 196]], true), dome: 6, z: -14, fabric, color: shade(color, 0.55), cast: false, amp: 0.3, drape: 0 });
        parts.push({ d: curve([[612, 152], [580, 70], [500, 52], [420, 70], [388, 152], [404, 160], [436, 92], [500, 80], [564, 92], [596, 160]], true), dome: 8, z: 10, fabric, color, cast: false, drape: 0 });
      } else {
        parts.push({ d: curve([[500, 40], [640, 60], [704, 170], [660, 260, 1], [500, 236], [340, 260, 1], [296, 170], [360, 60]], true), dome: 34, z: 10, fabric, color });
      }
    } else if (o.collar === 'crew' && front) {
      parts.push({ d: curve([[594, 152], [500, 132], [406, 152], [452, neckY - 34], [500, neckY - 26], [548, neckY - 34]], true), dome: 4, z: -10, fabric, color: shade(color, 0.55), cast: false, amp: 0.2, drape: 0 });
      parts.push({ d: curve([[596, 150], [552, neckY - 10], [500, neckY], [448, neckY - 10], [404, 150], [428, 154], [452, neckY - 36], [500, neckY - 28], [548, neckY - 36], [572, 154]], true), dome: 8, z: 6, fabric: 'rib', color, cast: false, drape: 0 });
    } else if (o.vNeckY && front) {
      parts.push({ d: `M596,150L500,${o.vNeckY}L404,150Q500,136,596,150Z`, dome: 4, z: -10, fabric, color: shade(color, 0.55), cast: false, amp: 0.2, drape: 0 });
      parts.push({ d: `M596,150L500,${o.vNeckY + 4}L404,150L426,148L500,${o.vNeckY - 34}L574,148Z`, dome: 6, z: 6, fabric: 'rib', color, cast: false, drape: 0 });
    }
    return { parts, nsp, len, side, front, fabric, color, sleeveR, cuffR };
  }

  const zipLine = (L, from, to, color = '#b9b2a4') => {
    L.metal(`M497,${from}H503V${to}H497Z`, color, 1);
    L.raise(`M494,${from}H506V${to}H494Z`, 0.5, 1.5);
  };
  const puller = (L, y, color = '#c4bdb0') => { L.metal(`M491,${y}H509V${y + 34}H491Z`, color, 1); L.raise(`M491,${y}H509V${y + 34}H491Z`, 0.9, 1.5); };

  // ---------------------------------------------------------------- DENIM TRUCKER / OVERSHIRT / CHORE
  G.trucker = (p, view) => {
    const chore = p.style === 'chore';
    const b = top(p, view, { len: chore ? 1030 : 960, side: 816, collar: 'shirt', closure: 'buttons', hem: chore ? 'self' : 'band', cuff: chore ? 'self' : 'band', fabric: p.fabric || 'denim' });
    const isDenim = b.fabric === 'denim';
    const thread = isDenim ? '#c98d3e' : shade(b.color, 0.75);
    const btn = isDenim ? '#9a8a6c' : (p.button || shade(b.color, 0.55));
    return {
      offset: { dx: 0, dy: chore ? 50 : 80 },
      parts: b.parts,
      details(L) {
        if (b.front) {
          L.raise(rect(482, 206, 36, b.len - 200), 0.3, 2);
          L.stitch(`M482,210V${b.len}M518,210V${b.len}`, thread, { w: 1.8 });
          const n = chore ? 5 : 5;
          for (let i = 0; i < n; i++) L.button(500, 250 + i * ((b.len - 300) / (n - 1)), isDenim ? 11 : 10, btn, isDenim ? 'shank' : 'sew');
          if (!chore) {
            // pointed yoke + flap chest pockets
            pair([[518, 330], [610, 300], [800, 320]]).forEach((s) => { L.raise(line(s), -0.6, 2, false); L.stitch(line(offset(s, -8)), thread, { w: 1.8 }); L.stitch(line(offset(s, -16)), thread, { w: 1.8 }); });
            [[560, 360], [340, 360]].forEach(([x, y]) => {
              const flap = `M${x},${y}H${x + 100}V${y + 34}L${x + 50},${y + 58}L${x},${y + 34}Z`;
              L.raise(rect(x + 4, y + 30, 92, 120), 0.3, 3);
              L.paint(flap, shade(b.color, 1.03)); L.raise(flap, 0.7, 2);
              L.stitch(`M${x + 6},${y + 6}V${y + 32}L${x + 50},${y + 52}L${x + 94},${y + 32}V${y + 6}`, thread, { w: 1.8 });
              L.button(x + 50, y + 40, 8, btn, 'shank');
              // vertical pleat seams down the front
              L.stitch(`M${x + (x > 500 ? 30 : 70)},${y + 150}V${b.len - 10}`, thread, { w: 1.8 });
            });
            if (isDenim) pair([[790, b.len - 6], [790, b.len + 52]]).forEach(() => {});
          } else {
            // chore: one chest + two lower patch pockets
            const pk = (x, y, w, h) => { const d = rect(x, y, w, h); L.raise(d, 0.4, 3); L.stitch(`M${x + 4},${y}V${y + h - 4}H${x + w - 4}V${y}`, thread, { w: 1.8 }); L.stitch(`M${x},${y + 16}H${x + w}`, thread, { w: 1.8 }); };
            pk(574, 330, 110, 120);
            pk(560, 660, 160, 170);
            pk(280, 660, 160, 170);
          }
        } else {
          pair([[300, 330], [500, 320]]).forEach(() => {});
          L.raise(line([[190, 320], [500, 300], [810, 320]]), -0.6, 2, false);
          L.stitch(line([[190, 328], [500, 308], [810, 328]]), thread, { w: 1.8 });
          if (!chore) { L.stitch(`M380,330V${b.len}M620,330V${b.len}`, thread, { w: 1.8 }); }
          if (isDenim) { L.paint(rect(478, 174, 44, 18), '#8a6a48'); }
        }
        if (!chore) {
          // waistband stitches + adjuster buttons
          L.stitch(`M184,${b.len + 6}Q500,${b.len + 12},816,${b.len + 6}`, thread, { w: 1.8 });
          L.stitch(`M184,${b.len + 50}Q500,${b.len + 56},816,${b.len + 50}`, thread, { w: 1.8 });
          if (b.front) [[770, b.len + 30], [230, b.len + 30]].forEach(([x, y]) => L.button(x, y, 8, btn, 'shank'));
          pair([[836, 1004], [920, 994]]).forEach((s) => L.stitch(line(s), thread, { w: 1.8 }));
        } else {
          L.stitch(`M186,${b.len - 16}Q500,${b.len - 8},814,${b.len - 16}`, thread, { w: 1.8 });
        }
      },
    };
  };

  // ---------------------------------------------------------------- BOMBER
  G.bomber = (p, view) => {
    const b = top(p, view, { len: 940, side: 830, collar: 'rib', closure: 'zip', hem: 'rib', cuff: 'rib', fabric: p.fabric || 'nylon', collarColor: p.rib, hemColor: p.rib, cuffColor: p.rib });
    return {
      offset: { dx: 0, dy: 90 },
      parts: b.parts,
      details(L) {
        if (b.front) {
          zipLine(L, 186, b.len + 84);
          puller(L, 214);
          pair([[640, 600], [700, 760]]).forEach((s) => { L.raise(line(s), -0.9, 2, false); L.stitch(line(offset(s, 10)), shade(b.color, 0.8), { w: 1.8 }); });
          // sleeve utility pocket (left arm = viewer's right)
          L.raise('M846,380L900,372L906,480L852,488Z', 0.4, 2);
          L.stitch('M846,380L900,372L906,480L852,488Z', shade(b.color, 0.8), { w: 1.6 });
          L.metal('M858,390L894,386L895,392L859,396Z', '#b9b2a4');
        }
      },
    };
  };

  // ---------------------------------------------------------------- PUFFER JACKET / VEST
  G.puffer = (p, view) => {
    const vest = !!p.vest;
    const b = top(p, view, { len: vest ? 960 : 980, side: vest ? 806 : 836, collar: 'stand', closure: 'zip', hem: 'self', cuff: vest ? undefined : 'band', fabric: p.fabric || 'puffer', quilt: 104, armhole: vest, armholeFabric: p.fabric || 'puffer' });
    return {
      offset: { dx: 0, dy: vest ? 70 : 60 },
      parts: b.parts,
      details(L) {
        if (b.front) {
          zipLine(L, 176, b.len + 4, '#2b2925');
          puller(L, 196, '#3a3732');
          pair([[620, 640], [660, 780]]).forEach((s) => { L.raise(line(s), -0.9, 2, false); L.metal(line(offset(s, 4)), '#2b2925', 0.6); });
          L.paint(rect(250, 300, 56, 16), shade(b.color, p.dark ? 1.8 : 0.6), 0.8);
        }
      },
    };
  };

  // ---------------------------------------------------------------- TRACK JACKET / HOODIE
  G.tracktop = (p, view) => {
    const hood = p.hood;
    const b = top(p, view, { len: 990, side: 812, collar: hood ? 'hood' : 'stand', closure: p.pullover ? 'none' : 'zip', hem: 'rib', cuff: 'rib', fabric: p.fabric || 'fleece' });
    return {
      offset: { dx: 0, dy: hood ? 70 : 40 },
      parts: b.parts,
      details(L) {
        const th = shade(b.color, 0.82);
        if (b.front && !p.pullover) { zipLine(L, hood ? 206 : 176, b.len + 80, p.zip || '#c9c2b3'); puller(L, hood ? 226 : 196, p.zip || '#d1cabd'); }
        if (p.stripe) {
          pair([[880, 240], [930, 990]]).forEach((s, i) => {
            const x0 = i ? 120 : 880, x1 = i ? 70 : 930;
            const d = i ? `M${x0 + 10},236L${x0 - 6},236L${x1 - 4},986L${x1 + 12},986Z` : `M${x0 - 10},236L${x0 + 6},236L${x1 + 4},986L${x1 - 12},986Z`;
            L.paint(d, p.stripe, 0.95);
          });
        }
        if (b.front && p.pullover && hood) {
          // kangaroo pocket
          L.raise('M330,700H670L700,900H300Z', 0.35, 3);
          L.stitch('M336,704H664L692,896H308Z', th, { w: 1.8 });
          L.raise('M330,704L300,896M670,704L700,896', -0.8, 2, false);
          L.paint('M484,206Q470,270,478,330', p.cord || '#e8e3d8', 1, 6);
          L.paint('M516,206Q532,268,522,326', p.cord || '#e8e3d8', 1, 6);
          L.raise('M484,206Q470,270,478,330M516,206Q532,268,522,326', 0.9, 2, false);
        } else if (b.front) {
          pair([[640, 640], [690, 800]]).forEach((s) => { L.raise(line(s), -0.9, 2, false); L.stitch(line(offset(s, 9)), th, { w: 1.6 }); });
        }
        if (b.front && p.label) L.paint(rect(590, 300, 40, 12), p.dark ? shade(b.color, 2.2) : shade(b.color, 0.5), 0.85);
      },
    };
  };

  // ---------------------------------------------------------------- KNIT VEST
  G.knitvest = (p, view) => {
    const b = top(p, view, { len: 940, side: 790, armhole: true, collar: 'none', hem: 'rib', vNeckY: 380, fabric: p.fabric || 'knit' });
    return { offset: { dx: 0, dy: 90 }, parts: b.parts };
  };

  // ---------------------------------------------------------------- BELT (folded over a hanger)
  G.belt = (p, view) => {
    const leather = (p.fabric || 'leather') === 'leather';
    const c = p.color;
    const sw = p.width || 70; // strap width in builder px
    const xL = 500 - sw - 18, xR = 500 + 18;
    const top = 180;
    const strapL = `M${xL},${top + 70}Q${xL},${top},${500},${top - 2}Q${xR + sw},${top},${xR + sw},${top + 70}V1060Q${xR + sw / 2},1110,${xR},1060V${top + 70}Q${xR},${top + sw - 10},500,${top + sw - 12}Q${xL + sw},${top + sw - 10},${xL + sw},${top + 70}V980H${xL}Z`;
    const parts = [
      { d: strapL, dome: 8, fabric: leather ? 'leather' : 'webbing', color: c, drape: 0.2, scale: 1.4 },
      { d: rect(xL + 4, 820, sw - 8, 36), dome: 6, z: 8, fabric: leather ? 'leather' : 'webbing', color: shade(c, 0.95), drape: 0, cast: true },
    ];
    return {
      offset: { dx: -150, dy: -150, s: 1.3 },
      parts,
      details(L) {
        const th = leather ? shade(c, 1.45) : shade(c, 0.8);
        L.stitch(`M${xL + 7},${top + 70}V976M${xL + sw - 7},${top + 70}V976`, th, { w: 1.6, dash: [5, 4] });
        L.stitch(`M${xR + 7},${top + 70}V1052M${xR + sw - 7},${top + 70}V1052`, th, { w: 1.6, dash: [5, 4] });
        // buckle: metal frame at the end of left strap
        const bx = xL - 10, by = 960, bw = sw + 20, bh = 92;
        const frame = `M${bx},${by}H${bx + bw}V${by + bh}H${bx}Z M${bx + 9},${by + 9}V${by + bh - 9}H${bx + bw - 9}V${by + 9}Z`;
        L.metal(frame, p.metal || '#bdb39e', 1);
        L.raise(frame, 0.95, 1.5);
        L.metal(`M${bx + bw / 2 - 3},${by + 4}H${bx + bw / 2 + 3}V${by + bh - 30}H${bx + bw / 2 - 3}Z`, p.metal || '#bdb39e', 1);
        // holes on right strap
        for (let i = 0; i < 5; i++) {
          const y = 860 + i * 34;
          L.paint(circle(xR + sw / 2, y, 4.5), shade(c, 0.35));
          L.raise(circle(xR + sw / 2, y, 6), -0.9, 1);
        }
        if (leather) { L.paint(rect(xL + sw / 2 - 18, 600, 36, 12), shade(c, 0.7), 0.5); }
      },
    };
  };

  // ---------------------------------------------------------------- BEANIE
  G.beanie = (p) => {
    const c = p.color;
    return {
      offset: { dx: 0, dy: 140 },
      parts: [
        { d: curve([[500, 210], [660, 236], [744, 400], [760, 640, 1], [240, 640, 1], [256, 400], [340, 236]], true), dome: 40, fabric: 'rib', color: c, scale: 1.5,
          folds: [{ d: 'M330,300Q500,250,670,300', w: 20, depth: -0.4, blur: 14 }, { d: 'M500,220V630', w: 6, depth: -0.4, blur: 4 }] },
        { d: rect(226, 620, 548, 210), dome: 16, z: 10, fabric: 'rib', color: c, scale: 1.5, drape: 0.4 },
      ],
      details(L) {
        L.paint(rect(470, 700, 60, 30), p.label || '#d8d0c2', 0.95);
        L.raise(rect(470, 700, 60, 30), 0.5, 1);
        L.stitch('M474,704H526V726H474Z', shade(c, 0.6), { w: 1.2, dash: [3, 2] });
      },
    };
  };

  // ---------------------------------------------------------------- SOCKS (pair)
  G.socks = (p) => {
    const c = p.color, c2 = p.accent || shade(c, 0.85);
    const sock = (dx) => {
      const d = curve([[300 + dx, 160, 1], [470 + dx, 160, 1], [470 + dx, 760], [500 + dx, 900], [520 + dx, 1050], [470 + dx, 1120], [330 + dx, 1110], [300 + dx, 1000], [300 + dx, 860, 1]], true);
      return d;
    };
    return {
      offset: { dx: -10, dy: 0 },
      parts: [
        { d: sock(-60), dome: 26, fabric: 'jersey', color: c, scale: 1.6 },
        { d: rect(240, 160, 170, 150), dome: 10, z: 6, fabric: 'rib', color: c, drape: 0, scale: 1.6 },
        { d: sock(200), dome: 26, z: 4, fabric: 'jersey', color: c, scale: 1.6 },
        { d: rect(500, 160, 170, 150), dome: 10, z: 10, fabric: 'rib', color: c, drape: 0, scale: 1.6 },
      ],
      details(L) {
        [[240, 410], [500, 670]].forEach(([a, b]) => {
          L.paint(`M${a},330H${b}V346H${a}Z`, c2, 0.95);
          L.paint(`M${a},356H${b}V364H${a}Z`, c2, 0.95);
        });
      },
    };
  };

  // ---------------------------------------------------------------- SCARF (folded over hanger)
  G.scarf = (p) => {
    const c = p.color;
    const w = 150;
    const d = `M${500 - w - 10},300Q${500 - w - 10},170,500,168Q${510 + w},170,${510 + w},300V1080H${510}V300Q510,250,500,250Q490,250,490,300V1040H${500 - w - 10}Z`;
    return {
      offset: { dx: 0, dy: 0 },
      parts: [{ d, dome: 22, fabric: p.fabric || 'wool', color: c, color2: p.color2, folds: [{ d: 'M420,320V1030', w: 14, depth: -0.4, blur: 10 }, { d: 'M590,320V1070', w: 14, depth: 0.4, blur: 10 }] }],
      details(L) {
        const fr = (x0, x1, y) => { for (let x = x0 + 4; x < x1; x += 9) L.paint(`M${x},${y}L${x + 2},${y + 46}`, shade(c, 0.95), 1, 4); };
        fr(500 - w - 10, 490, 1040);
        fr(510, 510 + w, 1080);
        if (p.stripe) { L.paint(rect(500 - w - 10, 960, w, 18), p.stripe, 0.9); L.paint(rect(510, 1000, w, 18), p.stripe, 0.9); }
      },
    };
  };
})();
