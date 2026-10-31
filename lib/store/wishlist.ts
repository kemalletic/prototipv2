'use client';
import { createPersisted } from './persisted';
import { getProductById } from '../catalog';
import { track, itemPayload } from '../analytics';

export const wishlistStore = createPersisted<string[]>('kroj.wishlist.v1', []);

export function toggleWishlist(productId: string) {
  const has = wishlistStore.get().includes(productId);
  wishlistStore.set((ids) => (has ? ids.filter((x) => x !== productId) : [productId, ...ids]));
  const p = getProductById(productId);
  if (p && !has) track('add_to_wishlist', { currency: 'BAM', value: p.price / 100, items: [itemPayload(p)] });
  return !has;
}
