'use client';
import Image from 'next/image';
import Link from 'next/link';
import { addTransitionType, startTransition, useCallback, useEffect, useMemo, useRef, useState, ViewTransition } from 'react';
import type { Product } from '@/lib/catalog/data';
import { CATEGORIES } from '@/lib/catalog/data';
import { formatKM } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { track, itemPayload, trackImpression } from '@/lib/analytics';

/**
 * THE RAIL — KROJ's signature interaction.
 * Garments hang on an oiled-brass rail. Native horizontal scrolling (no hijacking); each garment is a
 * damped pendulum excited by scroll velocity and pointer movement, so the rail feels physical.
 * Category tabs re-hang the rail with a view transition; selecting a garment morphs it into the PDP.
 */

type Hang = 'shoulders' | 'clips' | 'bar';
const hangOf = (p: Product): Hang =>
  ['jeans', 'joggers', 'socks', 'beanie'].includes(p.art.garment) ? 'clips' : ['belt', 'scarf'].includes(p.art.garment) ? 'bar' : 'shoulders';
const widthOf = (p: Product) => (p.category === 'kaisevi-i-dodaci' ? 0.66 : hangOf(p) === 'clips' ? 0.84 : 1);

const HOOK = 46; // px from rail top to the garment's hang point

export function Rail({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState<string>('sve');
  const scroller = useRef<HTMLDivElement>(null);
  const swing = useRef<Map<string, HTMLElement>>(new Map());
  const phys = useRef<Map<string, { a: number; v: number }>>(new Map());
  const raf = useRef<number | null>(null);
  const lastScroll = useRef(0);
  const reduced = useRef(false);
  const [progress, setProgress] = useState(0);
  const [edges, setEdges] = useState({ start: true, end: false });

  const groups = useMemo(() => {
    const present = new Set(products.map((p) => p.category));
    return [{ slug: 'sve', name: 'Sve' }, ...CATEGORIES.filter((c) => present.has(c.slug)).map((c) => ({ slug: c.slug, name: c.slug === 'jakne-i-prsluci' ? 'Jakne' : c.slug === 'kaisevi-i-dodaci' ? 'Dodaci' : c.name }))];
  }, [products]);
  const visible = filter === 'sve' ? products : products.filter((p) => p.category === filter);

  // ---- physics loop (runs only while something moves)
  const tick = useCallback(function step() {
    let moving = false;
    phys.current.forEach((s, key) => {
      const k = 0.0115, damping = 0.058;
      s.v += -k * s.a - damping * s.v;
      s.a += s.v;
      if (s.a > 0.16) { s.a = 0.16; s.v *= -0.3; }
      if (s.a < -0.16) { s.a = -0.16; s.v *= -0.3; }
      if (Math.abs(s.a) > 0.0004 || Math.abs(s.v) > 0.0004) moving = true; else { s.a = 0; s.v = 0; }
      const el = swing.current.get(key);
      if (el) el.style.transform = s.a ? `rotate(${s.a}rad)` : '';
    });
    raf.current = moving ? requestAnimationFrame(step) : null;
  }, []);
  const kick = useCallback((key: string | null, dv: number) => {
    if (reduced.current) return;
    const apply = (k: string) => {
      const s = phys.current.get(k) ?? { a: 0, v: 0 };
      s.v = Math.max(-0.03, Math.min(0.03, s.v + dv));
      phys.current.set(k, s);
    };
    if (key) apply(key); else swing.current.forEach((_, k) => apply(k));
    if (raf.current == null) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const d = el.scrollLeft - lastScroll.current;
    lastScroll.current = el.scrollLeft;
    // garments lag behind the rail's motion
    if (Math.abs(d) > 0.5) kick(null, -d * 0.00022);
    const max = el.scrollWidth - el.clientWidth;
    setProgress(max > 0 ? el.scrollLeft / max : 0);
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft > max - 8 });
  };
  useEffect(() => { onScroll(); /* initial edges */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const page = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: reduced.current ? 'auto' : 'smooth' });
  };

  const choose = (slug: string) => {
    if (slug === filter) return;
    startTransition(() => {
      addTransitionType('rail-filter');
      setFilter(slug);
    });
    scroller.current?.scrollTo({ left: 0 });
    setTimeout(() => swing.current.forEach((_, k) => kick(k, (Math.random() - 0.5) * 0.02)), 380);
  };

  return (
    <div className="relative">
      {/* tabs + controls */}
      <div className="page-x flex items-end justify-between gap-4">
        <div role="tablist" aria-label="Filtriraj vješalicu po kategoriji" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 py-1">
          {groups.map((g) => (
            <button
              key={g.slug}
              role="tab"
              aria-selected={filter === g.slug}
              aria-controls="rail-list"
              onClick={() => choose(g.slug)}
              className={`h-9 shrink-0 rounded-full px-4 text-sm transition-colors duration-200 ${filter === g.slug ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-plaster-2 hover:text-ink'}`}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-1 md:flex">
          <button type="button" onClick={() => page(-1)} disabled={edges.start} className="grid h-10 w-10 place-items-center rounded-full border border-stone transition-colors hover:border-ink disabled:opacity-35 disabled:hover:border-stone" aria-label="Prethodni komadi">
            <Icon name="arrowLeft" size={18} />
          </button>
          <button type="button" onClick={() => page(1)} disabled={edges.end} className="grid h-10 w-10 place-items-center rounded-full border border-stone transition-colors hover:border-ink disabled:opacity-35 disabled:hover:border-stone" aria-label="Sljedeći komadi">
            <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </div>

      {/* the rail */}
      <div className="relative mt-5">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[7px] z-[1] h-[7px] rounded-full bg-[linear-gradient(180deg,#d8c08e_0%,#a3864f_38%,#6f5a33_100%)] shadow-[0_7px_10px_-5px_rgb(40_30_15/0.35)]" />
        <div
          ref={scroller}
          onScroll={onScroll}
          tabIndex={0}
          aria-label="Vješalica s odjećom. Pomičite vodoravno za još komada."
          className="no-scrollbar relative overflow-x-auto overscroll-x-contain scroll-smooth [scroll-padding-inline:var(--page-x)] [scroll-snap-type:x_proximity] focus-visible:outline-offset-[-2px]"
        >
          <ul id="rail-list" className="flex w-max gap-[clamp(0.75rem,1.6vw,1.75rem)] px-[var(--page-x)] pb-4" style={{ ['--rail-w' as string]: 'clamp(12.5rem, 18.5vw, 19rem)' }}>
            {visible.map((p, i) => (
              <ViewTransition
                key={p.id}
                name={`rail-${p.slug}`}
                enter={{ 'rail-filter': 'rail-in', default: 'none' }}
                exit={{ 'rail-filter': 'rail-out', default: 'none' }}
                update={{ 'rail-filter': 'rail-move', default: 'none' }}
                default="none"
              >
                <RailItem
                  p={p}
                  index={i}
                  priority={i < 2}
                  registerSwing={(el) => { if (el) swing.current.set(p.id, el); else swing.current.delete(p.id); }}
                  onPointerMove={(dx) => kick(p.id, dx * 0.00055)}
                />
              </ViewTransition>
            ))}
          </ul>
        </div>
        <div className="page-x mt-2 flex items-center gap-4">
          <div className="relative h-px flex-1 bg-stone" aria-hidden>
            <div className="absolute inset-y-[-1px] left-0 w-1/5 bg-ink transition-[left] duration-150" style={{ left: `${progress * 80}%` }} />
          </div>
          <p className="font-label tabular shrink-0 text-ink-3" aria-live="polite">{visible.length} komada na vješalici</p>
        </div>
      </div>
    </div>
  );
}

function RailItem({ p, index, priority, registerSwing, onPointerMove }: {
  p: Product; index: number; priority: boolean; registerSwing: (el: HTMLElement | null) => void; onPointerMove: (dx: number) => void;
}) {
  const c = p.colorways[0];
  const hang = hangOf(p);
  const w = widthOf(p);
  const li = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const el = li.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { trackImpression('home_rail', p, index); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [p, index]);

  return (
    <li ref={li} className="relative shrink-0 [scroll-snap-align:start]" style={{ width: `calc(var(--rail-w) * ${w})`, ['--w' as string]: `calc(var(--rail-w) * ${w})` }}>
      <Link
        href={`/proizvod/${p.slug}`}
        prefetch
        transitionTypes={['to-product']}
        onClick={() => track('select_item', { item_list_id: 'home_rail', items: [{ ...itemPayload(p, c.id), index }] })}
        onPointerMove={(e) => { if (e.pointerType === 'mouse') onPointerMove(e.movementX); }}
        className="group block outline-none"
      >
        <div ref={registerSwing} className="relative flow-root origin-[50%_10px] will-change-transform" style={{ height: `calc(${HOOK}px + var(--rail-w) * 1.03)` }}>
          <Hanger kind={hang} />
          <div className="relative z-[1] aspect-[4/5]" style={{ marginTop: `calc(${HOOK}px - var(--w) * 1.25 * ${p.art.anchorY})` }}>
            <ViewTransition name={`garment-${p.slug}`} share="garment" default="none">
              <Image
                src={`/media/p/${p.slug}/${c.id}-front.webp`}
                alt=""
                fill
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={index < 2 ? 'high' : 'auto'}
                sizes="(min-width:1024px) 21vw, 58vw"
                className="object-contain transition-[filter] duration-300 group-hover:brightness-[1.03] group-focus-visible:brightness-[1.03]"
              />
            </ViewTransition>
          </div>
        </div>
        <div className="relative mt-1 flex items-baseline justify-between gap-2 border-t border-transparent pt-2 transition-colors group-hover:border-ink group-focus-visible:border-copper">
          <span className="min-w-0">
            <span className="block truncate text-[0.9375rem] font-medium leading-tight">{p.line}</span>
            <span className="block truncate text-[0.8125rem] text-ink-3">{p.type}</span>
          </span>
          <span className="tabular shrink-0 text-sm">{formatKM(p.price)}</span>
        </div>
      </Link>
    </li>
  );
}

/** The hanger: the hook disappears behind the collar, as on a real garment; trouser clips grip in front. */
function Hanger({ kind }: { kind: Hang }) {
  const stemEnd = HOOK + (kind === 'shoulders' ? 14 : 2);
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-0 flex justify-center" style={{ height: HOOK + 16 }}>
        <svg width="30" height={stemEnd + 2} viewBox={`0 0 30 ${stemEnd + 2}`} className="absolute top-0 overflow-visible">
          <path d={`M15 ${stemEnd} V15 C15 5 24 3 24 10.5`} fill="none" stroke="#8f7442" strokeWidth="2.4" strokeLinecap="round" />
          <path d={`M15 ${stemEnd} V15 C15 5 24 3 24 10.5`} fill="none" stroke="#e8d4a6" strokeWidth="0.8" strokeLinecap="round" transform="translate(-0.6 -0.4)" opacity="0.7" />
        </svg>
        {kind !== 'shoulders' && (
          <span className="absolute h-[6px] rounded-full bg-[linear-gradient(180deg,#c9a06f,#9b7246)] shadow-[0_2px_3px_rgb(40_25_10/0.25)]" style={{ top: HOOK - 8, width: kind === 'clips' ? '74%' : '44%' }} />
        )}
      </div>
      {kind === 'clips' && (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[3]">
          <span className="absolute left-[17%] h-[17px] w-[11px] rounded-[2px] bg-[linear-gradient(90deg,#7d7a74,#cfcbc2,#7d7a74)] shadow-[0_1px_2px_rgb(0_0_0/0.25)]" style={{ top: HOOK - 6 }} />
          <span className="absolute right-[17%] h-[17px] w-[11px] rounded-[2px] bg-[linear-gradient(90deg,#7d7a74,#cfcbc2,#7d7a74)] shadow-[0_1px_2px_rgb(0_0_0/0.25)]" style={{ top: HOOK - 6 }} />
        </div>
      )}
    </>
  );
}
