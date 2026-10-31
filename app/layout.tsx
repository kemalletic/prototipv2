import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono, Newsreader } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ConsentBanner } from '@/components/layout/ConsentBanner';
import { PrototypeNotice } from '@/components/layout/PrototypeNotice';
import './globals.css';

const archivo = Archivo({ subsets: ['latin', 'latin-ext'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
const newsreader = Newsreader({ subsets: ['latin', 'latin-ext'], style: ['italic'], weight: ['400'], variable: '--font-newsreader', display: 'swap' });
const plex = IBM_Plex_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: { default: 'KROJ — Muška odjeća, Sarajevo', template: '%s · KROJ' },
  description: 'Traperice, majice, džemperi, trenerke i jakne za muškarce. Plaćanje pouzećem i dostava širom Bosne i Hercegovine.',
  applicationName: 'KROJ',
  openGraph: { type: 'website', locale: 'bs_BA', siteName: 'KROJ' },
  robots: { index: false, follow: false }, // prototype: keep out of search indexes until launch
};

export const viewport: Viewport = { themeColor: '#ece7de', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bs" className={`${archivo.variable} ${newsreader.variable} ${plex.variable}`}>
      <body className="min-h-dvh">
        <a href="#sadrzaj" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Preskoči na sadržaj
        </a>
        <PrototypeNotice />
        <Header />
        <main id="sadrzaj">{children}</main>
        <Footer />
        <CartDrawer />
        <ConsentBanner />
      </body>
    </html>
  );
}
