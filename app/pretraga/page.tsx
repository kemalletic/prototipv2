import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SearchResults } from '@/components/commerce/SearchResults';

export const metadata: Metadata = { title: 'Pretraga', robots: { index: false } };

export default function Page() {
  return (
    <div className="page-x mx-auto max-w-[1600px] pt-8">
      <h1 className="font-display mb-8 text-[clamp(2.8rem,6vw,5rem)]">Pretraga</h1>
      <Suspense fallback={<div className="h-14 max-w-2xl skeleton" />}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
