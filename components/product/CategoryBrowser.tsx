'use client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { startTransition, useMemo, useState } from 'react';
import type { Product } from '@/lib/catalog';
import {
  applyFilters, facets, colorFamily, parseFilters, toQuery, FILTER_KEYS, FILTER_LABEL, SORTS, FAMILY_HEX, optionLabel,
  type FilterKey, type FilterState, type SortId,
} from '@/lib/catalog/filters';
import { ProductGrid } from './ProductGrid';
import { Sheet } from '@/components/ui/Sheet';
import { Icon } from '@/components/ui/Icon';
import { btn } from '@/components/ui/styles';
import { plural } from '@/lib/format';

export function CategoryBrowser({ products, list }: { products: Product[]; list: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const f = useMemo(() => parseFilters(new URLSearchParams(sp.toString())), [sp]);
  const fac = useMemo(() => facets(products), [products]);
  const shown = useMemo(() => applyFilters(products, f), [products, f]);
  const [sheet, setSheet] = useState(false);
  const active = FILTER_KEYS.reduce((n, k) => n + f[k].length, 0);

  const update = (next: FilterState) => {
    startTransition(() => router.replace(`${pathname}${toQuery(next)}`, { scroll: false }));
  };
  const toggle = (k: FilterKey, v: string) => {
    const has = f[k].includes(v);
    update({ ...f, [k]: has ? f[k].filter((x) => x !== v) : [...f[k], v] });
  };
  const clear = () => update({ velicina: [], boja: [], kroj: [], materijal: [], cijena: [], sort: f.sort });
  const setSort = (s: SortId) => update({ ...f, sort: s });

  const panel = <FilterPanel fac={fac} f={f} toggle={toggle} />;

  return (
    <div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
      <aside aria-label="Filteri" className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+1.25rem)] max-h-[calc(100dvh-var(--header-h)-2.5rem)] overflow-y-auto pb-6 pr-2">
          <div className="flex items-center justify-between">
            <h2 className="font-label text-ink-3">Filteri</h2>
            {active > 0 && <button type="button" onClick={clear} className="text-sm underline underline-offset-4 hover:text-copper">Očisti ({active})</button>}
          </div>
          {panel}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="sticky top-[var(--header-h)] z-20 -mx-[var(--page-x)] mb-6 border-b border-stone bg-plaster/95 px-[var(--page-x)] py-2.5 backdrop-blur-[2px] lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSheet(true)} className="flex h-10 items-center gap-2 border border-stone px-3.5 text-sm hover:border-ink lg:hidden" aria-haspopup="dialog">
                <Icon name="filter" size={18} /> Filteri{active > 0 && <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.6875rem] text-paper">{active}</span>}
              </button>
              <p className="tabular text-sm text-ink-3" aria-live="polite">{shown.length} {plural(shown.length, 'proizvod', 'proizvoda', 'proizvoda')}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden text-ink-3 sm:inline">Sortiraj</span>
              <span className="relative">
                <select value={f.sort} onChange={(e) => setSort(e.target.value as SortId)} className="h-10 appearance-none border border-stone bg-transparent pl-3 pr-9 text-sm hover:border-ink" aria-label="Sortiraj proizvode">
                  {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
              </span>
            </label>
          </div>
          {active > 0 && (
            <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Aktivni filteri">
              {FILTER_KEYS.flatMap((k) => f[k].map((v) => (
                <li key={`${k}-${v}`}>
                  <button type="button" onClick={() => toggle(k, v)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-ink pl-3 pr-2 text-[0.8125rem] text-paper hover:bg-ink-2" aria-label={`Ukloni filter ${FILTER_LABEL[k]}: ${optionLabel(k, v)}`}>
                    {optionLabel(k, v)} <Icon name="close" size={14} />
                  </button>
                </li>
              )))}
              <li><button type="button" onClick={clear} className="h-8 px-2 text-[0.8125rem] underline underline-offset-4">Očisti sve</button></li>
            </ul>
          )}
        </div>

        {shown.length ? (
          <ProductGrid products={shown} list={list} colorFor={f.boja.length ? (p) => p.colorways.find((c) => f.boja.includes(colorFamily(c.name)))?.id : undefined} />
        ) : (
          <div className="border border-dashed border-stone-2 px-6 py-16 text-center">
            <p className="font-display text-4xl text-stone-2">Ništa</p>
            <p className="mt-3 text-ink-2">Nema proizvoda za odabrane filtere.</p>
            <button type="button" onClick={clear} className={`${btn.base} ${btn.secondary} mt-6`}>Očisti filtere</button>
          </div>
        )}
      </div>

      <Sheet open={sheet} onClose={() => setSheet(false)} label="Filteri" side="bottom" className="rounded-t-xl">
        <div className="flex max-h-[88dvh] flex-col">
          <div className="flex h-14 shrink-0 items-center border-b border-stone px-5"><h2 className="font-medium">Filteri</h2></div>
          <div className="overflow-y-auto px-5 pb-4">{panel}</div>
          <div className="grid shrink-0 grid-cols-[auto_1fr] gap-2 border-t border-stone p-4">
            <button type="button" onClick={clear} className={`${btn.base} ${btn.ghost} h-12 px-4`} disabled={!active}>Očisti</button>
            <button type="button" onClick={() => setSheet(false)} className={`${btn.base} ${btn.primary}`}>Prikaži {shown.length} {plural(shown.length, 'proizvod', 'proizvoda', 'proizvoda')}</button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function FilterPanel({ fac, f, toggle }: { fac: ReturnType<typeof facets>; f: FilterState; toggle: (k: FilterKey, v: string) => void }) {
  return (
    <div>
      {FILTER_KEYS.map((k) => {
        const opts = fac[k];
        if (!opts.length || (k === 'kroj' && opts.length < 2) || (k === 'materijal' && opts.length < 2)) return null;
        return (
          <fieldset key={k} className="border-b border-stone py-4 last:border-0">
            <legend className="float-left mb-3 w-full text-sm font-medium">{FILTER_LABEL[k]}{f[k].length > 0 && <span className="text-ink-3"> · {f[k].length}</span>}</legend>
            <div className={`clear-both ${k === 'velicina' ? 'grid grid-cols-4 gap-1.5' : 'flex flex-col gap-0.5'}`}>
              {opts.map((v) => {
                const on = f[k].includes(v);
                if (k === 'velicina') {
                  return (
                    <button key={v} type="button" onClick={() => toggle(k, v)} aria-pressed={on} className={`tabular h-10 border text-[0.8125rem] transition-colors ${on ? 'border-ink bg-ink text-paper' : 'border-stone hover:border-ink'}`}>{v}</button>
                  );
                }
                return (
                  <label key={v} className="flex min-h-9 cursor-pointer items-center gap-2.5 text-sm text-ink-2 hover:text-ink">
                    <input type="checkbox" checked={on} onChange={() => toggle(k, v)} className="peer sr-only" />
                    <span aria-hidden className={`grid h-[18px] w-[18px] place-items-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-copper ${on ? 'border-ink bg-ink text-paper' : 'border-stone-2'}`}>{on && <Icon name="check" size={12} strokeWidth={2.2} />}</span>
                    {k === 'boja' && <span aria-hidden className="h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: FAMILY_HEX[v] }} />}
                    <span className={on ? 'text-ink' : ''}>{optionLabel(k, v)}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
