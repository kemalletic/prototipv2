'use client';
import Link from 'next/link';
import { wishlistStore } from '@/lib/store/wishlist';
import { useHydrated } from '@/lib/store/persisted';
import { getProductById } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { btn } from '@/components/ui/styles';
import { plural } from '@/lib/format';

export function WishlistPage() {
  const ids = wishlistStore.use();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-96 skeleton" aria-busy="true" />;
  const items = ids.map(getProductById).filter((p): p is Product => !!p);
  if (!items.length) {
    return (
      <div className="min-h-96 py-6">
        <p className="font-display text-7xl text-ink-3">Prazno</p>
        <p className="mt-4 max-w-md text-lg">Još niste ništa sačuvali. Dodirnite srce na proizvodu da ga sačuvate za kasnije.</p>
        <Link href="/kolekcija/sve" className={`${btn.base} ${btn.primary} mt-6`}>Pogledaj kolekciju</Link>
      </div>
    );
  }
  return (
    <>
      <p className="font-label tabular mb-6 text-ink-3">{items.length} {plural(items.length, 'sačuvan proizvod', 'sačuvana proizvoda', 'sačuvanih proizvoda')} · čuva se u ovom pregledniku</p>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-4 xl:grid-cols-4">
        {items.map((p, i) => <li key={p.id}><ProductCard product={p} list="wishlist" index={i} /></li>)}
      </ul>
    </>
  );
}
