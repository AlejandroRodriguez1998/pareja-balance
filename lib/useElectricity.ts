'use client';

import { useEffect, useState } from 'react';
import { madridDate, type ElectricityDay } from './electricity';

export function useElectricity() {
  const [data, setData] = useState<ElectricityDay | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    const update = () => setNow(Date.now());
    window.addEventListener('focus', update);
    document.addEventListener('visibilitychange', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);
  const date = madridDate(new Date(now));
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/electricity', { cache: 'no-store', signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'No se pueden cargar los precios.');
        if (result.date !== date) throw new Error('Los precios disponibles no corresponden a hoy. Conéctate a Internet y vuelve a intentarlo.');
        setData(result);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'No se pueden cargar los precios.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    const refresh = setInterval(() => void load(), 15 * 60000);
    return () => { controller.abort(); clearInterval(refresh); };
  }, [date, attempt]);
  const hours = !error && data?.date === date ? data.hours : [];
  const current = hours.find((hour) => now >= Date.parse(hour.datetime) && now < Date.parse(hour.datetime) + 3600000);
  return { hours, current, now, error, loading, retry: () => setAttempt((value) => value + 1) };
}
