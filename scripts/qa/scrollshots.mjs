// Scrolls through a page like a user and captures viewport frames (triggers lazy images + scroll reveals).
import { chromium } from 'playwright';
const [,, url, prefix, w = '1440', h = '900', maxFrames = '8'] = process.argv;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.addInitScript(() => localStorage.setItem('kroj.consent.v1', JSON.stringify({ decided: true, analytics: false, marketing: false })));
await p.goto(url, { waitUntil: 'networkidle' });
const total = await p.evaluate(() => document.documentElement.scrollHeight);
let y = 0, i = 0;
while (y < total && i < +maxFrames) {
  await p.evaluate((yy) => window.scrollTo(0, yy), y);
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${prefix}-${i}.png` });
  y += +h * 0.92; i++;
}
console.log('frames', i, 'height', total);
await b.close();
