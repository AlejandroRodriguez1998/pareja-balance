'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import type { SharedTask } from '@/lib/types';

type Props = {
  show: boolean;
  onHide: () => void;
  task?: SharedTask | null;
};

export default function TaskModal({ show, onHide, task = null }: Props) {
  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState<SharedTask['assignedTo']>('Ambos');
  const [saving, setSaving] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [repeat, setRepeat] = useState<NonNullable<SharedTask['repeat']>>('none');
  const savingRef = useRef(false);

  useEffect(() => {
    if (!show) return;
    setTitle(task?.title || '');
    setAssignedTo(task?.assignedTo || 'Ambos');
    setDueDate(task?.dueDate || '');
    setRepeat(task?.repeat || 'none');
  }, [show, task]);

  const closeIfIdle = () => {
    if (!savingRef.current) onHide();
  };

  const handleSave = async () => {
    if (savingRef.current || !title.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    savingRef.current = true;
    setSaving(true);
    try {
      if (task) {
        await updateDoc(doc(db, 'tasks', task.id), { title: title.trim(), assignedTo, dueDate, repeat, repeatDay: dueDate === task.dueDate ? task.repeatDay || Number(dueDate.slice(-2)) || 0 : Number(dueDate.slice(-2)) || 0 });
      } else {
        const pairId = await getUserPairId(user.uid);
        if (!pairId) throw new Error('No se encontró una pareja asociada.');
        await addDoc(collection(db, 'tasks'), {
          pairId,
          title: title.trim(),
          assignedTo,
          dueDate,
          repeat,
          repeatDay: Number(dueDate.slice(-2)) || 0,
          completed: false,
          createdAt: serverTimestamp(),
          completedAt: null,
        });
      }
      onHide();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('No se pudo guardar la tarea.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!task || savingRef.current || !confirm('¿Eliminar esta tarea?')) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'tasks', task.id));
      onHide();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('No se pudo eliminar la tarea.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={closeIfIdle} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title>{task ? 'Editar tarea' : 'Añadir tarea'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
          <Form.Group className="mb-3">
            <Form.Label>Tarea</Form.Label>
            <Form.Control
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="¿Qué hay que hacer?"
              disabled={saving}
            />
          </Form.Group>
          <Form.Group controlId="task-due-date" className="mb-3"><Form.Label>Fecha límite, opcional</Form.Label><Form.Control type="date" value={dueDate} disabled={saving} onChange={(event) => setDueDate(event.target.value)} /></Form.Group>
          <Form.Group controlId="task-repeat" className="mb-3"><Form.Label>Repetición</Form.Label><Form.Select value={repeat} disabled={saving} onChange={(event) => setRepeat(event.target.value as NonNullable<SharedTask['repeat']>)}><option value="none">No repetir</option><option value="daily">Cada día</option><option value="weekly">Cada semana</option><option value="monthly">Cada mes</option></Form.Select><Form.Text>Al completarla se creará la siguiente tarea.</Form.Text></Form.Group>
          <Form.Group>
            <Form.Label>Asignada a</Form.Label>
            <div className="task-assignee-picker" role="group" aria-label="Persona asignada">
              {(['Alejandro', 'Mario', 'Ambos'] as const).map((person) => (
                <button
                  key={person}
                  type="button"
                  className={`task-assignee-option ${assignedTo === person ? 'is-selected' : ''}`}
                  aria-pressed={assignedTo === person}
                  onClick={() => setAssignedTo(person)}
                >
                  {person}
                </button>
              ))}
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className={task ? 'd-flex justify-content-between' : undefined}>
        {task && <Button variant="danger" onClick={handleDelete} disabled={saving}>Eliminar</Button>}
        <div className="ms-auto d-flex gap-2">
          <Button variant="secondary" onClick={closeIfIdle} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
