import type { Product } from '@/lib/catalog';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products, list, cols = 'grid-cols-2 lg:grid-cols-3', vt = true, colorFor }: {
  products: Product[]; list: string; cols?: string; vt?: boolean; colorFor?: (p: Product) => string | undefined;
}) {
  return (
    <ul className={`grid gap-x-3 gap-y-10 md:gap-x-4 ${cols}`}>
      {products.map((p, i) => {
        const c = colorFor?.(p);
        return <li key={`${p.id}-${c ?? ''}`}><ProductCard product={p} list={list} index={i} vt={vt} priority={i < 4} initialColor={c} /></li>;
      })}
    </ul>
  );
}
