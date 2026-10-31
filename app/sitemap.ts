import type { MetadataRoute } from 'next';
import { CATEGORIES, PRODUCTS } from '@/lib/catalog';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/kolekcija/sve', '/kolekcija/novo', '/o-nama', '/kontakt', '/dostava', '/povrat-i-zamjena', '/vodic-za-velicine', '/pitanja', '/privatnost', '/uslovi-kupovine', '/kolacici'];
  return [
    ...pages.map((p) => ({ url: `${base}${p}` })),
    ...CATEGORIES.map((c) => ({ url: `${base}/kolekcija/${c.slug}` })),
    ...PRODUCTS.map((p) => ({ url: `${base}/proizvod/${p.slug}`, images: [`${base}/media/p/${p.slug}/${p.colorways[0].id}-front.webp`] })),
  ];
}
