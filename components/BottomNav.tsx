'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Check2Square,
  CashCoin,
  EggFried,
  HeartFill,
  HouseDoorFill,
} from 'react-bootstrap-icons';

const navigationItems = [
  { href: '/dashboard', label: 'Inicio', icon: HouseDoorFill },
  { href: '/history', label: 'Gastos', icon: CashCoin },
  { href: '/us', label: 'Nosotros', icon: HeartFill, featured: true },
  { href: '/tasks', label: 'Tareas', icon: Check2Square },
  { href: '/meals', label: 'Comidas', icon: EggFried },
] as const;

export default function BottomNav() {
  const path = usePathname();

  return (
    <div className="bottom-nav-spacer">
      <nav className="app-bottom-nav" aria-label="Navegación principal">
        {navigationItems.map(({ href, label, icon: Icon, ...item }) => {
          const isActive = path === href;

          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`bottom-nav-link ${isActive ? 'is-active' : ''} ${'featured' in item ? 'is-featured' : ''}`}
            >
              <Icon className="bottom-nav-icon" size={22} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
