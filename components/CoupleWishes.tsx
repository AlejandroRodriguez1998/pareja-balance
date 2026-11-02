'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { CheckCircleFill, Circle, Gift, PencilFill, Plus } from 'react-bootstrap-icons';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { CoupleData, CoupleWish } from '@/lib/types';

export type CoupleWishesHandle = { addWish: () => void };

function productUrl(value: string) {
  if (!value.trim()) return '';
  try {
    const url = new URL(value.trim());
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

const CoupleWishes = forwardRef<CoupleWishesHandle, { data: CoupleData }>(function CoupleWishes({ data }, ref) {
  const [filter, setFilter] = useState('pending');
  const [ownerFilter, setOwnerFilter] = useState<CoupleWish['owner'] | null>(null);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<CoupleWish | null>(null);
  const [title, setTitle] = useState('');
  const [owner, setOwner] = useState<CoupleWish['owner']>('both');
  const [price, setPrice] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const wishes = data.wishes || [];
  const labels = { one: data.partnerOneName || 'Primera persona', two: data.partnerTwoName || 'Segunda persona', both: 'Los dos' };
  const visible = wishes.filter((wish) => wish.completed === (filter === 'completed') && (!ownerFilter || wish.owner === ownerFilter));

  function openEditor(wish?: CoupleWish) {
    setEditing(wish || null);
    setTitle(wish?.title || '');
    setOwner(wish?.owner || 'both');
    setPrice(wish?.priceCents == null ? '' : (wish.priceCents / 100).toFixed(2));
    setUrl(wish?.url || '');
    setError('');
    setShow(true);
  }
  useImperativeHandle(ref, () => ({ addWish: () => openEditor() }));

  async function mutate(change: (current: CoupleWish[]) => CoupleWish[]) {
    if (!auth.currentUser || pending.current) return false;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await runTransaction(db, async (transaction) => {
        const reference = doc(db, 'coupleData', data.pairId);
        const snapshot = await transaction.get(reference);
        const current = snapshot.exists() ? snapshot.data() as CoupleData : null;
        const patch = { pairId: data.pairId, wishes: change(current?.wishes || []), updatedAt: serverTimestamp() };
        if (snapshot.exists()) transaction.update(reference, patch);
        else transaction.set(reference, patch);
      });
      return true;
    } catch (cause) {
      console.error('Error saving wish:', cause);
      setError(cause instanceof Error && cause.message === 'wish-deleted' ? 'Este deseo ya se ha eliminado. Cierra el formulario para actualizar la lista.' : 'No se pudo guardar. Comprueba la conexión e inténtalo de nuevo.');
      return false;
    } finally { pending.current = false; setBusy(false); }
  }

  async function save() {
    const link = productUrl(url);
    const amount = price.trim() ? Number(price.replace(',', '.')) : null;
    if (!title.trim()) return;
    if (link === null) { setError('Introduce un enlace que empiece por https:// o http://.'); return; }
    if (amount !== null && (!Number.isFinite(amount) || amount < 0 || amount > 1000000)) { setError('Introduce un precio entre 0 y 1.000.000 €.'); return; }
    const wish: CoupleWish = { id: editing?.id || crypto.randomUUID(), title: title.trim(), owner, priceCents: amount === null ? null : Math.round(amount * 100), url: link, completed: false };
    const saved = await mutate((current) => {
      if (editing && !current.some((item) => item.id === editing.id)) throw new Error('wish-deleted');
      return editing ? current.map((item) => item.id === wish.id ? { ...wish, completed: item.completed } : item) : [...current, wish];
    });
    if (saved) { setShow(false); if (!editing) setFilter('pending'); }
  }

  async function toggle(wish: CoupleWish) {
    await mutate((current) => current.map((item) => item.id === wish.id ? { ...item, completed: !item.completed } : item));
  }

  async function remove() {
    if (!editing || !confirm('¿Eliminar este deseo?')) return;
    if (await mutate((current) => current.filter((item) => item.id !== editing.id))) setShow(false);
  }

  return <section className="couple-card couple-wishes" aria-labelledby="couple-wishes-title">
    <div className="calendar-heading"><div className="couple-card-heading"><span><Gift size={20} /><span id="couple-wishes-title">Deseos y regalos</span></span></div><button className="inline-action" type="button" disabled={busy} onClick={() => openEditor()}><Plus aria-hidden="true" /> Añadir deseo</button></div>
    <p className="activity-hint">Ideas para sorprenderos o daros un capricho juntos. Todo lo que guardéis aquí es visible para los dos.</p>
    {!show && error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="wish-filters">
      <div className="wish-status-filters" role="group" aria-label="Estado de los deseos">{[['pending', 'Pendientes'], ['completed', 'Cumplidos']].map(([value, label]) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
      <div className="wish-owner-filters" role="group" aria-label="Para quién es el deseo">{(['both', 'one', 'two'] as const).map((value) => <button key={value} type="button" aria-pressed={ownerFilter === value} onClick={() => setOwnerFilter((current) => current === value ? null : value)}>{labels[value]}</button>)}</div>
    </div>
    {visible.length ? <ul className="wish-list">{visible.map((wish) => <li className={`wish-row${wish.completed ? ' is-completed' : ''}`} key={wish.id}>
      <button type="button" className="wish-toggle" disabled={busy} aria-label={`${wish.completed ? 'Marcar como pendiente' : 'Marcar como cumplido'}: ${wish.title}`} aria-pressed={wish.completed} onClick={() => void toggle(wish)}>{wish.completed ? <CheckCircleFill /> : <Circle />}</button>
      <div className="wish-content"><strong>{wish.title}</strong><small>{labels[wish.owner]}{wish.priceCents !== null ? ` · ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(wish.priceCents / 100)}` : ''}</small>{wish.url && productUrl(wish.url) && <a href={productUrl(wish.url)!} target="_blank" rel="noopener noreferrer">Ver enlace ↗</a>}</div>
      <button type="button" className="calendar-edit" disabled={busy} onClick={() => openEditor(wish)} aria-label={`Editar ${wish.title}`}><PencilFill /></button>
    </li>)}</ul> : <div className="wish-empty-state"><span className="wish-empty-icon"><Gift size={26} aria-hidden="true" /></span><strong>{filter === 'completed' ? 'Aún quedan ilusiones por cumplir' : '¿Qué os hace ilusión?'}</strong><p>{filter === 'completed' ? 'Los deseos que marquéis como cumplidos aparecerán aquí.' : 'Guardad una idea para regalar o un capricho para los dos.'}</p>{filter !== 'completed' && <button type="button" className="inline-action" disabled={busy} onClick={() => openEditor()}>Añadir un deseo</button>}</div>}
    <Modal show={show} onHide={() => { if (!pending.current) setShow(false); }} centered scrollable contentClassName="custom-modal-bg">
      <Modal.Header closeButton={!busy}><Modal.Title>{editing ? 'Editar deseo' : 'Añadir deseo'}</Modal.Title></Modal.Header>
      <Form onSubmit={(event) => { event.preventDefault(); void save(); }}>
        <Modal.Body>{error && <div className="alert alert-danger" role="alert">{error}</div>}
          <Form.Group controlId="wish-title" className="mb-3"><Form.Label>¿Qué os hace ilusión?</Form.Label><Form.Control required maxLength={120} value={title} disabled={busy} onChange={(event) => setTitle(event.target.value)} placeholder="Un libro, una cena, una escapada…" /></Form.Group>
          <Form.Group controlId="wish-owner" className="mb-3"><Form.Label>Para quién</Form.Label><Form.Select value={owner} disabled={busy} onChange={(event) => setOwner(event.target.value as CoupleWish['owner'])}>{Object.entries(labels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Form.Select></Form.Group>
          <Form.Group controlId="wish-price" className="mb-3"><Form.Label>Precio orientativo (€), opcional</Form.Label><Form.Control type="number" inputMode="decimal" min="0" max="1000000" step="0.01" value={price} disabled={busy} onChange={(event) => setPrice(event.target.value)} placeholder="0,00" /></Form.Group>
          <Form.Group controlId="wish-url"><Form.Label>Enlace, opcional</Form.Label><Form.Control type="url" maxLength={2000} value={url} disabled={busy} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" /></Form.Group>
        </Modal.Body>
        <Modal.Footer>{editing && <Button variant="outline-danger" disabled={busy} onClick={() => void remove()}>Eliminar</Button>}<Button variant="secondary" disabled={busy} onClick={() => setShow(false)}>Cancelar</Button><Button type="submit" disabled={busy || !title.trim()}>{busy ? 'Guardando…' : 'Guardar deseo'}</Button></Modal.Footer>
      </Form>
    </Modal>
  </section>;
});

export default CoupleWishes;
