import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { IBM_Plex_Mono, Newsreader } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { ConsentBanner } from '@/components/layout/ConsentBanner';
import { PrototypeNotice } from '@/components/layout/PrototypeNotice';
import './globals.css';

// Archivo, self-hosted as ONE variable woff2 (wght 400–800, wdth 62–112) subset to the glyphs Bosnian needs
// (ASCII + čćđšž + typographic punctuation): 72 KB instead of ~172 KB for Google's latin + latin-ext pair.
// Regenerate with scripts/fonts/subset-archivo.py if new characters are needed.
const archivo = localFont({
  src: './fonts/archivo-kroj.woff2',
  variable: '--font-archivo',
  weight: '400 800',
  display: 'swap',
  declarations: [{ prop: 'font-stretch', value: '62% 112%' }],
  fallback: ['ui-sans-serif', 'system-ui', 'Arial'],
});
const newsreader = Newsreader({ subsets: ['latin', 'latin-ext'], style: ['italic'], weight: ['400'], variable: '--font-newsreader', display: 'swap', preload: false });
const plex = IBM_Plex_Mono({ subsets: ['latin', 'latin-ext'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap', preload: false });

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
