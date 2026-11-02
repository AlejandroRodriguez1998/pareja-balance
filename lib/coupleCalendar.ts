import type { CoupleDate } from './types';

export function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function occurrenceInYear(event: CoupleDate, year: number) {
  if (!event.yearly) return event.date;
  const [startYear, month, day] = event.date.split('-').map(Number);
  if (year < startYear) return null;
  // In non-leap years, celebrate February 29 on February 28.
  const lastDay = new Date(year, month, 0).getDate();
  return dateKey(new Date(year, month - 1, Math.min(day, lastDay)));
}

export function nextOccurrence(event: CoupleDate, today: string) {
  if (!event.yearly) return event.date >= today ? event.date : null;
  const year = Math.max(Number(today.slice(0, 4)), Number(event.date.slice(0, 4)));
  const candidate = occurrenceInYear(event, year);
  return candidate && candidate >= today ? candidate : occurrenceInYear(event, year + 1);
}

export function calendarFile(event: CoupleDate) {
  const escape = (text: string) => text.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pareja Balance//Fechas//ES', 'BEGIN:VEVENT', `UID:${escape(event.id)}@pareja-balance`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART;VALUE=DATE:${event.date.replaceAll('-', '')}`, `SUMMARY:${escape(event.title)}`];
  if (event.yearly) lines.push(event.date.endsWith('-02-29') ? 'RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1' : 'RRULE:FREQ=YEARLY');
  if (event.reminderDays !== -1) lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${escape(event.title)}`, `TRIGGER:-P${event.reminderDays ?? 7}D`, 'END:VALARM');
  lines.push('END:VEVENT', 'END:VCALENDAR');
  // RFC 5545 folds content lines at 75 octets, including accented characters.
  const folded = lines.map((line) => {
    let output = '', chunk = '', length = 0;
    for (const character of line) {
      const size = new TextEncoder().encode(character).length;
      if (length + size > 75) { output += `${chunk}\r\n`; chunk = ' '; length = 1; }
      chunk += character; length += size;
    }
    return output + chunk;
  });
  return folded.join('\r\n') + '\r\n';
}
