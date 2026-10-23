'use client';

import Link from 'next/link';
import { ArrowRight } from 'react-bootstrap-icons';
import { electricityPrice, electricityStatus, electricityStatusLabels } from '@/lib/electricity';
import { useElectricity } from '@/lib/useElectricity';

export default function ElectricityCard() {
  const { hours, current, loading, error } = useElectricity();
  const status = current ? electricityStatus(current.price, hours) : null;
  return <Link href="/luz" className="week-summary-card electricity-entry">
    <span className={`electricity-traffic-light ${status ? `is-${status}` : ''}`} aria-hidden="true">
      <span className="traffic-red" /><span className="traffic-amber" /><span className="traffic-green" />
    </span>
    <div>
      <strong>Luz{status ? ` · ${electricityStatusLabels[status]}` : ''}</strong>
      <small>{current ? `${electricityPrice(current.price)} €/kWh ahora` : loading && !error ? 'Consultando precio actual…' : 'Precio actual no disponible'}</small>
      <small className="electricity-card-hint">{status ? 'Comparado con las horas de hoy · PVPC' : 'Ver precios por hora · PVPC'}</small>
    </div>
    <ArrowRight aria-hidden="true" />
  </Link>;
}
