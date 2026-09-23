'use client';

import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import type { CoupleData, CoupleGoal } from '@/lib/types';

type Props = { show: boolean; onHide: () => void; data?: CoupleData | null; focusPlan?: boolean };

export default function CoupleDataModal({ show, onHide, data = null, focusPlan = false }: Props) {
  const [partnerOneName, setPartnerOneName] = useState('');
  const [partnerTwoName, setPartnerTwoName] = useState('');
  const [relationshipStart, setRelationshipStart] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planDateTime, setPlanDateTime] = useState('');
  const [goals, setGoals] = useState<CoupleGoal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    setPartnerOneName(data?.partnerOneName || '');
    setPartnerTwoName(data?.partnerTwoName || '');
    setRelationshipStart(data?.relationshipStart || '');
    setPlanTitle(data?.nextPlan?.title || '');
    setPlanDateTime(data?.nextPlan?.dateTime || '');
    setGoals(data?.goals || []);
    setNewGoal('');
  }, [show, data]);

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
      await setDoc(doc(db, 'coupleData', pairId), payload, { merge: true });
      onHide();
    } catch (error) {
      console.error('Error saving couple data:', error);
      alert('No se pudo guardar la información.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} scrollable dialogClassName="app-modal-dialog" contentClassName="custom-modal-bg">
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
          <Form.Group className="mb-2"><Form.Label>Plan</Form.Label><Form.Control autoFocus={focusPlan} value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} placeholder="¿Qué os apetece hacer?" /></Form.Group>
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
