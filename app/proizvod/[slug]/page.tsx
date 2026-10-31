import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PRODUCTS, getProduct, getCategory, lookFor, related } from '@/lib/catalog';
import { SIZES, sampleStock } from '@/lib/catalog/data';
import { ProductView } from '@/components/product/ProductView';
import { FabricViewer } from '@/components/product/FabricViewer';
import { ProductCard } from '@/components/product/ProductCard';
import { LookBuilder } from '@/components/home/LookBuilder';
import { MATERIAL } from '@/lib/catalog/filters';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/proizvod/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  const title = `${p.line} — ${p.type}`;
  const image = `/media/p/${p.slug}/${p.colorways[0].id}-front.webp`;
  return {
    title,
    description: `${p.description.split('.')[0]}. ${p.composition}. Plaćanje pouzećem, dostava širom BiH.`,
    alternates: { canonical: `/proizvod/${p.slug}` },
    openGraph: { title, images: [{ url: image, width: 1000, height: 1250 }] },
  };
}

export default function ProductPage({ params }: PageProps<'/proizvod/[slug]'>) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="page-x mx-auto grid max-w-[1600px] gap-12 pt-14 lg:grid-cols-12" aria-busy="true">
      <div className="aspect-[4/5] skeleton lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5"><div className="h-4 w-1/3 skeleton" /><div className="h-10 w-3/4 skeleton" /><div className="h-6 w-1/4 skeleton" /><div className="mt-10 h-40 skeleton" /></div>
    </div>
  );
}

async function ProductContent({ params }: Pick<PageProps<'/proizvod/[slug]'>, 'params'>) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = getCategory(p.category)!;
  const look = lookFor(p);
  const rel = related(p, 4);
  const c = p.colorways[0];
  const fabric = (c.art?.fabric as string) || (p.art.params?.fabric as string) || p.fabric;
  const color2 = (c.art?.color2 as string) || (fabric === 'denim' ? '#dfe3e8' : '#e9e5dc');
  const inStock = p.colorways.some((cw) => SIZES[p.sizeSystem].some((s) => sampleStock(p.id, cw.id, s) > 0));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.line} — ${p.type}`,
    description: p.description,
    sku: p.id,
    brand: { '@type': 'Brand', name: 'KROJ' },
    material: p.composition,
    image: p.colorways.map((cw) => `/media/p/${p.slug}/${cw.id}-front.webp`),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BAM',
      price: (p.price / 100).toFixed(2),
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `/proizvod/${p.slug}`,
      acceptedPaymentMethod: 'https://schema.org/COD',
    },
  };

  const slotLabel = (cat: string) => (cat === 'jakne-i-prsluci' ? 'Jakna' : ['traperice', 'pantalone', 'sorcevi'].includes(cat) ? 'Donji dio' : cat === 'kaisevi-i-dodaci' ? 'Dodatak' : 'Gornji dio');
  const slotKey = (cat: string) => (cat === 'jakne-i-prsluci' ? 'outer' : ['traperice', 'pantalone', 'sorcevi'].includes(cat) ? 'bottom' : cat === 'kaisevi-i-dodaci' ? 'extra' : 'top');
  const lookItems = [p, ...look];
  const seen = new Set<string>();
  const slots = lookItems
    .filter((x) => { const k = slotKey(x.category); if (seen.has(k)) return false; seen.add(k); return true; })
    .map((x) => ({ key: slotKey(x.category), label: slotLabel(x.category), options: [x] }));

  return (
    <div className="page-x mx-auto max-w-[1600px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <nav aria-label="Putanja" className="font-label py-5 text-ink-3">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/" className="hover:text-ink">Početna</Link></li><li aria-hidden>/</li>
          <li><Link href={`/kolekcija/${cat.slug}`} className="hover:text-ink">{cat.name}</Link></li><li aria-hidden>/</li>
          <li aria-current="page" className="text-ink-2">{p.line}</li>
        </ol>
      </nav>

      <ProductView product={p} />

      <section aria-labelledby="fabric-title" className="mt-20 grid gap-8 border-t border-stone pt-12 lg:mt-28 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 lg:col-start-1">
          <p className="font-label text-ink-3">Tkanina izbliza</p>
          <h2 id="fabric-title" className="font-display mt-3 text-[clamp(2.4rem,4.5vw,4rem)]">{MATERIAL[p.fabric]}<span className="text-copper">.</span></h2>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-2">{p.composition}{p.weight ? `, ${p.weight}` : ''}. Pomjerajte prst ili kursor preko tkanine. Svjetlo prati pokret i otkriva tkanje, kao kad tkaninu okrenete prema prozoru.</p>
          <dl className="mt-6 grid max-w-md grid-cols-2 gap-y-3 border-t border-stone pt-4 text-sm">
            <dt className="text-ink-3">Sastav</dt><dd>{p.composition}</dd>
            {p.weight && <><dt className="text-ink-3">Gramatura</dt><dd>{p.weight}</dd></>}
            <dt className="text-ink-3">Kroj</dt><dd>{p.fit}</dd>
            <dt className="text-ink-3">Održavanje</dt><dd>{p.care[0]}</dd>
          </dl>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <FabricViewer fabric={fabric} color={c.hex} color2={color2} fallback={`/media/p/${p.slug}/${c.id}-detail.webp`} label={`Tkanina: ${p.composition}`} />
        </div>
      </section>

      {slots.length > 1 && (
        <section aria-label="Upotpuni look" className="mt-20 border-t border-stone pt-12 lg:mt-28">
          <LookBuilder listId={`pdp_look_${p.id}`} mode="fixed" title="Upotpuni look" intro="Komadi koji idu uz ovaj. Odaberite veličine i dodajte sve odjednom." slots={slots} />
        </section>
      )}

      <section aria-labelledby="rel-title" className="mt-20 border-t border-stone pt-12 lg:mt-28">
        <h2 id="rel-title" className="font-display text-[clamp(2.2rem,4vw,3.5rem)]">Možda vam se svidi</h2>
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
          {rel.map((r, i) => <li key={r.id}><ProductCard product={r} list="pdp_related" index={i} /></li>)}
        </ul>
      </section>
    </div>
  );
}
