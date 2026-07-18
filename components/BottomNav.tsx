'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HouseDoorFill, ClockFill, EggFried } from 'react-bootstrap-icons';

export default function BottomNav() {
  const path = usePathname();

  return (
    <div className="bottom-nav-spacer">
      <nav className="app-bottom-nav">
        <Link
          href="/dashboard"
          className={`bottom-nav-link ${path === '/dashboard' ? 'is-active' : ''}`}
        >
          <HouseDoorFill size={22} />
          <span>Inicio</span>
        </Link>

        <Link
          href="/history"
          className={`bottom-nav-link ${path === '/history' ? 'is-active' : ''}`}
        >
          <ClockFill size={22} />
          <span>Historial</span>
        </Link>

        <Link
          href="/meals"
          className={`bottom-nav-link ${path === '/meals' ? 'is-active' : ''}`}
        >
          <EggFried size={22} />
          <span>Comidas</span>
        </Link>
      </nav>
    </div>
  );
}
