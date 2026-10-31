'use client';
import Link from 'next/link';
import { createPersisted, useHydrated } from '@/lib/store/persisted';

const store = createPersisted<boolean>('kroj.notice.dismissed', false);

export function PrototypeNotice() {
  const dismissed = store.use();
  const hydrated = useHydrated();
  if (hydrated && dismissed) return null;
  return (
    <div className="bg-ink text-[#d9d2c5]" role="note" aria-label="Napomena o prototipu">
      <div className="page-x mx-auto flex min-h-8 max-w-[1600px] items-center justify-between gap-3 py-1.5">
        <p className="font-label leading-snug">
          <span className="text-paper">Prototip</span><span className="hidden sm:inline"> · primjeri proizvoda i ilustrativni prikazi</span> · narudžbe se ne šalju.{' '}
          <Link href="/o-nama#prototip" className="underline underline-offset-2 hover:text-paper">Više</Link>
        </p>
        <button type="button" onClick={() => store.set(true)} className="font-label shrink-0 px-1 hover:text-paper" aria-label="Sakrij napomenu">
          Sakrij
        </button>
      </div>
    </div>
  );
}
