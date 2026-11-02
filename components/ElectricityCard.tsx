'use client';

import Link from 'next/link';
import { ArrowRight } from 'react-bootstrap-icons';
import { electricityCents, electricityPriceLevelLabels, electricityStatus } from '@/lib/electricity';
import { useElectricity } from '@/lib/useElectricity';

export default function ElectricityCard() {
  const { hours, current, loading, error } = useElectricity();
  const status = current ? electricityStatus(current.price, hours) : null;
  return <Link href="/luz" className="week-summary-card electricity-entry">
    <span className={`electricity-traffic-light ${status ? `is-${status}` : ''}`} aria-hidden="true">
      <span className="traffic-red" /><span className="traffic-amber" /><span className="traffic-green" />
    </span>
    <div>
      <strong>Luz{status ? ` · ${electricityPriceLevelLabels[status]}` : ''}</strong>
      <small>{current ? `${electricityCents(current.price)} cént/kWh ahora` : loading && !error ? 'Consultando precio actual…' : 'Precio actual no disponible'}</small>
    </div>
    <ArrowRight aria-hidden="true" />
  </Link>;
}
