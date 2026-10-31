import Link from 'next/link';
import { NAV } from './nav';
import { HeaderActions, MobileMenuButton } from './HeaderClient';

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 border-b border-stone/80 bg-plaster"
      style={{ viewTransitionName: 'site-header' }}
    >
      <div className="page-x mx-auto flex h-[var(--header-h)] max-w-[1600px] items-center gap-4">
        <div className="flex flex-1 items-center gap-2 xl:flex-none">
          <MobileMenuButton />
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-display text-[1.7rem] tracking-[-0.02em] lg:text-[1.9rem]">Kroj</span>
            <span className="font-label hidden text-ink-3 sm:inline">Sarajevo</span>
            <span className="sr-only">, početna stranica</span>
          </Link>
        </div>
        <nav aria-label="Kategorije" className="hidden flex-1 justify-center xl:flex">
          <ul className="flex items-center gap-[clamp(0.75rem,1.4vw,1.6rem)] text-[0.875rem]">
            <li><Link href="/kolekcija/novo" className="relative py-2 text-copper hover:text-ink">Novo</Link></li>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="relative py-2 text-ink-2 transition-colors hover:text-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <HeaderActions />
      </div>
    </header>
  );
}
