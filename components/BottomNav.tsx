'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HouseFill, ClockHistory } from 'react-bootstrap-icons';

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav
      className="navbar fixed-bottom justify-content-around"
      style={{
        backgroundColor: 'rgb(30, 30, 30)',
        borderTop: '1px solid rgb(51, 51, 51)',
        paddingBottom: `calc(5px + env(safe-area-inset-bottom))`,
        paddingTop: '5px',
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
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
      <div className="pb-5"></div>
    </nav>
  );
}
