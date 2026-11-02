import { dateKey } from './coupleCalendar';
import type { SharedTask } from './types';

export function nextTaskDate(value: string, repeat: SharedTask['repeat'], today = dateKey(new Date()), repeatDay?: number) {
  const base = value || today;
  const date = new Date(`${base}T12:00:00`);
  if (repeat === 'daily') date.setDate(date.getDate() + 1);
  else if (repeat === 'weekly') date.setDate(date.getDate() + 7);
  else if (repeat === 'monthly') {
    const day = repeatDay || date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + 1);
    date.setDate(Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
  }
  return dateKey(date);
}
