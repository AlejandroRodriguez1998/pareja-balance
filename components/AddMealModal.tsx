'use client';
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const weekdays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

export default function AddMealModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [name, setName] = useState('');
  const [dayIndex, setDayIndex] = useState('0');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Debes iniciar sesion.');
    const trimmed = name.trim();
    if (!trimmed) return alert('Anade un nombre para la comida.');

    try {
      const pairId = await getUserPairId(user.uid);
      if (!pairId) return alert('No se encontro una pareja asociada.');

      setSaving(true);
      await addDoc(collection(db, 'meals'), {
        pairId,
        user_id: user.uid,
        day: Number(dayIndex),
        name: trimmed,
        createdAt: serverTimestamp(),
      });
      setName('');
      onHide();
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title className="text-white">Anadir comida</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Comida</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ejemplo: Lentejas"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-white">Dia</Form.Label>
            <Form.Select
              value={dayIndex}
              onChange={(e) => setDayIndex(e.target.value)}
              disabled={saving}
            >
              {weekdays.map((day, index) => (
                <option key={day} value={index}>
                  {day}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
