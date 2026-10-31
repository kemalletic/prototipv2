'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore, ViewTransition } from 'react';
import type { Product } from '@/lib/catalog/data';
import { CATEGORIES, SIZES, sampleStock } from '@/lib/catalog/data';
import { formatKM } from '@/lib/format';
import { SHIPPING, RETURNS } from '@/lib/commerce';
import { addToCart } from '@/lib/store/cart';
import { track, itemPayload } from '@/lib/analytics';
import { Icon } from '@/components/ui/Icon';
import { Sheet } from '@/components/ui/Sheet';
import { btn } from '@/components/ui/styles';
import { WishlistButton } from './WishlistButton';
import { SizeGuideDialog } from './SizeGuide';

type Slide = { key: string; src: string; alt: string; kind: 'front' | 'back' | 'detail' };

const noopSubscribe = () => () => {};
/** Reads ?boja= on the client only, so the prerendered HTML stays identical for every visitor. */
function useUrlColour() {
  return useSyncExternalStore(noopSubscribe, () => new URLSearchParams(window.location.search).get('boja'), () => null);
}

export function ProductView({ product: p }: { product: Product }) {
  const urlColour = useUrlColour();
  const [picked, setColorId] = useState<string | null>(null);
  const colorId = picked ?? (urlColour && p.colorways.some((x) => x.id === urlColour) ? urlColour : p.colorways[0].id);
  const c = p.colorways.find((x) => x.id === colorId) ?? p.colorways[0];
  const sizes = SIZES[p.sizeSystem];
  const single = sizes.length === 1;
  const [size, setSize] = useState<string | null>(single ? sizes[0] : null);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const [guide, setGuide] = useState(false);
  const sizeGroup = useRef<HTMLFieldSetElement>(null);
  const buyBtn = useRef<HTMLButtonElement>(null);
  const [showBar, setShowBar] = useState(false);
  const category = CATEGORIES.find((x) => x.slug === p.category)!;

  useEffect(() => {
    track('view_item', { currency: 'BAM', value: p.price / 100, items: [itemPayload(p, new URLSearchParams(window.location.search).get('boja') ?? p.colorways[0].id)] });
  }, [p]);

  // sticky mobile purchase bar when the main button scrolls away
  useEffect(() => {
    const el = buyBtn.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pickColor = (id: string) => {
    setColorId(id);
    const url = new URL(window.location.href);
    if (id === p.colorways[0].id) url.searchParams.delete('boja'); else url.searchParams.set('boja', id);
    window.history.replaceState(window.history.state, '', url);
    if (size && sampleStock(p.id, id, size) === 0) setSize(null);
  };

  const stock = size ? sampleStock(p.id, c.id, size) : null;

  const add = () => {
    if (!size) {
      setSizeError(true);
      sizeGroup.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (sizeGroup.current?.querySelector('button:not([disabled])') as HTMLButtonElement | null)?.focus({ preventScroll: true });
      return;
    }
    addToCart({ productId: p.id, colorId: c.id, size }, 1, { list: 'pdp' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const slides: Slide[] = [
    { key: 'front', kind: 'front', src: `/media/p/${p.slug}/${c.id}-front.webp`, alt: `${p.line} ${p.type}, ${c.name}, prednja strana` },
    ...(p.art.back ? [{ key: 'back', kind: 'back' as const, src: `/media/p/${p.slug}/${c.id}-back.webp`, alt: `${p.line} ${p.type}, ${c.name}, stražnja strana` }] : []),
    { key: 'detail', kind: 'detail', src: `/media/p/${p.slug}/${c.id}-detail.webp`, alt: `Tkanina izbliza: ${p.composition}` },
  ];

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="min-w-0 lg:col-span-7">
          <Gallery slides={slides} slug={p.slug} />
        </div>

        <div className="min-w-0 lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <p className="font-label text-ink-3"><Link href={`/kolekcija/${p.category}`} className="hover:text-ink">{category.name}</Link> · {p.line}</p>
            <h1 className="mt-2 text-[clamp(1.9rem,3vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.015em] font-condensed">{p.line} — {p.type}</h1>
            <p className="mt-3 flex items-baseline gap-3">
              <span className="tabular text-2xl">{formatKM(p.price)}</span>
              <span className="text-sm text-ink-3">PDV uključen</span>
            </p>

            {/* colour */}
            <fieldset className="mt-7">
              <legend className="text-sm"><span className="text-ink-3">Boja:</span> <span className="font-medium">{c.name}</span></legend>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {p.colorways.map((cw) => (
                  <button
                    key={cw.id}
                    type="button"
                    onClick={() => pickColor(cw.id)}
                    aria-pressed={cw.id === c.id}
                    aria-label={cw.name}
                    className={`relative h-14 w-12 overflow-hidden bg-plaster-2 ring-offset-2 ring-offset-plaster transition-shadow ${cw.id === c.id ? 'ring-1 ring-ink' : 'hover:ring-1 hover:ring-stone-2'}`}
                  >
                    <Image src={`/media/p/${p.slug}/${cw.id}-front.webp`} alt="" fill sizes="48px" className="object-contain p-0.5" />
                  </button>
                ))}
              </div>
            </fieldset>

            {/* size */}
            <fieldset ref={sizeGroup} className="mt-6" aria-describedby="size-status">
              <div className="flex items-baseline justify-between">
                <legend className="text-sm"><span className="text-ink-3">Veličina:</span> <span className="font-medium">{size ?? (single ? sizes[0] : 'odaberite')}</span></legend>
                {!single && (
                  <button type="button" onClick={() => { setGuide(true); track('size_guide_open', { item_id: p.id }); }} className="inline-flex items-center gap-1.5 text-sm underline underline-offset-4 hover:text-copper">
                    <Icon name="ruler" size={16} /> Vodič za veličine
                  </button>
                )}
              </div>
              {!single && (
                <div className={`mt-2.5 grid gap-1.5 ${sizes.length > 6 ? 'grid-cols-4' : sizes.length > 4 ? 'grid-cols-6 max-sm:grid-cols-3' : 'grid-cols-4'}`}>
                  {sizes.map((s) => {
                    const n = sampleStock(p.id, c.id, s);
                    const on = size === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={n === 0}
                        aria-pressed={on}
                        onClick={() => { setSize(s); setSizeError(false); }}
                        className={`tabular relative h-12 border text-sm transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-stone hover:border-ink'} disabled:cursor-not-allowed disabled:border-stone/60 disabled:text-ink-3/50 ${sizeError && !on ? 'border-alert/70' : ''}`}
                        aria-label={`${s}${n === 0 ? ', rasprodano' : n <= 3 ? `, još ${n} kom.` : ''}`}
                      >
                        <span className={n === 0 ? 'line-through' : ''}>{s}</span>
                        {n > 0 && n <= 3 && <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-copper" />}
                      </button>
                    );
                  })}
                </div>
              )}
              <p id="size-status" className={`mt-2 min-h-5 text-sm ${sizeError ? 'text-alert' : 'text-ink-2'}`} aria-live="polite">
                {sizeError ? 'Odaberite veličinu da biste dodali u korpu.'
                  : stock == null ? <span className="text-ink-3">{p.fit !== 'Uni' ? `Kroj: ${p.fit}. ${p.fitNote.split('.')[0]}.` : p.fitNote}</span>
                  : stock === 0 ? 'Ova veličina je rasprodana.'
                  : stock <= 3 ? <span><span className="text-copper">●</span> Na stanju, još {stock} kom. u ovoj veličini.</span>
                  : <span><span className="text-moss">●</span> Na stanju</span>}
              </p>
            </fieldset>

            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button ref={buyBtn} type="button" onClick={add} className={`${btn.base} ${btn.primary} h-14 text-base`}>
                {added ? <><Icon name="check" size={20} /> Dodano u korpu</> : <>Dodaj u korpu <span aria-hidden className="text-paper/50">·</span> <span className="tabular">{formatKM(p.price)}</span></>}
              </button>
              <WishlistButton productId={p.id} name={`${p.line} ${p.type}`} className="h-14 w-14 border border-stone hover:border-ink" />
            </div>

            <DeliveryBox />

            <div className="mt-6 border-t border-stone">
              <Accordion title="Opis i detalji" defaultOpen>
                <p className="leading-relaxed">{p.description}</p>
                <ul className="mt-3 space-y-1">{p.details.map((d) => <li key={d} className="flex gap-2"><span aria-hidden className="text-ink-3">—</span>{d}</li>)}</ul>
              </Accordion>
              <Accordion title="Kroj i veličina">
                <p><strong className="font-medium text-ink">{p.fit}.</strong> {p.fitNote}</p>
                {!single && <button type="button" onClick={() => setGuide(true)} className="mt-2 underline underline-offset-4">Otvori tabelu veličina</button>}
              </Accordion>
              <Accordion title="Materijal i održavanje">
                <p><strong className="font-medium text-ink">{p.composition}</strong>{p.weight ? ` · ${p.weight}` : ''}</p>
                <ul className="mt-2 space-y-1">{p.care.map((d) => <li key={d} className="flex gap-2"><span aria-hidden className="text-ink-3">—</span>{d}</li>)}</ul>
              </Accordion>
              <Accordion title="Dostava, plaćanje i povrat">
                <p>Plaćanje isključivo pouzećem, gotovinom kuriru. Dostava {SHIPPING.days} na adrese u BiH: {formatKM(SHIPPING.standard)}, besplatno od {formatKM(SHIPPING.freeFrom)}.</p>
                <p className="mt-2">Zamjena veličine ili povrat u roku od {RETURNS.days} dana od preuzimanja. <Link href="/povrat-i-zamjena" className="underline underline-offset-4">Pravila povrata</Link></p>
              </Accordion>
            </div>
            <p className="mt-4 text-xs text-ink-3">Slike su ilustrativni prikazi (prototip), a ne fotografije stvarnog proizvoda.</p>
          </div>
        </div>
      </div>

      <SizeGuideDialog open={guide} onClose={() => setGuide(false)} system={p.sizeSystem} sizes={sizes} onPick={(s) => { setSize(s); setSizeError(false); }} productName={`${p.line} — ${p.type}`} />

      {/* sticky mobile purchase bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-stone bg-paper/97 px-[var(--page-x)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_-18px_rgb(28_26_23/0.35)] transition-transform duration-300 ease-[var(--ease-tailor)] lg:hidden ${showBar ? 'translate-y-0' : 'translate-y-full'}`}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-10 shrink-0 bg-plaster-2"><Image src={`/media/p/${p.slug}/${c.id}-front.webp`} alt="" fill sizes="40px" className="object-contain" /></div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{p.line}</p>
            <p className="tabular text-sm text-ink-2">{formatKM(p.price)}{size && !single ? ` · ${size}` : ''}</p>
          </div>
          <button type="button" onClick={add} className={`${btn.base} ${btn.primary} h-11 px-5 text-sm`}>
            {added ? <><Icon name="check" size={18} /> Dodano</> : size ? 'Dodaj u korpu' : 'Odaberi veličinu'}
          </button>
        </div>
      </div>
    </>
  );
}

function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="group border-b border-stone" open={defaultOpen}>
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-[0.9375rem] font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <Icon name="plus" size={18} className="shrink-0 transition-transform duration-300 group-open:rotate-45" />
      </summary>
      <div className="pb-5 text-[0.9375rem] text-ink-2">{children}</div>
    </details>
  );
}

const DAYS = ['nedjelje', 'ponedjeljka', 'utorka', 'srijede', 'četvrtka', 'petka', 'subote'];
function addBusinessDays(d: Date, n: number) {
  const x = new Date(d);
  while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) n--; }
  return x;
}
/** Sample delivery window: next 1–3 business days, 14:00 cut-off. Client-only (depends on "now"). */
function etaString() {
  const now = new Date();
  const start = now.getHours() >= 14 ? 2 : 1;
  const a = addBusinessDays(now, start), b = addBusinessDays(now, start + 2);
  const f = (d: Date) => `${DAYS[d.getDay()]}, ${d.getDate()}. ${d.getMonth() + 1}.`;
  return `između ${f(a)} i ${f(b)}`;
}
function DeliveryBox() {
  const eta = useSyncExternalStore(noopSubscribe, etaString, () => null);
  return (
    <ul className="mt-5 space-y-2.5 bg-plaster-2/70 p-4 text-sm">
      <li className="flex gap-3"><Icon name="truck" size={18} className="mt-px shrink-0 text-ink-2" /><span>Okvirna dostava <strong className="font-medium">{eta ?? SHIPPING.days}</strong> <span className="text-ink-3">(primjer roka)</span></span></li>
      <li className="flex gap-3"><Icon name="check" size={18} className="mt-px shrink-0 text-ink-2" /><span>Plaćanje pouzećem: gotovinom kuriru pri preuzimanju</span></li>
      <li className="flex gap-3"><Icon name="check" size={18} className="mt-px shrink-0 text-ink-2" /><span>Besplatna dostava od {formatKM(SHIPPING.freeFrom)} · zamjena {RETURNS.days} dana</span></li>
    </ul>
  );
}

function Gallery({ slides, slug }: { slides: Slide[]; slug: string }) {
  const track_ = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<number | null>(null);
  const onScroll = () => {
    const el = track_.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };
  const go = (i: number) => {
    const el = track_.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  };
  return (
    <div className="lg:grid lg:grid-cols-[4.5rem_1fr] lg:gap-4">
      <ul className="hidden flex-col gap-2 lg:flex" aria-label="Pregled slika">
        {slides.map((s, i) => (
          <li key={s.key}>
            <button type="button" onClick={() => go(i)} aria-label={`Slika ${i + 1}: ${s.alt}`} aria-current={i === active} className={`relative block aspect-[4/5] w-full bg-plaster-2 transition-shadow ${i === active ? 'ring-1 ring-ink' : 'opacity-70 hover:opacity-100'}`}>
              <Image src={s.src} alt="" fill sizes="72px" className={s.kind === 'detail' ? 'object-cover' : 'object-contain p-1'} />
            </button>
          </li>
        ))}
      </ul>
      <div className="relative -mx-[var(--page-x)] lg:mx-0">
        <div
          ref={track_}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          tabIndex={0}
          aria-label="Galerija proizvoda"
          aria-roledescription="galerija"
          onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(Math.min(active + 1, slides.length - 1)); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(Math.max(active - 1, 0)); } }}
        >
          {slides.map((s, i) => {
            const img = (
              <Image src={s.src} alt={s.alt} fill loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} sizes="(min-width:1024px) 52vw, 100vw" className={s.kind === 'detail' ? 'object-cover' : 'object-contain p-[7%]'} />
            );
            return (
              <div key={s.key} className="relative aspect-[4/5] w-full shrink-0 snap-center bg-plaster-2" role="group" aria-roledescription="slika" aria-label={`${i + 1} od ${slides.length}`}>
                {i === 0 ? <ViewTransition name={`garment-${slug}`} share="garment" default="none">{img}</ViewTransition> : img}
                <button type="button" onClick={() => setZoom(i)} className="absolute inset-0 cursor-zoom-in" aria-label={`Uvećaj: ${s.alt}`} />
                {s.kind === 'detail' && <span className="font-label pointer-events-none absolute bottom-4 left-4 bg-paper/85 px-2 py-1 text-ink-2">Tkanina izbliza</span>}
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-2">
          <span className="font-label tabular bg-paper/85 px-2 py-1 text-ink-2">{active + 1} / {slides.length}</span>
          <span className="grid h-8 w-8 place-items-center rounded-full bg-paper/85 text-ink-2"><Icon name="zoom" size={16} /></span>
        </div>
        <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden>
          {slides.map((s, i) => <span key={s.key} className={`h-1 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-ink' : 'w-1.5 bg-stone-2'}`} />)}
        </div>
      </div>
      <ZoomViewer slides={slides} index={zoom} onClose={() => setZoom(null)} onIndex={setZoom} />
    </div>
  );
}

function ZoomViewer({ slides, index, onClose, onIndex }: { slides: Slide[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const [zoomed, setZoomed] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const s = index != null ? slides[index] : null;
  const toggle = (e: React.MouseEvent) => {
    const el = box.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    setZoomed((z) => !z);
    requestAnimationFrame(() => {
      if (!box.current) return;
      box.current.scrollLeft = fx * (box.current.scrollWidth - box.current.clientWidth);
      box.current.scrollTop = fy * (box.current.scrollHeight - box.current.clientHeight);
    });
  };
  const pan = (e: React.PointerEvent) => {
    if (!zoomed || e.pointerType !== 'mouse' || !box.current) return;
    const el = box.current, r = el.getBoundingClientRect();
    el.scrollLeft = ((e.clientX - r.left) / r.width) * (el.scrollWidth - el.clientWidth);
    el.scrollTop = ((e.clientY - r.top) / r.height) * (el.scrollHeight - el.clientHeight);
  };
  return (
    <Sheet open={index != null} onClose={() => { setZoomed(false); onClose(); }} label="Uvećana slika" side="full" className="bg-plaster-2">
      {s && (
        <div className="relative h-full">
          <div ref={box} onPointerMove={pan} className={`h-full w-full ${zoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
            <button type="button" onClick={toggle} className={`relative block ${zoomed ? 'h-[220%] w-[220%] cursor-zoom-out' : 'h-full w-full cursor-zoom-in'}`} aria-label={zoomed ? 'Smanji' : 'Uvećaj'}>
              <Image src={s.src} alt={s.alt} fill sizes={zoomed ? '220vw' : '100vw'} quality={zoomed ? 90 : 75} className={s.kind === 'detail' ? 'object-cover' : 'object-contain p-4'} />
            </button>
          </div>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
            {slides.map((sl, i) => (
              <button key={sl.key} type="button" onClick={() => { setZoomed(false); onIndex(i); }} aria-label={`Slika ${i + 1}`} aria-current={i === index} className={`relative h-14 w-11 bg-paper ${i === index ? 'ring-1 ring-ink' : 'opacity-70'}`}>
                <Image src={sl.src} alt="" fill sizes="44px" className={sl.kind === 'detail' ? 'object-cover' : 'object-contain p-0.5'} />
              </button>
            ))}
          </div>
          <p className="font-label absolute left-4 top-4 text-ink-3">{zoomed ? 'Pomjerajte za pregled' : 'Kliknite za uvećanje'}</p>
        </div>
      )}
    </Sheet>
  );
}
