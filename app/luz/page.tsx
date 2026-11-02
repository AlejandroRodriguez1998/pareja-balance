'use client';

import Link from 'next/link';
import { ArrowLeft } from 'react-bootstrap-icons';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import { electricityAdvice, electricityCents, electricityEndTime, electricityRange, electricityStatus, electricityStretches, electricityTime, type ElectricityHour } from '@/lib/electricity';
import { useElectricity } from '@/lib/useElectricity';
import ElectricityChart from '@/components/ElectricityChart';
import SectionLoader from '@/components/SectionLoader';

export default function ElectricityPage() {
  return <AuthGuard><ElectricityContent /></AuthGuard>;
}

function ElectricityContent() {
  const { hours, current, now, error, loading, retry } = useElectricity();
  const advice = electricityAdvice(hours, now);
  const cheapStretches = electricityStretches(hours, now).filter((stretch) => stretch.status === 'cheap').slice(0, 3);
  const ranked = [...hours].sort((a, b) => a.price - b.price);
  const cheapest = ranked[0];
  const highest = ranked[ranked.length - 1];
  const cheapHours = new Set(ranked.slice(0, 3).map((hour) => hour.datetime));
  const isPast = (hour: ElectricityHour) => Date.parse(hour.datetime) + 3600000 <= now;

  if (loading && !hours.length && !error) return <SectionLoader label="Cargando el precio de la luz" />;

  return <>
    <nav className="app-top-nav" aria-label="Luz">
      <Link href="/dashboard" className="nav-icon-button electricity-back-button" aria-label="Volver a Inicio">
        <ArrowLeft size={20} aria-hidden="true" />
      </Link>
      <h5>Luz</h5>
      <span />
    </nav>
    <main className="dashboard-shell"><div className="container dashboard-container electricity-page">
      {error && <div className="electricity-panel" role="alert"><p>{error}</p><button className="btn btn-outline-secondary" onClick={retry}>Reintentar</button></div>}
      {!error && hours.length > 0 && <>
        {advice && <section className={`electricity-panel electricity-hero electricity-tone-${advice.status}`} aria-label="Precio ahora">
          <span className="electricity-hero-kicker">Ahora{current ? ` · ${electricityRange(current, false)}` : ''}</span>
          <h1>{advice.title}</h1>
          <p>{advice.detail}</p>
          {current && <span className="electricity-hero-price">{electricityCents(current.price)} cént/kWh</span>}
        </section>}

        <section className="electricity-panel">
          <h2>Mejores momentos</h2>
          {cheapStretches.length > 0
            ? <ul className="electricity-moments">{cheapStretches.map((stretch) => <li key={stretch.start.datetime}>
              <strong>{electricityTime(stretch.start.datetime)} – {electricityEndTime(stretch.end)}</strong>
              <span>{stretch.hours.length === 1 ? '1 hora' : `${stretch.hours.length} horas`} de luz barata</span>
            </li>)}</ul>
            : <p>Hoy ya no quedan horas baratas. Mañana habrá precios nuevos.</p>}
        </section>

        <ElectricityChart hours={hours} current={current} now={now} />

        <section className="dashboard-stat-grid" aria-label="Extremos del día">
          <div className="dashboard-stat-card electricity-tone-cheap"><span>Hora más barata</span><strong>{electricityRange(cheapest, false)}</strong><small>{electricityCents(cheapest.price)} cént/kWh</small></div>
          <div className="dashboard-stat-card electricity-tone-expensive"><span>Hora más cara</span><strong>{electricityRange(highest, false)}</strong><small>{electricityCents(highest.price)} cént/kWh</small></div>
        </section>

        <section className="electricity-panel">
          <h2>Las 3 horas más baratas</h2>
          <p>Para planificar los electrodomésticos que más gastan.</p>
          <ol className="electricity-cheapest">{ranked.slice(0, 3).map((hour) => <li key={hour.datetime} className={isPast(hour) ? 'is-past' : ''}>
            <span>{electricityRange(hour, false)}{isPast(hour) && <small> · Ya pasó</small>}</span>
            <strong>{electricityCents(hour.price)} cént/kWh</strong>
          </li>)}</ol>
        </section>

        <section className="electricity-panel">
          <h2>Precios por hora</h2>
          <p>Las 3 horas más baratas llevan una estrella.</p>
          <table className="electricity-table">
            <caption className="visually-hidden">Precio de la luz por hora en céntimos por kWh</caption>
            <thead><tr><th scope="col">Hora</th><th scope="col">cént/kWh</th></tr></thead>
            <tbody>{hours.map((hour) => {
              const active = current?.datetime === hour.datetime;
              const status = electricityStatus(hour.price, hours);
              const width = highest.price === cheapest.price ? 100 : 8 + 92 * (hour.price - cheapest.price) / (highest.price - cheapest.price);
              return <tr key={hour.datetime} className={`${active ? 'electricity-active' : ''}${isPast(hour) ? ' is-past' : ''}`}>
                <th scope="row">
                  {electricityRange(hour, false)}
                  {active && <small className="electricity-now-tag">Ahora</small>}
                  {cheapHours.has(hour.datetime) && <span className="electricity-star" aria-label="Una de las 3 horas más baratas"> ★</span>}
                </th>
                <td className={`electricity-tone-${status}`}><strong>{electricityCents(hour.price)}</strong><span className="electricity-bar" aria-hidden="true" style={{ width: `${width}%` }} /></td>
              </tr>;
            })}</tbody>
          </table>
        </section>
      </>}

      <details className="electricity-panel electricity-help">
        <summary>¿Qué significa esto?</summary>
        <p><strong>Barata, normal o cara</strong> se calcula comparando cada hora con el resto de horas de hoy, así que te dice cuándo es mejor usar los electrodomésticos que más gastan.</p>
        <p>Es el precio de la tarifa regulada (PVPC), sin impuestos. Si tenéis una tarifa de mercado libre con precio fijo, esto no os afecta.</p>
        <p>Fuente: <a href="https://www.esios.ree.es/es/pvpc" target="_blank" rel="noreferrer">Red Eléctrica</a>.</p>
      </details>
    </div></main><BottomNav />
  </>;
}
