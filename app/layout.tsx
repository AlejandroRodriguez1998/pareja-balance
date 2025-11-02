import './globals.css';
import type { Metadata } from 'next';
import Nav from '@/component/Nav';

export const metadata: Metadata = {
  title: 'Pareja Balance',
  description: 'Contabilidad de pareja sencilla',
  manifest: '/manifest.json',
  themeColor: '#000000ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50">
        <Nav />
        <main className="max-w-3xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
