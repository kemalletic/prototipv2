import { expect, test } from '@playwright/test';
import { prepare } from './helpers';

test.beforeEach(async ({ page }) => { await prepare(page); });

test('category filters sync with the URL and can be cleared', async ({ page, isMobile }) => {
  await page.goto('/kolekcija/traperice');
  await expect(page.getByText('6 proizvoda')).toBeVisible();
  if (isMobile) await page.getByRole('button', { name: /Filteri/ }).click();
  const scope = isMobile ? page.getByRole('dialog', { name: 'Filteri' }) : page.getByRole('complementary', { name: 'Filteri' });
  await scope.getByText('Slim', { exact: true }).click();
  await expect(page).toHaveURL(/kroj=Slim/);
  if (isMobile) await scope.getByRole('button', { name: /Prikaži 2 proizvoda/ }).click();
  await expect(page.getByText('2 proizvoda', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Očisti sve' }).click();
  await expect(page).not.toHaveURL(/kroj=/);
  await expect(page.getByText('6 proizvoda')).toBeVisible();
});

test('sorting by price orders the grid', async ({ page }) => {
  await page.goto('/kolekcija/majice?sort=cijena-rastuce');
  const read = async () => (await page.locator('main article p.tabular').allTextContents()).map((t) => parseFloat(t.replace(/\./g, '').replace(',', '.')));
  await expect.poll(async () => { const n = await read(); return n.length > 1 && n.every((v, i) => i === 0 || n[i - 1] <= v); }).toBe(true);
});

test('search is diacritic-insensitive', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Traži' }).click();
  await page.getByRole('combobox', { name: 'Pretraži proizvode' }).fill('dzemper');
  await expect(page.getByRole('option').first()).toContainText(/Džemper|Prenj|Merino|Čvrsnica/);
  await page.getByRole('combobox', { name: 'Pretraži proizvode' }).fill('xyzxyz');
  await expect(page.getByText(/Nismo pronašli ništa/)).toBeVisible();
});

test('wishlist persists across pages', async ({ page }) => {
  await page.goto('/proizvod/jahorina-prosivena-jakna');
  await page.getByRole('button', { name: /Sačuvaj Jahorina/ }).first().click();
  await page.goto('/zelje');
  await expect(page.getByText('Jahorina', { exact: true })).toBeVisible();
});

test('rail category tabs re-hang the rail', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('18 komada na vješalici')).toBeVisible();
  await page.getByRole('tab', { name: 'Traperice' }).click();
  await expect(page.getByRole('tab', { name: 'Traperice' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText(/^2 komada na vješalici/)).toBeVisible();
});

test('look composer cycles layers and requires sizes before adding', async ({ page }) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: 'Složi look' });
  await section.scrollIntoViewIfNeeded();
  await section.getByRole('button', { name: 'Sljedeći: Gornji dio' }).click();
  await expect(section.getByRole('link', { name: /Osnova — Majica/ })).toBeVisible();
  await section.getByRole('button', { name: 'Dodaj cijeli look u korpu' }).click();
  await expect(section.getByRole('alert')).toContainText('Odaberite veličinu');
});

test('size guide estimates a size and selects it', async ({ page }) => {
  await page.goto('/proizvod/osnovna-majica');
  await page.getByRole('button', { name: 'Vodič za veličine' }).click();
  const dlg = page.getByRole('dialog', { name: 'Vodič za veličine' });
  await dlg.getByLabel('Visina (cm)').fill('182');
  await dlg.getByLabel('Težina (kg)').fill('80');
  await dlg.getByRole('button', { name: /Odaberi/ }).click();
  await expect(page.getByText(/Veličina: (M|L)/)).toBeVisible();
});

test('consent banner offers equal choices and records the decision', async ({ browser }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('/');
  const banner = page.getByRole('region', { name: 'Postavke kolačića' });
  await expect(banner).toBeVisible();
  await banner.getByRole('button', { name: 'Samo neophodni' }).click();
  await expect(banner).toBeHidden();
  const c = await page.evaluate(() => JSON.parse(localStorage.getItem('kroj.consent.v1')!));
  expect(c).toMatchObject({ decided: true, analytics: false });
  await ctx.close();
});
