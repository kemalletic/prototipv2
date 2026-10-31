/* Garment templates for the KROJ virtual studio.
 * Builder space: 1000 × 1250 (4:5), garment centred at x = 500.
 * Each builder returns { parts, details } — see engine.js. */
(function () {
  const G = (window.GARMENTS = window.GARMENTS || {});
  const { sym, curve, line, mirrorPts } = window.KROJ.API;
  const M = (pts) => mirrorPts(pts);
  const shade = (hex, f) => {
    const n = parseInt(hex.slice(1), 16);
    const ch = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
    return '#' + [ch(16), ch(8), ch(0)].map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  const both = (pts) => [pts, M(pts)];
  const rect = (x, y, w, h) => `M${x},${y}H${x + w}V${y + h}H${x}Z`;
  const circle = (cx, cy, r) => `M${cx + r},${cy}A${r},${r},0,1,1,${cx - r},${cy}A${r},${r},0,1,1,${cx + r},${cy}Z`;

  // offset a polyline by d along normals (rough, adequate for stitch lines)
  function offset(pts, d) {
    return pts.map((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const l = Math.hypot(nx, ny) || 1;
      return [p[0] + (nx / l) * d, p[1] + (ny / l) * d, p[2]];
    });
  }

  // ---------------------------------------------------------------- T-SHIRT
  G.tee = (p, view) => {
    const bx = p.fit === 'boxy';
    const nsp = [590, 150, 1];
    const neckY = view === 'back' ? 168 : 212;
    const sh = bx ? [812, 200, 1] : [770, 184, 1];
    const so = bx ? [966, 414, 1] : [946, 368, 1];
    const si = bx ? [866, 548, 1] : [844, 492, 1];
    const ua = bx ? [826, 478, 1] : [794, 432, 1];
    const side = bx ? 828 : 796;
    const len = bx ? 900 : 930;
    const right = [
      [500, neckY], [550, neckY - 8], nsp, sh,
      [sh[0] + 64, sh[1] + 50], so, si, ua,
      [side, 640], [side + 4, len, 1], [500, len + 10],
    ];
    const fabric = p.fabric || 'jersey';
    const color = p.color;
    const neckOuter = [[nsp[0], nsp[1]], [550, neckY - 8], [500, neckY], [450, neckY - 8], [410, nsp[1]]];
    const bandIn = 22;
    const neckInner = [[nsp[0] - 14, nsp[1] + 2], [548, neckY - 8 - bandIn], [500, neckY - bandIn], [452, neckY - 8 - bandIn], [424, nsp[1] + 2]];
    const sl = (pts) => [pts, M(pts)];
    const folds = [
      ...sl([[ua[0] - 4, ua[1] + 8], [680, 520], [612, 690]]).map((d) => ({ d: line(d), w: 18, depth: -0.4, blur: 14 })),
      { d: line([[640, 600], [662, 760], [648, 900]]), w: 26, depth: 0.35, blur: 18 },
      { d: line([[380, 560], [360, 720], [374, 900]]), w: 20, depth: -0.3, blur: 16 },
      ...sl([[sh[0] + 28, sh[1] + 60], [so[0] - 40, so[1] - 10]]).map((d) => ({ d: line(d), w: 14, depth: -0.35, blur: 10 })),
    ];
    const parts = [
      {
        d: sym(right), dome: 30, fabric, color, color2: p.color2, folds,
        seams: [
          ...sl([sh, [sh[0] + 6, sh[1] + 110], ua]).map((d) => ({ d: line(d) })),
          ...sl([nsp, sh]).map((d) => ({ d: line(d), w: 2 })),
        ],
      },
    ];
    if (view !== 'back') {
      parts.push({
        d: curve([[nsp[0] - 2, nsp[1] + 2], [500, 136], [410, nsp[1] + 2], [452, neckY - 8 - bandIn], [500, neckY - bandIn], [548, neckY - 8 - bandIn]], true),
        dome: 4, z: -10, fabric, color: shade(color, 0.62), cast: false, amp: 0.2, drape: 0,
      });
    }
    parts.push({ d: curve(neckOuter.concat(neckInner.slice().reverse()), true), dome: 6, z: 4, fabric: 'rib', color, color2: p.color2, cast: false, drape: 0 });
    const thread = shade(color, 0.84);
    return {
      offset: { dx: 0, dy: bx ? 110 : 90 },
      parts,
      details(L) {
        const hem = [[side + 2, len - 24], [500, len - 14], [1000 - side - 2, len - 24]];
        L.stitch(line(hem), thread, { w: 1.8 });
        L.stitch(line(offset(hem, -8)), thread, { w: 1.8 });
        const sh2 = [[so[0] - 8, so[1] - 22], [si[0] - 10, si[1] - 20]];
        sl(sh2).forEach((s) => { L.stitch(line(s), thread, { w: 1.8 }); L.stitch(line(offset(s, 8)), thread, { w: 1.8 }); });
        L.stitch(line(offset(neckOuter, 5)), thread, { w: 1.6, dash: [5, 4] });
        if (p.print === 'chest' && view !== 'back') {
          L.paint(rect(600, 300, 44, 11), p.dark ? shade(color, 2.2) : shade(color, 0.45), 0.85);
          L.raise(rect(600, 300, 44, 11), 0.4, 1);
        }
        if (p.print === 'type' && view !== 'back') {
          L.albedo.save();
          L.albedo.font = '800 64px Archivo, Arial Narrow, Arial, sans-serif';
          L.albedo.textAlign = 'center';
          L.albedo.globalAlpha = 0.86;
          L.albedo.fillStyle = p.dark ? '#e9e4d8' : '#1d1b18';
          L.albedo.fillText(p.printText || 'KROJ', 500, 380);
          L.albedo.font = '500 18px Arial, sans-serif';
          L.albedo.fillText(p.printSub || 'SARAJEVO · BOSNA I HERCEGOVINA', 500, 414);
          L.albedo.restore();
        }
        if (view === 'back') { L.paint(rect(486, 176, 28, 14), '#d9d2c5', 0.95); }
        if (p.pocket && view !== 'back') {
          const pk = 'M596,312H684V420Q640,434,596,420Z';
          L.raise(pk, 0.35, 2);
          L.stitch('M596,316V420Q640,434,684,420V316', thread, { w: 1.8 });
          L.stitch('M596,326H684', thread, { w: 1.8 });
        }
      },
    };
  };

  // ---------------------------------------------------------------- POLO
  G.polo = (p, view) => {
    const t = G.tee({ ...p, fabric: p.fabric || 'jersey' }, view);
    if (view === 'back') {
      t.parts.push({ d: 'M416,150Q500,128,584,150L590,186Q500,168,410,186Z', dome: 8, z: 10, fabric: 'rib', color: p.color });
      return t;
    }
    // collar points
    t.parts.push(
      { d: curve([[592, 146, 1], [624, 206], [640, 266, 1], [566, 248, 1], [506, 214, 1]], true), dome: 10, z: 14, fabric: 'rib', color: p.color, drape: 0 },
      { d: curve(M([[592, 146, 1], [624, 206], [640, 266, 1], [566, 248, 1], [506, 214, 1]]), true), dome: 10, z: 14, fabric: 'rib', color: p.color, drape: 0 },
    );
    const det = t.details;
    t.details = (L) => {
      det(L);
      L.raise(rect(480, 214, 40, 190), 0.3, 2);
      L.stitch('M480,214V404H520V214', shade(p.color, 0.8), { w: 1.8 });
      L.button(500, 262, 7, shade(p.color, 1.25), 'sew');
      L.button(500, 336, 7, shade(p.color, 1.25), 'sew');
    };
    return t;
  };

  // ---------------------------------------------------------------- KNIT / SWEATSHIRT CREW
  G.crew = (p, view) => {
    const fabric = p.fabric || 'knit';
    const color = p.color;
    const neckY = view === 'back' ? 172 : 214;
    const bodyR = [[500, neckY], [550, neckY - 10], [590, 156, 1], [790, 214, 1], [812, 330], [816, 1012, 1], [500, 1014]];
    const sleeveR = [[760, 208, 1], [806, 222], [850, 300], [896, 640], [916, 1000, 1], [826, 1010, 1], [800, 640], [760, 330, 1]];
    const cuffR = [[826, 1004, 1], [916, 994, 1], [920, 1092, 1], [834, 1100, 1]];
    const hem = [[190, 1008, 1], [810, 1008, 1], [804, 1098, 1], [196, 1098, 1]];
    const neckOuter = [[590, 156], [550, neckY - 10], [500, neckY], [450, neckY - 10], [410, 156]];
    const neckInner = [[570, 158], [548, neckY - 42], [500, neckY - 32], [452, neckY - 42], [430, 158]];
    const ribFab = p.ribFabric || 'rib';
    const zip = p.neck === 'quarterzip';
    const parts = [
      ...[sleeveR, M(sleeveR)].map((s, i) => {
        const f = (pts) => line(i ? M(pts) : pts);
        return {
          d: curve(s, true), dome: 24, z: -4, fabric, color, color2: p.color2, cast: false,
          folds: [
            { d: f([[826, 560], [880, 600]]), w: 12, depth: -0.55, blur: 9 },
            { d: f([[832, 740], [890, 790]]), w: 12, depth: -0.55, blur: 9 },
            { d: f([[838, 900], [902, 930]]), w: 12, depth: -0.5, blur: 9 },
            { d: f([[850, 300], [870, 500]]), w: 20, depth: 0.4, blur: 14 },
          ],
        };
      }),
      {
        d: sym(bodyR), dome: 34, fabric, color, color2: p.color2, castAmt: 0.3,
        folds: [
          { d: line([[650, 560], [620, 780], [640, 980]]), w: 30, depth: 0.35, blur: 20 },
          { d: line([[372, 520], [392, 780], [376, 990]]), w: 24, depth: -0.35, blur: 20 },
          { d: line([[760, 300], [600, 420]]), w: 18, depth: -0.3, blur: 14 },
          { d: line(M([[760, 300], [640, 400]])), w: 16, depth: -0.25, blur: 14 },
        ],
      },
      ...[cuffR, M(cuffR)].map((s) => ({ d: curve(s, true), dome: 10, z: 8, fabric: ribFab, color, color2: p.color2, drape: 0.3 })),
      { d: curve(hem, true), dome: 10, z: 3, fabric: ribFab, color, color2: p.color2, drape: 0.3 },
    ];
    if (zip && view !== 'back') {
      parts.push({ d: 'M410,152Q500,126,590,152L598,236Q566,256,522,258L522,420H478L478,258Q434,256,402,236Z', dome: 10, z: 10, fabric: ribFab, color, color2: p.color2, drape: 0 });
    } else if (zip) {
      parts.push({ d: 'M410,152Q500,128,590,152L596,220Q500,202,404,220Z', dome: 10, z: 10, fabric: ribFab, color, color2: p.color2, drape: 0 });
    } else if (p.vNeck && view !== 'back') {
      parts.push({ d: 'M590,156L500,336L410,156Q500,142,590,156Z', dome: 4, z: -10, fabric, color: shade(color, 0.55), cast: false, amp: 0.2, drape: 0 });
      parts.push({ d: 'M590,156L500,340L410,156L432,154L500,300L568,154Z', dome: 6, z: 6, fabric: ribFab, color, cast: false, drape: 0 });
    } else {
      if (view !== 'back') parts.push({ d: curve([[588, 158], [500, 138], [412, 158], ...neckInner.slice(1, 4).reverse()], true), dome: 4, z: -10, fabric, color: shade(color, 0.55), cast: false, amp: 0.2, drape: 0 });
      parts.push({ d: curve(neckOuter.concat(neckInner.slice().reverse()), true), dome: 8, z: 6, fabric: ribFab, color, color2: p.color2, cast: false, drape: 0 });
    }
    return {
      offset: { dx: 0, dy: 40 },
      parts,
      details(L) {
        if (zip && view !== 'back') {
          L.metal('M496,156H504V412H496Z', '#b9b2a4', 1);
          L.metal(rect(490, 240, 20, 30), '#c9c2b3', 1);
          L.raise(rect(490, 240, 20, 30), 0.8, 1.5);
        }
        if (p.label && view !== 'back') L.paint(rect(470, 1050, 60, 16), p.dark ? shade(color, 2) : shade(color, 0.55), 0.85);
        if (fabric === 'fleece' || fabric === 'melange') {
          const s = [[788, 214], [806, 330]];
          L.stitch(line(s), shade(color, 0.8), { w: 1.8 });
          L.stitch(line(M(s)), shade(color, 0.8), { w: 1.8 });
          if (p.print === 'type' && view !== 'back') {
            L.albedo.save();
            L.albedo.font = '800 58px Archivo, Arial Narrow, Arial, sans-serif';
            L.albedo.textAlign = 'center';
            L.albedo.globalAlpha = 0.85;
            L.albedo.fillStyle = p.dark ? '#e6e0d3' : '#24211c';
            L.albedo.fillText(p.printText || 'KROJ', 500, 400);
            L.albedo.restore();
          }
        }
      },
    };
  };

  // ---------------------------------------------------------------- 5-POCKET JEANS / TROUSERS
  G.jeans = (p, view) => {
    const fit = { slim: -1, straight: 0, relaxed: 1, wide: 2 }[p.fit || 'straight'];
    const knee = 732 + fit * 14, hemO = 722 + fit * 22 - (fit < 0 ? 10 : 0), hemI = 548 - fit * 4 + (fit < 0 ? 22 : 0);
    const len = p.short ? 640 : 1172;
    const right = p.short
      ? [[500, 108], [688, 108, 1], [696, 160], [730, 330], [744, 520], [752, len, 1], [540, len + 6, 1], [526, 600], [500, 566, 1]]
      : [[500, 108], [688, 108, 1], [696, 160], [728 + fit * 6, 330], [738 + fit * 10, 520], [knee, 800], [hemO, len, 1], [hemI, len + 2, 1], [536 - fit * 4, 820], [522, 640], [500, 566, 1]];
    const isDenim = (p.fabric || 'denim') === 'denim';
    const fabric = p.fabric || 'denim';
    const color = p.color;
    const thread = isDenim ? '#c98d3e' : shade(color, 0.78);
    const wb = 'M310,106H690L696,162Q500,168,304,162Z';
    const folds = [];
    if (!p.short) {
      // whiskers (front) / honeycombs (back)
      const wy = view === 'back' ? 0 : 1;
      if (!isDenim) {
        [[[560, 470], [640, 440]], [[580, 1000], [690, 990]]].forEach((s) => folds.push({ d: line(s), w: 14, depth: -0.4, blur: 10 }, { d: line(M(s)), w: 14, depth: -0.4, blur: 10 }));
      } else if (wy) {
        [[[548, 470], [640, 432]], [[552, 500], [668, 470]], [[556, 530], [662, 512]], [[560, 444], [620, 412]]].forEach((s) => {
          folds.push({ d: line(s), w: 7, depth: 0.85, blur: 4 }, { d: line(M(s)), w: 7, depth: 0.85, blur: 4 });
        });
      } else {
        [[[580, 1010], [690, 990]], [[586, 1040], [690, 1028]], [[592, 980], [680, 960]]].forEach((s) => {
          folds.push({ d: line(s), w: 7, depth: 0.85, blur: 4 }, { d: line(M(s)), w: 7, depth: 0.85, blur: 4 });
        });
      }
      // knee and stacking
      [[[560, 780], [640, 810], [710, 790]], [[566, 1100], [650, 1120], [712, 1104]], [[570, 1130], [640, 1146], [714, 1136]]].forEach((s) => {
        folds.push({ d: line(s), w: 16, depth: -0.55, blur: 10 }, { d: line(M(s)), w: 16, depth: -0.55, blur: 10 });
      });
      folds.push({ d: line([[640, 560], [652, 760], [640, 1000]]), w: 34, depth: 0.5, blur: 22 }, { d: line(M([[640, 560], [652, 760], [640, 1000]])), w: 34, depth: 0.5, blur: 22 });
      if (p.crease) folds.push({ d: line([[628, 170], [632, 1160]]), w: 4, depth: 0.8, blur: 2 }, { d: line(M([[628, 170], [632, 1160]])), w: 4, depth: 0.8, blur: 2 });
    } else {
      if (isDenim) [[[560, 470], [650, 440]], [[560, 500], [670, 480]]].forEach((s) => folds.push({ d: line(s), w: 8, depth: 0.7, blur: 5 }, { d: line(M(s)), w: 8, depth: 0.7, blur: 5 }));
    }
    const parts = [
      { d: sym(right), dome: 24, fabric, color, color2: p.color2 || '#dfe3e8', fade: isDenim ? (p.fade ?? 0.4) : 0, folds,
        seams: [
          { d: line([[500, 162], [500, 566]]), w: 3 },
          { d: line([[696, 162], [708, 520], [hemO - 8, len - 4]]), w: 2 },
          { d: line(M([[696, 162], [708, 520], [hemO - 8, len - 4]])), w: 2 },
        ] },
      { d: wb, dome: 8, z: 10, fabric, color, color2: p.color2 || '#dfe3e8', fade: isDenim ? 0.2 : 0, cast: false },
    ];
    return {
      offset: { dx: 0, dy: p.short ? 230 : 0 },
      parts,
      details(L) {
        // waistband stitching
        L.stitch('M312,114H688', thread, { w: 2 });
        L.stitch('M306,156Q500,162,694,156', thread, { w: 2 });
        // belt loops
        const loops = view === 'back' ? [356, 470, 530, 644] : [342, 446, 554, 658];
        loops.forEach((x) => {
          L.paint(rect(x - 8, 100, 16, 74), shade(color, 0.96));
          L.raise(rect(x - 8, 100, 16, 74), 0.7, 1.5);
          L.stitch(`M${x - 8},108H${x + 8}M${x - 8},166H${x + 8}`, thread, { w: 1.8, dash: [3, 2] });
        });
        // hems
        if (!p.short) {
          L.stitch(line([[hemO - 4, len - 22], [(hemO + hemI) / 2, len - 20], [hemI + 4, len - 18]]), thread, { w: 2 });
          L.stitch(line(M([[hemO - 4, len - 22], [(hemO + hemI) / 2, len - 20], [hemI + 4, len - 18]])), thread, { w: 2 });
        } else {
          L.stitch(line([[748, len - 24], [544, len - 20]]), thread, { w: 2 });
          L.stitch(line(M([[748, len - 24], [544, len - 20]])), thread, { w: 2 });
        }
        if (view !== 'back') {
          L.button(500, 134, 11, '#b7ab93', 'shank');
          // fly J-stitch
          L.stitch('M544,164V400Q544,436,504,446', thread, { w: 2 });
          L.stitch('M554,164V404Q552,446,506,458', thread, { w: 2 });
          L.raise('M500,164H544V400Q540,436,500,446Z', 0.25, 3);
          if (p.chinoPockets) {
            const sl = [[606, 164], [700, 330]];
            [sl, M(sl)].forEach((s) => { L.raise(line(s), -0.9, 2, false); L.stitch(line(offset(s, 10)), thread, { w: 1.8 }); });
          } else {
            // scoop pockets + coin pocket
            const pk = [[600, 164], [628, 250], [704, 290]];
            [pk, M(pk)].forEach((s) => {
              L.raise(line(s), -1, 2, false);
              L.stitch(line(offset(s, 9)), thread, { w: 2 });
              L.stitch(line(offset(s, 17)), thread, { w: 2 });
            });
            L.raise('M620,166H676L680,236L626,244Z', 0.3, 2);
            L.stitch('M626,174H674', thread, { w: 1.8 });
            L.stitch('M622,168L626,244L680,236', thread, { w: 1.8 });
            if (isDenim) [[702, 288], [298, 288], [624, 168], [676, 168]].forEach(([x, y]) => L.button(x, y, 4.5, '#b49a6c', 'rivet'));
          }
          if (p.cargo) {
            [[700, 560], [300, 560]].forEach(([x, y]) => {
              const d = rect(x - 70, y, 110, 150);
              const dd = x < 500 ? rect(x - 40, y, 110, 150) : d;
              L.raise(dd, 0.45, 3);
              L.stitch(dd, thread, { w: 1.8 });
              L.paint(x < 500 ? rect(x - 44, y - 10, 118, 40) : rect(x - 74, y - 10, 118, 40), shade(color, 0.98));
              L.raise(x < 500 ? rect(x - 44, y - 10, 118, 40) : rect(x - 74, y - 10, 118, 40), 0.6, 2);
            });
          }
        } else {
          // yoke + back pockets + patch
          const yoke = [[304, 162], [500, 236], [696, 162]];
          L.raise(line(yoke), -0.7, 2, false);
          L.stitch(line(offset(yoke, -8)), thread, { w: 2 });
          L.stitch(line(offset(yoke, -16)), thread, { w: 2 });
          if (!p.chinoPockets) {
            [[560, 260], [328, 260]].forEach(([x, y]) => {
              const d = `M${x},${y}L${x + 112},${y - 8}L${x + 108},${y + 120}L${x + 56},${y + 148}L${x + 4},${y + 124}Z`;
              L.raise(d, 0.45, 3);
              L.stitch(`M${x + 6},${y + 8}L${x + 106},${y}`, thread, { w: 2 });
              L.stitch(`M${x + 2},${y + 4}L${x + 6},${y + 122}L${x + 56},${y + 144}L${x + 104},${y + 118}L${x + 110},${y - 4}`, thread, { w: 2 });
              if (isDenim) L.stitch(`M${x + 14},${y + 56}Q${x + 34},${y + 86},${x + 56},${y + 60}Q${x + 78},${y + 86},${x + 98},${y + 56}`, thread, { w: 1.8 });
            });
          } else {
            [[560, 240], [330, 240]].forEach(([x, y]) => { L.raise(`M${x},${y}H${x + 110}`, -0.9, 1.5, false); L.stitch(`M${x},${y + 8}H${x + 110}`, thread, { w: 1.8 }); });
          }
          if (isDenim) { L.paint(rect(600, 118, 72, 36), '#8a6a48'); L.raise(rect(600, 118, 72, 36), 0.5, 1.5); }
        }
      },
    };
  };

  // ---------------------------------------------------------------- JOGGERS / TRACK PANTS
  G.joggers = (p, view) => {
    const len = p.short ? 660 : 1160;
    const right = p.short
      ? [[500, 120], [696, 120, 1], [710, 200], [748, 420], [758, len, 1], [540, len + 6, 1], [526, 600], [500, 560, 1]]
      : [[500, 120], [696, 120, 1], [712, 200], [744, 420], [736, 760], [700, 1070, 1], [576, 1076, 1], [540, 800], [522, 640], [500, 560, 1]];
    const fabric = p.fabric || 'fleece';
    const color = p.color;
    const parts = [
      { d: sym(right), dome: 28, fabric, color, color2: p.color2,
        folds: [
          { d: line([[560, 360], [640, 330]]), w: 12, depth: -0.5, blur: 8 }, { d: line(M([[560, 360], [640, 330]])), w: 12, depth: -0.5, blur: 8 },
          { d: line([[620, 600], [640, 820], [630, 1000]]), w: 30, depth: 0.5, blur: 20 }, { d: line(M([[620, 600], [640, 820], [630, 1000]])), w: 30, depth: 0.5, blur: 20 },
          ...(p.short ? [] : [[[590, 960], [700, 940]], [[586, 1000], [702, 990]], [[584, 1030], [700, 1024]], [[600, 900], [706, 880]]].flatMap((s) => [{ d: line(s), w: 12, depth: -0.7, blur: 7 }, { d: line(M(s)), w: 12, depth: -0.7, blur: 7 }])),
          ...[310, 360, 410, 460, 540, 590, 640, 690].map((x) => ({ d: `M${x},126V196`, w: 6, depth: -0.7, blur: 4 })),
        ] },
      { d: 'M302,118H698L702,196Q500,204,298,196Z', dome: 10, z: 10, fabric: 'rib', color, color2: p.color2, cast: false },
    ];
    if (!p.short) {
      parts.push({ d: curve([[576, 1070, 1], [700, 1066, 1], [696, 1150, 1], [580, 1154, 1]], true), dome: 8, z: 6, fabric: 'rib', color });
      parts.push({ d: curve(M([[576, 1070, 1], [700, 1066, 1], [696, 1150, 1], [580, 1154, 1]]), true), dome: 8, z: 6, fabric: 'rib', color });
    }
    return {
      offset: { dx: 0, dy: p.short ? 220 : 0 },
      parts,
      details(L) {
        const th = shade(color, 0.8);
        if (view !== 'back') {
          // drawcord
          L.paint('M486,196Q470,260,478,330', p.cord || '#e8e3d8', 1, 6);
          L.paint('M514,196Q532,262,522,326', p.cord || '#e8e3d8', 1, 6);
          L.raise('M486,196Q470,260,478,330M514,196Q532,262,522,326', 0.9, 2, false);
          L.metal(rect(472, 326, 12, 22), '#b9b2a4'); L.metal(rect(516, 322, 12, 22), '#b9b2a4');
          const sl = [[640, 200], [712, 380]];
          [sl, M(sl)].forEach((s) => L.raise(line(s), -0.9, 2, false));
          if (p.stripe) {
            [[708, 206], [292, 206]].forEach(([x], i) => {
              const d = i ? `M${x - 6},206L${x + 6},206L${p.short ? 254 : 274},${len - 10}L${p.short ? 240 : 262},${len - 10}Z` : `M${x - 6},206L${x + 6},206L${p.short ? 760 : 738},${len - 10}L${p.short ? 746 : 726},${len - 10}Z`;
              L.paint(d, p.stripe, 0.95);
            });
          }
        } else {
          L.raise('M560,260H660V380H560Z', 0.4, 3);
          L.stitch('M560,260V380H660V260', th, { w: 1.8 });
        }
        L.stitch('M300,190Q500,198,700,190', th, { w: 1.8 });
        if (p.short) {
          L.stitch(line([[754, len - 24], [544, len - 20]]), th, { w: 1.8 });
          L.stitch(line(M([[754, len - 24], [544, len - 20]])), th, { w: 1.8 });
        }
      },
    };
  };

  window.KROJ_GARMENT_HELPERS = { shade, rect, circle, offset, both };
})();
