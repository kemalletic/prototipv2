'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Icon } from '@/components/ui/Icon';
import { Sheet } from '@/components/ui/Sheet';
import { cartStore, openCart } from '@/lib/store/cart';
import { wishlistStore } from '@/lib/store/wishlist';
import { useHydrated } from '@/lib/store/persisted';
import { NAV, HELP } from './nav';
import { SearchDialog } from './SearchDialog';
import { SHIPPING } from '@/lib/commerce';
import { formatKM } from '@/lib/format';

export function HeaderActions() {
  const lines = cartStore.use();
  const wish = wishlistStore.use();
  const hydrated = useHydrated();
  const count = hydrated ? lines.reduce((s, l) => s + l.qty, 0) : 0;
  const wcount = hydrated ? wish.length : 0;
  const [searchOpen, setSearchOpen] = useState(false);
  return (
    <div className="flex flex-1 items-center justify-end gap-0.5 sm:gap-1 xl:flex-none">
      <button type="button" onClick={() => setSearchOpen(true)} className="flex h-10 items-center gap-2 rounded-full px-2.5 text-sm text-ink hover:bg-plaster-2" aria-haspopup="dialog">
        <Icon name="search" />
        <span className="max-lg:sr-only">Traži</span>
      </button>
      <Link href="/zelje" className="relative flex h-10 items-center gap-2 rounded-full px-2.5 text-sm hover:bg-plaster-2" aria-label={`Lista želja${wcount ? `, ${wcount}` : ''}`}>
        <Icon name="heart" />
        {wcount > 0 && <span className="tabular absolute right-0.5 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-copper px-1 text-[0.625rem] font-medium text-paper">{wcount}</span>}
      </Link>
      <button type="button" onClick={openCart} className="flex h-10 items-center gap-2 rounded-full px-2.5 text-sm hover:bg-plaster-2" aria-haspopup="dialog">
        <Icon name="bag" />
        <span className="max-sm:sr-only">Korpa</span>
        <span key={count} className={`tabular grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.6875rem] font-medium ${count ? 'bg-ink text-paper animate-[pop_400ms_var(--ease-cloth)]' : 'bg-plaster-2 text-ink-3'}`}>{count}</span>
        <span className="sr-only">{count === 1 ? 'artikal' : 'artikala'}</span>
      </button>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

export function MobileMenuButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) { setLastPath(pathname); if (open) setOpen(false); }
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="-ml-2 flex h-10 items-center gap-2 rounded-full px-2 text-sm hover:bg-plaster-2 xl:hidden" aria-label="Otvori meni" aria-expanded={open}>
        <Icon name="menu" />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label="Meni" side="full" className="bg-plaster">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="page-x flex h-[var(--header-h)] shrink-0 items-center border-b border-stone">
            <span className="font-display text-[1.7rem]">Kroj</span>
          </div>
          <nav aria-label="Kategorije" className="page-x py-6">
            <ul>
              <li>
                <Link href="/kolekcija/novo" className="flex items-baseline justify-between border-b border-stone py-3">
                  <span className="font-display text-[2.6rem] text-copper">Novo</span>
                  <span className="font-label text-ink-3">Jesen 26</span>
                </Link>
              </li>
              {NAV.map((n, i) => (
                <li key={n.href} style={{ animation: `sheet-in-top 360ms var(--ease-tailor) ${60 + i * 30}ms both` }}>
                  <Link href={n.href} className="flex items-baseline justify-between border-b border-stone py-3">
                    <span className="font-display text-[2.6rem]">{n.full}</span>
                    <span className="font-label tabular text-ink-3">{n.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 text-sm text-ink-2">
              <li><Link href="/o-nama">O nama</Link></li>
              {HELP.map((h) => <li key={h.href}><Link href={h.href}>{h.label}</Link></li>)}
            </ul>
          </nav>
          <p className="page-x mt-auto border-t border-stone py-5 text-sm text-ink-2">
            Plaćanje pouzećem · Dostava {SHIPPING.days} · Besplatno iznad {formatKM(SHIPPING.freeFrom)}
          </p>
        </div>
      </Sheet>
    </>
  );
}
