'use client';

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { electricityPrice, electricityRange, electricityTime } from '@/lib/electricity';
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
  const cheapHours = new Set(ranked.slice(0, 3).map((hour) => hour.datetime));

  return <>
    <nav className="app-top-nav" aria-label="Luz"><Link href="/dashboard" className="nav-icon-button" aria-label="Volver a Inicio">←</Link><h5>Luz</h5><span /></nav>
    <main className="dashboard-shell"><div className="container dashboard-container electricity-page">
      <header><span className="section-kicker">PVPC · Península</span><h1>La luz, hora a hora</h1><p>Precios de hoy, {new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(now))}.</p></header>
      {loading && !hours.length && <p role="status">Consultando los precios oficiales…</p>}
      {error && <div className="electricity-panel" role="alert"><p>{error}</p><button className="btn btn-outline-secondary" onClick={retry}>Reintentar</button></div>}
      {!error && hours.length > 0 && <>
        <section className="electricity-panel electricity-current" aria-label="Precio actual"><span>Ahora · {current ? electricityRange(current) : 'Sin dato para esta hora'}</span><strong>{current ? electricityPrice(current.price) : '—'} <small>€/kWh</small></strong><p>Media del día: {electricityPrice(average)} €/kWh</p></section>
        <ElectricityChart hours={hours} current={current} />
        <section className="dashboard-stat-grid" aria-label="Extremos del día">
          <div className="dashboard-stat-card"><span>Hora más barata</span><strong>{electricityPrice(cheapest.price)} €/kWh</strong><small>{electricityRange(cheapest)}</small></div>
          <div className="dashboard-stat-card"><span>Hora más cara</span><strong>{electricityPrice(highest.price)} €/kWh</strong><small>{electricityRange(highest)}</small></div>
        </section>
        <section className="electricity-panel"><h2>Las 3 horas más baratas</h2><p>Para planificar el uso de los electrodomésticos. Pueden ser horas que ya han pasado.</p><ol className="electricity-cheapest">{ranked.slice(0, 3).map((hour) => <li key={hour.datetime}><span>{electricityRange(hour)}</span><strong>{electricityPrice(hour.price)} €/kWh</strong></li>)}</ol></section>
        <section className="electricity-panel"><h2>Precios por hora</h2><p>Hora de Madrid. Las tres horas más baratas llevan una estrella.</p><table className="electricity-table"><caption className="visually-hidden">Precios de la energía PVPC en euros por kilovatio hora</caption><thead><tr><th scope="col">Hora</th><th scope="col">Precio €/kWh</th></tr></thead><tbody>{hours.map((hour) => {
          const active = current?.datetime === hour.datetime;
          const width = highest.price === cheapest.price ? 100 : 8 + 92 * (hour.price - cheapest.price) / (highest.price - cheapest.price);
          return <tr key={hour.datetime} className={active ? 'electricity-active' : ''}><th scope="row"><span>{electricityTime(hour.datetime)} <small>UTC{hour.datetime.slice(-6)}</small></span>{active && <small> Ahora</small>}{cheapHours.has(hour.datetime) && <span aria-label="Una de las tres horas más baratas"> ★</span>}</th><td><strong>{electricityPrice(hour.price)}</strong><span className="electricity-bar" aria-hidden="true" style={{ width: `${width}%` }} /></td></tr>;
        })}</tbody></table></section>
      </>}
      <footer className="electricity-source"><p>Fuente: <a href="https://www.esios.ree.es/es/pvpc" target="_blank" rel="noreferrer">Red Eléctrica · ESIOS</a>, a través de su API pública REData.</p><p>Precio del término de energía PVPC, sin impuestos. La factura incluye otros conceptos, como potencia y alquiler del contador. Si tenéis una tarifa de mercado libre, vuestro precio puede ser diferente.</p></footer>
    </div></main><BottomNav />
  </>;
}
