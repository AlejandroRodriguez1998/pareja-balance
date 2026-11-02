'use client';

import { useId, useState } from 'react';
import { electricityCents, electricityRange, electricityStatus, electricityStatusLabels, electricityTime, type ElectricityHour } from '@/lib/electricity';

export default function ElectricityChart({ hours, current, now }: { hours: ElectricityHour[]; current?: ElectricityHour; now: number }) {
  const titleId = useId();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const selected = hours.find((hour) => hour.datetime === selectedTime) ?? current ?? hours[0];
  if (!selected) return null;
  const max = Math.max(...hours.map((hour) => hour.price), 0.0001);
  const selectedStatus = electricityStatus(selected.price, hours);
  const currentIndex = hours.findIndex((hour) => hour.datetime === current?.datetime);

  return <section className="electricity-panel electricity-chart" aria-labelledby={titleId}>
    <h2 id={titleId}>Hoy, hora a hora</h2>
    <p>Toca una barra para ver esa hora.</p>

    <div className={`electricity-chart-detail electricity-tone-${selectedStatus}`} aria-live="polite" aria-atomic="true">
      <span>{electricityRange(selected, false)}{selected.datetime === current?.datetime ? ' · Ahora' : ''}</span>
      <strong>{electricityStatusLabels[selectedStatus]}</strong>
      <small>{electricityCents(selected.price)} cént/kWh</small>
    </div>

    <div className="electricity-bars" role="group" aria-label="Precio de la luz por hora">
      {hours.map((hour, index) => {
        const status = electricityStatus(hour.price, hours);
        const isCurrent = hour.datetime === current?.datetime;
        const isPast = Date.parse(hour.datetime) + 3600000 <= now;
        const isSelected = hour.datetime === selected.datetime;
        const height = 12 + 88 * Math.max(hour.price, 0) / max;
        // Las horas junto a "Ahora" no llevan etiqueta para que no se solapen.
        const nearCurrent = currentIndex >= 0 && Math.abs(index - currentIndex) <= 1;
        const hourLabel = isCurrent ? 'Ahora' : index % 3 === 0 && !nearCurrent ? electricityTime(hour.datetime).slice(0, 2) : '';
        return <button
          key={hour.datetime}
          type="button"
          className={`electricity-bar-item electricity-tone-${status}${isPast ? ' is-past' : ''}${isCurrent ? ' is-current' : ''}${isSelected ? ' is-selected' : ''}`}
          aria-label={`${electricityRange(hour, false)}: ${electricityStatusLabels[status]}, ${electricityCents(hour.price)} céntimos el kWh${isCurrent ? '. Ahora' : ''}`}
          aria-pressed={isSelected}
          onClick={() => setSelectedTime(hour.datetime)}
        >
          <span className="electricity-bar-track"><span className="electricity-bar-fill" style={{ height: `${height}%` }} /></span>
          <span className="electricity-bar-hour">{hourLabel}</span>
        </button>;
      })}
    </div>

    <div className="electricity-chart-legend">
      <span className="electricity-tone-cheap">● Barata</span>
      <span className="electricity-tone-medium">● Normal</span>
      <span className="electricity-tone-expensive">● Cara</span>
    </div>
  </section>;
}
