'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { cartStore, clearCart, totals } from '@/lib/store/cart';
import { ordersStore, type DemoOrder } from '@/lib/store/orders';
import { useHydrated } from '@/lib/store/persisted';
import { validate, normalizePhone, CITIES, type CheckoutInput, type Errors } from '@/lib/checkout';
import { formatKM, plural } from '@/lib/format';
import { SHIPPING } from '@/lib/commerce';
import { btn, field } from '@/components/ui/styles';
import { Icon } from '@/components/ui/Icon';
import { track, itemPayload } from '@/lib/analytics';

const EMPTY: CheckoutInput = { name: '', phone: '', email: '', street: '', city: '', zip: '', note: '', terms: false };

export function CheckoutForm() {
  const hydrated = useHydrated();
  const lines = cartStore.use();
  const t = totals(lines);
  const router = useRouter();
  const [v, setV] = useState<CheckoutInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof CheckoutInput, boolean>>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [serverMsg, setServerMsg] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const tracked = useRef(false);
  const shipTracked = useRef(false);
  const dlId = useId();

  useEffect(() => {
    if (!hydrated || tracked.current || !t.resolved.length) return;
    tracked.current = true;
    track('begin_checkout', { currency: 'BAM', value: t.subtotal / 100, items: t.resolved.map((r) => itemPayload(r.product, r.colorway.id, r.line.size, r.line.qty)) });
  }, [hydrated, t]);

  const set = <K extends keyof CheckoutInput>(k: K, val: CheckoutInput[K]) => {
    setV((prev) => {
      const next = { ...prev, [k]: val };
      if (k === 'city') { const hit = CITIES.find(([c]) => c.toLowerCase() === String(val).trim().toLowerCase()); if (hit && !prev.zip) next.zip = hit[1]; }
      if (touched[k] || Object.keys(errors).length) setErrors(validate(next));
      return next;
    });
  };
  const blur = (k: keyof CheckoutInput) => {
    setTouched((x) => ({ ...x, [k]: true }));
    const e = validate(v);
    setErrors((prev) => ({ ...prev, [k]: e[k] }));
    if ((k === 'zip' || k === 'city' || k === 'street') && !e.street && !e.city && !e.zip && !shipTracked.current && (shipTracked.current = true)) track('add_shipping_info', { currency: 'BAM', value: t.subtotal / 100, shipping_tier: 'kurir' });
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate(v);
    setErrors(e);
    setTouched({ name: true, phone: true, email: true, street: true, city: true, zip: true, terms: true });
    const keys = Object.keys(e) as Array<keyof CheckoutInput>;
    if (keys.length) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${keys[0]}"]`);
      el?.focus();
      return;
    }
    track('add_payment_info', { currency: 'BAM', value: t.total / 100, payment_type: 'pouzece' });
    setStatus('sending');
    setServerMsg('');
    try {
      const res = await fetch('/api/narudzbe', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ customer: v, lines }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (res.status === 422 && data.errors) { setErrors(data.errors); setStatus('idle'); return; }
        if (res.status === 409) throw new Error('Neki artikli više nisu dostupni u odabranoj količini. Provjerite korpu.');
        throw new Error('Narudžba nije poslana. Server trenutno ne odgovara.');
      }
      const o = data.order;
      const order: DemoOrder = {
        number: o.number, createdAt: new Date().toISOString(), status: 'zaprimljena',
        customer: { name: v.name.trim(), phone: normalizePhone(v.phone)!, email: v.email?.trim() || undefined },
        address: { street: v.street.trim(), city: v.city.trim(), zip: v.zip.trim(), note: v.note?.trim() || undefined },
        lines, subtotal: o.subtotal, shipping: o.shipping, total: o.total, payment: 'pouzece',
      };
      ordersStore.set((prev) => [order, ...prev].slice(0, 10));
      track('order_submitted', {
        transaction_id: o.number, currency: 'BAM', value: o.total / 100, shipping: o.shipping / 100, payment_type: 'pouzece', status: 'submitted',
        items: t.resolved.map((r) => itemPayload(r.product, r.colorway.id, r.line.size, r.line.qty)),
      });
      router.push(`/narudzba/${o.number}`);
      clearCart();
    } catch (err) {
      setStatus('error');
      setServerMsg(err instanceof Error ? err.message : 'Došlo je do greške.');
      track('order_submit_failed', { value: t.total / 100 });
    }
  };

  if (!hydrated) {
    return <div className="grid gap-10 lg:grid-cols-12" aria-busy="true"><div className="h-[36rem] skeleton lg:col-span-7" /><div className="h-80 skeleton lg:col-span-5" /></div>;
  }
  if (!t.resolved.length && status !== 'sending') {
    return (
      <div className="max-w-lg py-10">
        <p className="font-display text-6xl text-stone-2">Prazno</p>
        <p className="mt-4 text-lg">Vaša korpa je prazna, pa nema šta naplatiti.</p>
        <Link href="/kolekcija/sve" className={`${btn.base} ${btn.primary} mt-6`}>Nazad u kolekciju</Link>
      </div>
    );
  }

  const err = (k: keyof CheckoutInput) => (touched[k] ? errors[k] : undefined);
  const input = (k: keyof CheckoutInput, label: string, props: React.InputHTMLAttributes<HTMLInputElement> & { hint?: string } = {}) => {
    const { hint, ...rest } = props;
    const e = err(k);
    return (
      <div>
        <label htmlFor={`co-${k}`} className={field.label}>{label}{rest.required === false && <span className="font-normal text-ink-3"> (neobavezno)</span>}</label>
        <input
          id={`co-${k}`} name={k} value={String(v[k] ?? '')}
          onChange={(ev) => set(k, ev.target.value as never)} onBlur={() => blur(k)}
          aria-invalid={!!e} aria-describedby={e ? `co-${k}-err` : hint ? `co-${k}-hint` : undefined}
          className={field.input} {...rest} required={rest.required !== false}
        />
        {e ? <p id={`co-${k}-err`} className={field.error}>{e}</p> : hint ? <p id={`co-${k}-hint`} className={field.hint}>{hint}</p> : null}
      </div>
    );
  };
  const errorCount = Object.values(errors).filter(Boolean).length;
  const sending = status === 'sending';

  const summary = (
    <div>
      <ul className="divide-y divide-stone">
        {t.resolved.map((r) => (
          <li key={`${r.line.productId}-${r.line.colorId}-${r.line.size}`} className="flex gap-3 py-3">
            <div className="relative h-20 w-16 shrink-0 bg-plaster-2">
              <Image src={`/media/p/${r.product.slug}/${r.colorway.id}-front.webp`} alt="" fill sizes="64px" className="object-contain p-0.5" />
              <span className="tabular absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.6875rem] text-paper">{r.line.qty}</span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium">{r.product.line} — {r.product.type}</p>
              <p className="text-ink-3">{r.colorway.name} · {r.line.size}</p>
            </div>
            <p className="tabular text-sm">{formatKM(r.total)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-3 space-y-1.5 border-t border-stone pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-ink-2">Međuzbir</dt><dd className="tabular">{formatKM(t.subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-2">Dostava (kurir, {SHIPPING.days})</dt><dd className="tabular">{t.shipping ? formatKM(t.shipping) : 'Besplatno'}</dd></div>
        <div className="flex justify-between border-t border-stone pt-3 text-lg font-medium"><dt>Za plaćanje kuriru</dt><dd className="tabular">{formatKM(t.total)}</dd></div>
      </dl>
      {t.shipping > 0 && <p className="mt-2 text-xs text-ink-3">Dodajte još {formatKM(SHIPPING.freeFrom - t.subtotal)} za besplatnu dostavu.</p>}
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      {/* mobile summary */}
      <details className="border-y border-stone lg:hidden">
        <summary className="flex h-14 cursor-pointer list-none items-center justify-between text-sm [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2"><Icon name="bag" size={18} /> Sažetak narudžbe ({t.count} {plural(t.count, 'artikal', 'artikla', 'artikala')})</span>
          <span className="tabular font-medium">{formatKM(t.total)}</span>
        </summary>
        <div className="pb-4">{summary}</div>
      </details>

      <form ref={formRef} onSubmit={submit} noValidate className="lg:col-span-7" aria-describedby="co-status">
        <fieldset disabled={sending} className="space-y-10">
          <div id="co-status" aria-live="assertive">
            {errorCount > 0 && Object.values(touched).some(Boolean) && (
              <div className="border-l-2 border-alert bg-alert/5 px-4 py-3 text-sm text-alert">Provjerite {errorCount} {plural(errorCount, 'polje', 'polja', 'polja')} označen{errorCount === 1 ? 'o' : 'a'} ispod.</div>
            )}
            {status === 'error' && (
              <div className="border-l-2 border-alert bg-alert/5 px-4 py-3 text-sm">
                <p className="font-medium text-alert">{serverMsg}</p>
                <p className="mt-1 text-ink-2">Vaši podaci su sačuvani u formi. Provjerite internet vezu i pokušajte ponovo.</p>
              </div>
            )}
          </div>

          <section aria-labelledby="co-1">
            <h2 id="co-1" className="flex items-baseline gap-3 text-xl font-medium"><span className="font-label text-copper">01</span> Kontakt</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">{input('name', 'Ime i prezime', { autoComplete: 'name' })}</div>
              {input('phone', 'Broj telefona', { type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '061 234 567', hint: 'Kurir i mi vas zovemo radi potvrde i dostave.' })}
              {input('email', 'E-mail', { type: 'email', autoComplete: 'email', required: false, hint: 'Za potvrdu narudžbe na e-mail.' })}
            </div>
          </section>

          <section aria-labelledby="co-2">
            <h2 id="co-2" className="flex items-baseline gap-3 text-xl font-medium"><span className="font-label text-copper">02</span> Adresa dostave</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <div className="sm:col-span-6">{input('street', 'Ulica i kućni broj', { autoComplete: 'street-address', placeholder: 'Ferhadija 12' })}</div>
              <div className="sm:col-span-4">{input('city', 'Grad ili mjesto', { autoComplete: 'address-level2', list: dlId })}</div>
              <datalist id={dlId}>{CITIES.map(([c]) => <option key={c} value={c} />)}</datalist>
              <div className="sm:col-span-2">{input('zip', 'Poštanski broj', { autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 5, placeholder: '71000' })}</div>
              <div className="sm:col-span-6">
                <label htmlFor="co-note" className={field.label}>Napomena za kurira <span className="font-normal text-ink-3">(neobavezno)</span></label>
                <textarea id="co-note" name="note" rows={2} value={v.note} onChange={(e) => set('note', e.target.value)} placeholder="Sprat, interfon, najbolje vrijeme za dostavu…" className={`${field.input} h-auto py-3`} />
              </div>
            </div>
          </section>

          <section aria-labelledby="co-3">
            <h2 id="co-3" className="flex items-baseline gap-3 text-xl font-medium"><span className="font-label text-copper">03</span> Dostava i plaćanje</h2>
            <div className="mt-5 space-y-3">
              <label className="flex items-start gap-4 border border-ink bg-paper p-4">
                <input type="radio" name="shipping" checked readOnly className="mt-1 h-4 w-4 accent-ink" />
                <span className="flex-1"><span className="flex justify-between gap-4 font-medium"><span>Kurirska dostava</span><span className="tabular">{t.shipping ? formatKM(t.shipping) : 'Besplatno'}</span></span><span className="mt-0.5 block text-sm text-ink-2">{SHIPPING.days}, na adresu u BiH</span></span>
              </label>
              <label className="flex items-start gap-4 border border-ink bg-paper p-4">
                <input type="radio" name="payment" checked readOnly className="mt-1 h-4 w-4 accent-ink" />
                <span className="flex-1"><span className="font-medium">Plaćanje pouzećem</span><span className="mt-0.5 block text-sm text-ink-2">Plaćate gotovinom kuriru kad preuzmete paket. Bez kartice i bez avansa.</span></span>
              </label>
            </div>
          </section>

          <div>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="terms" checked={v.terms} onChange={(e) => set('terms', e.target.checked)} onBlur={() => blur('terms')} aria-invalid={!!err('terms')} aria-describedby={err('terms') ? 'co-terms-err' : undefined} className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-ink" />
              <span>Prihvatam <Link href="/uslovi-kupovine" target="_blank" className="underline underline-offset-2">uslove kupovine</Link> i <Link href="/privatnost" target="_blank" className="underline underline-offset-2">politiku privatnosti</Link>.</span>
            </label>
            {err('terms') && <p id="co-terms-err" className={field.error}>{err('terms')}</p>}
          </div>

          <div>
            <button type="submit" className={`${btn.base} ${btn.primary} h-14 w-full text-base`}>
              {sending ? <><span className="h-4 w-4 animate-[spin_700ms_linear_infinite] rounded-full border-2 border-paper/30 border-t-paper" aria-hidden /> Šaljemo narudžbu…</> : <>Potvrdi narudžbu · <span className="tabular">{formatKM(t.total)}</span></>}
            </button>
            <p className="mt-3 text-center text-xs text-ink-3">Prototip: narudžba se ne šalje i ništa se ne naplaćuje.</p>
          </div>
        </fieldset>
      </form>

      <aside aria-label="Sažetak narudžbe" className="hidden lg:col-span-5 lg:block">
        <div ref={summaryRef} className="sticky top-[calc(var(--header-h)+1.5rem)] bg-paper p-6">
          <h2 className="text-lg font-medium">Sažetak narudžbe</h2>
          {summary}
        </div>
      </aside>
    </div>
  );
}
