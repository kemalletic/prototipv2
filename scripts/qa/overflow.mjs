// Lists elements that extend beyond the viewport width (horizontal overflow hunting).
import { chromium } from 'playwright';
const [,, url, w = '390'] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: 844 } });
await p.goto(url, { waitUntil: 'networkidle' });
const res = await p.evaluate(() => {
  const vw = document.documentElement.clientWidth;
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 && r.width > 0) {
      // skip elements inside horizontal scrollers
      let n = el.parentElement, inScroller = false;
      while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.overflowX === 'auto' || cs.overflowX === 'scroll' || cs.overflowX === 'hidden' || cs.overflowX === 'clip') { inScroller = true; break; } n = n.parentElement; }
      if (!inScroller) out.push(`${el.tagName.toLowerCase()}.${(el.className?.baseVal ?? el.className ?? '').toString().slice(0, 80)} right=${Math.round(r.right)}`);
    }
  });
  return { vw, sw: document.documentElement.scrollWidth, out: out.slice(0, 12) };
});
console.log(JSON.stringify(res, null, 1));
await b.close();
