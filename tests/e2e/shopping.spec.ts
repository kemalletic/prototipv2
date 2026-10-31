import { expect, test } from '@playwright/test';
import { prepare, collectErrors, events } from './helpers';

test.beforeEach(async ({ page }) => { await prepare(page); });

test('PDP requires a size, adds to cart and opens the drawer', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/proizvod/prenj-dzemper-okruglog-izreza');
  const buy = page.getByRole('button', { name: /Dodaj u korpu/ }).first();
  await buy.click();
  await expect(page.getByText('Odaberite veličinu da biste dodali u korpu.')).toBeVisible();
  await page.getByRole('button', { name: /^M(,|$)/ }).first().click();
  await buy.click();
  const drawer = page.getByRole('dialog', { name: 'Korpa' });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText('Prenj — Džemper okruglog izreza')).toBeVisible();
  await expect(drawer.getByText('Veličina M')).toBeVisible();
  expect(await events(page)).toContain('add_to_cart');
  expect(errors).toEqual([]);
});

test('colour change updates the gallery and URL', async ({ page }) => {
  await page.goto('/proizvod/neretva-ravne-traperice');
  await page.getByRole('button', { name: 'Isprana plava' }).click();
  await expect(page).toHaveURL(/boja=isprana-plava/);
  await expect(page.getByText('Boja: Isprana plava')).toBeVisible();
  await expect(page.locator('img[src*="isprana-plava-front"]').first()).toBeAttached();
});

test('cart quantity, totals, free-shipping threshold and removal', async ({ page }) => {
  await page.goto('/proizvod/osnovna-majica');
  await page.getByRole('button', { name: /^L(,|$)/ }).first().click();
  await page.getByRole('button', { name: /Dodaj u korpu/ }).first().click();
  await page.goto('/korpa');
  await expect(page.getByText(/do besplatne dostave/)).toBeVisible();
  const inc = page.getByRole('button', { name: 'Povećaj količinu' });
  for (let i = 0; i < 4; i++) await inc.click(); // 5 × 35 KM = 175 KM ≥ 150 KM
  await expect(page.getByText('Dostava je besplatna.')).toBeVisible();
  await expect(page.getByText('175,00 KM').first()).toBeVisible();
  await page.getByRole('button', { name: 'Ukloni' }).click();
  await expect(page.getByText('Vaša korpa je prazna.')).toBeVisible();
});

test('guest COD checkout: validation, submission and confirmation', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('/proizvod/kozara-traper-jakna');
  await page.getByRole('button', { name: /^M(,|$)/ }).first().click();
  await page.getByRole('button', { name: /Dodaj u korpu/ }).first().click();
  await page.goto('/naplata');
  await page.getByRole('button', { name: /Potvrdi narudžbu/ }).click();
  await expect(page.getByText(/Provjerite \d+ polja/)).toBeVisible();
  await expect(page.getByLabel('Ime i prezime')).toBeFocused();
  await page.getByLabel('Ime i prezime').fill('Amir Hodžić');
  await page.getByLabel('Broj telefona').fill('061 234 567');
  await page.getByLabel('Ulica i kućni broj').fill('Ferhadija 12');
  await page.getByLabel('Grad ili mjesto').fill('Mostar');
  await page.getByLabel('Poštanski broj').click();
  await expect(page.getByLabel('Poštanski broj')).toHaveValue('88000');
  await page.getByRole('checkbox', { name: /Prihvatam/ }).check();
  await page.getByRole('button', { name: /Potvrdi narudžbu/ }).click();
  await expect(page).toHaveURL(/\/narudzba\/KR-[A-Z0-9]{6}$/);
  await expect(page.getByRole('heading', { name: 'Hvala, Amir.' })).toBeVisible();
  await expect(page.getByText('Demo narudžba u prototipu')).toBeVisible();
  await expect(page.getByText('Potvrda telefonom')).toBeVisible();
  const ev = await events(page);
  for (const e of ['begin_checkout', 'add_payment_info', 'order_submitted']) expect(ev).toContain(e);
  await page.goto('/korpa');
  await expect(page.getByText('Vaša korpa je prazna.')).toBeVisible();
  expect(errors).toEqual([]);
});

test('checkout shows a recoverable error when the order service fails', async ({ page }) => {
  await page.goto('/proizvod/kozni-kais-35mm');
  await page.getByRole('button', { name: /^90(,|$)/ }).first().click();
  await page.getByRole('button', { name: /Dodaj u korpu/ }).first().click();
  await page.goto('/naplata');
  await page.getByLabel('Ime i prezime').fill('Test #greska Korisnik');
  await page.getByLabel('Broj telefona').fill('+387 62 111 222');
  await page.getByLabel('Ulica i kućni broj').fill('Titova 5');
  await page.getByLabel('Grad ili mjesto').fill('Tuzla');
  await page.getByLabel('Poštanski broj').fill('75000');
  await page.getByRole('checkbox', { name: /Prihvatam/ }).check();
  await page.getByRole('button', { name: /Potvrdi narudžbu/ }).click();
  await expect(page.getByText('Narudžba nije poslana. Server trenutno ne odgovara.')).toBeVisible();
  await expect(page.getByLabel('Ime i prezime')).toHaveValue('Test #greska Korisnik');
  await expect(page).toHaveURL(/\/naplata$/);
});

test('empty checkout shows an empty state', async ({ page }) => {
  await page.goto('/naplata');
  await expect(page.getByText('Vaša korpa je prazna, pa nema šta naplatiti.')).toBeVisible();
});

test('order API re-prices and rejects tampered lines', async ({ request }) => {
  const customer = { name: 'Ana Babić', phone: '061111222', street: 'Ulica 1', city: 'Sarajevo', zip: '71000', terms: true };
  const ok = await request.post('/api/narudzbe', { data: { customer, lines: [{ productId: 'p12', colorId: 'bijela', size: 'M', qty: 2 }] } });
  expect(ok.status()).toBe(201);
  const body = await ok.json();
  expect(body.order).toMatchObject({ subtotal: 7000, shipping: 800, total: 7800, status: 'zaprimljena' });
  const bad = await request.post('/api/narudzbe', { data: { customer, lines: [{ productId: 'p12', colorId: 'nepostojeca', size: 'M', qty: 1 }] } });
  expect(bad.status()).toBe(409);
  const invalid = await request.post('/api/narudzbe', { data: { customer: { ...customer, phone: '123' }, lines: [] } });
  expect(invalid.status()).toBe(422);
});
