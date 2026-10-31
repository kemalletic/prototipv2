import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { SizeTable } from '@/components/product/SizeGuide';

export const metadata: Metadata = { title: 'Vodič za veličine' };

export default function Page() {
  return (
    <InfoPage current="/vodic-za-velicine" title="Vodič za veličine" lede="Izmjerite se jednom, kupujte sigurno svaki put.">
      <p>Tabele prikazuju mjere tijela. Na svakoj stranici proizvoda je i kratak opis kroja (uži, ravni, opušteni), te procjena veličine na osnovu visine i težine.</p>
      <div className="not-prose my-8 space-y-10"><SizeTable chartKey="tops" /><SizeTable chartKey="bottoms" /><SizeTable chartKey="belts" /></div>
      <h2>Kako mjeriti</h2>
      <ul>
        <li><strong>Grudi:</strong> metar vodoravno preko najšireg dijela grudi, ispod pazuha.</li>
        <li><strong>Struk:</strong> obim na mjestu gdje inače nosite pantalone, ne preusko.</li>
        <li><strong>Bokovi:</strong> obim preko najšireg dijela.</li>
        <li><strong>Dužina nogavice:</strong> od međunožja do poda, bez obuće.</li>
      </ul>
      <p>Između dvije veličine? Za uži izgled uzmite manju, a za opušteni veću. Zamjena je moguća u roku od 14 dana.</p>
    </InfoPage>
  );
}
