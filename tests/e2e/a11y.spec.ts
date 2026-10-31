import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { prepare } from './helpers';

const PAGES = ['/', '/kolekcija/traperice', '/proizvod/neretva-ravne-traperice', '/naplata', '/pitanja', '/korpa'];

for (const path of PAGES) {
  test(`axe WCAG 2.1 AA: ${path}`, async ({ page }) => {
    await prepare(page);
    await page.goto(path, { waitUntil: 'networkidle' });
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const summary = r.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes[0]?.target.join(' ')}`);
    expect(summary).toEqual([]);
  });
}
