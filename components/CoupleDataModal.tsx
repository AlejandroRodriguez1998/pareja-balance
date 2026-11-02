'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { doc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import type { CoupleData, CoupleGoal } from '@/lib/types';

type Props = { show: boolean; onHide: () => void; data?: CoupleData | null; focusPlan?: boolean; suggestedPlan?: string };

export default function CoupleDataModal({ show, onHide, data = null, focusPlan = false, suggestedPlan }: Props) {
  const [partnerOneName, setPartnerOneName] = useState('');
  const [partnerTwoName, setPartnerTwoName] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planDateTime, setPlanDateTime] = useState('');
  const [goals, setGoals] = useState<CoupleGoal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState(false);
  const latestData = useRef(data);
  const originalGoalIds = useRef(new Set<string>());

  useEffect(() => { latestData.current = data; }, [data]);

  useEffect(() => {
    if (!show) return;
    const initial = latestData.current;
    originalGoalIds.current = new Set(initial?.goals?.map((goal) => goal.id));
    setPartnerOneName(initial?.partnerOneName || '');
    setPartnerTwoName(initial?.partnerTwoName || '');
    setRelationshipStart(initial?.relationshipStart || '');
    setPlanTitle(suggestedPlan || initial?.nextPlan?.title || '');
    setPlanDateTime(suggestedPlan ? '' : initial?.nextPlan?.dateTime || '');
    setGoals(initial?.goals || []);
    setNewGoal('');
  }, [show, suggestedPlan]);

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals((current) => [...current, { id: crypto.randomUUID(), title: newGoal.trim(), completed: false }]);
    setNewGoal('');
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user || saving) return;
    setSaving(true);
    try {
      const pairId = data?.pairId || await getUserPairId(user.uid);
      if (!pairId) throw new Error('No se encontró una pareja asociada.');
      const nextPlan = planTitle.trim() ? { title: planTitle.trim(), dateTime: planDateTime } : null;
      const payload = focusPlan
        ? { pairId, nextPlan, updatedAt: serverTimestamp() }
        : {
            pairId,
            partnerOneName: partnerOneName.trim(),
            partnerTwoName: partnerTwoName.trim(),
            relationshipStart,
            nextPlan,
            goals,
            updatedAt: serverTimestamp(),
          };
      if (focusPlan) await setDoc(doc(db, 'coupleData', pairId), payload, { merge: true });
      else await runTransaction(db, async (transaction) => {
        const reference = doc(db, 'coupleData', pairId);
        const snapshot = await transaction.get(reference);
        const current = snapshot.exists() ? snapshot.data() as CoupleData : null;
        // Keep savings and contributions that may have changed while this editor was open.
        const mergedGoals = goals.map((goal) => {
          const latest = current?.goals?.find((item) => item.id === goal.id);
          return latest ? { ...latest, title: goal.title, completed: goal.completed, completedAt: goal.completedAt || null } : goal;
        });
        const originalIds = originalGoalIds.current;
        mergedGoals.push(...(current?.goals || []).filter((goal) => !originalIds.has(goal.id) && !mergedGoals.some((item) => item.id === goal.id)));
        const patch = { ...payload, goals: mergedGoals };
        if (snapshot.exists()) transaction.update(reference, patch);
        else transaction.set(reference, patch);
      });
      onHide();
    } catch (error) {
      console.error('Error saving couple data:', error);
      alert('No se pudo guardar la información.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered scrollable contentClassName="custom-modal-bg">
      <Modal.Header closeButton><Modal.Title>{focusPlan ? 'Añadir plan' : 'Editar nuestra información'}</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form>
          {!focusPlan && (
            <>
              <div className="row g-2 mb-3">
                <Form.Group className="col-6"><Form.Label>Primera persona</Form.Label><Form.Control value={partnerOneName} onChange={(e) => setPartnerOneName(e.target.value)} placeholder="Nombre" /></Form.Group>
                <Form.Group className="col-6"><Form.Label>Segunda persona</Form.Label><Form.Control value={partnerTwoName} onChange={(e) => setPartnerTwoName(e.target.value)} placeholder="Nombre" /></Form.Group>
              </div>
              <Form.Group className="mb-4"><Form.Label>Juntos desde</Form.Label><Form.Control type="date" value={relationshipStart} onChange={(e) => setRelationshipStart(e.target.value)} /></Form.Group>
            </>
          )}
          <div className="modal-section-label">Próximo plan</div>
          {suggestedPlan && data?.nextPlan?.title && <p>Al guardar, este plan sustituirá a «{data.nextPlan.title}» como próximo plan.</p>}
          <Form.Group className="mb-2"><Form.Label>Plan</Form.Label><Form.Control value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} placeholder="¿Qué os apetece hacer?" /></Form.Group>
          <Form.Group className="mb-4"><Form.Label>Fecha y hora</Form.Label><Form.Control type="datetime-local" value={planDateTime} onChange={(e) => setPlanDateTime(e.target.value)} /></Form.Group>
          {!focusPlan && (
            <>
              <div className="modal-section-label">Objetivos juntos</div>
              <div className="goal-editor-list">
                {goals.map((goal) => (
                  <div className="goal-editor-row" key={goal.id}>
                    <Form.Check checked={goal.completed} aria-label={`Completar ${goal.title}`} onChange={() => setGoals((items) => items.map((item) => item.id === goal.id ? { ...item, completed: !item.completed, completedAt: item.completed ? null : new Date().toISOString() } : item))} />
                    <span>{goal.title}</span>
                    <button type="button" aria-label={`Eliminar ${goal.title}`} onClick={() => setGoals((items) => items.filter((item) => item.id !== goal.id))}>×</button>
                  </div>
                ))}
              </div>
              <div className="goal-add-row"><Form.Control value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Nuevo objetivo" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal(); } }} /><Button variant="secondary" type="button" onClick={addGoal}>Añadir</Button></div>
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer><Button variant="secondary" onClick={onHide}>Cancelar</Button><Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button></Modal.Footer>
    </Modal>
  );
}
