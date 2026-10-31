'use client';
import Image from 'next/image';
import Link from 'next/link';
import { ordersStore } from '@/lib/store/orders';
import { useHydrated } from '@/lib/store/persisted';
import { getProductById, colorwayOf } from '@/lib/catalog';
import { formatKM } from '@/lib/format';
import { btn } from '@/components/ui/styles';
import { Icon } from '@/components/ui/Icon';
import { SHIPPING, SUPPORT } from '@/lib/commerce';

export function OrderConfirmation({ broj }: { broj: string }) {
  const orders = ordersStore.use();
  const hydrated = useHydrated();
  if (!hydrated) return <div className="h-96 skeleton" aria-busy="true" />;
  const o = orders.find((x) => x.number === broj);
  if (!o) {
    return (
      <div className="max-w-xl py-10">
        <h1 className="font-display text-[clamp(2.6rem,6vw,4.5rem)]">Narudžba nije pronađena</h1>
        <p className="mt-4 text-ink-2">U ovom pregledniku nema narudžbe s brojem <span className="font-mono">{broj}</span>. U prototipu se demo narudžbe čuvaju samo lokalno, u pregledniku u kojem su napravljene.</p>
        <Link href="/" className={`${btn.base} ${btn.primary} mt-6`}>Na početnu</Link>
      </div>
    );
  }
  const first = o.customer.name.split(' ')[0];
  const steps = [
    { t: 'Zaprimljena', d: 'Upravo sada', done: true },
    { t: 'Potvrda telefonom', d: `Zovemo vas na ${o.customer.phone} radnim danom`, done: false },
    { t: 'Poslano kurirom', d: `Dostava ${SHIPPING.days}`, done: false },
    { t: 'Preuzeto i plaćeno', d: `Gotovinom kuriru: ${formatKM(o.total)}`, done: false },
  ];
  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <p className="inline-flex items-center gap-2 bg-moss/10 px-3 py-1.5 text-sm text-moss"><Icon name="check" size={16} /> Narudžba zaprimljena</p>
        <h1 className="font-display mt-5 text-[clamp(3rem,7vw,6rem)]">Hvala, {first}.</h1>
        <p className="mt-4 max-w-lg text-lg text-ink-2">Vaša narudžba <span className="font-mono text-ink">{o.number}</span> je zaprimljena. Javit ćemo vam se telefonom da je potvrdimo prije slanja.</p>

        <div className="mt-6 border-l-2 border-copper bg-paper px-4 py-3 text-sm">
          <p className="font-medium">Demo narudžba u prototipu</p>
          <p className="mt-0.5 text-ink-2">Narudžba nije poslana, niko neće zvati i ništa se ne naplaćuje. U produkciji ovaj korak kreira narudžbu u sistemu i šalje potvrdu.</p>
        </div>

        <ol className="mt-10 space-y-0" aria-label="Status narudžbe">
          {steps.map((s, i) => (
            <li key={s.t} className="relative flex gap-4 pb-7 last:pb-0">
              {i < steps.length - 1 && <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-1.5rem)] w-px bg-stone-2" />}
              <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${s.done ? 'border-ink bg-ink text-paper' : 'border-stone-2 bg-plaster'}`}>{s.done ? <Icon name="check" size={13} strokeWidth={2.2} /> : <span className="font-label text-[0.625rem] text-ink-3">{i + 1}</span>}</span>
              <div><p className={`font-medium ${s.done ? '' : 'text-ink-2'}`}>{s.t}{s.done && <span className="sr-only"> (završeno)</span>}</p><p className="text-sm text-ink-3">{s.d}</p></div>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link href="/kolekcija/sve" className={`${btn.base} ${btn.primary}`}>Nastavi kupovinu</Link>
          <a href={SUPPORT.phoneHref} className={`${btn.base} ${btn.secondary}`}>Pozovite nas: {SUPPORT.phone}</a>
        </div>
      </div>

      <aside className="lg:col-span-5" aria-label="Detalji narudžbe">
        <div className="bg-paper p-6">
          <h2 className="font-medium">Detalji narudžbe</h2>
          <ul className="mt-3 divide-y divide-stone">
            {o.lines.map((l) => {
              const p = getProductById(l.productId);
              if (!p) return null;
              const c = colorwayOf(p, l.colorId);
              return (
                <li key={`${l.productId}-${l.colorId}-${l.size}`} className="flex gap-3 py-3 text-sm">
                  <div className="relative h-16 w-[3.2rem] shrink-0 bg-plaster-2"><Image src={`/media/p/${p.slug}/${c.id}-front.webp`} alt="" fill sizes="52px" className="object-contain p-0.5" /></div>
                  <div className="flex-1"><p className="font-medium">{p.line} — {p.type}</p><p className="text-ink-3">{c.name} · {l.size} · {l.qty} kom.</p></div>
                  <p className="tabular">{formatKM(p.price * l.qty)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-2 space-y-1.5 border-t border-stone pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-2">Međuzbir</dt><dd className="tabular">{formatKM(o.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-2">Dostava</dt><dd className="tabular">{o.shipping ? formatKM(o.shipping) : 'Besplatno'}</dd></div>
            <div className="flex justify-between border-t border-stone pt-3 text-base font-medium"><dt>Za plaćanje pri preuzimanju</dt><dd className="tabular">{formatKM(o.total)}</dd></div>
          </dl>
          <div className="mt-5 grid gap-4 border-t border-stone pt-4 text-sm sm:grid-cols-2">
            <div><p className="font-label text-ink-3">Dostava na</p><p className="mt-1">{o.customer.name}<br />{o.address.street}<br />{o.address.zip} {o.address.city}</p></div>
            <div><p className="font-label text-ink-3">Plaćanje</p><p className="mt-1">Pouzećem, gotovinom kuriru</p></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
