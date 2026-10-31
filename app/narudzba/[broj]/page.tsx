import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderConfirmation } from '@/components/commerce/OrderConfirmation';

export const metadata: Metadata = { title: 'Potvrda narudžbe', robots: { index: false } };

export function generateStaticParams() {
  return [{ broj: 'KR-DEMO01' }];
}

async function Confirmation({ params }: Pick<PageProps<'/narudzba/[broj]'>, 'params'>) {
  const { broj } = await params;
  return <OrderConfirmation broj={decodeURIComponent(broj)} />;
}

export default function Page({ params }: PageProps<'/narudzba/[broj]'>) {
  return (
    <div className="page-x mx-auto max-w-[1280px] pt-10">
      <Suspense fallback={<div className="h-96 skeleton" aria-busy="true" />}>
        <Confirmation params={params} />
      </Suspense>
    </div>
  );
}
