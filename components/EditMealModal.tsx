'use client';
import { useEffect, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db } from '@/lib/firebase';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';

type Meal = {
  id: string;
  day: number;
  name: string;
};

const weekdays = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];

export default function EditMealModal({
  show,
  onHide,
  meal,
}: {
  show: boolean;
  onHide: () => void;
  meal: Meal | null;
}) {
  const [name, setName] = useState('');
  const [dayIndex, setDayIndex] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (meal) {
      setName(meal.name || '');
      setDayIndex(String(meal.day ?? 0));
    }
  }, [meal]);

  const handleSave = async () => {
    if (!meal) return;
    const trimmed = name.trim();
    if (!trimmed) return alert('Anade un nombre para la comida.');
    try {
      setSaving(true);
      await updateDoc(doc(db, 'meals', meal.id), {
        name: trimmed,
        day: Number(dayIndex),
        updatedAt: new Date(),
      });
      onHide();
    } catch (err: any) {
      console.error(err);
      alert('Error al guardar cambios: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!meal) return;
    const confirmed = confirm('Seguro que deseas eliminar esta comida?');
    if (!confirmed) return;
    try {
      setSaving(true);
      await deleteDoc(doc(db, 'meals', meal.id));
      onHide();
    } catch (err: any) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title className="text-white">Editar comida</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Comida</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-white">Dia</Form.Label>
            <div className="meal-day-picker">
              {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`meal-day-pill ${Number(dayIndex) === index ? 'is-selected' : ''}`}
                  onClick={() => setDayIndex(String(index))}
                  disabled={saving}
                  aria-pressed={Number(dayIndex) === index}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="text-light-50 small mt-2">{weekdays[Number(dayIndex)]}</div>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={handleDelete} disabled={saving}>
          Eliminar
        </Button>
        <div>
          <Button variant="secondary" onClick={onHide} disabled={saving} className="me-2">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
