'use client';
import { useState } from 'react';
import { btn, field } from '@/components/ui/styles';

export function ContactForm() {
  const [v, setV] = useState({ name: '', contact: '', order: '', message: '' });
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (v.name.trim().length < 2) x.name = 'Unesite ime.';
    if (!/@|\d{6,}/.test(v.contact.replace(/\s/g, ''))) x.contact = 'Unesite e-mail ili broj telefona.';
    if (v.message.trim().length < 10) x.message = 'Poruka treba imati bar 10 znakova.';
    setErr(x);
    if (!Object.keys(x).length) setSent(true);
  };
  if (sent) {
    return (
      <div className="border-l-2 border-moss bg-paper px-5 py-4" role="status">
        <p className="font-medium">Hvala, {v.name.split(' ')[0]}.</p>
        <p className="mt-1 text-sm text-ink-2">U prototipu se poruka ne šalje. U produkciji bi stigla na podršku, a odgovor biste dobili istog radnog dana.</p>
        <button type="button" onClick={() => { setSent(false); setV({ name: '', contact: '', order: '', message: '' }); }} className="mt-3 text-sm underline underline-offset-4">Nova poruka</button>
      </div>
    );
  }
  const f = (k: keyof typeof v, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={`cf-${k}`} className={field.label}>{label}</label>
      <input id={`cf-${k}`} value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} aria-invalid={!!err[k]} aria-describedby={err[k] ? `cf-${k}-e` : undefined} className={field.input} {...props} />
      {err[k] && <p id={`cf-${k}-e`} className={field.error}>{err[k]}</p>}
    </div>
  );
  return (
    <form onSubmit={submit} noValidate className="grid max-w-xl gap-4">
      {f('name', 'Ime', { autoComplete: 'name' })}
      {f('contact', 'E-mail ili telefon', { autoComplete: 'email' })}
      {f('order', 'Broj narudžbe (neobavezno)', { placeholder: 'KR-…' })}
      <div>
        <label htmlFor="cf-message" className={field.label}>Poruka</label>
        <textarea id="cf-message" rows={5} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} aria-invalid={!!err.message} aria-describedby={err.message ? 'cf-message-e' : undefined} className={`${field.input} h-auto py-3`} />
        {err.message && <p id="cf-message-e" className={field.error}>{err.message}</p>}
      </div>
      <button type="submit" className={`${btn.base} ${btn.primary} justify-self-start`}>Pošalji poruku</button>
    </form>
  );
}
