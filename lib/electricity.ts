export type ElectricityHour = { datetime: string; price: number };
export type ElectricityDay = { date: string; hours: ElectricityHour[] };

export type ElectricityStatus = 'cheap' | 'medium' | 'expensive';
export const electricityStatusLabels: Record<ElectricityStatus, string> = {
  cheap: 'Precio bajo', medium: 'Precio medio', expensive: 'Precio alto',
};

export type ElectricityChartStatus = 'cheap' | 'lower-medium' | 'upper-medium' | 'expensive';
export const electricityChartStatusLabels: Record<ElectricityChartStatus, string> = {
  cheap: 'Precio bajo', 'lower-medium': 'Precio medio-bajo', 'upper-medium': 'Precio medio-alto', expensive: 'Precio alto',
};

// Daily price quartiles; equal prices always receive the same color.
export function electricityChartStatus(price: number, hours: ElectricityHour[]): ElectricityChartStatus {
  const ranked = hours.map((hour) => hour.price).sort((a, b) => a - b);
  if (!ranked.length || ranked[0] === ranked[ranked.length - 1]) return 'lower-medium';
  const first = ranked[Math.ceil(ranked.length / 4) - 1];
  const median = ranked[Math.ceil(ranked.length / 2) - 1];
  const third = ranked[Math.ceil(3 * ranked.length / 4) - 1];
  if (first === third) return price < first ? 'cheap' : price > third ? 'expensive' : 'lower-medium';
  return price <= first ? 'cheap' : price <= median ? 'lower-medium' : price <= third ? 'upper-medium' : 'expensive';
}

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

export function electricityRange(hour: ElectricityHour, showOffset = true) {
  const end = new Date(new Date(hour.datetime).getTime() + 3600000).toISOString();
  // Include UTC offset to distinguish the repeated hour when clocks change.
  return `${electricityTime(hour.datetime)}–${electricityTime(end)}${showOffset ? ` (${hour.datetime.slice(-6)})` : ''}`;
}

export function electricityPrice(price: number) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(price);
}
