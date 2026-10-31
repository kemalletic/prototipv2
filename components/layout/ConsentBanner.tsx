'use client';
import Link from 'next/link';
import { useState } from 'react';
import { consentStore } from '@/lib/analytics';
import { useHydrated, createPersisted } from '@/lib/store/persisted';
import { btn } from '@/components/ui/styles';

const reopen = createPersisted<number>('kroj.consent.reopen', 0);

export function ConsentBanner() {
  const consent = consentStore.use();
  const hydrated = useHydrated();
  const r = reopen.use();
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(consent.analytics);
  if (!hydrated || (consent.decided && !r)) return null;
  const save = (a: boolean) => { consentStore.set({ decided: true, analytics: a, marketing: false }); reopen.set(0); };
  return (
    <section aria-label="Postavke kolačića" className="fixed inset-x-3 bottom-3 z-[60] max-w-[26rem] border border-stone bg-paper p-5 shadow-[0_20px_50px_-20px_rgb(28_26_23/0.35)] sm:left-5 sm:bottom-5">
      <h2 className="font-medium">Kolačići</h2>
      <p className="mt-1.5 text-sm text-ink-2">
        Koristimo neophodne kolačiće za korpu i listu želja. Uz vašu dozvolu koristili bismo i analitiku da poboljšamo trgovinu. <Link href="/kolacici" className="underline underline-offset-2">Saznajte više</Link>.
      </p>
      {details && (
        <fieldset className="mt-4 space-y-3 border-t border-stone pt-4 text-sm">
          <legend className="sr-only">Kategorije kolačića</legend>
          <label className="flex items-start gap-3"><input type="checkbox" checked disabled className="mt-0.5 h-4 w-4 accent-ink" /><span><strong className="font-medium">Neophodni</strong><br /><span className="text-ink-3">Korpa, lista želja, ove postavke.</span></span></label>
          <label className="flex items-start gap-3"><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} className="mt-0.5 h-4 w-4 accent-ink" /><span><strong className="font-medium">Analitika</strong><br /><span className="text-ink-3">Anonimna statistika posjeta i kupovine.</span></span></label>
        </fieldset>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {details ? (
          <button type="button" onClick={() => save(analytics)} className={`${btn.base} ${btn.primary} col-span-2 h-11`}>Sačuvaj izbor</button>
        ) : (
          <>
            <button type="button" onClick={() => save(false)} className={`${btn.base} ${btn.secondary} h-11 px-3`}>Samo neophodni</button>
            <button type="button" onClick={() => save(true)} className={`${btn.base} ${btn.primary} h-11 px-3`}>Prihvati sve</button>
          </>
        )}
      </div>
      {!details && <button type="button" onClick={() => setDetails(true)} className="mt-3 text-sm text-ink-3 underline underline-offset-2 hover:text-ink">Postavke</button>}
    </section>
  );
}

export function ConsentLink() {
  return <button type="button" onClick={() => reopen.set(Date.now())} className="hover:text-copper">Postavke kolačića</button>;
}
