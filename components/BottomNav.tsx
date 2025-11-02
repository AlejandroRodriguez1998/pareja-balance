'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HouseFill, ClockHistory } from 'react-bootstrap-icons';

export default function BottomNav() {
  const path = usePathname();

  return (
   <nav
      className="navbar fixed-bottom justify-content-around py-2"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: '8px',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3px)',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        borderTop: '1px solid #333',
        zIndex: 1000,
      }}
    >
      {/* Inicio */}
      <Link
        href="/dashboard"
        className={`nav-link d-flex flex-column align-items-center ${
          path === '/dashboard' ? 'text-primary' : 'text-light'
        }`}
      >
        <HouseFill size={22} />
        <div style={{ fontSize: '0.75rem' }}>Inicio</div>
      </Link>

      {/* Historial */}
      <Link
        href="/history"
        className={`nav-link d-flex flex-column align-items-center ${
          path === '/history' ? 'text-primary' : 'text-light'
        }`}
      >
        <ClockHistory size={22} />
        <div style={{ fontSize: '0.75rem' }}>Historial</div>
      </Link>
    </nav>
  );
}
