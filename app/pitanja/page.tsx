import type { Metadata } from 'next';
import { InfoPage } from '@/components/info/InfoPage';
import { SHIPPING, RETURNS, SUPPORT } from '@/lib/commerce';
import { formatKM } from '@/lib/format';

export const metadata: Metadata = { title: 'Česta pitanja' };

const QA: Array<[string, string]> = [
  ['Kako plaćam?', 'Isključivo pouzećem: gotovinom kuriru kad preuzmete paket. Kartice i avans nisu potrebni.'],
  ['Koliko traje dostava?', `${SHIPPING.days} od potvrde narudžbe, na svaku adresu u BiH.`],
  ['Koliko košta dostava?', `${formatKM(SHIPPING.standard)} po narudžbi, a besplatno za narudžbe od ${formatKM(SHIPPING.freeFrom)}.`],
  ['Moram li napraviti račun?', 'Ne. Kupujete kao gost: dovoljni su ime, telefon i adresa.'],
  ['Zašto me zovete nakon narudžbe?', 'Kod plaćanja pouzećem telefonom potvrđujemo narudžbu, veličine i adresu. Tako izbjegavamo pogrešne i neželjene pošiljke.'],
  ['Mogu li zamijeniti veličinu?', `Da, u roku od ${RETURNS.days} dana od preuzimanja. Prva zamjena je besplatna.`],
  ['Mogu li otkazati narudžbu?', `Da, besplatno, dok narudžba nije poslana. Nazovite ${SUPPORT.phone}.`],
  ['Šaljete li izvan BiH?', 'Trenutno ne. Dostava je moguća samo na adrese u Bosni i Hercegovini.'],
  ['Jesu li slike prave fotografije?', 'U ovom prototipu ne: slike su ilustrativni prikazi iz virtualnog studija i bit će zamijenjene fotografijama stvarnih proizvoda.'],
];

export default function Page() {
  const jsonLd = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: QA.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  return (
    <InfoPage current="/pitanja" title="Česta pitanja" lede="Kratki odgovori na ono što nas najčešće pitate.">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="not-prose border-t border-stone">
        {QA.map(([q, a]) => (
          <details key={q} className="group border-b border-stone">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-[1.0625rem] font-medium [&::-webkit-details-marker]:hidden">
              {q}<span aria-hidden className="text-xl text-ink-3 transition-transform duration-300 group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-[60ch] pb-5 leading-relaxed text-ink-2">{a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
