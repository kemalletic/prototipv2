import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { ConsentLink } from '@/components/layout/ConsentBanner';

export const metadata: Metadata = { title: 'Kolačići' };

export default function Page() {
  return (
    <InfoPage current="/kolacici" title="Kolačići" lede="Koristimo samo ono što je potrebno, a ostalo isključivo uz vašu dozvolu." sample>
      <table>
        <thead><tr><th>Kategorija</th><th>Svrha</th><th>Saglasnost</th></tr></thead>
        <tbody>
          <tr><td>Neophodni</td><td>Korpa, lista želja, postavke kolačića</td><td>Nije potrebna</td></tr>
          <tr><td>Analitika</td><td>Anonimna statistika posjeta i kupovine radi poboljšanja trgovine</td><td>Potrebna</td></tr>
          <tr><td>Marketing</td><td>Trenutno se ne koriste</td><td>—</td></tr>
        </tbody>
      </table>
      <p>Saglasnost možete promijeniti ili povući u bilo kojem trenutku: <span className="underline underline-offset-4"><ConsentLink /></span>.</p>
    </InfoPage>
  );
}
