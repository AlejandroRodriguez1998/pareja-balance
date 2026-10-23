'use client';

import { useId, useState } from 'react';
import { electricityPrice, electricityRange, electricityStatus, electricityStatusLabels, electricityTime, type ElectricityHour } from '@/lib/electricity';

export default function ElectricityChart({ hours, current }: { hours: ElectricityHour[]; current?: ElectricityHour }) {
  const titleId = useId();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const selected = hours.find((hour) => hour.datetime === selectedTime) ?? current ?? hours[0];
  if (!selected) return null;
  const min = Math.min(0, ...hours.map((hour) => hour.price));
  const max = Math.max(0, ...hours.map((hour) => hour.price));
  const padding = (max - min || 0.01) * 0.12;
  const bottom = min < 0 ? min - padding : 0;
  const top = max + padding;
  const left = 65, plotWidth = 670, plotHeight = 220, plotTop = 24;
  const y = (value: number) => plotTop + plotHeight * (top - value) / (top - bottom);
  const zero = y(0);
  const step = plotWidth / hours.length;
  const status = electricityStatus(selected.price, hours);

  return <section className="electricity-panel electricity-chart" aria-labelledby={titleId}>
    <h2 id={titleId}>El precio de un vistazo</h2>
    <p>Toca una barra para ver su precio. Desliza la gráfica para recorrer las horas.</p>
    <div className={`electricity-chart-detail electricity-tone-${status}`} aria-live="polite" aria-atomic="true">
      <span>{electricityRange(selected)}{selected.datetime === current?.datetime ? ' · Ahora' : ''}</span>
      <strong>{electricityPrice(selected.price)} €/kWh · {electricityStatusLabels[status]}</strong>
    </div>
    <div className="electricity-chart-scroll" role="region" aria-label="Gráfica de precios por hora, desplazable" tabIndex={0}>
      <svg viewBox="0 0 760 295" className="electricity-chart-svg" role="group" aria-label="Precio PVPC por hora en euros por kilovatio hora">
        <text x={left} y={14} className="chart-axis-label">€/kWh</text>
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = bottom + (top - bottom) * tick / 4;
          return <g key={tick}><line x1={left} x2={left + plotWidth} y1={y(value)} y2={y(value)} className="chart-grid" /><text x={left - 8} y={y(value) + 4} textAnchor="end" className="chart-axis-label">{value.toLocaleString('es-ES', { maximumFractionDigits: 3 })}</text></g>;
        })}
        <line x1={left} x2={left + plotWidth} y1={zero} y2={zero} className="chart-zero" />
        {hours.map((hour, index) => {
          const band = electricityStatus(hour.price, hours);
          const active = hour.datetime === current?.datetime;
          const chosen = hour.datetime === selected.datetime;
          const label = `${electricityRange(hour)}: ${electricityPrice(hour.price)} euros por kWh. ${electricityStatusLabels[band]}${active ? '. Hora actual' : ''}`;
          const x = left + index * step + 3;
          return <g key={hour.datetime}>
            <rect x={x} y={Math.min(y(hour.price), zero)} width={step - 6} height={Math.max(2, Math.abs(zero - y(hour.price)))} rx={3}
              className={`chart-price-bar electricity-tone-${band} ${chosen ? 'is-selected' : ''}`} role="button" tabIndex={0} aria-label={label} aria-pressed={chosen}
              onClick={() => setSelectedTime(hour.datetime)} onFocus={() => setSelectedTime(hour.datetime)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedTime(hour.datetime); } }}>
              <title>{label}</title>
            </rect>
            <text x={x + (step - 6) / 2} y={264} textAnchor="middle" className={`chart-axis-label ${active ? 'chart-current-label' : ''}`}>{electricityTime(hour.datetime).slice(0, 2)}</text>
            {active && <text x={x + (step - 6) / 2} y={282} textAnchor="middle" className="chart-current-label">●</text>}
          </g>;
        })}
      </svg>
    </div>
    <div className="electricity-chart-legend"><span className="electricity-tone-cheap">● Bajo</span><span className="electricity-tone-medium">● Medio</span><span className="electricity-tone-expensive">● Alto</span><span>● Hora actual</span></div>
    <p className="electricity-chart-note">Colores según los tercios de precios de hoy. No indican una tarifa fija. En el cambio de hora, consulta el desfase UTC al seleccionar una barra.</p>
  </section>;
}
