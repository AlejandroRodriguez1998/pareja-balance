import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import AppSplash from '@/components/AppSplash';
import KeyboardInset from '@/components/KeyboardInset';
import { Plus_Jakarta_Sans } from 'next/font/google';

const appFont = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-app', display: 'swap' });

export const metadata = {
  title: 'Pareja Balance',
  description: 'Contabilidad sencilla en pareja',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  // En Android, el teclado encoge la página en vez de taparla.
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const themeScript = `
    try {
      const savedTheme = localStorage.getItem('pareja-balance-theme');
      const theme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.content = theme === 'dark' ? '#101318' : '#f4f6f8';
      // La pantalla de carga solo aparece con la sesión iniciada (ver AppSplash).
      document.documentElement.dataset.session = localStorage.getItem('pareja-balance-session') ? 'yes' : 'no';
    } catch (_) {}
  `;

  return (
    <html lang="es" className={appFont.variable} suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#101318" />

        {/* 📱 iOS Safari status bar */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="Balance" />

        {/* ✅ Forzar color oscuro igual que bg-dark */}
        <meta name="background-color" content="#101318" />
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />

        {/* 🔧 Compatibilidad general */}

        {/* 🧩 Iconos */}
        <link rel="icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body>
        <AppSplash />
        <KeyboardInset />
        {children}
      </body>
    </html>
  );
}
