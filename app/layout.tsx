import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/component/Nav';

export const metadata: Metadata = {
  title: 'Pareja Balance',
  description: 'Contabilidad de pareja sencilla',
};

export const viewport = {
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* 👇 Enlace explícito al manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen bg-neutral-50">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
