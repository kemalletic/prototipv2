// Verifies that clicking a rail garment triggers a View Transition with the shared garment name.
import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.addInitScript(() => {
  localStorage.setItem('kroj.consent.v1', JSON.stringify({ decided: true, analytics: false, marketing: false }));
  const orig = document.startViewTransition?.bind(document);
  window.__vt = [];
  if (orig) document.startViewTransition = (arg) => {
    const names = [...document.querySelectorAll('*')].map((e) => getComputedStyle(e).viewTransitionName).filter((n) => n && n !== 'none');
    window.__vt.push(names.filter((n) => n.startsWith('garment') || n.startsWith('rail') || n === 'site-header'));
    return orig(arg);
  };
});
await p.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
await p.waitForTimeout(1500); // let prefetch settle
await p.locator('#rail-list a').first().click();
await p.waitForURL('**/proizvod/**');
await p.waitForTimeout(250);
await p.screenshot({ path: '/tmp/shots/vt-mid.png' });
await p.waitForTimeout(900);
const vt = await p.evaluate(() => window.__vt);
console.log('view transitions started:', vt.length, JSON.stringify(vt).slice(0, 300));
const names = await p.evaluate(() => [...document.querySelectorAll('*')].map((e) => getComputedStyle(e).viewTransitionName).filter((n) => n && n !== 'none'));
console.log('names on PDP:', names.slice(0, 6));
await b.close();
