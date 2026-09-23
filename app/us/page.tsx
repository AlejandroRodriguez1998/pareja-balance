'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { arrayUnion, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { CalendarHeart, Check2Circle, Circle, ClockHistory, HeartFill, PencilFill, Stars } from 'react-bootstrap-icons';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import CoupleDataModal from '@/components/CoupleDataModal';
import TopNav from '@/components/TopNav';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import type { CoupleData } from '@/lib/types';

function getTimeTogether(dateValue?: string) {
  if (!dateValue) return null;
  const start = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  if (Number.isNaN(start.getTime()) || start > today) return null;
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  let days = today.getDate() - start.getDate();
  if (days < 0) { months -= 1; days += new Date(today.getFullYear(), today.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  return [years ? `${years} ${years === 1 ? 'año' : 'años'}` : '', months ? `${months} ${months === 1 ? 'mes' : 'meses'}` : '', `${days} ${days === 1 ? 'día' : 'días'}`].filter(Boolean).join(', ');
}

export default function UsPage() {
  const [data, setData] = useState<CoupleData | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [loading, setLoading] = useState(true);
  const together = useMemo(() => getTimeTogether(data?.relationshipStart), [data?.relationshipStart]);
  const pendingGoals = useMemo(() => data?.goals?.filter((goal) => !goal.completed) || [], [data?.goals]);
  const completedGoals = useMemo(() => data?.goals?.filter((goal) => goal.completed) || [], [data?.goals]);

  useEffect(() => {
    let unsubscribeData: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeData?.();
      if (!user) return setLoading(false);
      try {
        const pairId = await getUserPairId(user.uid);
        if (!pairId) return setLoading(false);
        unsubscribeData = onSnapshot(doc(db, 'coupleData', pairId), (snapshot) => {
          setData(snapshot.exists() ? snapshot.data() as CoupleData : { pairId, goals: [] });
          setLoading(false);
        }, (error) => { console.error('Error loading couple data:', error); setLoading(false); });
      } catch (error) { console.error('Error resolving pair:', error); setLoading(false); }
    });
    return () => { unsubscribeAuth(); unsubscribeData?.(); };
  }, []);

  if (loading) return <div className="app-loading-screen"><div className="spinner-border app-loading-spinner" role="status" /></div>;
  const hasNames = data?.partnerOneName && data?.partnerTwoName;

  const completeCurrentPlan = async () => {
    if (!data?.nextPlan?.title || !data.pairId) return;
    const completedAt = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'coupleData', data.pairId), {
        nextPlan: null,
        planHistory: arrayUnion({
          id: crypto.randomUUID(),
          title: data.nextPlan.title,
          dateTime: data.nextPlan.dateTime || '',
          completedAt,
        }),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error completing plan:', error);
      alert('No se pudo guardar el plan en el histórico.');
    }
  };

  return (
    <AuthGuard>
      <TopNav title="Nosotros" onAddClick={() => setShowPlan(true)} />
      <main className="dashboard-shell">
        <div className="container dashboard-container us-page">
          <section className="couple-hero">
            <button type="button" className="couple-edit-button" onClick={() => setShowEdit(true)} aria-label="Editar información de la pareja"><PencilFill size={17} aria-hidden="true" /></button>
            <HeartFill className="couple-heart" size={30} aria-hidden="true" />
            <h1>{hasNames ? <>{data?.partnerOneName} <span>♥</span> {data?.partnerTwoName}</> : 'Nuestra historia'}</h1>
            {data?.relationshipStart ? <><p>Juntos desde {new Date(`${data.relationshipStart}T00:00:00`).toLocaleDateString('es-ES')}</p>{together && <strong>{together} juntos</strong>}</> : <button type="button" className="inline-action" onClick={() => setShowEdit(true)}>Añadir fecha de inicio</button>}
          </section>
          <section className="couple-grid">
            <article className="couple-card">
              <div className="couple-card-heading"><span><CalendarHeart size={20} /> Próximo plan</span></div>
              {data?.nextPlan?.title ? <><h2>{data.nextPlan.title}</h2>{data.nextPlan.dateTime && <p>{new Date(data.nextPlan.dateTime).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p>}<button type="button" className="inline-action" onClick={completeCurrentPlan}>Marcar como realizado</button></> : <div className="compact-empty"><p>Aún no tenéis ningún plan guardado.</p><button type="button" className="inline-action" onClick={() => setShowPlan(true)}>Añadir plan</button></div>}
            </article>
            <article className="couple-card">
              <div className="couple-card-heading"><span><Stars size={20} /> Objetivos juntos</span></div>
              {pendingGoals.length ? <div className="couple-goals">{pendingGoals.map((goal) => <div key={goal.id}><Circle /><span>{goal.title}</span></div>)}</div> : <div className="compact-empty"><p>No tenéis objetivos pendientes.</p><button type="button" className="inline-action" onClick={() => setShowEdit(true)}>Añadir objetivo</button></div>}
            </article>
          </section>
          <section className="couple-history" aria-labelledby="couple-history-title">
            <div className="section-heading">
              <div><span className="section-kicker">Recuerdos compartidos</span><h2 id="couple-history-title">Lo que ya hemos conseguido</h2></div>
              <ClockHistory size={22} aria-hidden="true" />
            </div>
            {data?.planHistory?.length || completedGoals.length ? (
              <div className="couple-history-list">
                {[...(data?.planHistory || [])].reverse().map((plan) => (
                  <article className="couple-history-row" key={plan.id}>
                    <span className="history-marker"><CalendarHeart /></span>
                    <div><strong>{plan.title}</strong><small>{plan.dateTime ? new Date(plan.dateTime).toLocaleDateString('es-ES') : new Date(plan.completedAt).toLocaleDateString('es-ES')}</small></div>
                  </article>
                ))}
                {completedGoals.map((goal) => (
                  <article className="couple-history-row" key={goal.id}>
                    <span className="history-marker is-goal"><Check2Circle /></span>
                    <div><strong>{goal.title}</strong><small>Objetivo conseguido{goal.completedAt ? ` · ${new Date(goal.completedAt).toLocaleDateString('es-ES')}` : ''}</small></div>
                  </article>
                ))}
              </div>
            ) : <div className="empty-state"><p>Los planes realizados y objetivos conseguidos aparecerán aquí.</p></div>}
          </section>
        </div>
      </main>
      <CoupleDataModal show={showEdit} data={data} onHide={() => setShowEdit(false)} />
      <CoupleDataModal show={showPlan} data={data} focusPlan onHide={() => setShowPlan(false)} />
      <BottomNav />
    </AuthGuard>
  );
}
