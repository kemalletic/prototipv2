import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { RETURNS, SUPPORT } from '@/lib/commerce';

export const metadata: Metadata = { title: 'Povrat i zamjena' };

export default function Page() {
  return (
    <InfoPage current="/povrat-i-zamjena" title="Povrat i zamjena" lede={`Ne odgovara veličina? Imate ${RETURNS.days} dana za zamjenu ili povrat.`} sample>
      <h2>Zamjena veličine</h2>
      <p>Javite nam se u roku od {RETURNS.days} dana od preuzimanja na {SUPPORT.phone} ili {SUPPORT.email}. Kurir preuzima artikal i donosi novu veličinu. Prva zamjena je besplatna.</p>
      <h2>Povrat novca</h2>
      <p>Artikal vratite neopran, nenošen i s etiketama, u roku od {RETURNS.days} dana od preuzimanja. Novac vraćamo na vaš bankovni račun u roku od 14 dana od prijema povrata. Trošak povratne dostave snosi kupac, osim ako je artikal oštećen ili pogrešan.</p>
      <h2>Izuzeci</h2>
      <ul><li>Čarape iz higijenskih razloga ne možemo primiti nazad ako je pakovanje otvoreno.</li><li>Artikli koji su nošeni, prani ili oštećeni nakon preuzimanja.</li></ul>
      <h2>Reklamacije</h2>
      <p>Ako artikal ima grešku u izradi, javite nam se uz fotografiju. Reklamacije rješavamo u skladu sa Zakonom o zaštiti potrošača u Bosni i Hercegovini.</p>
    </InfoPage>
  );
}
