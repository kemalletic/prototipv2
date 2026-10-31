import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { SHIPPING } from '@/lib/commerce';
import { formatKM } from '@/lib/format';

export const metadata: Metadata = { title: 'Dostava i plaćanje', description: 'Plaćanje pouzećem i dostava kurirom na sve adrese u Bosni i Hercegovini.' };

export default function Page() {
  return (
    <InfoPage current="/dostava" title="Dostava i plaćanje" lede="Plaćate tek kad paket stigne. Dostavljamo na svaku adresu u BiH." sample>
      <table>
        <thead><tr><th>Usluga</th><th>Rok</th><th>Cijena</th></tr></thead>
        <tbody>
          <tr><td>Kurirska dostava, BiH</td><td>{SHIPPING.days}</td><td>{formatKM(SHIPPING.standard)}</td></tr>
          <tr><td>Narudžbe od {formatKM(SHIPPING.freeFrom)}</td><td>{SHIPPING.days}</td><td>Besplatno</td></tr>
        </tbody>
      </table>
      <h2>Plaćanje pouzećem</h2>
      <p>Jedini način plaćanja je pouzećem: iznos plaćate gotovinom kuriru prilikom preuzimanja paketa. Nema dodatne naknade za pouzeće, jer je uključena u cijenu dostave. Cijene su u konvertibilnim markama (KM) i uključuju PDV.</p>
      <h2>Kako teče narudžba</h2>
      <ol>
        <li><strong>Zaprimljena:</strong> narudžbu ste poslali kroz trgovinu.</li>
        <li><strong>Potvrđena:</strong> nazovemo vas radnim danom da potvrdimo artikle, veličine i adresu. Nepotvrđene narudžbe ne šaljemo.</li>
        <li><strong>Poslana:</strong> paket predajemo kuriru i šaljemo vam SMS s brojem pošiljke.</li>
        <li><strong>Isporučena:</strong> preuzimate paket i plaćate kuriru.</li>
      </ol>
      <h2>Ako niste kod kuće</h2>
      <p>Kurir vas kontaktira telefonom. Ako dostava ne uspije, pošiljka se čuva u kurirskom centru nekoliko radnih dana. Molimo da odbijanje preuzimanja izbjegavate: ako se predomislite, javite nam se prije slanja i otkazat ćemo narudžbu bez troškova.</p>
    </InfoPage>
  );
}
