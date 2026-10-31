import { chromium } from 'playwright';
const base = 'http://localhost:3100';
const b = await chromium.launch();
const shot = async (vp, path, fn, out) => {
  const p = await b.newPage({ viewport: vp });
  await p.addInitScript(() => localStorage.setItem('kroj.consent.v1', JSON.stringify({ decided: true, analytics: false, marketing: false })));
  await p.goto(base + path, { waitUntil: 'networkidle' });
  await fn(p); await p.waitForTimeout(700);
  await p.screenshot({ path: out }); await p.close();
};
const D = { width: 1440, height: 900 }, M = { width: 390, height: 844 };
await shot(D, '/', async (p) => { await p.getByRole('button', { name: 'Traži' }).click(); await p.getByRole('combobox', { name: 'Pretraži proizvode' }).fill('jakna'); }, '/tmp/shots/o-search.png');
await shot(M, '/', async (p) => { await p.getByRole('button', { name: 'Otvori meni' }).click(); }, '/tmp/shots/o-menu.png');
await shot(D, '/proizvod/osnovna-majica', async (p) => { await p.getByRole('button', { name: 'Vodič za veličine' }).click(); await p.getByLabel('Visina (cm)').fill('182'); await p.getByLabel('Težina (kg)').fill('84'); }, '/tmp/shots/o-size.png');
await shot(D, '/proizvod/romanija-radna-jakna', async (p) => { await p.getByRole('button', { name: /Uvećaj:/ }).first().click(); }, '/tmp/shots/o-zoom.png');
await shot(M, '/kolekcija/dzemperi', async (p) => { await p.getByRole('button', { name: /Filteri/ }).click(); }, '/tmp/shots/o-filter.png');
await shot(D, '/dostava', async () => {}, '/tmp/shots/o-info.png');
await b.close();
