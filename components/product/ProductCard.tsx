'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, ViewTransition } from 'react';
import type { Product } from '@/lib/catalog';
import { colorwayOf, imagesOf, sizesFor, stockOf } from '@/lib/catalog';
import { formatKM } from '@/lib/format';
import { trackImpression, track, itemPayload } from '@/lib/analytics';
import { addToCart } from '@/lib/store/cart';
import { WishlistButton } from './WishlistButton';

export function ProductCard({
  product: p, list, index = 0, vt = false, priority = false, sizes = '(min-width:1280px) 22vw, (min-width:768px) 30vw, 46vw', initialColor,
}: { product: Product; list: string; index?: number; vt?: boolean; priority?: boolean; sizes?: string; initialColor?: string }) {
  const [colorId, setColorId] = useState(initialColor ?? p.colorways[0].id);
  const c = colorwayOf(p, colorId);
  const img = imagesOf(p, c);
  const ref = useRef<HTMLElement>(null);
  const [added, setAdded] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { trackImpression(list, p, index); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [list, p, index]);

  const href = `/proizvod/${p.slug}${colorId !== p.colorways[0].id ? `?boja=${colorId}` : ''}`;
  const tag = p.tags.includes('novo') ? 'Novo' : null;
  const quickSizes = sizesFor(p);

  const front = (
    <Image src={img.front} alt={`${p.line} ${p.type}, ${c.name}`} fill sizes={sizes} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority && index < 2 ? 'high' : 'auto'} className="object-contain p-[6%] transition-[opacity,scale] duration-500 ease-[var(--ease-tailor)] group-hover:scale-[1.025] [@media(hover:hover)]:group-hover:opacity-0" />
  );

  return (
    <article ref={ref} className="group relative flex flex-col">
      <div className="relative">
        <Link
          href={href}
          prefetch
          transitionTypes={vt ? ['to-product'] : undefined}
          onClick={() => track('select_item', { item_list_id: list, items: [{ ...itemPayload(p, colorId), index }] })}
          className="relative block aspect-[4/5] overflow-hidden bg-plaster-2"
        >
          {vt ? <ViewTransition name={`garment-${p.slug}`} share="garment" default="none">{front}</ViewTransition> : front}
          {img.back && (
            <Image src={img.back} alt="" aria-hidden fill sizes={sizes} className="hidden object-contain p-[6%] opacity-0 transition-opacity duration-500 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:opacity-100" />
          )}
          {tag && <span className="font-label absolute left-3 top-3 bg-paper/90 px-2 py-1 text-copper">{tag}</span>}
        </Link>
        <WishlistButton productId={p.id} name={`${p.line} ${p.type}`} className="absolute right-1.5 top-1.5 h-10 w-10 rounded-full text-ink hover:bg-paper/80" />
        {quickSizes.length > 1 && (
          <QuickAdd p={p} colorId={c.id} onAdded={(s) => { setAdded(s); setTimeout(() => setAdded(null), 1600); }} added={added} list={list} />
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[0.9375rem] font-medium leading-tight">
            <Link href={href} tabIndex={-1} className="hover:underline">{p.line}</Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-ink-2">{p.type}</p>
        </div>
        <p className="tabular shrink-0 text-[0.9375rem]">{formatKM(p.price)}</p>
      </div>
      {p.colorways.length > 1 && (
        <div className="mt-2 flex items-center gap-1.5" role="group" aria-label="Boje">
          {p.colorways.map((cw) => (
            <button
              key={cw.id}
              type="button"
              onClick={() => setColorId(cw.id)}
              onMouseEnter={() => setColorId(cw.id)}
              aria-label={`Boja: ${cw.name}`}
              aria-pressed={cw.id === colorId}
              className={`grid h-6 w-6 place-items-center rounded-full ${cw.id === colorId ? 'ring-1 ring-ink' : ''}`}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: cw.hex }} />
            </button>
          ))}
          <span className="sr-only">Odabrana boja: {c.name}</span>
        </div>
      )}
    </article>
  );
}

function QuickAdd({ p, colorId, onAdded, added, list }: { p: Product; colorId: string; onAdded: (s: string) => void; added: string | null; list: string }) {
  const sizes = sizesFor(p);
  if (sizes.length < 2) return null;
  return (
    <div className="pointer-events-none absolute inset-x-2 bottom-2 hidden translate-y-1 opacity-0 transition-[opacity,translate] duration-300 ease-[var(--ease-tailor)] focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 [@media(hover:hover)]:block [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100">
      <div className="bg-paper/95 p-2 shadow-[0_8px_24px_-12px_rgb(28_26_23/0.3)]">
        <p className="font-label mb-1.5 text-ink-3">{added ? `Dodano · ${added}` : 'Brzo dodaj'}</p>
        <div className="flex flex-wrap gap-1">
          {sizes.map((s) => {
            const n = stockOf(p, colorId, s);
            return (
              <button
                key={s}
                type="button"
                disabled={n === 0}
                onClick={() => { addToCart({ productId: p.id, colorId, size: s }, 1, { open: false, list }); onAdded(s); }}
                className="tabular h-8 min-w-9 border border-stone px-2 text-xs hover:border-ink hover:bg-ink hover:text-paper disabled:border-transparent disabled:text-ink-3/60 disabled:line-through disabled:hover:bg-transparent disabled:hover:text-ink-3/60"
                aria-label={`Dodaj veličinu ${s} u korpu${n === 0 ? ' (rasprodano)' : ''}`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
