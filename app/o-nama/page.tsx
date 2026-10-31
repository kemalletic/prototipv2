import type { Metadata } from 'next';
import Image from 'next/image';
import { InfoPage } from '@/components/info/InfoPage';

export const metadata: Metadata = { title: 'O nama', description: 'KROJ je radni naziv koncepta muške odjeće iz Sarajeva.' };

export default function Page() {
  return (
    <InfoPage current="/o-nama" title="O nama" lede="Muška odjeća za svaki dan: gust materijal, pošten kroj i cijena koja ima smisla.">
      <p>KROJ je koncept trgovine muške odjeće iz Sarajeva. Ime dolazi od riječi koju svaki krojač koristi prvu: <em>kroj</em>, oblik iz kojeg nastaje komad odjeće. Prodajemo traperice, pantalone, majice, trenerke, džempere, jakne i dodatke za muškarce širom Bosne i Hercegovine.</p>
      <div className="not-prose my-8 grid grid-cols-3 gap-3">
        {[['neretva-ravne-traperice', 'tamno-indigo'], ['prenj-dzemper-okruglog-izreza', 'smeda'], ['romanija-radna-jakna', 'maslinasta']].map(([s, c]) => (
          <div key={s} className="relative aspect-square overflow-hidden"><Image src={`/media/p/${s}/${c}-detail.webp`} alt="" fill sizes="(min-width:1024px) 18vw, 30vw" className="object-cover" /></div>
        ))}
      </div>
      <h2>Kako biramo</h2>
      <p>Prvo tkanina, pa kroj. Biramo gušći pamuk, pravu vunu i denim koji lijepo stari, a krojeve držimo jednostavnim, da komad traje više sezona i da se lako kombinuje.</p>
      <h2>Kako kupujete</h2>
      <p>Bez registracije i bez kartice: naručite, mi vas nazovemo da potvrdimo, a platite gotovinom kuriru kad paket stigne. Ako veličina ne odgovara, zamjena je jednostavna.</p>
      <h2 id="prototip">O ovom prototipu</h2>
      <p>Ova stranica je <strong>funkcionalni prototip</strong> trgovine. Važno je znati sljedeće:</p>
      <ul>
        <li>Brend „KROJ” je radni naziv i može se promijeniti.</li>
        <li>Svi proizvodi, cijene, zalihe i opisi su <strong>primjeri</strong>.</li>
        <li>Slike proizvoda su <strong>ilustrativni prikazi</strong> nastali u virtualnom studiju, a ne fotografije stvarne robe. Bit će zamijenjene profesionalnim fotografijama.</li>
        <li>Narudžbe se <strong>ne šalju</strong>: korpa i potvrda rade samo u vašem pregledniku.</li>
        <li>Pravila dostave, povrata i privatnosti su prijedlozi koje treba pravno provjeriti.</li>
      </ul>
    </InfoPage>
  );
}
