import type { MetadataRoute } from 'next';

// Prototype: disallow indexing. At launch, allow '/' and keep checkout/cart/account routes disallowed.
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return { rules: [{ userAgent: '*', disallow: '/' }], sitemap: `${base}/sitemap.xml` };
}
