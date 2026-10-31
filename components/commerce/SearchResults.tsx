'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { search, bestsellers } from '@/lib/catalog';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Icon } from '@/components/ui/Icon';
import { plural } from '@/lib/format';
import { track } from '@/lib/analytics';

export function SearchResults() {
  const sp = useSearchParams();
  const q = sp.get('q') ?? '';
  const [value, setValue] = useState(q);
  const router = useRouter();
  const results = useMemo(() => search(q), [q]);
  useEffect(() => { setValue(q); if (q) track('search', { search_term: q, results: results.length }); }, [q, results.length]);
  return (
    <>
      <form role="search" onSubmit={(e) => { e.preventDefault(); router.replace(`/pretraga?q=${encodeURIComponent(value.trim())}`); }} className="flex max-w-2xl items-center gap-3 border-b border-ink pb-3">
        <Icon name="search" size={22} />
        <label htmlFor="q-page" className="sr-only">Pretraga</label>
        <input id="q-page" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Šta tražite?" className="w-full bg-transparent text-2xl font-medium placeholder:text-ink-3/60 focus:outline-none" enterKeyHint="search" />
        <button type="submit" className="shrink-0 text-sm underline underline-offset-4">Traži</button>
      </form>
      <div className="mt-8" aria-live="polite">
        {q && <p className="font-label tabular mb-6 text-ink-3">{results.length} {plural(results.length, 'rezultat', 'rezultata', 'rezultata')} za „{q}“</p>}
        {q && results.length > 0 && <ProductGrid products={results} list="search" cols="grid-cols-2 md:grid-cols-3 xl:grid-cols-4" vt={false} />}
        {(!q || results.length === 0) && (
          <div>
            {q && <p className="max-w-lg text-lg">Nema rezultata za „{q}“. Provjerite pravopis ili pogledajte najprodavanije komade.</p>}
            <h2 className="font-display mt-10 text-4xl">Najprodavanije</h2>
            <div className="mt-6"><ProductGrid products={bestsellers(4)} list="search_fallback" cols="grid-cols-2 md:grid-cols-4" vt={false} /></div>
            <p className="mt-8 text-sm"><Link href="/kolekcija/sve" className="underline underline-offset-4">Pregledajte sve kategorije</Link></p>
          </div>
        )}
      </div>
    </>
  );
}
