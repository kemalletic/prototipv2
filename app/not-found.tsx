import Link from 'next/link';
import { btn } from '@/components/ui/styles';
import { NAV } from '@/components/layout/nav';

export default function NotFound() {
  return (
    <div className="page-x mx-auto max-w-[1400px] py-16">
      <p className="font-label text-ink-3">Greška 404</p>
      <h1 className="font-display mt-3 text-[clamp(3rem,9vw,8rem)]">Prazna<br />vješalica.</h1>
      <p className="mt-5 max-w-md text-lg text-ink-2">Stranicu koju tražite nismo pronašli. Možda je proizvod rasprodan ili je link pogrešan.</p>
      <div className="mt-6 flex flex-wrap gap-2"><Link href="/" className={`${btn.base} ${btn.primary}`}>Na početnu</Link><Link href="/kolekcija/sve" className={`${btn.base} ${btn.secondary}`}>Sva kolekcija</Link></div>
      <ul className="mt-12 flex flex-wrap gap-2">{NAV.map((n) => <li key={n.href}><Link href={n.href} className="flex h-9 items-center rounded-full border border-stone px-4 text-sm hover:border-ink">{n.full}</Link></li>)}</ul>
    </div>
  );
}
