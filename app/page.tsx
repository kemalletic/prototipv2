import Image from 'next/image';
import Link from 'next/link';
import { Rail } from '@/components/home/Rail';
import { LookBuilder } from '@/components/home/LookBuilder';
import { ProductCard } from '@/components/product/ProductCard';
import { RAIL, CATEGORIES, productsIn, bestsellers, newArrivals, getProductById } from '@/lib/catalog';
import type { Product } from '@/lib/catalog';
import { formatKM, plural } from '@/lib/format';
import { SHIPPING, RETURNS } from '@/lib/commerce';
import { btn } from '@/components/ui/styles';
import { Icon } from '@/components/ui/Icon';

const pick = (ids: string[]) => ids.map((id) => getProductById(id)).filter((p): p is Product => !!p);

const CATEGORY_FACE: Record<string, string> = {
  traperice: 'p01', pantalone: 'p07', majice: 'p13', trenerke: 'p20', dzemperi: 'p24', 'jakne-i-prsluci': 'p31', sorcevi: 'p37', 'kaisevi-i-dodaci': 'p40',
};

export default function Home() {
  const fits = pick(['p02', 'p01', 'p03', 'p04']);
  const best = bestsellers(8);
  const fresh = newArrivals(4);
  return (
    <>
      {/* ───────────────── HERO: the rail */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden bg-[radial-gradient(ellipse_75%_70%_at_50%_0%,#f4f0ea_0%,rgb(236_231_222/0)_72%)] pb-10 lg:pb-14">
        <div className="page-x mx-auto grid max-w-[1600px] items-end gap-6 pt-7 lg:grid-cols-12 lg:pt-9">
          <div className="lg:col-span-8">
            <p className="font-label text-ink-3">Jesen / Zima 2026 · Kolekcija 01</p>
            <h1 id="hero-title" className="font-display mt-3 text-[clamp(3.5rem,8.4vw,8.75rem)]">
              Kroj za<br />svaki dan<span className="text-copper">.</span>
            </h1>
          </div>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="max-w-sm font-serif text-[1.3rem] italic leading-snug text-ink-2">
              Traperice, pletiva i jakne od gustih materijala. Osmišljeno u Sarajevu da traje više zima.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/kolekcija/sve" className={`${btn.base} ${btn.primary}`}>Pogledaj kolekciju <Icon name="arrowRight" size={18} /></Link>
              <Link href="/kolekcija/novo" className={`${btn.base} ${btn.secondary}`}>Novo</Link>
            </div>
            <p className="mt-4 text-sm text-ink-3">Plaćanje pouzećem · Dostava {SHIPPING.days} · Besplatno od {formatKM(SHIPPING.freeFrom)}</p>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-[1920px] lg:mt-7">
          <Rail products={RAIL} />
        </div>
      </section>

      {/* ───────────────── CATEGORIES */}
      <section aria-labelledby="kat-title" className="page-x mx-auto max-w-[1600px] pt-16 lg:pt-24">
        <div className="flex items-end justify-between gap-4 border-b border-stone pb-4">
          <h2 id="kat-title" className="font-display text-[clamp(2.2rem,4.6vw,4.25rem)]">Kategorije</h2>
          <Link href="/kolekcija/sve" className="mb-1 inline-flex items-center gap-1.5 text-sm hover:text-copper">Svi proizvodi <Icon name="arrowRight" size={16} /></Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
          {CATEGORIES.map((c, i) => {
            const face = getProductById(CATEGORY_FACE[c.slug])!;
            const n = productsIn(c.slug).length;
            return (
              <li key={c.slug} className="reveal">
                <Link href={`/kolekcija/${c.slug}`} className="group relative block aspect-[5/6] overflow-hidden bg-plaster-2">
                  <Image
                    src={`/media/p/${face.slug}/${face.colorways[0].id}-front.webp`} alt="" fill
                    sizes="(min-width:768px) 24vw, 46vw" loading={i < 4 ? 'eager' : 'lazy'}
                    className="object-contain p-[10%] pb-[16%] transition-transform duration-700 ease-[var(--ease-tailor)] group-hover:-translate-y-2 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 lg:p-4">
                    <span className="font-display text-[clamp(1.35rem,2.3vw,2.1rem)]">{c.name}</span>
                    <span className="font-label tabular text-ink-3">{n}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ───────────────── DENIM CHAPTER: fit guide */}
      <section aria-labelledby="denim-title" className="mt-20 bg-night text-paper lg:mt-28">
        <div className="page-x mx-auto grid max-w-[1600px] gap-10 py-16 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-4">
            <p className="font-label text-[#9aa3b5]">Poglavlje 01 · Denim</p>
            <h2 id="denim-title" className="font-display mt-3 text-[clamp(2.8rem,6vw,5.75rem)]">Četiri<br />kroja.</h2>
            <p className="mt-5 max-w-sm text-[1.0625rem] leading-relaxed text-[#c9cfda]">
              Isti gusti denim od 12 do 15 unci, četiri silhuete. Uporedite krojeve jedan pored drugog i odaberite onaj koji odgovara vašem tijelu i stilu.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full">
                <Image src="/media/p/neretva-ravne-traperice/tamno-indigo-detail.webp" alt="Izbliza: tkanje denima" fill sizes="96px" className="object-cover" />
              </div>
              <p className="font-label leading-relaxed text-[#9aa3b5]">Kepper tkanje 3/1<br />100% pamuk<br />Bakrene zakovice</p>
            </div>
            <Link href="/kolekcija/traperice" className={`${btn.base} mt-8 h-12 bg-paper px-6 text-[0.9375rem] font-medium text-ink hover:bg-plaster`}>Sve traperice <Icon name="arrowRight" size={18} /></Link>
          </div>
          <ol className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:col-span-8">
            {fits.map((p, i) => (
              <li key={p.id} className="reveal">
                <Link href={`/proizvod/${p.slug}`} className="group block">
                  <div className="relative aspect-[1/2] overflow-hidden">
                    <div aria-hidden className="absolute inset-x-[12%] bottom-0 top-[8%] rounded-t-full bg-night-2 transition-colors duration-500 group-hover:bg-[#333c4e]" />
                    <Image src={`/media/p/${p.slug}/${p.colorways[0].id}-front.webp`} alt={`${p.line}: ${p.fit.toLowerCase()} kroj`} fill sizes="(min-width:1024px) 15vw, 45vw" className="object-cover object-top transition-transform duration-700 ease-[var(--ease-tailor)] group-hover:-translate-y-1.5" style={{ objectPosition: '50% 0%' }} />
                  </div>
                  <p className="font-label mt-4 text-[#9aa3b5]">0{i + 1} · {p.fit}</p>
                  <p className="mt-1 text-lg font-medium">{p.line}</p>
                  <p className="text-sm text-[#c9cfda]">{p.fitNote.split('.')[0]}.</p>
                  <p className="tabular mt-2 text-sm">{formatKM(p.price)}</p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────── BESTSELLERS */}
      <section aria-labelledby="best-title" className="mx-auto max-w-[1600px] pt-20 lg:pt-28">
        <div className="page-x"><div className="flex items-end justify-between gap-4 border-b border-stone pb-4">
          <h2 id="best-title" className="font-display text-[clamp(2.2rem,4.6vw,4.25rem)]">Najprodavanije</h2>
          <Link href="/kolekcija/sve?sort=preporuceno" className="mb-1 inline-flex items-center gap-1.5 text-sm hover:text-copper">Pogledaj sve <Icon name="arrowRight" size={16} /></Link>
        </div></div>
        <ul className="no-scrollbar mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--page-x)] [scroll-padding-inline:var(--page-x)] md:grid md:grid-cols-4 md:gap-x-4 md:gap-y-10 md:overflow-visible">
          {best.map((p, i) => (
            <li key={p.id} className="w-[64vw] shrink-0 snap-start sm:w-[40vw] md:w-auto">
              <ProductCard product={p} list="home_bestsellers" index={i} sizes="(min-width:768px) 24vw, 64vw" />
            </li>
          ))}
        </ul>
      </section>

      {/* ───────────────── LOOK COMPOSER */}
      <section aria-label="Složi look" className="page-x mx-auto max-w-[1600px] pt-20 lg:pt-28">
        <LookBuilder
          listId="home_look"
          title="Složi look"
          intro="Listajte slojeve, a mi računamo ukupnu cijenu. Kad ste zadovoljni, cijeli look ide u korpu u jednom koraku."
          slots={[
            { key: 'outer', label: 'Jakna', options: pick(['p29', 'p31', 'p30', 'p32', 'p34', 'p33']), optional: true },
            { key: 'top', label: 'Gornji dio', options: pick(['p24', 'p12', 'p20', 'p25', 'p13', 'p26', 'p17']) },
            { key: 'bottom', label: 'Donji dio', options: pick(['p01', 'p07', 'p09', 'p08', 'p03', 'p10']) },
            { key: 'extra', label: 'Dodatak', options: pick(['p40', 'p42', 'p44']), optional: true },
          ]}
        />
      </section>

      {/* ───────────────── NEW */}
      <section aria-labelledby="new-title" className="page-x mx-auto max-w-[1600px] pt-20 lg:pt-28">
        <div className="flex items-end justify-between gap-4 border-b border-stone pb-4">
          <h2 id="new-title" className="font-display text-[clamp(2.2rem,4.6vw,4.25rem)]">Novo ove sezone</h2>
          <Link href="/kolekcija/novo" className="mb-1 inline-flex items-center gap-1.5 text-sm hover:text-copper">Sve novo <Icon name="arrowRight" size={16} /></Link>
        </div>
        <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-4 md:gap-x-4">
          {fresh.map((p, i) => <li key={p.id}><ProductCard product={p} list="home_new" index={i} /></li>)}
        </ul>
      </section>

      {/* ───────────────── FABRIC STORY */}
      <section aria-labelledby="fabric-title" className="page-x mx-auto max-w-[1600px] pt-20 lg:pt-28">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-label text-ink-3">Zašto KROJ</p>
            <h2 id="fabric-title" className="font-display mt-3 text-[clamp(2.6rem,5.4vw,5rem)]">Gust materijal.<br />Pošten kroj.<br /><span className="text-copper">Fer cijena.</span></h2>
            <p className="mt-6 max-w-md leading-relaxed text-ink-2">
              Prvo biramo tkaninu, pa tek onda kroj. Gušći pamuk, prava vuna i denim koji stari lijepo. Na svakoj stranici proizvoda možete pogledati tkaninu izbliza i okretati svjetlo.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-3 lg:col-span-7 lg:grid-cols-4">
            {[
              ['neretva-ravne-traperice', 'tamno-indigo', 'Denim 14 oz', 'Traperice Neretva'],
              ['prenj-dzemper-okruglog-izreza', 'smeda', 'Janjeća vuna', 'Džemper Prenj'],
              ['bjelasnica-pantalone-od-samta', 'smeda', 'Rebrasti samt', 'Pantalone Bjelašnica'],
              ['romanija-radna-jakna', 'maslinasta', 'Pamučno platno', 'Jakna Romanija'],
            ].map(([slug, color, fabric, prod]) => (
              <li key={slug} className="reveal">
                <Link href={`/proizvod/${slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image src={`/media/p/${slug}/${color}-detail.webp`} alt={`Izbliza: ${fabric}`} fill sizes="(min-width:1024px) 14vw, 45vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-tailor)] group-hover:scale-110" />
                  </div>
                  <p className="mt-2 text-sm font-medium">{fabric}</p>
                  <p className="text-sm text-ink-3 group-hover:text-ink">{prod}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────── HOW COD WORKS */}
      <section aria-labelledby="how-title" className="page-x mx-auto max-w-[1600px] pt-20 lg:pt-28">
        <h2 id="how-title" className="font-display border-b border-stone pb-4 text-[clamp(2.2rem,4.6vw,4.25rem)]">Kako kupujete</h2>
        <ol className="grid gap-x-8 gap-y-8 pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Naručite bez kartice', 'Odaberite veličinu i ostavite adresu i broj telefona. Registracija nije potrebna.'],
            ['Potvrdimo telefonom', 'Javimo se radnim danom da potvrdimo narudžbu, veličinu i adresu.'],
            [`Kurir za ${SHIPPING.days}`, `Dostava na svaku adresu u BiH. Besplatno za narudžbe od ${formatKM(SHIPPING.freeFrom)}.`],
            ['Platite pri preuzimanju', `Gotovinom kuriru. Ne odgovara veličina? Zamjena ili povrat u roku od ${RETURNS.days} dana.`],
          ].map(([t, d], i) => (
            <li key={t} className="reveal border-t border-ink pt-4">
              <p className="font-label tabular text-copper">0{i + 1}</p>
              <p className="mt-2 text-lg font-medium">{t}</p>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">{d}</p>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-ink-3">
          {PRODUCTS_COUNT} {plural(PRODUCTS_COUNT, 'model', 'modela', 'modela')} u {CATEGORIES.length} kategorija · <Link href="/dostava" className="underline underline-offset-2 hover:text-ink">Sve o dostavi</Link> · <Link href="/povrat-i-zamjena" className="underline underline-offset-2 hover:text-ink">Povrat i zamjena</Link>
        </p>
      </section>
    </>
  );
}

const PRODUCTS_COUNT = CATEGORIES.reduce((s, c) => s + productsIn(c.slug).length, 0);
