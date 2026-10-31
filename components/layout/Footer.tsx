import Link from 'next/link';
import { NAV, HELP, LEGAL } from './nav';
import { SUPPORT, SHIPPING, RETURNS } from '@/lib/commerce';
import { formatKM } from '@/lib/format';
import { ConsentLink } from './ConsentBanner';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-stone bg-plaster-2">
      <div className="page-x mx-auto max-w-[1600px]">
        <ul className="grid grid-cols-2 gap-px border-b border-stone py-8 text-sm md:grid-cols-4">
          {[
            ['Plaćanje pouzećem', 'Gotovinom kuriru pri preuzimanju.'],
            [`Dostava ${SHIPPING.days}`, 'Na svaku adresu u BiH.'],
            [`Besplatno od ${formatKM(SHIPPING.freeFrom)}`, `Inače ${formatKM(SHIPPING.standard)} po narudžbi.`],
            [`Zamjena ${RETURNS.days} dana`, 'Druga veličina ili povrat novca.'],
          ].map(([t, d]) => (
            <li key={t} className="py-2 pr-4">
              <p className="font-medium text-ink">{t}</p>
              <p className="mt-0.5 text-ink-3">{d}</p>
            </li>
          ))}
        </ul>
        <div className="grid gap-10 py-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-serif text-2xl italic leading-snug text-ink-2">
              Muška odjeća krojena za svaki dan, iz Sarajeva za cijelu Bosnu i Hercegovinu.
            </p>
            <dl className="mt-6 space-y-1 text-sm text-ink-2">
              <div><dt className="sr-only">Telefon</dt><dd><a href={SUPPORT.phoneHref} className="hover:text-ink">{SUPPORT.phone}</a></dd></div>
              <div><dt className="sr-only">E-mail</dt><dd><a href={`mailto:${SUPPORT.email}`} className="hover:text-ink">{SUPPORT.email}</a></dd></div>
              <div><dt className="sr-only">Radno vrijeme</dt><dd>{SUPPORT.hours}</dd></div>
            </dl>
          </div>
          <nav aria-label="Kupovina" className="md:col-span-3 md:col-start-6">
            <h2 className="font-label text-ink-3">Kupovina</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/kolekcija/novo" className="hover:text-copper">Novo</Link></li>
              <li><Link href="/kolekcija/sve" className="hover:text-copper">Sve kategorije</Link></li>
              {NAV.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-copper">{n.full}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Pomoć" className="md:col-span-2">
            <h2 className="font-label text-ink-3">Pomoć</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {HELP.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-copper">{n.label}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="O nama i pravila" className="md:col-span-2">
            <h2 className="font-label text-ink-3">KROJ</h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/o-nama" className="hover:text-copper">O nama</Link></li>
              {LEGAL.map((n) => <li key={n.href}><Link href={n.href} className="hover:text-copper">{n.label}</Link></li>)}
              <li><ConsentLink /></li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="overflow-hidden border-t border-stone">
        <div className="page-x mx-auto flex max-w-[1600px] flex-col gap-2 py-4 text-xs text-ink-3 sm:flex-row sm:justify-between">
          <p>© 2026 KROJ (radni naziv brenda). Prototip, svi proizvodi su primjeri.</p>
          <p>Cijene su u KM (BAM) i uključuju PDV.</p>
        </div>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 1000 250" className="block w-full select-none" preserveAspectRatio="xMidYMax meet">
          <text x="500" y="300" textAnchor="middle" fill="#ddd6ca" style={{ fontFamily: 'var(--font-archivo)', fontVariationSettings: '"wdth" 66', fontWeight: 760, fontSize: 380, letterSpacing: '-4px' }}>KROJ</text>
        </svg>
      </div>
    </footer>
  );
}
