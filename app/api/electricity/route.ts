import { NextResponse } from 'next/server';
import { madridDate } from '@/lib/electricity';

export const dynamic = 'force-dynamic';

export async function GET() {
  const date = madridDate();
  const url = new URL('https://apidatos.ree.es/es/datos/mercados/precios-mercados-tiempo-real');
  url.search = new URLSearchParams({ start_date: `${date}T00:00`, end_date: `${date}T23:59`, time_trunc: 'hour' }).toString();
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: 900 }, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error(`REE: ${response.status}`);
    const data = await response.json();
    const series = data.included?.find((item: { id: string; type: string }) => item.id === '1001' && item.type === 'PVPC');
    const values: { datetime: string; value: number }[] = series?.attributes?.values ?? [];
    const hours = values.filter((item) => typeof item.value === 'number' && Number.isFinite(item.value) && Number.isFinite(Date.parse(item.datetime)) && madridDate(new Date(item.datetime)) === date)
      .map((item) => ({ datetime: item.datetime, price: item.value / 1000 }))
      .sort((a, b) => Date.parse(a.datetime) - Date.parse(b.datetime));
    const noon = Date.parse(`${date}T12:00:00Z`);
    const expected = Array.from({ length: 49 }, (_, index) => noon + (index - 24) * 3600000)
      .filter((time) => madridDate(new Date(time)) === date);
    // DST days have 23 or 25 hourly values. Never present a partial day as complete.
    if (hours.length !== expected.length || hours.some((hour, index) => Date.parse(hour.datetime) !== expected[index])) throw new Error('Incomplete PVPC series');
    return NextResponse.json({ date, hours });
  } catch (error) {
    console.error('Error fetching PVPC:', error);
    return NextResponse.json({ error: 'No se han podido obtener los precios oficiales de hoy. Vuelve a intentarlo en unos minutos.' }, { status: 503 });
  }
}
