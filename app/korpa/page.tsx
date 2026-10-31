import type { Metadata } from 'next';
import { CartPage } from '@/components/commerce/CartPage';

export const metadata: Metadata = { title: 'Korpa', robots: { index: false } };

export default function Page() {
  return (
    <div className="page-x mx-auto max-w-[1280px]">
      <h1 className="font-display border-b border-stone pb-6 pt-8 text-[clamp(2.8rem,6vw,5rem)]">Korpa</h1>
      <div className="pt-8"><CartPage /></div>
    </div>
  );
}
