export type ElectricityHour = { datetime: string; price: number };
export type ElectricityDay = { date: string; hours: ElectricityHour[] };

export type ElectricityStatus = 'cheap' | 'medium' | 'expensive';
export const electricityStatusLabels: Record<ElectricityStatus, string> = {
  cheap: 'Barata', medium: 'Normal', expensive: 'Cara',
};
export const electricityPriceLevelLabels: Record<ElectricityStatus, string> = {
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

export function electricityRange(hour: ElectricityHour, showOffset = true) {
  const end = new Date(new Date(hour.datetime).getTime() + 3600000).toISOString();
  // Include UTC offset to distinguish the repeated hour when clocks change.
  return `${electricityTime(hour.datetime)}–${electricityTime(end)}${showOffset ? ` (${hour.datetime.slice(-6)})` : ''}`;
}


// Precio en céntimos de euro por kWh, más fácil de leer que 0,1234 €/kWh.
export function electricityCents(price: number) {
  return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(price * 100);
}

export type ElectricityStretch = { status: ElectricityStatus; start: ElectricityHour; end: ElectricityHour; hours: ElectricityHour[] };

// Agrupa las horas que quedan del día (desde la actual) en tramos seguidos del mismo nivel de precio.
export function electricityStretches(hours: ElectricityHour[], now: number): ElectricityStretch[] {
  const remaining = hours.filter((hour) => Date.parse(hour.datetime) + 3600000 > now);
  const stretches: ElectricityStretch[] = [];
  for (const hour of remaining) {
    const status = electricityStatus(hour.price, hours);
    const last = stretches[stretches.length - 1];
    if (last && last.status === status) {
      last.end = hour;
      last.hours.push(hour);
    } else {
      stretches.push({ status, start: hour, end: hour, hours: [hour] });
    }
  }
  return stretches;
}

export function electricityEndTime(hour: ElectricityHour) {
  return electricityTime(new Date(Date.parse(hour.datetime) + 3600000).toISOString());
}

// Consejo corto en lenguaje llano según el precio actual y lo que queda de día.
export function electricityAdvice(hours: ElectricityHour[], now: number) {
  const [currentStretch, ...next] = electricityStretches(hours, now);
  if (!currentStretch) return null;
  const nextCheap = next.find((stretch) => stretch.status === 'cheap');
  const nextExpensive = next.find((stretch) => stretch.status === 'expensive');
  if (currentStretch.status === 'cheap') {
    return {
      status: currentStretch.status,
      title: 'Buen momento para gastar luz',
      detail: `Barata hasta las ${electricityEndTime(currentStretch.end)}. Aprovecha para la lavadora, el lavavajillas o el horno.`,
      short: `Barata hasta las ${electricityEndTime(currentStretch.end)}`,
    };
  }
  if (currentStretch.status === 'expensive') {
    return {
      status: currentStretch.status,
      title: 'Mejor espera si puedes',
      detail: nextCheap
        ? `Está cara hasta las ${electricityEndTime(currentStretch.end)}. Vuelve a estar barata a las ${electricityTime(nextCheap.start.datetime)}.`
        : `Está cara hasta las ${electricityEndTime(currentStretch.end)}. Hoy ya no quedan horas baratas.`,
      short: nextCheap ? `Barata desde las ${electricityTime(nextCheap.start.datetime)}` : 'Hoy no quedan horas baratas',
    };
  }
  return {
    status: currentStretch.status,
    title: 'Precio normal',
    detail: nextCheap
      ? `Si puedes esperar, estará barata a las ${electricityTime(nextCheap.start.datetime)}.`
      : nextExpensive
        ? `Hoy ya no quedan horas baratas. Se pone cara a las ${electricityTime(nextExpensive.start.datetime)}.`
        : 'Hoy ya no quedan horas baratas ni caras.',
    short: nextCheap ? `Barata desde las ${electricityTime(nextCheap.start.datetime)}` : 'Hoy no quedan horas baratas',
  };
}
