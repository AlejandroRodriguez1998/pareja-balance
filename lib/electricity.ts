export type ElectricityHour = { datetime: string; price: number };
export type ElectricityDay = { date: string; hours: ElectricityHour[] };

export type ElectricityStatus = 'cheap' | 'medium' | 'expensive';
export const electricityStatusLabels: Record<ElectricityStatus, string> = {
  cheap: 'Precio bajo', medium: 'Precio medio', expensive: 'Precio alto',
};

// Compare prices with the day's price terciles, keeping equal prices in the same band.
export function electricityStatus(price: number, hours: ElectricityHour[]): ElectricityStatus {
  const ranked = hours.map((hour) => hour.price).sort((a, b) => a - b);
  if (!ranked.length || ranked[0] === ranked[ranked.length - 1]) return 'medium';
  const low = ranked[Math.ceil(ranked.length / 3) - 1];
  const high = ranked[Math.ceil(2 * ranked.length / 3) - 1];
  if (low === high) return price < low ? 'cheap' : price > high ? 'expensive' : 'medium';
  return price <= low ? 'cheap' : price <= high ? 'medium' : 'expensive';
}

export function madridDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function electricityTime(datetime: string) {
  return new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' }).format(new Date(datetime));
}

export function electricityRange(hour: ElectricityHour) {
  const end = new Date(new Date(hour.datetime).getTime() + 3600000).toISOString();
  // Include UTC offset to distinguish the repeated hour when clocks change.
  return `${electricityTime(hour.datetime)}–${electricityTime(end)} (${hour.datetime.slice(-6)})`;
}

export function electricityPrice(price: number) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(price);
}
