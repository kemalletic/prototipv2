'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Icon } from '@/components/ui/Icon';
import { search, CATEGORIES, imagesOf, colorwayOf, bestsellers } from '@/lib/catalog';
import { formatKM, normalize, plural } from '@/lib/format';
import { track } from '@/lib/analytics';

const POPULAR = ['traperice', 'džemper', 'jakna', 'trenerka', 'kaiš', 'majica'];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} label="Pretraga" side="top" className="max-sm:h-dvh">
      <SearchPanel onClose={onClose} />
    </Sheet>
  );
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const dq = useDeferredValue(q);
  const [active, setActive] = useState(-1);
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(dq), [dq]);
  const cats = useMemo(() => (dq.trim() ? CATEGORIES.filter((c) => normalize(c.name).includes(normalize(dq))) : []), [dq]);
  const shown = results.slice(0, 6);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    if (!dq.trim()) return;
    const t = setTimeout(() => track('search', { search_term: dq, results: results.length }), 700);
    return () => clearTimeout(t);
  }, [dq, results.length]);

  const go = (href: string) => { onClose(); router.push(href); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, shown.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && shown[active]) go(`/proizvod/${shown[active].slug}`);
      else if (q.trim()) go(`/pretraga?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div className="page-x mx-auto w-full max-w-[1200px] overflow-y-auto pb-8 pt-5">
      <form role="search" onSubmit={(e) => e.preventDefault()} className="flex items-center gap-3 border-b border-ink pb-3 pr-12 transition-[border-color,box-shadow] focus-within:border-copper focus-within:shadow-[0_1px_0_0_var(--color-copper)]">
        <Icon name="search" size={24} />
        <label htmlFor="q-global" className="sr-only">Pretraži proizvode</label>
        <input
          id="q-global" ref={inputRef} value={q}
          onChange={(e) => { setQ(e.target.value); setActive(-1); }}
          onKeyDown={onKey}
          placeholder="Traperice, džemper, kaiš…"
          role="combobox" aria-expanded={shown.length > 0} aria-controls={listId} aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          className="w-full bg-transparent text-2xl font-medium tracking-tight placeholder:text-ink-3/60 focus:outline-none focus-visible:outline-none sm:text-3xl"
          autoComplete="off" enterKeyHint="search"
        />
      </form>

      {!dq.trim() ? (
        <div className="mt-6 grid gap-8 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-label text-ink-3">Često traženo</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {POPULAR.map((t) => (
                <li key={t}><button type="button" onClick={() => setQ(t)} className="h-9 rounded-full border border-stone px-4 text-sm hover:border-ink">{t}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-label text-ink-3">Najprodavanije</h2>
            <ul className="mt-3 grid grid-cols-4 gap-3">
              {bestsellers(4).map((p) => {
                const c = colorwayOf(p);
                return (
                  <li key={p.id}>
                    <Link href={`/proizvod/${p.slug}`} onClick={onClose} className="group block">
                      <div className="relative aspect-[4/5] bg-plaster-2"><Image src={imagesOf(p, c).front} alt="" fill sizes="120px" className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.04]" /></div>
                      <p className="mt-1.5 truncate text-xs">{p.line} {p.type}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div className="mt-5" aria-live="polite">
          <p className="font-label text-ink-3">{results.length} {plural(results.length, 'rezultat', 'rezultata', 'rezultata')}</p>
          {cats.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {cats.map((c) => <li key={c.slug}><Link href={`/kolekcija/${c.slug}`} onClick={onClose} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-sm text-paper">{c.name}<Icon name="arrowRight" size={14} /></Link></li>)}
            </ul>
          )}
          {shown.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Rezultati pretrage" className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
              {shown.map((p, i) => {
                const c = colorwayOf(p);
                return (
                  <li key={p.id} id={`${listId}-${i}`} role="option" aria-selected={active === i}>
                    <Link href={`/proizvod/${p.slug}`} onClick={onClose} tabIndex={-1} className={`group block outline-offset-4 ${active === i ? 'outline outline-2 outline-copper' : ''}`}>
                      <div className="relative aspect-[4/5] bg-plaster-2"><Image src={imagesOf(p, c).front} alt="" fill sizes="(min-width:1024px) 180px, 45vw" className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]" /></div>
                      <p className="mt-2 text-sm font-medium leading-tight">{p.line}</p>
                      <p className="text-sm text-ink-2">{p.type}</p>
                      <p className="tabular mt-0.5 text-sm">{formatKM(p.price)}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-6 max-w-md">
              <p className="text-lg">Nismo pronašli ništa za „{dq}“.</p>
              <p className="mt-1 text-sm text-ink-2">Provjerite pravopis ili probajte opštiji pojam, npr. „traperice“ ili „jakna“.</p>
            </div>
          )}
          {results.length > shown.length && (
            <Link href={`/pretraga?q=${encodeURIComponent(dq)}`} onClick={onClose} className="mt-6 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4">
              Prikaži sve rezultate ({results.length}) <Icon name="arrowRight" size={16} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
