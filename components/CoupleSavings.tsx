'use client';

import { useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { CashCoin } from 'react-bootstrap-icons';
import { updateCouple } from '@/lib/coupleUpdates';
import type { CoupleData, CoupleGoal } from '@/lib/types';

const money = (cents: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(cents / 100);
function cents(value: string) {
  const amount = Number(value.replace(',', '.'));
  return Number.isFinite(amount) && amount > 0 && amount <= 1000000 ? Math.round(amount * 100) : null;
}

export default function CoupleSavings({ data }: { data: CoupleData }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [mode, setMode] = useState<'goal' | 'contribution'>('goal');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const goals = data.goals || [];
  const savings = goals.filter((goal) => goal.targetCents);
  const otherGoals = goals.filter((goal) => !goal.targetCents && !goal.completed);
  const [show, setShow] = useState(false);

  function open(goal?: CoupleGoal, contribution = false) {
    setSelected(goal?.id || null); setMode(contribution ? 'contribution' : 'goal');
    setTitle(goal?.title || ''); setAmount(contribution ? '' : goal?.targetCents ? String(goal.targetCents / 100) : '');
    setDate(goal?.targetDate || ''); setError(''); setShow(true);
  }

  async function save(removeContribution?: string) {
    if (pending.current) return;
    const value = cents(amount);
    if (!removeContribution && (!value || (mode === 'goal' && !title.trim()))) { setError('Introduce un título y un importe mayor que cero, hasta 1.000.000 €.'); return; }
    const id = selected || crypto.randomUUID();
    const contributionId = crypto.randomUUID();
    pending.current = true; setBusy(true); setError('');
    try {
      await updateCouple(data.pairId, (current, uid) => {
        const currentGoals = current.goals || [];
        const existing = currentGoals.find((goal) => goal.id === id);
        if (selected && !existing) throw new Error('El objetivo ya no existe. Cierra y vuelve a abrir el formulario.');
        let updated: CoupleGoal;
        if (removeContribution) updated = { ...existing!, contributions: (existing?.contributions || []).filter((item) => item.id !== removeContribution) };
        else if (mode === 'contribution') updated = { ...existing!, contributions: [...(existing?.contributions || []), { id: contributionId, amountCents: value!, author: uid, date: new Date().toISOString() }] };
        else updated = { ...(existing || { id, completed: false }), title: title.trim(), targetCents: value!, targetDate: date };
        return { goals: existing ? currentGoals.map((goal) => goal.id === id ? updated : goal) : [...currentGoals, updated] };
      });
      if (!removeContribution) setShow(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar. Inténtalo de nuevo.'); }
    finally { pending.current = false; setBusy(false); }
  }

  return <section className="couple-card savings-section" aria-labelledby="savings-title">
    <div className="calendar-heading"><div className="couple-card-heading"><span><CashCoin size={20} /><span id="savings-title">Ahorrar juntos</span></span></div><button type="button" className="inline-action" onClick={() => open()}>Añadir meta</button></div>
    <p className="activity-hint">Vuestros objetivos con una meta de ahorro. Las aportaciones no se suman a los gastos.</p>
    {savings.length ? <div className="savings-list">{savings.map((goal) => {
      const total = (goal.contributions || []).reduce((sum, item) => sum + item.amountCents, 0);
      const percent = Math.min(100, Math.round(total / goal.targetCents! * 100));
      return <article className="savings-item" key={goal.id}><h3>{goal.title}</h3><p>{money(total)} <span>de {money(goal.targetCents!)}</span></p><progress max={goal.targetCents} value={Math.min(total, goal.targetCents!)} aria-label={`Ahorro para ${goal.title}`} /><small>{percent}%{goal.targetDate ? ` · Para el ${new Date(`${goal.targetDate}T12:00:00`).toLocaleDateString('es-ES')}` : ''}{total >= goal.targetCents! ? ' · ¡Meta alcanzada!' : ''}</small><div className="activity-actions"><button type="button" className="inline-action" onClick={() => open(goal, true)}>Añadir aportación</button><button type="button" className="inline-action" onClick={() => open(goal)}>Editar meta</button></div></article>;
    })}</div> : <p className="activity-hint">Una escapada, un viaje, algo para casa… ¿Para qué queréis ahorrar?</p>}
    {otherGoals.length > 0 && <details className="question-history"><summary>Convertir un objetivo en meta de ahorro</summary>{otherGoals.map((goal) => <button type="button" key={goal.id} className="inline-action me-2" onClick={() => open(goal)}>{goal.title}</button>)}</details>}
    <Modal show={show} onHide={() => { if (!pending.current) setShow(false); }} centered scrollable contentClassName="custom-modal-bg"><Modal.Header closeButton={!busy}><Modal.Title>{mode === 'contribution' ? `Aportar a ${title}` : selected ? 'Editar meta de ahorro' : 'Nueva meta de ahorro'}</Modal.Title></Modal.Header><Form onSubmit={(event) => { event.preventDefault(); void save(); }}><Modal.Body>{error && <div className="alert alert-danger" role="alert">{error}</div>}{mode === 'goal' && <Form.Group controlId="saving-title" className="mb-3"><Form.Label>Objetivo</Form.Label><Form.Control required maxLength={120} value={title} disabled={busy} onChange={(event) => setTitle(event.target.value)} /></Form.Group>}<Form.Group controlId="saving-amount" className="mb-3"><Form.Label>{mode === 'contribution' ? 'Aportación (€)' : 'Cantidad objetivo (€)'}</Form.Label><Form.Control autoFocus type="number" inputMode="decimal" required min="0.01" max="1000000" step="0.01" value={amount} disabled={busy} onChange={(event) => setAmount(event.target.value)} /></Form.Group>{mode === 'goal' && <Form.Group controlId="saving-date"><Form.Label>Fecha objetivo, opcional</Form.Label><Form.Control type="date" value={date} disabled={busy} onChange={(event) => setDate(event.target.value)} /></Form.Group>}{selected && <details className="question-history"><summary>Aportaciones registradas</summary>{(goals.find((goal) => goal.id === selected)?.contributions || []).map((item) => <div className="contribution-row" key={item.id}><span>{money(item.amountCents)} · {new Date(item.date).toLocaleDateString('es-ES')}</span><button type="button" className="inline-action" disabled={busy} onClick={() => { if (confirm('¿Eliminar esta aportación?')) void save(item.id); }}>Eliminar</button></div>)}</details>}</Modal.Body><Modal.Footer><Button variant="secondary" disabled={busy} onClick={() => setShow(false)}>Cancelar</Button><Button type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar'}</Button></Modal.Footer></Form></Modal>
  </section>;
}
