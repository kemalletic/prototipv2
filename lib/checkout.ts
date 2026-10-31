/** Checkout validation shared by the client form and the mock order API (never trust client totals). */
import { getProductById, sampleStock, SIZES } from './catalog';
import { shippingFor } from './commerce';

export interface CheckoutInput {
  name: string; phone: string; email?: string;
  street: string; city: string; zip: string; note?: string;
  terms: boolean;
}
export type Errors = Partial<Record<keyof CheckoutInput, string>>;

/** Normalises BiH phone numbers to +387 format; returns null if invalid. */
export function normalizePhone(raw: string): string | null {
  let d = raw.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('387')) d = '0' + d.slice(3);
  if (!/^0\d{8,9}$/.test(d)) return null;
  return `+387 ${d.slice(1, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function validate(v: CheckoutInput): Errors {
  const e: Errors = {};
  if (v.name.trim().length < 3 || !/\s/.test(v.name.trim())) e.name = 'Unesite ime i prezime.';
  if (!normalizePhone(v.phone)) e.phone = 'Unesite ispravan broj telefona, npr. 061 234 567.';
  if (v.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'E-mail adresa nije ispravna.';
  if (v.street.trim().length < 4 || !/\d/.test(v.street)) e.street = 'Unesite ulicu i kućni broj.';
  if (v.city.trim().length < 2) e.city = 'Unesite grad ili mjesto.';
  if (!/^[78]\d{4}$/.test(v.zip.trim())) e.zip = 'Poštanski broj u BiH ima 5 cifara (npr. 71000).';
  if (!v.terms) e.terms = 'Potrebno je prihvatiti uslove kupovine.';
  return e;
}

export interface LineInput { productId: string; colorId: string; size: string; qty: number }

/** Re-prices the order from the catalogue. Returns null if any line is invalid or out of stock. */
export function priceOrder(lines: LineInput[]) {
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 30) return null;
  let subtotal = 0;
  for (const l of lines) {
    const p = getProductById(l.productId);
    if (!p || !p.colorways.some((c) => c.id === l.colorId) || !SIZES[p.sizeSystem].includes(l.size)) return null;
    if (!Number.isInteger(l.qty) || l.qty < 1 || l.qty > 10) return null;
    if (sampleStock(p.id, l.colorId, l.size) < l.qty) return null;
    subtotal += p.price * l.qty;
  }
  const shipping = shippingFor(subtotal);
  return { subtotal, shipping, total: subtotal + shipping };
}

/** Major BiH cities with their main postal code (for autofill; user can still edit). */
export const CITIES: Array<[string, string]> = [
  ['Sarajevo', '71000'], ['Banja Luka', '78000'], ['Tuzla', '75000'], ['Zenica', '72000'], ['Mostar', '88000'],
  ['Bijeljina', '76300'], ['Brčko', '76100'], ['Bihać', '77000'], ['Prijedor', '79101'], ['Trebinje', '89101'],
  ['Doboj', '74000'], ['Cazin', '77220'], ['Travnik', '72270'], ['Goražde', '73000'], ['Konjic', '88400'],
  ['Livno', '80101'], ['Gradačac', '76250'], ['Visoko', '71300'], ['Lukavac', '75300'], ['Zvornik', '75400'],
  ['Široki Brijeg', '88220'], ['Čapljina', '88300'], ['Kakanj', '72240'], ['Gračanica', '75320'], ['Sanski Most', '79260'],
  ['Bugojno', '70230'], ['Jajce', '70101'], ['Foča', '73300'], ['Srebrenik', '75350'], ['Velika Kladuša', '77230'],
];
