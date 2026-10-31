import Link from 'next/link';
import type { ReactNode } from 'react';

const PAGES = [
  { href: '/dostava', label: 'Dostava i plaćanje' },
  { href: '/povrat-i-zamjena', label: 'Povrat i zamjena' },
  { href: '/vodic-za-velicine', label: 'Vodič za veličine' },
  { href: '/pitanja', label: 'Česta pitanja' },
  { href: '/kontakt', label: 'Kontakt' },
  { href: '/o-nama', label: 'O nama' },
  { href: '/uslovi-kupovine', label: 'Uslovi kupovine' },
  { href: '/privatnost', label: 'Privatnost' },
  { href: '/kolacici', label: 'Kolačići' },
];

export function InfoPage({ title, lede, current, children, sample = false }: { title: string; lede?: string; current: string; children: ReactNode; sample?: boolean }) {
  return (
    <div className="page-x mx-auto max-w-[1400px]">
      <header className="border-b border-stone pb-8 pt-10">
        <h1 className="font-display text-[clamp(2.8rem,7vw,6rem)]">{title}</h1>
        {lede && <p className="mt-4 max-w-2xl font-serif text-xl italic leading-snug text-ink-2">{lede}</p>}
      </header>
      <div className="grid gap-10 pt-10 lg:grid-cols-12">
        <nav aria-label="Pomoć i informacije" className="lg:col-span-3">
          <ul className="no-scrollbar -mx-[var(--page-x)] flex gap-1 overflow-x-auto px-[var(--page-x)] lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:mx-0 lg:flex-col lg:px-0">
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link href={p.href} aria-current={p.href === current ? 'page' : undefined} className={`flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm lg:rounded-none lg:border-l lg:px-4 ${p.href === current ? 'bg-ink text-paper lg:border-ink lg:bg-transparent lg:font-medium lg:text-ink' : 'text-ink-2 hover:text-ink lg:border-stone'}`}>{p.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <article className="prose-kroj lg:col-span-8 lg:col-start-5">
          {sample && (
            <p className="!mb-8 border-l-2 border-copper bg-paper px-4 py-3 text-sm !text-ink-2">
              <strong className="font-medium text-ink">Primjer teksta.</strong> Pravila i podaci na ovoj stranici su prijedlog za prototip i moraju se uskladiti sa stvarnim poslovanjem i zakonima BiH prije objave.
            </p>
          )}
          {children}
        </article>
      </div>
    </div>
  );
}
