'use client';
import { useSyncExternalStore } from 'react';
import { createPersisted } from './persisted';
import { getProductById, colorwayOf, stockOf } from '../catalog';
import { shippingFor } from '../commerce';
import { track, itemPayload } from '../analytics';

export interface CartLine { productId: string; colorId: string; size: string; qty: number }
export const MAX_QTY = 10;

export const cartStore = createPersisted<CartLine[]>('kroj.cart.v1', []);
// UI state is in-memory only: the drawer must not reopen on the next page load.
const uiListeners = new Set<() => void>();
let uiState = { cartOpen: false };
export const uiStore = {
  get: () => uiState,
  set(next: { cartOpen: boolean }) { uiState = next; uiListeners.forEach((l) => l()); },
  subscribe(l: () => void) { uiListeners.add(l); return () => { uiListeners.delete(l); }; },
  use(): { cartOpen: boolean } { return useSyncExternalStore(uiStore.subscribe, uiStore.get, () => SERVER_UI); },
};
const SERVER_UI = { cartOpen: false };

const same = (a: CartLine, b: Pick<CartLine, 'productId' | 'colorId' | 'size'>) => a.productId === b.productId && a.colorId === b.colorId && a.size === b.size;

export function addToCart(line: Omit<CartLine, 'qty'>, qty = 1, opts: { open?: boolean; list?: string } = {}) {
  const p = getProductById(line.productId);
  if (!p) return;
  const available = stockOf(p, line.colorId, line.size);
  cartStore.set((lines) => {
    const existing = lines.find((l) => same(l, line));
    if (existing) return lines.map((l) => (same(l, line) ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY, available || MAX_QTY) } : l));
    return [...lines, { ...line, qty: Math.min(qty, available || MAX_QTY) }];
  });
  track('add_to_cart', { currency: 'BAM', value: (p.price * qty) / 100, items: [itemPayload(p, line.colorId, line.size, qty)], list: opts.list });
  if (opts.open !== false) openCart();
}

export function setQty(line: CartLine, qty: number) {
  if (qty <= 0) return removeLine(line);
  cartStore.set((lines) => lines.map((l) => (same(l, line) ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)));
}

export function removeLine(line: CartLine) {
  const p = getProductById(line.productId);
  cartStore.set((lines) => lines.filter((l) => !same(l, line)));
  if (p) track('remove_from_cart', { currency: 'BAM', value: (p.price * line.qty) / 100, items: [itemPayload(p, line.colorId, line.size, line.qty)] });
}

export const clearCart = () => cartStore.set([]);
export const openCart = () => uiStore.set({ cartOpen: true });
export const closeCart = () => uiStore.set({ cartOpen: false });

export function resolveLines(lines: CartLine[]) {
  return lines
    .map((l) => {
      const p = getProductById(l.productId);
      if (!p) return null;
      const c = colorwayOf(p, l.colorId);
      return { line: l, product: p, colorway: c, total: p.price * l.qty, stock: stockOf(p, c.id, l.size) };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
}

export function totals(lines: CartLine[]) {
  const resolved = resolveLines(lines);
  const subtotal = resolved.reduce((s, r) => s + r.total, 0);
  const shipping = shippingFor(subtotal);
  const count = resolved.reduce((s, r) => s + r.line.qty, 0);
  return { resolved, subtotal, shipping, total: subtotal + shipping, count };
}
