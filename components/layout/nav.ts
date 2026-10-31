import { CATEGORIES, productsIn } from '@/lib/catalog';

export const NAV = CATEGORIES.map((c) => ({
  href: `/kolekcija/${c.slug}`,
  label: c.slug === 'jakne-i-prsluci' ? 'Jakne' : c.slug === 'kaisevi-i-dodaci' ? 'Dodaci' : c.name,
  full: c.name,
  count: productsIn(c.slug).length,
  slug: c.slug,
}));

export const HELP = [
  { href: '/dostava', label: 'Dostava i plaćanje' },
  { href: '/povrat-i-zamjena', label: 'Povrat i zamjena' },
  { href: '/vodic-za-velicine', label: 'Vodič za veličine' },
  { href: '/pitanja', label: 'Česta pitanja' },
  { href: '/kontakt', label: 'Kontakt' },
];
export const LEGAL = [
  { href: '/uslovi-kupovine', label: 'Uslovi kupovine' },
  { href: '/privatnost', label: 'Privatnost' },
  { href: '/kolacici', label: 'Kolačići' },
];
