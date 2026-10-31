'use client';
import Link from 'next/link';
import { cartStore, totals } from '@/lib/store/cart';
import { useHydrated } from '@/lib/store/persisted';
import { CartLineItem, FreeShippingMeter } from '@/components/layout/CartLine';
import { SHIPPING, RETURNS } from '@/lib/commerce';
import { formatKM } from '@/lib/format';
import { btn } from '@/components/ui/styles';
import { ProductCard } from '@/components/product/ProductCard';
import { PRODUCTS } from '@/lib/catalog';

export function CartPage() {
  const hydrated = useHydrated();
  const lines = cartStore.use();
  const t = totals(lines);
  if (!hydrated) return <div className="h-96 skeleton" aria-busy="true" />;
  const inCart = new Set(lines.map((l) => l.productId));
  // Honest cross-sell: low-priced accessories and basics not already in the cart.
  const extras = PRODUCTS.filter((p) => !inCart.has(p.id) && (p.category === 'kaisevi-i-dodaci' || p.tags.includes('osnova')) && p.price <= 6000).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  if (!t.resolved.length) {
    return (
      <div className="min-h-96 py-6">
        <p className="font-display text-7xl text-ink-3">Prazno</p>
        <p className="mt-4 text-lg">Vaša korpa je prazna.</p>
        <div className="mt-6 flex gap-2"><Link href="/kolekcija/sve" className={`${btn.base} ${btn.primary}`}>Pogledaj kolekciju</Link><Link href="/zelje" className={`${btn.base} ${btn.secondary}`}>Lista želja</Link></div>
      </div>
    );
  }
  return (
    <>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <ul className="divide-y divide-stone border-y border-stone lg:col-span-7">
          {t.resolved.map((r) => <CartLineItem key={`${r.line.productId}-${r.line.colorId}-${r.line.size}`} r={r} />)}
        </ul>
        <aside className="lg:col-span-5" aria-label="Ukupno">
          <div className="sticky top-[calc(var(--header-h)+1.5rem)] bg-paper p-6">
            <FreeShippingMeter subtotal={t.subtotal} freeFrom={SHIPPING.freeFrom} />
            <dl className="mt-5 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-2">Međuzbir</dt><dd className="tabular">{formatKM(t.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-2">Dostava</dt><dd className="tabular">{t.shipping ? formatKM(t.shipping) : 'Besplatno'}</dd></div>
              <div className="flex justify-between border-t border-stone pt-3 text-lg font-medium"><dt>Ukupno</dt><dd className="tabular">{formatKM(t.total)}</dd></div>
            </dl>
            <Link href="/naplata" className={`${btn.base} ${btn.primary} mt-5 h-14 w-full text-base`}>Nastavi na naplatu</Link>
            <ul className="mt-5 space-y-1.5 text-sm text-ink-2">
              <li>· Plaćanje pouzećem, gotovinom kuriru</li>
              <li>· Dostava {SHIPPING.days} na adrese u BiH</li>
              <li>· Zamjena ili povrat u roku od {RETURNS.days} dana</li>
            </ul>
          </div>
        </aside>
      </div>
      {extras.length > 0 && (
        <section aria-labelledby="extras" className="mt-20">
          <h2 id="extras" className="font-display text-[clamp(1.9rem,3.4vw,3rem)]">Možda vam još treba</h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
            {extras.map((p, i) => <li key={p.id}><ProductCard product={p} list="cart_extras" index={i} /></li>)}
          </ul>
        </section>
      )}
    </>
  );
}
