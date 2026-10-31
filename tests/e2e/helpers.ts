import type { Page } from '@playwright/test';

/** Pre-decide cookie consent so the banner doesn't cover the UI under test. */
export async function prepare(page: Page, analytics = true) {
  await page.addInitScript((a) => {
    localStorage.setItem('kroj.consent.v1', JSON.stringify({ decided: true, analytics: a, marketing: false }));
  }, analytics);
}

export function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  return errors;
}

export const events = (page: Page) => page.evaluate(() => (window.__krojEvents ?? []).map((e) => e.event));
