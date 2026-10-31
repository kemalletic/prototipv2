import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { SUPPORT } from '@/lib/commerce';

export const metadata: Metadata = { title: 'Politika privatnosti' };

export default function Page() {
  return (
    <InfoPage current="/privatnost" title="Privatnost" lede="Koje podatke prikupljamo, zašto i koliko dugo ih čuvamo." sample>
      <h2>Podaci za narudžbu</h2>
      <p>Za dostavu pouzećem trebaju nam ime i prezime, broj telefona i adresa, a e-mail je neobavezan. Koristimo ih isključivo za obradu, potvrdu i dostavu narudžbe, te ih dijelimo samo s kurirskom službom koja vrši dostavu.</p>
      <h2>Pravni osnov</h2>
      <p>Obrada je potrebna za izvršenje ugovora o kupoprodaji. Analitiku i marketing koristimo samo uz vašu izričitu saglasnost, koju možete povući u bilo kojem trenutku u postavkama kolačića.</p>
      <h2>Čuvanje podataka</h2>
      <p>Podatke o narudžbama čuvamo onoliko dugo koliko to zahtijevaju računovodstveni i poreski propisi, a potom ih brišemo.</p>
      <h2>Vaša prava</h2>
      <p>Imate pravo na pristup, ispravku i brisanje podataka, kao i na prigovor. Zahtjev pošaljite na {SUPPORT.email}. Imate i pravo podnijeti prigovor Agenciji za zaštitu ličnih podataka u BiH.</p>
      <h2>U ovom prototipu</h2>
      <p>Prototip ne šalje podatke na server za trajno čuvanje: korpa, lista želja i demo narudžbe čuvaju se samo u vašem pregledniku (localStorage) i možete ih obrisati brisanjem podataka stranice.</p>
    </InfoPage>
  );
}
