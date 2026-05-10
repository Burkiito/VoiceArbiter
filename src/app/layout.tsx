import type { Metadata, Viewport } from 'next';
import type React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'VoiceArbiter — Sesli AI Tahkim Platformu',
  description:
    'İki taraf arasında sesli müzakere ile akıllı sözleşme oluşturun. ' +
    'Yapay zeka arabulucusu şartları otomatik belirler, Solana escrow sistemi güvenli ödeme sağlar.',
  keywords: [
    'Solana',
    'akıllı sözleşme',
    'sesli müzakere',
    'escrow',
    'yapay zeka arabulucu',
    'blockchain',
    'freelancer',
    'VoiceArbiter',
  ],
  authors: [{ name: 'VoiceArbiter Ekibi' }],
  creator: 'VoiceArbiter',
  publisher: 'VoiceArbiter',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    title: 'VoiceArbiter — Sesli AI Tahkim Platformu',
    description:
      'Sesli müzakere ile akıllı sözleşmeler oluşturun. AI arabulucu + Solana escrow.',
    siteName: 'VoiceArbiter',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0e1a',
};

interface KokDuzenProps {
  children: React.ReactNode;
}

export default function KokDuzen({ children }: KokDuzenProps) {
  return (
    <html lang="tr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-zemin antialiased">
        {children}
      </body>
    </html>
  );
}
