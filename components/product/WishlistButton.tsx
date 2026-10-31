'use client';
import { Icon } from '@/components/ui/Icon';
import { toggleWishlist, wishlistStore } from '@/lib/store/wishlist';
import { useHydrated } from '@/lib/store/persisted';

export function WishlistButton({ productId, name, className = '', withLabel = false }: { productId: string; name: string; className?: string; withLabel?: boolean }) {
  const ids = wishlistStore.use();
  const hydrated = useHydrated();
  const on = hydrated && ids.includes(productId);
  return (
    <button
      type="button"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(productId); }}
      aria-pressed={on}
      aria-label={on ? `Ukloni ${name} sa liste želja` : `Sačuvaj ${name} na listu želja`}
      className={`inline-flex items-center justify-center gap-2 transition-colors ${className}`}
    >
      <Icon name="heart" size={withLabel ? 18 : 19} className={`transition-[fill,color,scale] duration-300 ${on ? 'fill-copper text-copper scale-110' : 'fill-transparent'}`} />
      {withLabel && <span>{on ? 'Sačuvano' : 'Sačuvaj'}</span>}
    </button>
  );
}
