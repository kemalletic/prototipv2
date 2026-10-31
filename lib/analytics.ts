'use client';
/**
 * Consent-gated analytics instrumentation (GA4-compatible event names where they exist).
 * Nothing leaves the browser in this prototype: events go to window.dataLayer (only with consent)
 * and to an in-memory debug log (window.__krojEvents) for QA. See docs/ANALYTICS.md.
 */
import type { Product } from './catalog/data';
import { createPersisted } from './store/persisted';

export type Consent = { decided: boolean; analytics: boolean; marketing: boolean };
export const consentStore = createPersisted<Consent>('kroj.consent.v1', { decided: false, analytics: false, marketing: false });

export type EventName =
  | 'view_item_list' | 'select_item' | 'view_item' | 'add_to_cart' | 'remove_from_cart' | 'add_to_wishlist'
  | 'view_cart' | 'begin_checkout' | 'add_shipping_info' | 'add_payment_info'
  | 'order_submitted' | 'order_submit_failed' | 'search' | 'size_guide_open' | 'look_add' | 'fabric_view';

declare global {
  interface Window { dataLayer?: unknown[]; __krojEvents?: Array<{ event: string; ts: number; sent: boolean; [k: string]: unknown }> }
}

export function itemPayload(p: Product, colorId?: string, size?: string, qty = 1) {
  return { item_id: p.id, item_name: `${p.line} ${p.type}`, item_category: p.category, item_variant: [colorId, size].filter(Boolean).join(' / ') || undefined, price: p.price / 100, quantity: qty };
}

export function track(event: EventName, payload: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const consent = consentStore.get();
  const sent = consent.analytics;
  (window.__krojEvents ||= []).push({ event, ts: Date.now(), sent, ...payload });
  if (sent) (window.dataLayer ||= []).push({ event, ecommerce: payload });
  if (process.env.NODE_ENV === 'development') console.debug('[analytics]', event, sent ? '' : '(not sent: no consent)', payload);
}

/** Batches product impressions per list to avoid one event per card. */
const pending = new Map<string, Set<string>>();
let timer: ReturnType<typeof setTimeout> | null = null;
export function trackImpression(list: string, p: Product, index: number) {
  if (!pending.has(list)) pending.set(list, new Set());
  pending.get(list)!.add(`${p.id}:${index}:${p.price}:${p.line} ${p.type}:${p.category}`);
  if (timer) return;
  timer = setTimeout(() => {
    pending.forEach((set, l) => {
      const items = [...set].map((s) => { const [id, i, price, name, cat] = s.split(':'); return { item_id: id, index: Number(i), price: Number(price) / 100, item_name: name, item_category: cat }; });
      track('view_item_list', { item_list_id: l, items });
    });
    pending.clear();
    timer = null;
  }, 600);
}
