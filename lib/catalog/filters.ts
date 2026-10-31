import type { Product, FabricKey } from './data';
import { SIZES, sampleStock } from './data';

export const MATERIAL: Record<FabricKey, string> = {
  denim: 'Denim', chino: 'Pamuk', jersey: 'Pamuk', heavyjersey: 'Pamuk', melange: 'Flis', fleece: 'Flis', rib: 'Vuna',
  knit: 'Vuna', fineknit: 'Merino', nylon: 'Tehnički materijal', puffer: 'Tehnički materijal', wool: 'Vuna', cord: 'Samt', canvas: 'Platno', leather: 'Koža', webbing: 'Pamuk',
};

export const PRICE_BANDS = [
  { id: 'do-50', label: 'Do 50 KM', min: 0, max: 5000 },
  { id: '50-100', label: '50–100 KM', min: 5000, max: 10000 },
  { id: '100-150', label: '100–150 KM', min: 10000, max: 15000 },
  { id: 'preko-150', label: 'Preko 150 KM', min: 15000, max: Infinity },
];

export const SORTS = [
  { id: 'preporuceno', label: 'Preporučeno' },
  { id: 'novo', label: 'Najnovije' },
  { id: 'cijena-rastuce', label: 'Cijena: od niže' },
  { id: 'cijena-opadajuce', label: 'Cijena: od više' },
] as const;
export type SortId = (typeof SORTS)[number]['id'];

export interface FilterState { velicina: string[]; boja: string[]; kroj: string[]; materijal: string[]; cijena: string[]; sort: SortId }
export const FILTER_KEYS = ['velicina', 'boja', 'kroj', 'materijal', 'cijena'] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export const FILTER_LABEL: Record<FilterKey, string> = { velicina: 'Veličina', boja: 'Boja', kroj: 'Kroj', materijal: 'Materijal', cijena: 'Cijena' };

export function parseFilters(sp: URLSearchParams): FilterState {
  const list = (k: string) => (sp.get(k) ?? '').split(',').filter(Boolean);
  const sort = (SORTS.find((s) => s.id === sp.get('sort'))?.id ?? 'preporuceno') as SortId;
  return { velicina: list('velicina'), boja: list('boja'), kroj: list('kroj'), materijal: list('materijal'), cijena: list('cijena'), sort };
}

export function toQuery(f: FilterState): string {
  const sp = new URLSearchParams();
  FILTER_KEYS.forEach((k) => { if (f[k].length) sp.set(k, f[k].join(',')); });
  if (f.sort !== 'preporuceno') sp.set('sort', f.sort);
  const s = sp.toString();
  return s ? `?${s}` : '';
}

/** Colour families keep the filter short even though colourway names are specific. */
export function colorFamily(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('indigo') || n.includes('plava') || n.includes('stone')) return n.includes('tamno') || n.includes('indigo') ? 'Tamnoplava' : 'Plava';
  if (n.includes('crna')) return 'Crna';
  if (n.includes('bijela')) return 'Bijela';
  if (n.includes('ecru') || n.includes('krem')) return 'Ecru';
  if (n.includes('siva') || n.includes('antracit') || n.includes('grafit')) return 'Siva';
  if (n.includes('maslin') || n.includes('zelen') || n.includes('kaki')) return 'Zelena';
  if (n.includes('smeđ') || n.includes('bakar')) return 'Smeđa';
  if (n.includes('bež') || n.includes('kamen')) return 'Bež';
  if (n.includes('bordo')) return 'Bordo';
  return 'Ostalo';
}
export const FAMILY_HEX: Record<string, string> = {
  Tamnoplava: '#25304a', Plava: '#4a6890', Crna: '#1f1f21', Bijela: '#efece5', Ecru: '#e4ddcd', Siva: '#8a8884', Zelena: '#5e5f45', Smeđa: '#6b5a44', Bež: '#b8a888', Bordo: '#5b2630', Ostalo: '#999',
};

export function facets(products: Product[]) {
  const sizes = new Set<string>(), colors = new Set<string>(), fits = new Set<string>(), mats = new Set<string>();
  products.forEach((p) => {
    SIZES[p.sizeSystem].forEach((s) => s !== 'UNI' && sizes.add(s));
    p.colorways.forEach((c) => colors.add(colorFamily(c.name)));
    if (p.fit !== 'Uni') fits.add(p.fit);
    mats.add(MATERIAL[p.fabric]);
  });
  const sizeOrder = [...SIZES.alpha, ...SIZES.waist, ...SIZES.belt, ...SIZES.socks];
  return {
    velicina: [...sizes].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b)),
    boja: [...colors].sort(),
    kroj: [...fits],
    materijal: [...mats].sort(),
    cijena: PRICE_BANDS.filter((b) => products.some((p) => p.price >= b.min && p.price < b.max)).map((b) => b.id),
  };
}

export function applyFilters(products: Product[], f: FilterState): Product[] {
  const out = products.filter((p) => {
    if (f.velicina.length && !f.velicina.some((s) => p.colorways.some((c) => SIZES[p.sizeSystem].includes(s) && sampleStock(p.id, c.id, s) > 0))) return false;
    if (f.boja.length && !p.colorways.some((c) => f.boja.includes(colorFamily(c.name)))) return false;
    if (f.kroj.length && !f.kroj.includes(p.fit)) return false;
    if (f.materijal.length && !f.materijal.includes(MATERIAL[p.fabric])) return false;
    if (f.cijena.length && !f.cijena.some((id) => { const b = PRICE_BANDS.find((x) => x.id === id); return b && p.price >= b.min && p.price < b.max; })) return false;
    return true;
  });
  return sortProducts(out, f.sort);
}

export function sortProducts(list: Product[], sort: SortId): Product[] {
  const l = [...list];
  if (sort === 'novo') l.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  else if (sort === 'cijena-rastuce') l.sort((a, b) => a.price - b.price);
  else if (sort === 'cijena-opadajuce') l.sort((a, b) => b.price - a.price);
  else l.sort((a, b) => b.popularity - a.popularity);
  return l;
}

export const optionLabel = (k: FilterKey, v: string) => (k === 'cijena' ? PRICE_BANDS.find((b) => b.id === v)?.label ?? v : v);
