import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export const metadata: Metadata = { title: 'Naplata', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="page-x mx-auto max-w-[1280px] pb-10">
      <nav aria-label="Koraci kupovine" className="font-label flex gap-2 pt-6 text-ink-3">
        <Link href="/korpa" className="hover:text-ink">Korpa</Link><span aria-hidden>/</span><span aria-current="step" className="text-ink">Naplata</span><span aria-hidden>/</span><span>Potvrda</span>
      </nav>
      <h1 className="font-display mt-4 border-b border-stone pb-6 text-[clamp(2.8rem,6vw,5rem)]">Naplata</h1>
      <p className="mb-10 mt-4 max-w-xl text-ink-2">Bez registracije. Unesite kontakt i adresu, a platit ćete gotovinom kuriru kad paket stigne.</p>
      <CheckoutForm />
    </div>
  );
}
