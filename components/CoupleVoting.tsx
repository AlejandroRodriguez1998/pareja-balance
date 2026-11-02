'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { ChevronRight, CupHot, EggFried, GeoAlt, Shuffle } from 'react-bootstrap-icons';
import { auth } from '@/lib/firebase';
import { updateCouple } from '@/lib/coupleUpdates';
import { ballotHash, ballotStorageKey, type LocalBallot } from '@/lib/secretBallot';
import type { CoupleData } from '@/lib/types';

const POLL_IDEAS = [
  { title: '¿Qué cenamos hoy?', options: ['Pizza casera', 'Algo de picar', 'Salir a cenar'], Icon: EggFried },
  { title: '¿Qué hacemos el finde?', options: ['Una escapada', 'Plan en casa', 'Descubrir un sitio nuevo'], Icon: GeoAlt },
  { title: '¿Cómo desconectamos?', options: ['Peli y manta', 'Un paseo', 'Café y charla'], Icon: CupHot },
];

export default function CoupleVoting({ data }: { data: CoupleData }) {
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [secret, setSecret] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const pending = useRef(false);
  const poll = data.poll;
  const uid = auth.currentUser?.uid;
  const committed = uid ? !!poll?.commitments?.[uid] : false;
  const revealed = Object.keys(poll?.votes || {}).length >= 2;
  const committedCount = Object.keys(poll?.commitments || {}).length;

  // The choice and random salt stay on this device until both commitments exist.
  // Both people must reopen this device to reveal if they voted while the other was away.
  useEffect(() => {
    if (!uid || !poll?.secret || committedCount < 2 || !committed || poll.votes[uid] !== undefined) return;
    let active = true;
    async function reveal() {
      try {
        const stored = localStorage.getItem(ballotStorageKey(data.pairId, poll!.id, uid!));
        if (!stored) throw new Error('Para revelar tu voto, abre el dispositivo donde votaste. Si borraste sus datos, cread otra votación.');
        const ballot = JSON.parse(stored) as LocalBallot;
        const digest = await ballotHash(poll!.id, uid!, ballot);
        if (digest !== poll!.commitments?.[uid!]) throw new Error('No se pudo recuperar el voto de este dispositivo. Cread otra votación.');
        await updateCouple(data.pairId, (current, userId) => {
          if (current.poll?.id !== poll!.id || Object.keys(current.poll.commitments || {}).length < 2 || current.poll.commitments?.[userId] !== digest) throw new Error('La votación ha cambiado.');
          return { poll: { ...current.poll, votes: { ...current.poll.votes, [userId]: ballot.choice } } };
        });
      } catch (cause) { if (active) setError(cause instanceof Error ? cause.message : 'No se pudo revelar el voto. Vuelve a abrir esta sección con conexión.'); }
    }
    void reveal();
    return () => { active = false; };
  }, [data.pairId, poll, uid, committed, committedCount, retry]);

  async function action(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await work(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo guardar. Inténtalo de nuevo.'); }
    finally { pending.current = false; setBusy(false); }
  }

  async function vote(choice: number) {
    if (!poll || !uid) return;
    await action(async () => {
      let digest = '';
      if (poll.secret) {
        if (committed) return;
        const key = ballotStorageKey(data.pairId, poll.id, uid);
        // Preserve a previous ballot after an uncertain network result.
        const previous = localStorage.getItem(key);
        const ballot: LocalBallot = previous ? JSON.parse(previous) : { choice, salt: crypto.randomUUID() + crypto.randomUUID() };
        localStorage.setItem(key, JSON.stringify(ballot));
        digest = await ballotHash(poll.id, uid, ballot);
      }
      await updateCouple(data.pairId, (current, userId) => {
        if (current.poll?.id !== poll.id) throw new Error('La votación ha cambiado. Revisa las nuevas opciones.');
        if (poll.secret) {
          if (current.poll.commitments?.[userId]) return {};
          return { poll: { ...current.poll, commitments: { ...current.poll.commitments, [userId]: digest } } };
        }
        return { poll: { ...current.poll, votes: { ...current.poll.votes, [userId]: choice } } };
      });
    });
  }

  const cleanOptions = options.map((option) => option.trim());
  const valid = !!title.trim() && cleanOptions.every(Boolean) && new Set(cleanOptions.map((option) => option.toLocaleLowerCase('es'))).size === options.length;
  async function create() {
    if (!valid) return;
    const id = crypto.randomUUID();
    await action(async () => {
      await updateCouple(data.pairId, (current) => {
        if (current.poll?.id !== poll?.id) throw new Error('La votación ha cambiado. Cierra el formulario y revisa la actual.');
        return { poll: { id, title: title.trim(), options: cleanOptions, votes: {}, commitments: {}, secret } };
      });
      setCreating(false); setTitle(''); setOptions(['', '']);
    });
  }
  const voteValues = Object.values(poll?.votes || {});
  const showResults = !poll?.secret || revealed;
  return <article className="couple-card together-voting">
    <div className="together-card-header"><span className="together-icon"><Shuffle size={22} aria-hidden="true" /></span><div><span className="section-kicker">Una decisión entre dos</span><h2 className="together-card-title">Decidir juntos</h2></div></div>
    {error && <div className="alert alert-danger mt-3" role="alert">{error}{poll?.secret && committedCount >= 2 && !revealed && <button type="button" className="inline-action" onClick={() => { setError(''); setRetry((value) => value + 1); }}>Reintentar revelación</button>}</div>}
    {poll && <p className="activity-hint">{poll.secret ? 'Votación secreta: cada voto queda cerrado hasta que los dos elegís. No se puede cambiar.' : 'Votos compartidos: podéis ver y cambiar vuestra elección.'}</p>}
    {poll ? <><h2>{poll.title}</h2><div className="activity-options">{poll.options.map((option, index) => <button type="button" key={index} disabled={busy || (!!poll.secret && committed)} aria-pressed={uid && showResults ? poll.votes[uid] === index : false} onClick={() => void vote(index)}><span>{option}</span>{showResults && <small>{voteValues.filter((value) => value === index).length} votos{uid && poll.votes[uid] === index ? ' · Tu elección' : ''}</small>}</button>)}</div><p className="activity-hint" aria-live="polite">{poll.secret && !revealed ? `${committedCount} de 2 votos confirmados. ${committedCount >= 2 ? 'Abrid ambos la app en el dispositivo donde votasteis para revelar el resultado.' : committed ? 'Tu voto está guardado. Esperando a tu pareja.' : 'Elige una opción.'}` : voteValues.length < 2 ? `${voteValues.length} de 2 habéis votado.` : voteValues[0] === voteValues[1] ? `¡Coincidís! ${poll.options[voteValues[0]]}` : 'Habéis elegido opciones distintas.'}</p></> : <p className="mt-3">¿Qué cenamos? ¿Qué vemos? Proponed opciones y elegid juntos.</p>}
    {!poll && <div className="voting-suggestions" aria-label="Ideas para vuestra votación">{POLL_IDEAS.map(({ title: ideaTitle, options: ideaOptions, Icon }) => <button type="button" key={ideaTitle} disabled={busy} onClick={() => { setTitle(ideaTitle); setOptions([...ideaOptions]); setError(''); setCreating(true); }}><span className="voting-suggestion-icon"><Icon aria-hidden="true" /></span><span><strong>{ideaTitle}</strong><small>{ideaOptions.slice(0, 2).join(' o ')}…</small></span><ChevronRight aria-hidden="true" /></button>)}</div>}
    <button className="inline-action" type="button" disabled={busy} onClick={() => setCreating(true)}>{poll ? 'Crear otra votación' : 'Crear mi propia votación'}</button>
    <Modal show={creating} onHide={() => { if (!pending.current) setCreating(false); }} centered scrollable contentClassName="custom-modal-bg voting-modal">
      <Modal.Header closeButton={!busy}><Modal.Title>Nueva votación</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form id="create-couple-poll" className="voting-editor" onSubmit={(event) => { event.preventDefault(); void create(); }}>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {poll && <p className="activity-hint">Esta votación sustituirá a la actual.</p>}
          <Form.Group controlId="poll-title"><Form.Label>¿Qué queréis decidir?</Form.Label><Form.Control required maxLength={120} value={title} disabled={busy} placeholder="Por ejemplo, el plan del sábado" onChange={(event) => setTitle(event.target.value)} /></Form.Group>
          <div className="voting-choices">
            <div className="voting-choices-heading"><span>Opciones</span><small>{options.length} de 4</small></div>
            {options.map((option, index) => <div className="poll-option-editor" key={index}>
              <span className="poll-option-number" aria-hidden="true">{index + 1}</span>
              <Form.Control id={`poll-option-${index}`} aria-label={`Opción ${index + 1}`} required maxLength={80} value={option} disabled={busy} placeholder={`Opción ${index + 1}`} onChange={(event) => setOptions((current) => current.map((value, position) => index === position ? event.target.value : value))} />
              {options.length > 2 && <button type="button" className="poll-remove-option" disabled={busy} aria-label={`Eliminar opción ${index + 1}`} onClick={() => setOptions((current) => current.length > 2 ? current.filter((_, position) => position !== index) : current)}>×</button>}
            </div>)}
            {options.length < 4 && <button className="voting-add-option" type="button" disabled={busy} onClick={() => setOptions((current) => [...current, ''])}>+ Añadir opción</button>}
          </div>
          <div className="voting-privacy"><Form.Check type="switch" id="poll-secret" label="Votación secreta" checked={secret} disabled={busy} onChange={(event) => setSecret(event.target.checked)} /><p>{secret ? 'El resultado se abre cuando los dos votáis. Cada voto queda cerrado al confirmarlo.' : 'Los votos son visibles y se pueden cambiar.'}</p>{secret && <details><summary>Sobre el voto secreto</summary><p>Vuelve al dispositivo donde votaste para revelar tu elección. Conserva sus datos hasta ver el resultado.</p></details>}</div>
        </Form>
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" disabled={busy} onClick={() => setCreating(false)}>Cancelar</Button><Button type="submit" form="create-couple-poll" disabled={busy || !valid}>{busy ? 'Guardando…' : 'Crear votación'}</Button></Modal.Footer>
    </Modal>
  </article>;
}
