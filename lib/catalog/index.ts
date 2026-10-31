import { CATEGORIES, PRODUCTS, SIZES, media, sampleStock } from './data';
import type { Category, CategorySlug, Colorway, Product } from './data';
import { normalize } from '../format';

export type { Category, CategorySlug, Colorway, Product };
export { CATEGORIES, PRODUCTS, SIZES, media, sampleStock };

const bySlug = new Map(PRODUCTS.map((p) => [p.slug, p]));
const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

export const getProduct = (slug: string) => bySlug.get(slug);
export const getProductById = (id: string) => byId.get(id);
export const getCategory = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const productsIn = (slug: CategorySlug) => PRODUCTS.filter((p) => p.category === slug);
export const sizesFor = (p: Product) => SIZES[p.sizeSystem];
export const colorwayOf = (p: Product, colorId?: string | null) => p.colorways.find((c) => c.id === colorId) ?? p.colorways[0];

export const bestsellers = (n = 8) => [...PRODUCTS].sort((a, b) => b.popularity - a.popularity).slice(0, n);
export const newArrivals = (n = 8) => [...PRODUCTS].sort((a, b) => b.addedAt.localeCompare(a.addedAt)).slice(0, n);

export function stockOf(p: Product, colorId: string, size: string) {
  return sampleStock(p.id, colorId, size);
}
export function isSoldOut(p: Product, colorId: string) {
  return sizesFor(p).every((s) => stockOf(p, colorId, s) === 0);
}

export function lookFor(p: Product): Product[] {
  return (p.look ?? []).map((id) => byId.get(id)).filter((x): x is Product => !!x);
}

export function related(p: Product, n = 4): Product[] {
  const same = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id);
  const others = PRODUCTS.filter((x) => x.category !== p.category && !p.look?.includes(x.id) && x.id !== p.id).sort((a, b) => b.popularity - a.popularity);
  return [...same, ...others].slice(0, n);
}

export const displayName = (p: Product) => `${p.line} — ${p.type}`;

// ---------------------------------------------------------------- search
const index = PRODUCTS.map((p) => ({
  p,
  hay: normalize([p.line, p.type, p.category, getCategory(p.category)?.name, p.composition, p.fit, ...p.colorways.map((c) => c.name)].join(' ')),
}));

const SYNONYMS: Record<string, string> = {
  farmerke: 'traperice', jeans: 'traperice', dzins: 'traperice', hlace: 'pantalone', pantalone: 'pantalone',
  duks: 'dukserica', hoodie: 'kapuljac', majca: 'majica', tshirt: 'majica', 'tee': 'majica', jakna: 'jakna',
  kais: 'kais', remen: 'kais', pojas: 'kais', kapa: 'kapa', sal: 'sal', trenerka: 'trenerk', dzemper: 'dzemper',
  pulover: 'dzemper', sorc: 'sorc', bermude: 'sorc', prsluk: 'prsluk', vesta: 'prsluk',
};

export function search(q: string): Product[] {
  const terms = normalize(q).split(/\s+/).filter(Boolean).map((t) => SYNONYMS[t] ?? t);
  if (!terms.length) return [];
  return index
    .map(({ p, hay }) => {
      let score = 0;
      for (const t of terms) {
        const stem = t.length > 4 ? t.slice(0, -1) : t; // forgiving for Bosnian inflection
        if (hay.includes(t)) score += 2;
        else if (hay.includes(stem)) score += 1;
        else return { p, score: -1 };
      }
      return { p, score: score + p.popularity / 100 };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.p);
}

// ---------------------------------------------------------------- rail curation (homepage)
export const RAIL = [
  'p31', 'p24', 'p29', 'p12', 'p01', 'p30', 'p20', 'p13', 'p07', 'p26', 'p32', 'p40', 'p18', 'p03', 'p34', 'p42', 'p25', 'p09',
].map((id) => byId.get(id)!).filter(Boolean);

export function imagesOf(p: Product, c: Colorway) {
  return { front: media.front(p, c), back: p.art.back ? media.back(p, c) : null, detail: media.detail(p, c) };
}
