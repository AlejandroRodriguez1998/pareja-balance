'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { CalendarHeart, ChevronLeft, ChevronRight, PencilFill, Plus } from 'react-bootstrap-icons';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { calendarFile, dateKey, nextOccurrence, occurrenceInYear } from '@/lib/coupleCalendar';
import type { CoupleData, CoupleDate } from '@/lib/types';

export type CoupleCalendarHandle = { addDate: () => void };

const CoupleCalendar = forwardRef<CoupleCalendarHandle, { data: CoupleData }>(function CoupleCalendar({ data }, ref) {
  const [today, setToday] = useState(() => dateKey(new Date()));
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const [editing, setEditing] = useState<CoupleDate | null>(null);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [yearly, setYearly] = useState(true);
  const [reminderDays, setReminderDays] = useState(7);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(dateKey(new Date())), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const events = data.dates || [];
  const anniversary: CoupleDate[] = data.relationshipStart ? [{ id: 'relationship-anniversary', title: 'Nuestro aniversario', date: data.relationshipStart, yearly: true }] : [];
  const allEvents = [...anniversary, ...events];
  const year = month.getFullYear();
  const monthPrefix = dateKey(month).slice(0, 7);
  const monthEvents = allEvents.map((event) => ({ event, occurrence: occurrenceInYear(event, year) })).filter((item) => item.occurrence?.startsWith(monthPrefix));
  const selectedEvents = monthEvents.filter((item) => item.occurrence === selected);
  const upcoming = allEvents.map((event) => ({ event, occurrence: nextOccurrence(event, today) })).filter((item): item is { event: CoupleDate; occurrence: string } => item.occurrence !== null).sort((a, b) => a.occurrence.localeCompare(b.occurrence)).slice(0, 4);
  const reminders = allEvents.map((event) => ({ event, occurrence: nextOccurrence(event, today) })).filter((item): item is { event: CoupleDate; occurrence: string } => {
    if (!item.occurrence || item.event.reminderDays === -1) return false;
    const daysAway = Math.round((Date.parse(`${item.occurrence}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 86400000);
    return daysAway <= (item.event.reminderDays ?? 7);
  });
  const offset = (month.getDay() + 6) % 7;
  const days = new Date(year, month.getMonth() + 1, 0).getDate();
  const monthLabel = month.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  function openEditor(event?: CoupleDate) {
    setEditing(event || null);
    setTitle(event?.title || '');
    setDate(event?.date || selected);
    setYearly(event?.yearly ?? true);
    setReminderDays(event?.reminderDays ?? 7);
    setError('');
    setShow(true);
  }

  useImperativeHandle(ref, () => ({ addDate: () => openEditor() }));

  async function persist(remove = false) {
    if (saving.current || !auth.currentUser || (!remove && (!title.trim() || !date))) return;
    if (remove && !confirm('¿Eliminar esta fecha del calendario?')) return;
    saving.current = true;
    setBusy(true);
    setError('');
    const event: CoupleDate = { id: editing?.id || crypto.randomUUID(), title: title.trim(), date, yearly, reminderDays };
    try {
      await runTransaction(db, async (transaction) => {
        const ref = doc(db, 'coupleData', data.pairId);
        const snapshot = await transaction.get(ref);
        const current = snapshot.exists() ? snapshot.data() as CoupleData : null;
        const dates = current?.dates || [];
        if (editing && !dates.some((item) => item.id === editing.id)) throw new Error('date-deleted');
        const updated = remove ? dates.filter((item) => item.id !== event.id) : editing ? dates.map((item) => item.id === event.id ? event : item) : [...dates, event];
        const patch = { pairId: data.pairId, dates: updated, updatedAt: serverTimestamp() };
        if (snapshot.exists()) transaction.update(ref, patch);
        else transaction.set(ref, patch);
      });
      if (!remove) {
        setMonth(new Date(`${date.slice(0, 7)}-01T12:00:00`));
        setSelected(date);
      }
      setShow(false);
    } catch (cause) {
      console.error('Error saving calendar date:', cause);
      setError(cause instanceof Error && cause.message === 'date-deleted' ? 'Esta fecha ya se ha eliminado. Cierra y vuelve a abrir el calendario.' : 'No se pudo guardar. Comprueba la conexión y vuelve a intentarlo.');
    } finally { saving.current = false; setBusy(false); }
  }

  function changeMonth(delta: number) {
    const next = new Date(year, month.getMonth() + delta, 1);
    setMonth(next);
    setSelected(dateKey(next));
  }

  function exportCalendar() {
    const header = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Pareja Balance//Fechas//ES\r\n';
    const content = allEvents.map((event) => calendarFile(event).split('BEGIN:VEVENT')[1].split('END:VCALENDAR')[0]).map((event) => `BEGIN:VEVENT${event}`).join('');
    const url = URL.createObjectURL(new Blob([header + content + 'END:VCALENDAR\r\n'], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'nuestras-fechas.ics'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function eventRow(event: CoupleDate, occurrence: string) {
    return <div className="calendar-event" key={event.id}><span className="history-marker"><CalendarHeart aria-hidden="true" /></span><div><strong>{event.title}</strong><small>{new Date(`${occurrence}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}{event.yearly ? ' · Cada año' : ''}</small></div>{event.id !== 'relationship-anniversary' && <button className="calendar-edit" type="button" onClick={() => openEditor(event)} aria-label={`Editar ${event.title}`}><PencilFill aria-hidden="true" /></button>}</div>;
  }

  return <section className="couple-card couple-calendar" aria-labelledby="couple-calendar-title">
    <div className="calendar-heading"><div className="couple-card-heading"><span><CalendarHeart size={20} /><span id="couple-calendar-title">Nuestro calendario</span></span></div><button className="inline-action" type="button" onClick={() => openEditor()}><Plus aria-hidden="true" /> Añadir fecha</button></div>
    <p className="activity-hint">Aniversarios, cumpleaños y esas fechas que solo tienen sentido para vosotros.</p>
    {reminders.length > 0 && <div className="calendar-reminders" role="status"><strong>Para que no se os pase</strong>{reminders.map(({ event, occurrence }) => <p key={event.id}>{event.title} · {occurrence === today ? '¡Hoy!' : new Date(`${occurrence}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</p>)}</div>}
    <div className="calendar-layout"><div className="calendar-month-panel">
      <div className="calendar-month"><button type="button" onClick={() => changeMonth(-1)} aria-label="Mes anterior"><ChevronLeft /></button><div className="calendar-month-label"><h2 aria-live="polite">{monthLabel}</h2><button type="button" className="calendar-today" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); setSelected(dateKey(now)); }}>Hoy</button></div><button type="button" onClick={() => changeMonth(1)} aria-label="Mes siguiente"><ChevronRight /></button></div>
      <div className="calendar-grid">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => <span className="calendar-weekday" key={index} aria-hidden="true">{day}</span>)}
        {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} />)}
        {Array.from({ length: days }, (_, index) => {
          const key = dateKey(new Date(year, month.getMonth(), index + 1));
          const count = monthEvents.filter((item) => item.occurrence === key).length;
          return <button key={key} type="button" className={`calendar-day${key === today ? ' is-today' : ''}`} aria-pressed={selected === key} aria-current={key === today ? 'date' : undefined} aria-label={`${index + 1} de ${monthLabel}${count ? `, ${count} fechas especiales` : ''}`} onClick={() => setSelected(key)}>{index + 1}{count > 0 && <span className="calendar-dot" />}</button>;
        })}
      </div>
      <div className="calendar-day-events"><h3>{new Date(`${selected}T12:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</h3>{selectedEvents.length ? selectedEvents.map(({ event, occurrence }) => eventRow(event, occurrence!)) : <p className="activity-hint">Sin fechas guardadas para este día.</p>}</div>
    </div><div className="calendar-upcoming"><h3>Próximas fechas</h3>{upcoming.length ? upcoming.map(({ event, occurrence }) => eventRow(event, occurrence)) : <p className="activity-hint">Guardad vuestra primera fecha especial.</p>}{data.relationshipStart && <p className="activity-hint">El aniversario se actualiza desde «Lo nuestro».</p>}</div></div>
    {allEvents.length > 0 && <details className="calendar-export-options"><summary>Exportar al calendario del móvil</summary><p className="activity-hint">Importa las fechas y sus recordatorios en tu calendario. Si las editas aquí, vuelve a descargarlas. Los avisos dependen de los ajustes de tu calendario.</p><button type="button" className="inline-action" onClick={exportCalendar}>Descargar fechas (.ics)</button></details>}
    <Modal show={show} onHide={() => { if (!saving.current) setShow(false); }} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton={!busy}><Modal.Title>{editing ? 'Editar fecha especial' : 'Añadir fecha especial'}</Modal.Title></Modal.Header>
      <Form onSubmit={(event) => { event.preventDefault(); void persist(); }}>
        <Modal.Body>{error && <div role="alert" className="alert alert-danger">{error}</div>}<Form.Group controlId="calendar-event-title" className="mb-3"><Form.Label>¿Qué celebramos?</Form.Label><Form.Control required maxLength={120} disabled={busy} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nuestro primer viaje, aniversario…" /></Form.Group><Form.Group controlId="calendar-event-date" className="mb-3"><Form.Label>Fecha</Form.Label><Form.Control type="date" required min="1900-01-01" max="9999-12-31" disabled={busy} value={date} onChange={(event) => setDate(event.target.value)} /></Form.Group><Form.Group controlId="calendar-reminder" className="mb-3"><Form.Label>Recordatorio</Form.Label><Form.Select value={reminderDays} disabled={busy} onChange={(event) => setReminderDays(Number(event.target.value))}><option value={-1}>Sin recordatorio</option><option value={0}>El mismo día</option><option value={1}>Un día antes</option><option value={7}>Una semana antes</option><option value={30}>Un mes antes (30 días)</option></Form.Select><Form.Text>Se muestra en la app. Para avisos con la app cerrada, importa las fechas al calendario del móvil.</Form.Text></Form.Group><Form.Check id="calendar-event-yearly" label="Repetir cada año" checked={yearly} disabled={busy} onChange={(event) => setYearly(event.target.checked)} />{date.endsWith('-02-29') && yearly && <p className="activity-hint">En años no bisiestos aparecerá el 28 de febrero.</p>}</Modal.Body>
        <Modal.Footer>{editing && <Button variant="outline-danger" disabled={busy} onClick={() => void persist(true)}>Eliminar</Button>}<Button variant="secondary" disabled={busy} onClick={() => setShow(false)}>Cancelar</Button><Button type="submit" disabled={busy || !title.trim() || !date}>{busy ? 'Guardando…' : 'Guardar fecha'}</Button></Modal.Footer>
      </Form>
    </Modal>
  </section>;
});

export default CoupleCalendar;
