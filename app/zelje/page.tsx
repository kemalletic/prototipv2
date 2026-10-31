import type { Metadata } from 'next';
import { WishlistPage } from '@/components/commerce/WishlistPage';

export const metadata: Metadata = { title: 'Lista želja', robots: { index: false } };

export default function Page() {
  return (
    <div className="page-x mx-auto max-w-[1600px]">
      <h1 className="font-display border-b border-stone pb-6 pt-8 text-[clamp(2.8rem,6vw,5rem)]">Lista želja</h1>
      <div className="pt-8"><WishlistPage /></div>
    </div>
  );
}
