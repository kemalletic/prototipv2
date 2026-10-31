import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { ContactForm } from '@/components/info/ContactForm';
import { SUPPORT } from '@/lib/commerce';

export const metadata: Metadata = { title: 'Kontakt' };

export default function Page() {
  return (
    <InfoPage current="/kontakt" title="Kontakt" lede="Pitanje o veličini, narudžbi ili povratu? Javite se, odgovaramo istog radnog dana.">
      <dl className="not-prose grid gap-6 border-y border-stone py-6 sm:grid-cols-3">
        <div><dt className="font-label text-ink-3">Telefon</dt><dd className="mt-1 text-lg"><a href={SUPPORT.phoneHref} className="hover:text-copper">{SUPPORT.phone}</a></dd></div>
        <div><dt className="font-label text-ink-3">E-mail</dt><dd className="mt-1 text-lg"><a href={`mailto:${SUPPORT.email}`} className="hover:text-copper">{SUPPORT.email}</a></dd></div>
        <div><dt className="font-label text-ink-3">Radno vrijeme</dt><dd className="mt-1 text-lg">{SUPPORT.hours}</dd></div>
      </dl>
      <p className="!mt-3 text-xs !text-ink-3">Kontakt podaci su primjeri.</p>
      <h2>Pošaljite poruku</h2>
      <div className="not-prose mt-4"><ContactForm /></div>
    </InfoPage>
  );
}
