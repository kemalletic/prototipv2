'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import { formatKM } from '@/lib/format';
import { MAX_QTY, removeLine, setQty, type resolveLines } from '@/lib/store/cart';
import { imagesOf } from '@/lib/catalog';

type R = ReturnType<typeof resolveLines>[number];

export function CartLineItem({ r, onNavigate, compact = false }: { r: R; onNavigate?: () => void; compact?: boolean }) {
  const { product: p, colorway: c, line } = r;
  const max = Math.min(MAX_QTY, r.stock || MAX_QTY);
  return (
    <li className="flex gap-4 py-4">
      <Link href={`/proizvod/${p.slug}?boja=${c.id}`} onClick={onNavigate} className={`relative shrink-0 bg-plaster-2 ${compact ? 'h-[6.5rem] w-[5.2rem]' : 'h-36 w-[7.2rem]'}`}>
        <Image src={imagesOf(p, c).front} alt={`${p.line} ${p.type}, ${c.name}`} fill sizes="120px" className="object-contain p-1" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/proizvod/${p.slug}?boja=${c.id}`} onClick={onNavigate} className="block text-[0.9375rem] font-medium leading-snug hover:underline">{p.line} — {p.type}</Link>
            <p className="mt-0.5 text-sm text-ink-3">{c.name} · Veličina {line.size}</p>
          </div>
          <p className="tabular shrink-0 text-[0.9375rem]">{formatKM(r.total)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex h-9 items-center border border-stone" role="group" aria-label={`Količina za ${p.line} ${p.type}`}>
            <button type="button" className="grid h-full w-9 place-items-center hover:bg-plaster disabled:opacity-40" onClick={() => setQty(line, line.qty - 1)} aria-label="Smanji količinu">
              <Icon name="minus" size={14} />
            </button>
            <span className="tabular w-8 text-center text-sm" aria-live="polite">{line.qty}</span>
            <button type="button" className="grid h-full w-9 place-items-center hover:bg-plaster disabled:opacity-40" onClick={() => setQty(line, line.qty + 1)} disabled={line.qty >= max} aria-label="Povećaj količinu">
              <Icon name="plus" size={14} />
            </button>
          </div>
          <button type="button" onClick={() => removeLine(line)} className="text-sm text-ink-3 underline-offset-4 hover:text-ink hover:underline">Ukloni</button>
        </div>
        {line.qty >= max && r.stock > 0 && r.stock <= MAX_QTY && <p className="mt-1.5 text-xs text-ink-3">Dostupno najviše {r.stock} kom.</p>}
      </div>
    </li>
  );
}

export function FreeShippingMeter({ subtotal, freeFrom }: { subtotal: number; freeFrom: number }) {
  const pct = Math.min(100, (subtotal / freeFrom) * 100);
  const left = freeFrom - subtotal;
  return (
    <div>
      <p className="text-sm text-ink-2">
        {left > 0 ? <>Još <strong className="tabular font-medium text-ink">{formatKM(left)}</strong> do besplatne dostave.</> : <span className="text-moss">Dostava je besplatna.</span>}
      </p>
      <div className="mt-2 h-[3px] bg-stone" role="progressbar" aria-label="Napredak do besplatne dostave" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div className="h-full bg-ink transition-[width] duration-500 ease-[var(--ease-tailor)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
