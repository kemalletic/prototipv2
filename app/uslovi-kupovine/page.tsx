import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { RETURNS, SHIPPING } from '@/lib/commerce';
import { formatKM } from '@/lib/format';

export const metadata: Metadata = { title: 'Uslovi kupovine' };

export default function Page() {
  return (
    <InfoPage current="/uslovi-kupovine" title="Uslovi kupovine" sample>
      <h2>1. Prodavac</h2>
      <p>Podaci o pravnom licu (naziv, sjedište, ID i PDV broj) bit će dodani prije objave trgovine.</p>
      <h2>2. Narudžba i ugovor</h2>
      <p>Slanjem narudžbe kupac daje ponudu za kupovinu. Ugovor je zaključen kada prodavac telefonom potvrdi narudžbu. Prodavac može odbiti narudžbu ako artikal nije dostupan ili ako se narudžba ne može potvrditi.</p>
      <h2>3. Cijene i plaćanje</h2>
      <p>Cijene su izražene u KM i uključuju PDV. Plaćanje se vrši isključivo pouzećem, gotovinom kuriru prilikom preuzimanja.</p>
      <h2>4. Dostava</h2>
      <p>Dostava se vrši na adrese u Bosni i Hercegovini u roku od {SHIPPING.days} od potvrde. Cijena dostave je {formatKM(SHIPPING.standard)}, a besplatna je za narudžbe od {formatKM(SHIPPING.freeFrom)}.</p>
      <h2>5. Odustanak, zamjena i povrat</h2>
      <p>Kupac može odustati od kupovine i vratiti artikal u roku od {RETURNS.days} dana od preuzimanja, u skladu s pravilima na stranici Povrat i zamjena i važećim propisima o zaštiti potrošača.</p>
      <h2>6. Reklamacije</h2>
      <p>Reklamacije se rješavaju u skladu sa Zakonom o zaštiti potrošača u Bosni i Hercegovini.</p>
    </InfoPage>
  );
}
