import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { CATEGORIES, PRODUCTS, getCategory, productsIn, newArrivals } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import { sortProducts } from '@/lib/catalog/filters';
import { CategoryBrowser } from '@/components/product/CategoryBrowser';
import { ProductGrid } from '@/components/product/ProductGrid';
import { plural } from '@/lib/format';
import { ScrollActive } from '@/components/ui/ScrollActive';

const SPECIAL: Record<string, { name: string; lede: string; products: () => Product[] }> = {
  sve: { name: 'Sve', lede: 'Cijela kolekcija na jednom mjestu: od osnovnih majica do zimskih jakni.', products: () => PRODUCTS },
  novo: { name: 'Novo', lede: 'Komadi koji su stigli ove jeseni: samt, krupno pletivo, prošivene jakne.', products: () => newArrivals(12) },
};

export function generateStaticParams() {
  return [...Object.keys(SPECIAL), ...CATEGORIES.map((c) => c.slug)].map((kategorija) => ({ kategorija }));
}

function resolve(slug: string) {
  const sp = SPECIAL[slug];
  if (sp) return { name: sp.name, lede: sp.lede, products: sp.products() };
  const c = getCategory(slug);
  if (!c) return null;
  return { name: c.name, lede: c.lede, products: productsIn(c.slug) };
}

export async function generateMetadata({ params }: PageProps<'/kolekcija/[kategorija]'>): Promise<Metadata> {
  const { kategorija } = await params;
  const r = resolve(kategorija);
  if (!r) return {};
  return { title: `${r.name} za muškarce`, description: r.lede, alternates: { canonical: `/kolekcija/${kategorija}` } };
}

export default function CategoryPage({ params }: PageProps<'/kolekcija/[kategorija]'>) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <CategoryContent params={params} />
    </Suspense>
  );
}

function CategorySkeleton() {
  return (
    <div className="page-x mx-auto max-w-[1600px]" aria-busy="true">
      <div className="h-4 w-40 pt-6" />
      <div className="mt-6 h-[clamp(3rem,8vw,7.5rem)] w-2/3 skeleton" />
      <div className="mt-24 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <div key={i} className="aspect-[4/5] skeleton" />)}</div>
    </div>
  );
}

async function CategoryContent({ params }: Pick<PageProps<'/kolekcija/[kategorija]'>, 'params'>) {
  const { kategorija } = await params;
  const r = resolve(kategorija);
  if (!r) notFound();
  const list = `category_${kategorija}`;
  const fallback = <ProductGrid products={sortProducts(r.products, 'preporuceno')} list={list} />;
  return (
    <div className="page-x mx-auto max-w-[1600px]">
      <nav aria-label="Putanja" className="font-label pt-6 text-ink-3">
        <ol className="flex gap-2"><li><Link href="/" className="hover:text-ink">Početna</Link></li><li aria-hidden>/</li><li aria-current="page" className="text-ink-2">{r.name}</li></ol>
      </nav>
      <header className="grid gap-4 border-b border-stone pb-6 pt-4 lg:grid-cols-12 lg:items-end">
        <h1 className="font-display text-[clamp(3rem,8vw,7.5rem)] lg:col-span-7">{r.name}</h1>
        <div className="lg:col-span-5 lg:pb-3">
          <p className="max-w-md font-serif text-lg italic leading-snug text-ink-2">{r.lede}</p>
          <p className="font-label tabular mt-3 text-ink-3">{r.products.length} {plural(r.products.length, 'model', 'modela', 'modela')}</p>
        </div>
      </header>
      <nav aria-label="Druge kategorije"><ScrollActive className="no-scrollbar -mx-[var(--page-x)] overflow-x-auto px-[var(--page-x)]">
        <ul className="flex gap-1 py-4">
          {[{ slug: 'sve', name: 'Sve' }, { slug: 'novo', name: 'Novo' }, ...CATEGORIES].map((c) => (
            <li key={c.slug}>
              <Link href={`/kolekcija/${c.slug}`} aria-current={c.slug === kategorija ? 'page' : undefined} className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm transition-colors ${c.slug === kategorija ? 'bg-ink text-paper' : 'text-ink-2 hover:bg-plaster-2 hover:text-ink'}`}>
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </ScrollActive></nav>
      <Suspense fallback={<div className="lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10"><div className="hidden lg:block" /><div><div className="mb-6 h-10" />{fallback}</div></div>}>
        <CategoryBrowser products={r.products} list={list} />
      </Suspense>
    </div>
  );
}
