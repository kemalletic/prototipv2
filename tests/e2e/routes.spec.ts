import { expect, test } from '@playwright/test';
import { prepare, collectErrors } from './helpers';

const ROUTES = [
  '/', '/kolekcija/sve', '/kolekcija/novo', '/kolekcija/traperice', '/kolekcija/pantalone', '/kolekcija/majice', '/kolekcija/trenerke',
  '/kolekcija/dzemperi', '/kolekcija/jakne-i-prsluci', '/kolekcija/sorcevi', '/kolekcija/kaisevi-i-dodaci',
  '/proizvod/neretva-ravne-traperice', '/proizvod/jahorina-prosivena-jakna', '/proizvod/kozni-kais-35mm', '/proizvod/osnovna-majica',
  '/korpa', '/naplata', '/zelje', '/pretraga?q=jakna', '/o-nama', '/kontakt', '/dostava', '/povrat-i-zamjena', '/vodic-za-velicine',
  '/pitanja', '/privatnost', '/uslovi-kupovine', '/kolacici',
];

for (const route of ROUTES) {
  test(`renders ${route} without errors or horizontal overflow`, async ({ page }) => {
    await prepare(page);
    const errors = collectErrors(page);
    const res = await page.goto(route, { waitUntil: 'networkidle' });
    expect(res?.status()).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });
}

test('unknown routes return a designed 404', async ({ page }) => {
  const res = await page.goto('/ovo-ne-postoji');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: /Prazna/ })).toBeVisible();
});

test('every internal link on the homepage resolves', async ({ page, request }) => {
  await page.goto('/');
  const hrefs = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')!.split('#')[0]))]);
  for (const h of hrefs) {
    const r = await request.get(h);
    expect(r.status(), h).toBe(200);
  }
});
