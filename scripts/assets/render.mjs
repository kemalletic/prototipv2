#!/usr/bin/env node
/* Renders placeholder product imagery through headless Chromium.
 * Usage:
 *   node scripts/assets/render.mjs                 # render every job from jobs.mjs (skips existing)
 *   node scripts/assets/render.mjs --force         # re-render everything
 *   node scripts/assets/render.mjs --only tee,jeans # filter by substring of output path
 *   node scripts/assets/render.mjs --test          # quick proof sheet into scripts/assets/.cache
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const test = args.includes('--test');
const onlyIdx = args.indexOf('--only');
const only = onlyIdx >= 0 ? args[onlyIdx + 1].split(',') : null;

const engine = await fs.readFile(path.join(here, 'engine.js'), 'utf8');
const garments = await fs.readFile(path.join(here, 'garments.js'), 'utf8');
const garments2 = await fs.readFile(path.join(here, 'garments2.js'), 'utf8').catch(() => '');
const scenes = await fs.readFile(path.join(here, 'scenes.js'), 'utf8').catch(() => '');

let jobs;
if (test) {
  const t = (await import(path.join(here, 'test-jobs.mjs') + `?${Date.now()}`)).default;
  jobs = t.map((j) => ({ ...j, out: path.join(here, '.cache', j.out) }));
} else {
  jobs = (await import(path.join(here, 'jobs.mjs'))).buildJobs().map((j) => ({ ...j, out: path.join(root, 'public', j.out) }));
}
if (only) jobs = jobs.filter((j) => only.some((o) => j.out.includes(o)));

const browser = await chromium.launch({ args: ['--disable-web-security'] });
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', (e) => console.error('[pageerror]', e.message));
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: engine });
await page.addScriptTag({ content: garments });
if (garments2) await page.addScriptTag({ content: garments2 });
if (scenes) await page.addScriptTag({ content: scenes });

let done = 0, skipped = 0;
const t0 = Date.now();
for (const job of jobs) {
  if (!force && !test) {
    try { await fs.access(job.out); skipped++; continue; } catch {}
  }
  await fs.mkdir(path.dirname(job.out), { recursive: true });
  const result = await page.evaluate(async (j) => {
    const toURL = (c) => c.toDataURL('image/png');
    if (j.kind === 'macro') {
      const r = window.KROJ.renderMacro(j);
      return { main: toURL(r.lit), normal: r.normal && toURL(r.normal), albedo: r.albedo && toURL(r.albedo) };
    }
    if (j.kind === 'scene') return { main: toURL(await window.KROJ_SCENES[j.scene](j)) };
    return { main: toURL(window.KROJ.renderGarment(j)) };
  }, job);
  const save = async (dataURL, out) => {
    const buf = Buffer.from(dataURL.split(',')[1], 'base64');
    let img = sharp(buf);
    if (job.resize) img = img.resize(job.resize);
    if (out.endsWith('.png')) await img.png().toFile(out);
    else await img.webp({ quality: job.quality || 80, alphaQuality: 90, effort: 5, smartSubsample: true }).toFile(out);
  };
  await save(result.main, job.out);
  if (result.normal) await save(result.normal, job.out.replace(/\.webp$/, '-normal.webp'));
  if (result.albedo) await save(result.albedo, job.out.replace(/\.webp$/, '-albedo.webp'));
  done++;
  if (done % 10 === 0 || test) console.log(`${done}/${jobs.length - skipped}  ${path.relative(root, job.out)}  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}
await browser.close();
console.log(`rendered ${done}, skipped ${skipped} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
