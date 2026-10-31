'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { cartStore, closeCart, totals, uiStore } from '@/lib/store/cart';
import { SHIPPING } from '@/lib/commerce';
import { formatKM, plural } from '@/lib/format';
import { btn } from '@/components/ui/styles';
import { CartLineItem, FreeShippingMeter } from './CartLine';
import { track, itemPayload } from '@/lib/analytics';
import { NAV } from './nav';

export function CartDrawer() {
  const { cartOpen } = uiStore.use();
  const lines = cartStore.use();
  const t = totals(lines);

  useEffect(() => {
    if (!cartOpen) return;
    track('view_cart', { currency: 'BAM', value: t.subtotal / 100, items: t.resolved.map((r) => itemPayload(r.product, r.colorway.id, r.line.size, r.line.qty)) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartOpen]);

  return (
    <Sheet open={cartOpen} onClose={closeCart} label="Korpa" side="right">
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center border-b border-stone px-5">
          <h2 className="text-lg font-medium">Korpa <span className="tabular text-ink-3">({t.count})</span></h2>
        </div>
        {t.resolved.length === 0 ? (
          <div className="flex flex-1 flex-col px-5 py-8">
            <p className="font-display text-5xl text-ink-3">Prazno</p>
            <p className="mt-4 text-ink-2">Vaša korpa je prazna. Krenite od kategorije:</p>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {NAV.slice(0, 6).map((n) => (
                <li key={n.href}><Link href={n.href} onClick={closeCart} className="flex h-11 items-center justify-between border border-stone px-3 text-sm hover:border-ink">{n.full}<span className="font-label text-ink-3">{n.count}</span></Link></li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <div className="border-b border-stone px-5 py-4"><FreeShippingMeter subtotal={t.subtotal} freeFrom={SHIPPING.freeFrom} /></div>
            <ul className="flex-1 divide-y divide-stone overflow-y-auto px-5">
              {t.resolved.map((r) => <CartLineItem key={`${r.line.productId}-${r.line.colorId}-${r.line.size}`} r={r} onNavigate={closeCart} compact />)}
            </ul>
            <div className="shrink-0 border-t border-stone bg-paper px-5 pb-5 pt-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between"><dt className="text-ink-2">Međuzbir ({t.count} {plural(t.count, 'artikal', 'artikla', 'artikala')})</dt><dd className="tabular">{formatKM(t.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-2">Dostava</dt><dd className="tabular">{t.shipping ? formatKM(t.shipping) : 'Besplatno'}</dd></div>
                <div className="flex justify-between pt-1.5 text-base font-medium"><dt>Ukupno</dt><dd className="tabular">{formatKM(t.total)}</dd></div>
              </dl>
              <p className="mt-1 text-xs text-ink-3">Plaćate gotovinom kuriru pri preuzimanju. Cijene uključuju PDV.</p>
              <Link href="/naplata" onClick={closeCart} className={`${btn.base} ${btn.primary} mt-4 w-full`}>Nastavi na naplatu</Link>
              <Link href="/korpa" onClick={closeCart} className={`${btn.base} mt-2 h-10 w-full text-sm underline-offset-4 hover:underline`}>Pregled korpe</Link>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
}
