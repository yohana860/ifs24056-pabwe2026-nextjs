import type { Metadata, Viewport } from 'next';
import { preconnect } from 'react-dom';
import Providers from '@/components/Providers';
import { BASE_URL } from '@/lib/api';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Rumpi', template: '%s | Rumpi' },
  description: 'Rumpi adalah tempat berbagi cerita singkat, memberi suka, dan berkomentar.',
  applicationName: 'Rumpi',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4338ca',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  preconnect(new URL(BASE_URL).origin, { crossOrigin: 'anonymous' });
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
