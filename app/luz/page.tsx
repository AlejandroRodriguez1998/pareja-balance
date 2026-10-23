'use client';

import Link from 'next/link';
import { ArrowLeft } from 'react-bootstrap-icons';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { electricityPrice, electricityRange } from '@/lib/electricity';
import { useElectricity } from '@/lib/useElectricity';
import ElectricityChart from '@/components/ElectricityChart';

export default function ElectricityPage() {
  return <AuthGuard><ElectricityContent /></AuthGuard>;
}

function ElectricityContent() {
  const { hours, current, now, error, loading, retry } = useElectricity();
  const ranked = [...hours].sort((a, b) => a.price - b.price);
  const cheapest = ranked[0];
  const highest = ranked[ranked.length - 1];
  const average = hours.length ? hours.reduce((sum, hour) => sum + hour.price, 0) / hours.length : 0;

  return <>
    <nav className="app-top-nav" aria-label="Luz">
      <Link href="/dashboard" className="nav-icon-button electricity-back-button" aria-label="Volver a Inicio">
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <h5>Luz</h5>
      <span />
    </nav>
    <main className="dashboard-shell"><div className="container dashboard-container electricity-page">
      <header><span className="section-kicker">PVPC · Península</span><h1>La luz, hora a hora</h1><p>Precios de hoy, {new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(now))}.</p></header>
      {loading && !hours.length && <p role="status">Consultando los precios oficiales…</p>}
      {error && <div className="electricity-panel" role="alert"><p>{error}</p><button className="btn btn-outline-secondary" onClick={retry}>Reintentar</button></div>}
      {!error && hours.length > 0 && <>
        <section className="electricity-panel electricity-current" aria-label="Precio actual"><span>Ahora · {current ? electricityRange(current, false) : 'Sin dato para esta hora'}</span><strong>{current ? electricityPrice(current.price) : '—'} <small>€/kWh</small></strong><p>Media del día: {electricityPrice(average)} €/kWh</p></section>
        <ElectricityChart hours={hours} current={current} />
        <section className="dashboard-stat-grid" aria-label="Extremos del día">
          <div className="dashboard-stat-card"><span>Hora más barata</span><strong title={electricityRange(cheapest)}>{electricityRange(cheapest, false)}</strong><small>{electricityPrice(cheapest.price)} €/kWh</small></div>
          <div className="dashboard-stat-card"><span>Hora más cara</span><strong title={electricityRange(highest)}>{electricityRange(highest, false)}</strong><small>{electricityPrice(highest.price)} €/kWh</small></div>
        </section>
      </>}
      <footer className="electricity-source"><a href="https://www.esios.ree.es/es/pvpc" target="_blank" rel="noreferrer">Red Eléctrica · PVPC</a> · Sin impuestos</footer>
    </div></main><BottomNav />
  </>;
}
