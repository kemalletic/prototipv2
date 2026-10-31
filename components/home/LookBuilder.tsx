'use client';
import Image from 'next/image';
import Link from 'next/link';
import { addTransitionType, startTransition, useMemo, useState, ViewTransition } from 'react';
import type { Product } from '@/lib/catalog/data';
import { SIZES } from '@/lib/catalog/data';
import { sampleStock } from '@/lib/catalog/data';
import { formatKM } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { btn } from '@/components/ui/styles';
import { addToCart, openCart } from '@/lib/store/cart';
import { track } from '@/lib/analytics';

export interface Slot { key: string; label: string; options: Product[]; optional?: boolean }

// Flat-lay positions on the stage (percent of stage). Hand-tuned like a stylist's table.
const LAYOUT: Record<string, { left: number; top: number; width: number; rotate: number; z: number }> = {
  outer: { left: 1, top: 2, width: 42, rotate: -2.5, z: 2 },
  top: { left: 31, top: 0, width: 36, rotate: 1.5, z: 3 },
  bottom: { left: 63, top: 3, width: 36, rotate: -1, z: 1 },
  extra: { left: 38, top: 55, width: 24, rotate: 6, z: 4 },
};

/**
 * "Složi look" — compose an outfit by cycling each layer; add the whole look in one step.
 * mode="fixed" renders a pre-composed look (complete-the-look on product pages).
 */
export function LookBuilder({ slots, title, intro, listId, mode = 'compose' }: { slots: Slot[]; title: string; intro?: string; listId: string; mode?: 'compose' | 'fixed' }) {
  const [pick, setPick] = useState<Record<string, number>>(() => Object.fromEntries(slots.map((s) => [s.key, 0])));
  const [sizes, setSizes] = useState<Record<string, string>>({});
  const [missing, setMissing] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const chosen = useMemo(
    () => slots.map((s) => ({ slot: s, product: pick[s.key] >= 0 ? s.options[pick[s.key]] ?? null : null })),
    [slots, pick],
  );
  const total = chosen.reduce((sum, c) => sum + (c.product?.price ?? 0), 0);

  const cycle = (s: Slot, dir: 1 | -1) => {
    const min = s.optional ? -1 : 0;
    const n = s.options.length;
    startTransition(() => {
      addTransitionType('look-swap');
      setPick((prev) => {
        let next = prev[s.key] + dir;
        if (next >= n) next = min;
        if (next < min) next = n - 1;
        return { ...prev, [s.key]: next };
      });
    });
    setSizes((prev) => { const { [s.key]: _drop, ...rest } = prev; return rest; });
    setDone(false);
  };

  const addAll = () => {
    const items = chosen.filter((c) => c.product);
    const need = items.filter((c) => SIZES[c.product!.sizeSystem].length > 1 && !sizes[c.slot.key]).map((c) => c.slot.key);
    if (need.length) { setMissing(need); return; }
    setMissing([]);
    items.forEach((c) => {
      const p = c.product!;
      const size = sizes[c.slot.key] ?? SIZES[p.sizeSystem][0];
      addToCart({ productId: p.id, colorId: p.colorways[0].id, size }, 1, { open: false, list: listId });
    });
    track('look_add', { item_list_id: listId, items: items.map((c) => c.product!.id), value: total / 100, currency: 'BAM' });
    setDone(true);
    openCart();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* stage */}
      <div className="relative min-w-0 lg:col-span-7">
        <div className="relative aspect-[4/3.1] overflow-hidden bg-plaster-2 max-sm:aspect-[4/4.2]">
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_45%_35%,rgb(255_255_255/0.45),transparent_70%)]" />
          {chosen.map(({ slot, product }) => {
            const L = LAYOUT[slot.key] ?? LAYOUT.extra;
            return (
              <div key={slot.key} className="absolute aspect-[4/5]" style={{ left: `${L.left}%`, top: `${L.top}%`, width: `${L.width}%`, rotate: `${L.rotate}deg`, zIndex: L.z }}>
                {product && (
                  <ViewTransition key={product.id} name={`look-${listId}-${slot.key}`} share="look-swap" default="none">
                    <Image src={`/media/p/${product.slug}/${product.colorways[0].id}-front.webp`} alt={`${slot.label}: ${product.line} ${product.type}`} fill sizes="(min-width:1024px) 22vw, 40vw" className="object-contain drop-shadow-[0_10px_14px_rgb(40_30_20/0.12)]" />
                  </ViewTransition>
                )}
              </div>
            );
          })}
          <p className="font-label absolute bottom-3 left-3 text-ink-3">{mode === 'fixed' ? 'Predloženi look' : 'Vaš look'} · ilustrativni prikaz</p>
        </div>
      </div>

      {/* list */}
      <div className="flex min-w-0 flex-col lg:col-span-5">
        <h2 className="font-display text-[clamp(2.4rem,4.5vw,4rem)]">{title}</h2>
        {intro && <p className="mt-3 max-w-md font-serif text-lg italic text-ink-2">{intro}</p>}
        <ul className="mt-6 divide-y divide-stone border-y border-stone">
          {chosen.map(({ slot, product }) => {
            const sz = product ? SIZES[product.sizeSystem] : [];
            const isMissing = missing.includes(slot.key);
            return (
              <li key={slot.key} className="flex items-center gap-3 py-3">
                <div className="relative h-16 w-[3.2rem] shrink-0 bg-plaster-2">
                  {product && <Image src={`/media/p/${product.slug}/${product.colorways[0].id}-front.webp`} alt="" fill sizes="52px" className="object-contain p-0.5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-label text-ink-3">{slot.label}</p>
                  {product ? (
                    <Link href={`/proizvod/${product.slug}`} className="block truncate text-sm font-medium hover:underline">{product.line} — {product.type}</Link>
                  ) : (
                    <p className="text-sm text-ink-3">Bez ovog sloja</p>
                  )}
                  {product && <p className="tabular text-sm text-ink-2">{formatKM(product.price)}</p>}
                </div>
                {product && sz.length > 1 && (
                  <div className="shrink-0">
                    <label className="sr-only" htmlFor={`${listId}-${slot.key}-size`}>Veličina za {product.line} {product.type}</label>
                    <select
                      id={`${listId}-${slot.key}-size`}
                      value={sizes[slot.key] ?? ''}
                      onChange={(e) => { setSizes((s) => ({ ...s, [slot.key]: e.target.value })); setMissing((m) => m.filter((k) => k !== slot.key)); setDone(false); }}
                      aria-invalid={isMissing}
                      className={`h-10 w-[5.6rem] border bg-paper px-2 text-sm ${isMissing ? 'border-alert' : 'border-stone'}`}
                    >
                      <option value="">Vel.</option>
                      {sz.map((s) => {
                        const out = sampleStock(product.id, product.colorways[0].id, s) === 0;
                        return <option key={s} value={s} disabled={out}>{s}{out ? ' (nema)' : ''}</option>;
                      })}
                    </select>
                  </div>
                )}
                {mode === 'compose' && (slot.options.length > 1 || slot.optional) && (
                  <div className="flex shrink-0">
                    <button type="button" onClick={() => cycle(slot, -1)} className="grid h-10 w-9 place-items-center hover:bg-plaster-2" aria-label={`Prethodni: ${slot.label}`}><Icon name="arrowLeft" size={16} /></button>
                    <button type="button" onClick={() => cycle(slot, 1)} className="grid h-10 w-9 place-items-center hover:bg-plaster-2" aria-label={`Sljedeći: ${slot.label}`}><Icon name="arrowRight" size={16} /></button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex items-baseline justify-between">
          <p className="text-ink-2">Ukupno za look</p>
          <p className="tabular text-2xl font-medium">{formatKM(total)}</p>
        </div>
        <button type="button" onClick={addAll} disabled={total === 0} className={`${btn.base} ${btn.primary} mt-4 w-full`}>
          {done ? <><Icon name="check" size={18} /> Look je u korpi</> : 'Dodaj cijeli look u korpu'}
        </button>
        <p className="mt-2 min-h-5 text-sm text-alert" role="alert">
          {missing.length > 0 && `Odaberite veličinu za: ${missing.map((k) => slots.find((s) => s.key === k)?.label.toLowerCase()).join(', ')}.`}
        </p>
      </div>
    </div>
  );
}
