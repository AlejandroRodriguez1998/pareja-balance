'use client';

import { useEffect, useRef, useState } from 'react';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { Button, Form } from 'react-bootstrap';
import { ChatHeart, Stars } from 'react-bootstrap-icons';
import { auth, db } from '@/lib/firebase';
import { PLAN_IDEAS, questionForDate } from '@/lib/coupleIdeas';
import type { CoupleData } from '@/lib/types';
import CoupleVoting from '@/components/CoupleVoting';

type Props = { data: CoupleData; onChoosePlan: (title: string) => void };

export default function CoupleActivities({ data, onChoosePlan }: Props) {
  const [today, setToday] = useState(() => questionForDate(new Date()));
  const [answer, setAnswer] = useState('');
  const [editingAnswer, setEditingAnswer] = useState(false);
  const [category, setCategory] = useState('Todos');
  const [ideaIndex, setIdeaIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const pending = useRef(false);
  const uid = auth.currentUser?.uid;
  const daily = data.dailyQuestion?.day === today.day ? data.dailyQuestion : null;
  const savedAnswer = uid ? daily?.answers[uid] : undefined;
  const questionHistory = { ...data.questionHistory, ...(data.dailyQuestion ? { [data.dailyQuestion.day]: data.dailyQuestion } : {}) };
  const ideas = PLAN_IDEAS.filter((idea) => category === 'Todos' || idea.category === category);
  const idea = ideas[ideaIndex % ideas.length];

  useEffect(() => {
    const timer = window.setInterval(() => setToday(questionForDate(new Date())), 30000);
    return () => window.clearInterval(timer);
  }, []);

  async function mutate(change: (current: CoupleData, userId: string) => Partial<CoupleData>) {
    const userId = auth.currentUser?.uid;
    if (!userId || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      await runTransaction(db, async (transaction) => {
        const ref = doc(db, 'coupleData', data.pairId);
        const snapshot = await transaction.get(ref);
        const current = snapshot.exists() ? snapshot.data() as CoupleData : { pairId: data.pairId };
        const patch = { ...change(current, userId), pairId: data.pairId, updatedAt: serverTimestamp() };
        if (snapshot.exists()) transaction.update(ref, patch);
        else transaction.set(ref, patch);
      });
      return true;
    } catch (cause) {
      console.error('Error saving couple activity:', cause);
      setError(cause instanceof Error && cause.message === 'poll-changed' ? 'La votación ha cambiado. Revisa las opciones y vuelve a votar.' : 'No se pudo guardar. Comprueba la conexión e inténtalo de nuevo.');
      return false;
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  async function saveAnswer() {
    const text = answer.trim();
    if (!text || text.length > 1000) return;
    const currentDay = questionForDate(new Date());
    if (currentDay.day !== today.day) {
      setToday(currentDay);
      setError('Ha empezado un nuevo día. Revisa la nueva pregunta antes de responder.');
      return;
    }
    const saved = await mutate((current, userId) => {
      const dailyQuestion = { ...currentDay, answers: { ...(current.dailyQuestion?.day === currentDay.day ? current.dailyQuestion.answers : {}), [userId]: text } };
      const history = { ...current.questionHistory };
      if (current.dailyQuestion) history[current.dailyQuestion.day] = current.dailyQuestion;
      history[currentDay.day] = dailyQuestion;
      return { dailyQuestion, questionHistory: history };
    });
    if (saved) { setAnswer(''); setEditingAnswer(false); }
  }

  return (
    <section className="couple-activities" aria-label="Para disfrutar juntos">
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      <article className="couple-card together-question">
        <div className="together-card-header"><span className="together-icon"><ChatHeart size={22} aria-hidden="true" /></span><div><span className="section-kicker">Un momento para vosotros</span><h2 className="together-card-title">La pregunta de hoy</h2></div><span className="together-status">{Object.keys(daily?.answers || {}).length}/2 respuestas</span></div>
        <h2>{daily?.question || today.question}</h2>
        <p className="activity-hint">Una pregunta cada día. Tu pareja verá tu respuesta al guardarla.</p>
        <div className="together-answers">
        {daily && Object.entries(daily.answers).map(([author, text]) => <div className="activity-answer" key={author}><strong>{author === uid ? 'Tu respuesta' : 'Respuesta de tu pareja'}</strong><p>{text}</p></div>)}
        </div>
        {savedAnswer && !editingAnswer ? <button type="button" className="together-text-action" onClick={() => { setAnswer(savedAnswer); setEditingAnswer(true); }}>Editar mi respuesta</button> : <Form className="together-answer-form" onSubmit={(event) => { event.preventDefault(); void saveAnswer(); }}>
          <Form.Group controlId="couple-daily-answer" className="mt-3">
            <Form.Label>{savedAnswer ? 'Cambiar tu respuesta' : 'Tu respuesta'}</Form.Label>
            <Form.Control as="textarea" rows={2} maxLength={1000} value={answer} disabled={busy} onChange={(event) => setAnswer(event.target.value)} placeholder="Escribe lo que te apetezca compartir…" />
          </Form.Group>
          <Button type="submit" className="mt-2" disabled={busy || !answer.trim()}>{busy ? 'Guardando…' : savedAnswer ? 'Actualizar respuesta' : 'Compartir respuesta'}</Button>
          {savedAnswer && <Button variant="secondary" className="mt-2 ms-2" disabled={busy} onClick={() => setEditingAnswer(false)}>Cancelar</Button>}
        </Form>}
        {Object.keys(questionHistory).some((day) => day !== today.day) && <details className="question-history"><summary>Preguntas anteriores</summary>{Object.values(questionHistory).filter((item) => item.day !== today.day).sort((a, b) => b.day.localeCompare(a.day)).map((item) => <article key={item.day}><small>{new Date(`${item.day}T12:00:00`).toLocaleDateString('es-ES')}</small><h3>{item.question}</h3>{Object.entries(item.answers).map(([author, text]) => <div className="activity-answer" key={author}><strong>{author === uid ? 'Tu respuesta' : 'Respuesta de tu pareja'}</strong><p>{text}</p></div>)}</article>)}</details>}
      </article>
      <CoupleVoting data={data} />
      <article className="couple-card together-plans">
        <div className="together-card-header"><span className="together-icon"><Stars size={22} aria-hidden="true" /></span><div><span className="section-kicker">Salid de la rutina</span><h2 className="together-card-title">Un plan para los dos</h2></div></div>
        <div className="together-filters" role="group" aria-label="Dónde hacer el plan">{['Todos', 'En casa', 'Fuera'].map((value) => <button type="button" key={value} aria-pressed={category === value} onClick={() => { setCategory(value); setIdeaIndex(0); }}>{value}</button>)}</div>
        <div className="together-plan-idea" aria-live="polite"><h2>{idea.title}</h2><p>{idea.detail}</p><div className="together-plan-meta"><span>{idea.time}</span><span>{idea.budget}</span></div></div>
        <div className="activity-actions"><Button onClick={() => onChoosePlan(idea.title)}>Elegir este plan</Button><Button variant="secondary" onClick={() => setIdeaIndex((current) => current + 1)}>Otra propuesta</Button></div>
      </article>
    </section>
  );
}
